/**
 * LaTeX Extraction Module
 *
 * Shared LaTeX extraction and validation logic.
 * Includes automatic retry with fallback models on rate limit errors.
 */

import { AI_CONFIG, getModelInfo, isModelAvailable, LATEX_MODELS } from "../config";
import { ATS_ANALYSIS_PROMPT, LATEX_MODIFY_PROMPT } from "../prompts";
import { extractLatexWithGemini } from "../providers/gemini";
import { extractLatexWithOpenRouter } from "../providers/openrouter";
import { atsAnalysisSchema } from "../schemas";
import type { ATSAnalysisResult, LatexExtractionModel, LatexExtractionResult } from "../types";
import { cleanAndValidateLatex, extractJsonFromText, parseJsonOrThrow } from "../utils";

// Re-export for backward compatibility
export { cleanAndValidateLatex };

// =============================================================================
// RATE LIMIT DETECTION
// =============================================================================

/**
 * Check if an error is a rate limit error
 */
function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("rate limit") ||
      message.includes("rate_limit") ||
      message.includes("quota exceeded") ||
      message.includes("too many requests") ||
      message.includes("429") ||
      message.includes("resource exhausted")
    );
  }
  return false;
}

/**
 * Get ordered list of available fallback models (excluding the failed one)
 */
function getAvailableFallbackModels(excludeModel: LatexExtractionModel): LatexExtractionModel[] {
  return LATEX_MODELS.filter((m) => m.id !== excludeModel && isModelAvailable(m.id)).map(
    (m) => m.id as LatexExtractionModel
  );
}

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
 * Extract LaTeX using a specific model
 */
async function extractWithModel(
  base64Data: string,
  mimeType: string,
  model: LatexExtractionModel
): Promise<string> {
  switch (model) {
    case "gemini-2.5-flash":
      return extractLatexWithGemini(base64Data, mimeType, model);
    case "nova-2-lite":
    case "mistral-small-3.1":
    case "gemma-3-27b":
    case "gemini-2.0-flash-or": {
      const modelInfo = getModelInfo(model);
      if (!modelInfo?.openrouterModel) {
        throw new Error(`OpenRouter model not configured for ${model}`);
      }
      return extractLatexWithOpenRouter(base64Data, mimeType, modelInfo.openrouterModel);
    }
    default:
      throw new Error(`Unsupported model: ${model}`);
  }
}

/**
 * Main entry point: Extract LaTeX from document using specified model
 * with automatic fallback to other available models on rate limit errors
 */
