/**
 * LaTeX Extraction Module
 *
 * Shared LaTeX extraction and validation logic.
 */

import { AI_CONFIG, isModelAvailable, getModelInfo } from "../config";
import type { LatexExtractionModel, LatexExtractionResult, ATSAnalysisResult } from "../types";
import { extractLatexWithGemini } from "../providers/gemini";
import { extractLatexWithOpenAI } from "../providers/openai";
import { extractLatexWithClaude } from "../providers/claude";
import { extractLatexWithOpenRouter } from "../providers/openrouter";
import { ATS_ANALYSIS_PROMPT, LATEX_MODIFY_PROMPT } from "../prompts";
import { cleanAndValidateLatex, extractJsonFromText } from "../utils";

// Re-export for backward compatibility
export { cleanAndValidateLatex };

// =============================================================================
// LEGACY EXTRACTION FUNCTIONS (for backward compatibility)
// =============================================================================

/**
 * Extract LaTeX from PDF using AI vision
 *
 * Uses retry logic with escalating token limits to handle long CVs.
 * Starts conservative (16K) to stay within free tier, escalates to 32K if needed.
 */
export async function extractLatexFromPDF(pdfBuffer: Buffer): Promise<string> {
  return extractLatexWithGemini(
    pdfBuffer.toString("base64"),
    "application/pdf",
    "gemini-2.5-flash"
  );
}

/**
 * Extract LaTeX from DOCX using AI
 *
 * Uses the same approach as PDF extraction - Gemini can process DOCX files.
 */
export async function extractLatexFromDocx(docxBuffer: Buffer): Promise<string> {
  return extractLatexWithGemini(
    docxBuffer.toString("base64"),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "gemini-2.5-flash"
  );
}

// =============================================================================
// MULTI-MODEL EXTRACTION
// =============================================================================

/**
 * Main entry point: Extract LaTeX from document using specified model
 * with automatic fallback to Gemini 2.5 Flash on failure
 */
export async function extractLatexWithModel(
  buffer: Buffer,
  mimeType: string,
  model: LatexExtractionModel = AI_CONFIG.defaultLatexModel
): Promise<LatexExtractionResult> {
  const base64Data = buffer.toString("base64");

  // Check if requested model is available
  if (!isModelAvailable(model)) {
    console.warn(`[extractLatexWithModel] Model ${model} not available, using fallback`);
    model = "gemini-2.5-flash"; // Fallback to free model
  }

  try {
    let latex: string;

    switch (model) {
      case "gemini-2.5-pro":
      case "gemini-2.5-flash":
      case "gemini-3-pro-preview":
        latex = await extractLatexWithGemini(base64Data, mimeType, model);
        break;
      case "nova-2-lite":
      case "mistral-small-3.1":
      case "gemma-3-27b":
      case "gemini-2.0-flash-or": {
        const modelInfo = getModelInfo(model);
        if (!modelInfo?.openrouterModel) {
          throw new Error(`OpenRouter model not configured for ${model}`);
        }
        latex = await extractLatexWithOpenRouter(base64Data, mimeType, modelInfo.openrouterModel);
        break;
      }
      case "gpt-4o":
        latex = await extractLatexWithOpenAI(base64Data, mimeType);
        break;
      case "claude-sonnet":
        latex = await extractLatexWithClaude(base64Data, mimeType);
        break;
      default:
        throw new Error(`Unsupported model: ${model}`);
    }

    return {
      latex,
      modelUsed: model,
      fallbackUsed: false,
    };
  } catch (error) {
    // If not already using fallback, try Gemini 2.5 Flash (free)
    if (model !== "gemini-2.5-flash" && isModelAvailable("gemini-2.5-flash")) {
      console.error(
        `[extractLatexWithModel] ${model} failed, falling back to Gemini 2.5 Flash:`,
        error
      );

      try {
        const latex = await extractLatexWithGemini(base64Data, mimeType, "gemini-2.5-flash");
        return {
          latex,
          modelUsed: "gemini-2.5-flash",
          fallbackUsed: true,
        };
      } catch {
        // Fallback also failed, throw original error
        throw error;
      }
    }

    throw error;
  }
}

// =============================================================================
// LATEX MODIFICATION
// =============================================================================

/**
 * Modify LaTeX CV based on user instructions using AI
 */
export async function modifyLatexWithAI(
  currentLatex: string,
  instruction: string
): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
  const model = genAI.getGenerativeModel({
    model: AI_CONFIG.models.gemini,
    generationConfig: {
      maxOutputTokens: 16384, // Handle long CVs without truncation
    },
  });

  const result = await model.generateContent(LATEX_MODIFY_PROMPT(currentLatex, instruction));

  return cleanAndValidateLatex(result.response.text());
}

// =============================================================================
// ATS ANALYSIS
// =============================================================================

/**
 * Analyze LaTeX CV for ATS compliance
 */
export async function analyzeATSCompliance(latexContent: string): Promise<ATSAnalysisResult> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
  const model = genAI.getGenerativeModel({
    model: AI_CONFIG.models.gemini,
  });

  const result = await model.generateContent(ATS_ANALYSIS_PROMPT(latexContent));
  const jsonText = extractJsonFromText(result.response.text());
  if (!jsonText) {
    throw new Error("Could not parse ATS analysis response as JSON");
  }

  return JSON.parse(jsonText) as ATSAnalysisResult;
}
