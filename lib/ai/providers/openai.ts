/**
 * OpenAI Provider
 *
 * OpenAI GPT-4 integration for job analysis, cover letters, and LaTeX extraction.
 */

import { AI_CONFIG } from "../config";
import type { JobAnalysisResult } from "../types";
import { ANALYSIS_PROMPT, COVER_LETTER_PROMPT, LATEX_EXTRACTION_PROMPT } from "../prompts";
import { cleanAndValidateLatex } from "../utils";

// =============================================================================
// JOB ANALYSIS
// =============================================================================

export async function analyzeWithOpenAI(
  jobDescription: string,
  userCV: string
): Promise<JobAnalysisResult> {
  const { OpenAI } = await import("openai");

  const openai = new OpenAI({ apiKey: AI_CONFIG.apiKeys.openai! });

  const completion = await openai.chat.completions.create({
    model: AI_CONFIG.models.openai,
    messages: [
      { role: "system", content: "You are a job application expert. Return only valid JSON." },
      { role: "user", content: ANALYSIS_PROMPT(jobDescription, userCV) },
    ],
    response_format: { type: "json_object" },
  });

  const firstChoice = completion.choices[0];
  if (!firstChoice?.message.content) {
    throw new Error("No response from OpenAI");
  }
  return JSON.parse(firstChoice.message.content) as JobAnalysisResult;
}

// =============================================================================
// COVER LETTER GENERATION
// =============================================================================

export async function generateCoverLetterWithOpenAI(
  analysis: JobAnalysisResult,
  userCV: string
): Promise<string> {
  const { OpenAI } = await import("openai");

  const openai = new OpenAI({ apiKey: AI_CONFIG.apiKeys.openai! });

  const completion = await openai.chat.completions.create({
    model: AI_CONFIG.models.openai,
    messages: [
      { role: "system", content: "You are a professional cover letter writer." },
      { role: "user", content: COVER_LETTER_PROMPT(analysis, userCV) },
    ],
  });

  const firstChoice = completion.choices[0];
  if (!firstChoice?.message.content) {
    throw new Error("No response from OpenAI");
  }
  return firstChoice.message.content.trim();
}

// =============================================================================
// LATEX EXTRACTION
// =============================================================================

/**
 * Extract LaTeX using OpenAI GPT-4o vision
 */
export async function extractLatexWithOpenAI(
  base64Data: string,
  mimeType: string
): Promise<string> {
  const { OpenAI } = await import("openai");

  const openai = new OpenAI({ apiKey: AI_CONFIG.apiKeys.openai! });

  // Convert mimeType for OpenAI (it expects image/* or application/pdf handled differently)
  // For PDFs, we need to use the file API or convert to images
  // GPT-4o supports direct image URLs but for PDF we'll pass as data URL
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  const completion = await openai.chat.completions.create({
    model: AI_CONFIG.models.openai,
    max_tokens: 16384,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: dataUrl,
              detail: "high",
            },
          },
          {
            type: "text",
            text: LATEX_EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  });

  const content = completion.choices[0]?.message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return cleanAndValidateLatex(content);
}
