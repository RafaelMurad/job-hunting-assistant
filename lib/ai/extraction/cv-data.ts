/**
 * CV Data Extraction Module
 *
 * Extract profile data from CVs with automatic rate-limit fallback.
 * Supports BYOK (Bring Your Own Key) for client-side execution.
 */

import {
  AI_CONFIG,
  getAPIKeyForProvider,
  getModelInfo,
  isModelAvailable,
  LATEX_MODELS,
  type AvailabilityOptions,
} from "../config";
import { CV_EXTRACTION_PROMPT } from "../prompts";
import { parsedCVDataSchema } from "../schemas";
import type { LatexExtractionModel, ParsedCVData } from "../types";
import { extractJsonFromText, parseJsonOrThrow } from "../utils";

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
// CV PARSING WITH GEMINI
// =============================================================================

/**
 * Parse CV using Gemini with native PDF vision.
 */
async function parseCVWithGeminiDirect(
  pdfBuffer: Buffer,
  options?: AIOptions
): Promise<ParsedCVData> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const apiKey = getAPIKeyForProvider("gemini", options?.geminiKey);
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: AI_CONFIG.models.gemini,
  });

  const base64Data = pdfBuffer.toString("base64");

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: "application/pdf",
        data: base64Data,
      },
    },
    CV_EXTRACTION_PROMPT,
  ]);

  const jsonText = extractJsonFromText(result.response.text());
  if (!jsonText) {
    throw new Error("Could not parse AI response as JSON");
  }

  return parseJsonOrThrow(jsonText, parsedCVDataSchema, "Gemini CV vision parsing");
}

/**
 * Parse CV using Gemini with extracted text (for DOCX files).
 */
async function parseCVTextWithGeminiDirect(
  cvText: string,
  options?: AIOptions
): Promise<ParsedCVData> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const apiKey = getAPIKeyForProvider("gemini", options?.geminiKey);
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: AI_CONFIG.models.gemini,
  });

  const result = await model.generateContent(
    `${CV_EXTRACTION_PROMPT}\n\nCV Text:\n${cvText.substring(0, 15000)}`
  );

  const jsonText = extractJsonFromText(result.response.text());
  if (!jsonText) {
    throw new Error("Could not parse AI response as JSON");
  }

  return parseJsonOrThrow(jsonText, parsedCVDataSchema, "Gemini CV text parsing");
}

// =============================================================================
// CV PARSING WITH OPENROUTER FALLBACK
// =============================================================================

/**
 * Parse CV using OpenRouter (fallback)
 */
async function parseCVWithOpenRouter(
  base64Data: string,
  mimeType: string,
  openrouterModel: string,
  options?: AIOptions
): Promise<ParsedCVData> {
  const { OpenAI } = await import("openai");

  const apiKey = getAPIKeyForProvider("openrouter", options?.openrouterKey);
  if (!apiKey) {
    throw new Error("OpenRouter API key not configured");
  }

  const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });

  const response = await openrouter.chat.completions.create({
    model: openrouterModel,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`,
            },
          },
          {
            type: "text",
            text: CV_EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenRouter");
  }

  const jsonText = extractJsonFromText(content);
  if (!jsonText) {
    throw new Error("Could not parse AI response as JSON");
  }

  return parseJsonOrThrow(jsonText, parsedCVDataSchema, "OpenRouter CV parsing");
}

/**
 * Parse CV text using OpenRouter (fallback for DOCX)
 */
async function parseCVTextWithOpenRouter(
  cvText: string,
  openrouterModel: string,
  options?: AIOptions
): Promise<ParsedCVData> {
  const { OpenAI } = await import("openai");

  const apiKey = getAPIKeyForProvider("openrouter", options?.openrouterKey);
  if (!apiKey) {
    throw new Error("OpenRouter API key not configured");
  }

  const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });

  const response = await openrouter.chat.completions.create({
    model: openrouterModel,
    messages: [
      {
        role: "user",
        content: `${CV_EXTRACTION_PROMPT}\n\nCV Text:\n${cvText.substring(0, 15000)}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenRouter");
  }

  const jsonText = extractJsonFromText(content);
  if (!jsonText) {
    throw new Error("Could not parse AI response as JSON");
  }

  return parseJsonOrThrow(jsonText, parsedCVDataSchema, "OpenRouter CV text parsing");
}

