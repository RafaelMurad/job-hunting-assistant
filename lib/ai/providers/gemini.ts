/**
 * Gemini AI Provider
 *
 * Google Gemini integration for job analysis, CV parsing, and LaTeX extraction.
 */

import { AI_CONFIG, getModelName } from "../config";
import {
  ANALYSIS_PROMPT,
  COVER_LETTER_PROMPT,
  CV_CONTENT_EXTRACTION_PROMPT,
  CV_EXTRACTION_PROMPT,
  LATEX_EXTRACTION_PROMPT,
  LATEX_FROM_STYLE_PROMPT,
  STYLE_ANALYSIS_PROMPT,
} from "../prompts";
import { extractedCVContentSchema, jobAnalysisSchema, parsedCVDataSchema } from "../schemas";
import type {
  ExtractedCVContent,
  JobAnalysisResult,
  LatexExtractionModel,
  ParsedCVData,
} from "../types";
import {
  cleanAndValidateLatex,
  cleanJsonResponse,
  extractJsonFromText,
  isValidJson,
  parseJsonOrThrow,
} from "../utils";

// =============================================================================
// JOB ANALYSIS
// =============================================================================

export async function analyzeWithGemini(
  jobDescription: string,
  userCV: string
): Promise<JobAnalysisResult> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
  const model = genAI.getGenerativeModel({
    model: AI_CONFIG.models.gemini,
  });

  const result = await model.generateContent(ANALYSIS_PROMPT(jobDescription, userCV));
  const text = result.response.text();

  // Clean JSON from markdown code blocks if present
  const jsonText = cleanJsonResponse(text);
  return parseJsonOrThrow(jsonText, jobAnalysisSchema, "Gemini job analysis");
}

// =============================================================================
// COVER LETTER GENERATION
// =============================================================================

export async function generateCoverLetterWithGemini(
  analysis: JobAnalysisResult,
  userCV: string
): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
  const model = genAI.getGenerativeModel({
    model: AI_CONFIG.models.gemini,
  });

  const result = await model.generateContent(COVER_LETTER_PROMPT(analysis, userCV));
  return result.response.text().trim();
}

// =============================================================================
// CV PARSING
// =============================================================================

/**
 * Parse CV using Gemini with native PDF vision.
 * Sends the PDF directly to Gemini - no text extraction needed.
 */
export async function parseCVWithGeminiVision(pdfBuffer: Buffer): Promise<ParsedCVData> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
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
export async function parseCVWithGeminiText(cvText: string): Promise<ParsedCVData> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
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
// LATEX EXTRACTION - TWO PASS
// =============================================================================

/**
 * Two-pass style extraction for Pro models
 * Pass 1: Extract visual style as JSON
 * Pass 2: Generate LaTeX using style + content
 */
export async function extractLatexTwoPass(
  base64Data: string,
  mimeType: string,
  modelName: string,
  genAI: InstanceType<typeof import("@google/generative-ai").GoogleGenerativeAI>
): Promise<string> {
  // Pass 1: Extract style as JSON
  const styleModel = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: 4096,
    },
  });

  const styleResult = await styleModel.generateContent([
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
    STYLE_ANALYSIS_PROMPT,
  ]);

  let styleJson = styleResult.response.text().trim();

  // Clean up JSON response
  styleJson = styleJson.replace(/^```(?:json)?\n?/gi, "").replace(/\n?```$/gi, "");

  // Validate it's valid JSON using utility to avoid exceptions for control flow
  if (!isValidJson(styleJson)) {
    console.warn("[Two-Pass] Style JSON invalid, falling back to single-pass");
    throw new Error("Style analysis returned invalid JSON");
  }

  // Style analysis logging (use warn since log is disallowed)
  console.warn("[Two-Pass] Style analysis complete:", styleJson.substring(0, 200) + "...");

  // Pass 2: Generate LaTeX using style + viewing the document again
  const latexModel = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: 32768,
    },
  });

  const latexResult = await latexModel.generateContent([
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
    LATEX_FROM_STYLE_PROMPT(styleJson),
  ]);

  return cleanAndValidateLatex(latexResult.response.text());
}

// =============================================================================
// LATEX EXTRACTION - SINGLE PASS
// =============================================================================

/**
 * Extract LaTeX using Gemini models (2.5 Pro, 2.5 Flash, 3 Pro)
 *
 * For Pro models (2.5 Pro, 3 Pro), uses two-pass extraction for better style preservation:
 * - Pass 1: Analyze visual style and extract as JSON
 * - Pass 2: Generate LaTeX using style analysis + content
 *
 * For Flash models, uses single-pass for speed.
 */
export async function extractLatexWithGemini(
  base64Data: string,
  mimeType: string,
  modelId: LatexExtractionModel
): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
  const modelName = getModelName(modelId);

  // Single-pass extraction for free tier
  // Escalating token limits for long CVs
  const tokenLimits = [16384, 32768];

  for (const maxTokens of tokenLimits) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
      },
    });

    try {
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        LATEX_EXTRACTION_PROMPT,
      ]);

      // Check for blocked content
      const candidate = result.response.candidates?.[0];
      if (!candidate) {
        const blockReason = result.response.promptFeedback?.blockReason;
        console.error(`[${modelId}] No response candidate. Block reason:`, blockReason);
        throw new Error(`Content blocked by safety filter: ${blockReason || "unknown reason"}`);
      }

      const finishReason = candidate.finishReason;
      const wasTruncated = finishReason === "MAX_TOKENS";

      // Check if response was blocked
      if (finishReason === "SAFETY") {
        const safetyRatings = candidate.safetyRatings;
        console.error(`[${modelId}] Response blocked by safety filter:`, safetyRatings);
        throw new Error("Content blocked by safety filter");
      }

      try {
        return cleanAndValidateLatex(result.response.text());
      } catch (error) {
        // If truncated and we have more limits to try, continue
        if (wasTruncated && maxTokens < tokenLimits[tokenLimits.length - 1]!) {
          console.warn(`[${modelId}] Response truncated at ${maxTokens} tokens, retrying...`);
          continue;
        }
        throw error;
      }
    } catch (error) {
      // Log the actual error for debugging
      console.error(`[${modelId}] Extraction error at ${maxTokens} tokens:`, error);
      throw error;
    }
  }

  throw new Error("LaTeX extraction failed after all retry attempts.");
}

// =============================================================================
// CV CONTENT EXTRACTION (for templates)
// =============================================================================

/**
 * Extract CV content as JSON using Gemini
 */
export async function extractContentWithGemini(
  base64Data: string,
  mimeType: string,
  modelName: LatexExtractionModel
): Promise<ExtractedCVContent> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);

  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: 16384,
    },
  });

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      CV_CONTENT_EXTRACTION_PROMPT,
    ]);

    // Check for blocked content
    const candidate = result.response.candidates?.[0];
    if (!candidate) {
      const blockReason = result.response.promptFeedback?.blockReason;
      console.error(`[extractContentWithGemini] No response candidate. Block reason:`, blockReason);
      throw new Error(`Content blocked by safety filter: ${blockReason || "unknown reason"}`);
    }

    if (candidate.finishReason === "SAFETY") {
      console.error(`[extractContentWithGemini] Response blocked:`, candidate.safetyRatings);
      throw new Error("Content blocked by safety filter");
    }

    const jsonText = cleanJsonResponse(result.response.text());
    return parseJsonOrThrow(jsonText, extractedCVContentSchema, "Gemini CV content extraction");
  } catch (error) {
    console.error(`[extractContentWithGemini] Error:`, error);
    throw error;
  }
}