export async function extractLatexWithModel(
  buffer: Buffer,
  mimeType: string,
  model: LatexExtractionModel = AI_CONFIG.defaultLatexModel
): Promise<LatexExtractionResult> {
  const base64Data = buffer.toString("base64");
  const triedModels: LatexExtractionModel[] = [];

  // Check if requested model is available
  if (!isModelAvailable(model)) {
    console.warn(`[extractLatexWithModel] Model ${model} not available, finding fallback`);
    const fallbacks = getAvailableFallbackModels(model);
    const firstFallback = fallbacks[0];
    if (!firstFallback) {
      throw new Error("No AI models available. Please configure at least one API key.");
    }
    model = firstFallback;
  }

  // Try the requested model first
  try {
    const latex = await extractWithModel(base64Data, mimeType, model);
    return {
      latex,
      modelUsed: model,
      fallbackUsed: false,
    };
  } catch (error) {
    triedModels.push(model);

    // If rate limited, try other available models
    if (isRateLimitError(error)) {
      console.warn(`[extractLatexWithModel] ${model} rate limited, trying fallback models...`);

      const fallbacks = getAvailableFallbackModels(model);
      for (const fallbackModel of fallbacks) {
        if (triedModels.includes(fallbackModel)) continue;

        console.warn(`[extractLatexWithModel] Trying fallback: ${fallbackModel}`);
        try {
          const latex = await extractWithModel(base64Data, mimeType, fallbackModel);
          console.warn(`[extractLatexWithModel] Fallback ${fallbackModel} succeeded`);
          return {
            latex,
            modelUsed: fallbackModel,
            fallbackUsed: true,
          };
        } catch (fallbackError) {
          triedModels.push(fallbackModel);
          if (isRateLimitError(fallbackError)) {
            console.warn(`[extractLatexWithModel] ${fallbackModel} also rate limited`);
            continue; // Try next model
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

// =============================================================================
// LATEX MODIFICATION
// =============================================================================

/**
 * Modify LaTeX CV based on user instructions using AI
 * Includes automatic fallback to OpenRouter on rate limit
 */
export async function modifyLatexWithAI(
  currentLatex: string,
  instruction: string
): Promise<string> {
  const prompt = LATEX_MODIFY_PROMPT(currentLatex, instruction);

  // Try Gemini first
  if (isModelAvailable("gemini-2.5-flash")) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
      const model = genAI.getGenerativeModel({
        model: AI_CONFIG.models.gemini,
        generationConfig: {
          maxOutputTokens: 16384,
        },
      });

      const result = await model.generateContent(prompt);
      return cleanAndValidateLatex(result.response.text());
    } catch (error) {
      if (!isRateLimitError(error)) throw error;
      console.warn("[modifyLatexWithAI] Gemini rate limited, trying OpenRouter fallback...");
    }
  }

  // Fallback to OpenRouter models
  const fallbacks = getAvailableFallbackModels("gemini-2.5-flash");
  for (const fallbackModel of fallbacks) {
    const modelInfo = getModelInfo(fallbackModel);
    if (!modelInfo?.openrouterModel) continue;

    try {
      const { OpenAI } = await import("openai");
      const openrouter = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: AI_CONFIG.apiKeys.openrouter,
      });

      const response = await openrouter.chat.completions.create({
        model: modelInfo.openrouterModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 16384,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response from OpenRouter");
      return cleanAndValidateLatex(content);
    } catch (fallbackError) {
      if (isRateLimitError(fallbackError)) {
        console.warn(`[modifyLatexWithAI] ${fallbackModel} also rate limited`);
        continue;
      }
      throw fallbackError;
    }
  }

  throw new Error("All AI models are rate limited. Please wait a moment and try again.");
}

// =============================================================================
// ATS ANALYSIS
// =============================================================================

/**
 * Analyze LaTeX CV for ATS compliance
 * Includes automatic fallback to OpenRouter on rate limit
 */
export async function analyzeATSCompliance(latexContent: string): Promise<ATSAnalysisResult> {
  const prompt = ATS_ANALYSIS_PROMPT(latexContent);

  // Try Gemini first
  if (isModelAvailable("gemini-2.5-flash")) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
      const model = genAI.getGenerativeModel({
        model: AI_CONFIG.models.gemini,
      });

      const result = await model.generateContent(prompt);
      const jsonText = extractJsonFromText(result.response.text());
      if (!jsonText) {
        throw new Error("Could not parse ATS analysis response as JSON");
      }
      return parseJsonOrThrow(jsonText, atsAnalysisSchema, "ATS compliance analysis");
    } catch (error) {
      if (!isRateLimitError(error)) throw error;
      console.warn("[analyzeATSCompliance] Gemini rate limited, trying OpenRouter fallback...");
    }
  }

  // Fallback to OpenRouter models
  const fallbacks = getAvailableFallbackModels("gemini-2.5-flash");
  for (const fallbackModel of fallbacks) {
    const modelInfo = getModelInfo(fallbackModel);
    if (!modelInfo?.openrouterModel) continue;

    try {
      const { OpenAI } = await import("openai");
      const openrouter = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: AI_CONFIG.apiKeys.openrouter,
      });

      const response = await openrouter.chat.completions.create({
        model: modelInfo.openrouterModel,
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response from OpenRouter");

      const jsonText = extractJsonFromText(content);
      if (!jsonText) {
        throw new Error("Could not parse ATS analysis response as JSON");
      }
      return parseJsonOrThrow(jsonText, atsAnalysisSchema, "ATS compliance analysis");
    } catch (fallbackError) {
      if (isRateLimitError(fallbackError)) {
        console.warn(`[analyzeATSCompliance] ${fallbackModel} also rate limited`);
        continue;
      }
      throw fallbackError;
    }
  }

  throw new Error("All AI models are rate limited. Please wait a moment and try again.");
}