// =============================================================================
// PUBLIC API WITH FALLBACK
// =============================================================================

/**
 * Parse CV from PDF with automatic rate-limit fallback
 */
export async function parseCVWithFallback(
  pdfBuffer: Buffer,
  options?: AIOptions
): Promise<ParsedCVData> {
  const triedModels: string[] = [];
  const availabilityOptions: AvailabilityOptions = {
    geminiKey: options?.geminiKey,
    openrouterKey: options?.openrouterKey,
  };

  // Try Gemini first
  if (isModelAvailable("gemini-2.5-flash", availabilityOptions)) {
    try {
      return await parseCVWithGeminiDirect(pdfBuffer, options);
    } catch (error) {
      triedModels.push("gemini-2.5-flash");
      if (!isRateLimitError(error)) throw error;
      console.warn("[parseCVWithFallback] Gemini rate limited, trying OpenRouter fallback...");
    }
  }

  // Fallback to OpenRouter models
  const base64Data = pdfBuffer.toString("base64");
  const fallbacks = getAvailableFallbackModels("gemini-2.5-flash", availabilityOptions);

  for (const fallbackModel of fallbacks) {
    const modelInfo = getModelInfo(fallbackModel);
    if (!modelInfo?.openrouterModel) continue;

    try {
      console.warn(`[parseCVWithFallback] Trying fallback: ${fallbackModel}`);
      return await parseCVWithOpenRouter(
        base64Data,
        "application/pdf",
        modelInfo.openrouterModel,
        options
      );
    } catch (fallbackError) {
      triedModels.push(fallbackModel);
      if (isRateLimitError(fallbackError)) {
        console.warn(`[parseCVWithFallback] ${fallbackModel} also rate limited`);
        continue;
      }
      throw fallbackError;
    }
  }

  throw new Error(
    `All available AI models are rate limited or unavailable. Tried: ${triedModels.join(", ")}. Please configure API keys in Settings and try again.`
  );
}

/**
 * Parse CV from text (DOCX) with automatic rate-limit fallback
 */
export async function parseCVTextWithFallback(
  cvText: string,
  options?: AIOptions
): Promise<ParsedCVData> {
  const triedModels: string[] = [];
  const availabilityOptions: AvailabilityOptions = {
    geminiKey: options?.geminiKey,
    openrouterKey: options?.openrouterKey,
  };

  // Try Gemini first
  if (isModelAvailable("gemini-2.5-flash", availabilityOptions)) {
    try {
      return await parseCVTextWithGeminiDirect(cvText, options);
    } catch (error) {
      triedModels.push("gemini-2.5-flash");
      if (!isRateLimitError(error)) throw error;
      console.warn("[parseCVTextWithFallback] Gemini rate limited, trying OpenRouter fallback...");
    }
  }

  // Fallback to OpenRouter models
  const fallbacks = getAvailableFallbackModels("gemini-2.5-flash", availabilityOptions);

  for (const fallbackModel of fallbacks) {
    const modelInfo = getModelInfo(fallbackModel);
    if (!modelInfo?.openrouterModel) continue;

    try {
      console.warn(`[parseCVTextWithFallback] Trying fallback: ${fallbackModel}`);
      return await parseCVTextWithOpenRouter(cvText, modelInfo.openrouterModel, options);
    } catch (fallbackError) {
      triedModels.push(fallbackModel);
      if (isRateLimitError(fallbackError)) {
        console.warn(`[parseCVTextWithFallback] ${fallbackModel} also rate limited`);
        continue;
      }
      throw fallbackError;
    }
  }

  throw new Error(
    `All available AI models are rate limited or unavailable. Tried: ${triedModels.join(", ")}. Please configure API keys in Settings and try again.`
  );
}
