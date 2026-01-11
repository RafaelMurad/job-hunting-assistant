/**
 * CV Content Extraction Module
 *
 * Template-based CV extraction with structured JSON output.
 * Uses Zod for robust validation to fix type guard issues.
 * Includes automatic rate-limit fallback across available models.
 * Supports BYOK (Bring Your Own Key) for client-side execution.
 */

import { type ExtractedCVContent, generateLatexFromContent } from "@/lib/cv-templates";
import { z } from "zod";
import {
  AI_CONFIG,
  getModelInfo,
  isModelAvailable,
  LATEX_MODELS,
  type AvailabilityOptions,
} from "../config";
import { extractContentWithGemini } from "../providers/gemini";
import { extractContentWithOpenRouter } from "../providers/openrouter";
import type { CVTemplateId, LatexExtractionModel, TemplateExtractionResult } from "../types";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Options for AI operations (BYOK support)
 */
export interface AIOptions {
  geminiKey?: string | undefined;
  openrouterKey?: string | undefined;
}

// =============================================================================
// RATE LIMIT DETECTION
// =============================================================================

/**
 * Check if an error is a rate limit error
 */
function isRateLimitError(error: unknown): boolean {
  const errorString = String(error).toLowerCase();
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const combined = errorString + " " + message;

  const isRateLimit =
    combined.includes("rate limit") ||
    combined.includes("rate_limit") ||
    combined.includes("quota exceeded") ||
    combined.includes("too many requests") ||
    combined.includes("429") ||
    combined.includes("resource exhausted") ||
    combined.includes("exhausted") ||
    combined.includes("limit exceeded") ||
    combined.includes("requests per minute");

  if (isRateLimit) {
    console.warn("[isRateLimitError] Detected rate limit error:", message.substring(0, 200));
  }

  return isRateLimit;
}

/**
 * Get ordered list of available fallback models (excluding the failed one)
 */
function getAvailableFallbackModels(
  excludeModel: LatexExtractionModel,
  options?: AvailabilityOptions
): LatexExtractionModel[] {
  return LATEX_MODELS.filter((m) => m.id !== excludeModel && isModelAvailable(m.id, options)).map(
    (m) => m.id as LatexExtractionModel
  );
}

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
  linkedin: z.string().nullish(), // Accept null, undefined, or string
  github: z.string().nullish(),
  website: z.string().nullish(),
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
 * Extract content using a specific model
 */
async function extractContentWithModel(
  base64Data: string,
  mimeType: string,
  model: LatexExtractionModel,
  options?: AIOptions
): Promise<ExtractedCVContent> {
  switch (model) {
    case "gemini-2.5-flash": {
      const rawContent = await extractContentWithGemini(base64Data, mimeType, model, {
        apiKey: options?.geminiKey,
      });
      return parseExtractedContent(JSON.stringify(rawContent));
    }
    case "qwen-2.5-vl":
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
        modelInfo.openrouterModel,
        { apiKey: options?.openrouterKey }
      );
      return parseExtractedContent(JSON.stringify(rawContent));
    }
    default:
      throw new Error(`Unsupported model: ${model}`);
  }
}

/**
 * Main entry point: Extract CV content and generate LaTeX using template
 * Includes automatic rate-limit fallback across all available models
 */
export async function extractWithTemplate(
  buffer: Buffer,
  mimeType: string,
  templateId: CVTemplateId,
  model: LatexExtractionModel = AI_CONFIG.defaultLatexModel,
  options?: AIOptions
): Promise<TemplateExtractionResult> {
  const base64Data = buffer.toString("base64");
  const triedModels: LatexExtractionModel[] = [];
  const availabilityOptions: AvailabilityOptions = {
    geminiKey: options?.geminiKey,
    openrouterKey: options?.openrouterKey,
  };

  // Check if requested model is available
  if (!isModelAvailable(model, availabilityOptions)) {
    console.warn(`[extractWithTemplate] Model ${model} not available, finding fallback`);
    const fallbacks = getAvailableFallbackModels(model, availabilityOptions);
    const firstFallback = fallbacks[0];
    if (!firstFallback) {
      throw new Error("No AI models available. Please configure at least one API key in Settings.");
    }
    model = firstFallback;
  }

  // Try the requested model first
  try {
    const content = await extractContentWithModel(base64Data, mimeType, model, options);
    const latex = generateLatexFromContent(content, templateId);

    return {
      latex,
      content,
      templateId,
      modelUsed: model,
      fallbackUsed: false,
    };
  } catch (error) {
    triedModels.push(model);

    // If rate limited, try other available models
    if (isRateLimitError(error)) {
      console.warn(`[extractWithTemplate] ${model} rate limited, trying fallback models...`);

      const fallbacks = getAvailableFallbackModels(model, availabilityOptions);
      for (const fallbackModel of fallbacks) {
        if (triedModels.includes(fallbackModel)) continue;

        console.warn(`[extractWithTemplate] Trying fallback: ${fallbackModel}`);
        try {
          const content = await extractContentWithModel(
            base64Data,
            mimeType,
            fallbackModel,
            options
          );
          const latex = generateLatexFromContent(content, templateId);

          console.warn(`[extractWithTemplate] Fallback ${fallbackModel} succeeded`);
          return {
            latex,
            content,
            templateId,
            modelUsed: fallbackModel,
            fallbackUsed: true,
          };
        } catch (fallbackError) {
          triedModels.push(fallbackModel);
          if (isRateLimitError(fallbackError)) {
            console.warn(`[extractWithTemplate] ${fallbackModel} also rate limited`);
            continue;
          }
          // Non-rate-limit error, throw it
          throw fallbackError;
        }
      }

      // All models rate limited
      throw new Error(
        `All available AI models are rate limited. Tried: ${triedModels.join(", ")}. Please wait a moment and try again.`
      );
    }

    // Not a rate limit error, throw as-is
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
