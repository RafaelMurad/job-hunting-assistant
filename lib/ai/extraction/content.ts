/**
 * CV Content Extraction Module
 *
 * Template-based CV extraction with structured JSON output.
 * Uses Zod for robust validation to fix type guard issues.
 */

import { z } from "zod";
import { AI_CONFIG, isModelAvailable, getModelInfo } from "../config";
import type { LatexExtractionModel, TemplateExtractionResult, CVTemplateId } from "../types";
import { extractContentWithGemini } from "../providers/gemini";
import { extractContentWithOpenRouter } from "../providers/openrouter";
import { type ExtractedCVContent, generateLatexFromContent } from "../../cv-templates";

// =============================================================================
// VALIDATION SCHEMAS (Zod - fixes "Unsound type guard check")
// =============================================================================

/**
 * Zod schema for contact information
 */
const contactSchema = z.object({
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  website: z.string().optional(),
});

/**
 * Zod schema for skill category
 */
const skillCategorySchema = z.object({
  category: z.string(),
  items: z.string(),
});

/**
 * Zod schema for work experience
 */
const experienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  bullets: z.array(z.string()).default([]),
});

/**
 * Zod schema for education
 */
const educationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * Zod schema for projects
 */
const projectSchema = z.object({
  name: z.string(),
  url: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

/**
 * Zod schema for language proficiency
 */
const languageSchema = z.object({
  language: z.string(),
  level: z.string(),
});

/**
 * Full CV content schema - validates AI extraction output
 */
export const extractedCVContentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  contact: contactSchema,
  summary: z.string().default(""),
  skills: z.array(skillCategorySchema).default([]),
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  projects: z.array(projectSchema).optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(languageSchema).optional(),
});

// =============================================================================
// CONTENT PARSING
// =============================================================================

/**
 * Parse and validate extracted CV content JSON using Zod
 * Replaces manual typeof checks that caused "Unsound type guard check" warnings
 */
export function parseExtractedContent(responseText: string): ExtractedCVContent {
  // Clean up response - remove markdown code blocks if present
  const jsonText = responseText
    .replace(/^```(?:json)?\n?/gi, "")
    .replace(/\n?```$/gi, "")
    .trim();

  // Parse JSON
  let rawContent: unknown;
  try {
    rawContent = JSON.parse(jsonText);
  } catch {
    console.error("[parseExtractedContent] Failed to parse JSON:", jsonText.substring(0, 500));
    throw new Error("Failed to parse CV content: Invalid JSON response from AI");
  }

  // Validate with Zod schema - this replaces manual typeof checks
  const parseResult = extractedCVContentSchema.safeParse(rawContent);

  if (!parseResult.success) {
    const issues = parseResult.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    console.error("[parseExtractedContent] Validation failed:", issues);
    throw new Error(`Failed to parse CV content: ${issues}`);
  }

  return parseResult.data as ExtractedCVContent;
}

// =============================================================================
// TEMPLATE-BASED EXTRACTION
// =============================================================================

/**
 * Main entry point: Extract CV content and generate LaTeX using template
 * This is the new template-based approach (preferred)
 */
export async function extractWithTemplate(
  buffer: Buffer,
  mimeType: string,
  templateId: CVTemplateId,
  model: LatexExtractionModel = AI_CONFIG.defaultLatexModel
): Promise<TemplateExtractionResult> {
  const base64Data = buffer.toString("base64");

  // Check if requested model is available
  if (!isModelAvailable(model)) {
    console.warn(`[extractWithTemplate] Model ${model} not available, using fallback`);
    model = "gemini-2.5-flash";
  }

  try {
    let content: ExtractedCVContent;

    switch (model) {
      case "gemini-2.5-pro":
      case "gemini-2.5-flash":
      case "gemini-3-pro-preview": {
        const rawContent = await extractContentWithGemini(base64Data, mimeType, model);
        content = parseExtractedContent(JSON.stringify(rawContent));
        break;
      }
      case "nova-2-lite":
      case "mistral-small-3.1":
      case "gemma-3-27b":
      case "gemini-2.0-flash-or": {
        const modelInfo = getModelInfo(model);
        if (!modelInfo?.openrouterModel) {
          throw new Error(`OpenRouter model not configured for ${model}`);
        }
        const rawContent = await extractContentWithOpenRouter(
          base64Data,
          mimeType,
          modelInfo.openrouterModel
        );
        content = parseExtractedContent(JSON.stringify(rawContent));
        break;
      }
      case "gpt-4o":
      case "claude-sonnet": {
        // For now, fall back to Gemini for these - can add dedicated functions later
        const rawContent = await extractContentWithGemini(base64Data, mimeType, "gemini-2.5-flash");
        content = parseExtractedContent(JSON.stringify(rawContent));
        break;
      }
      default:
        throw new Error(`Unsupported model: ${model}`);
    }

    // Generate LaTeX from content using template
    const latex = generateLatexFromContent(content, templateId);

    return {
      latex,
      content,
      templateId,
      modelUsed: model,
      fallbackUsed: false,
    };
  } catch (error) {
    // Fallback to Gemini 2.5 Flash
    if (model !== "gemini-2.5-flash" && isModelAvailable("gemini-2.5-flash")) {
      console.error(
        `[extractWithTemplate] ${model} failed, falling back to Gemini 2.5 Flash:`,
        error
      );

      try {
        const rawContent = await extractContentWithGemini(base64Data, mimeType, "gemini-2.5-flash");
        const content = parseExtractedContent(JSON.stringify(rawContent));
        const latex = generateLatexFromContent(content, templateId);

        return {
          latex,
          content,
          templateId,
          modelUsed: "gemini-2.5-flash",
          fallbackUsed: true,
        };
      } catch {
        throw error;
      }
    }

    throw error;
  }
}

/**
 * Re-generate LaTeX from already-extracted content with a different template
 * This is instant since no AI call is needed
 */
export function regenerateWithTemplate(
  content: ExtractedCVContent,
  templateId: CVTemplateId
): string {
  return generateLatexFromContent(content, templateId);
}
