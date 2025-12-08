/**
 * Cover Letter Generation Module
 *
 * AI-powered cover letter generation based on job analysis.
 */

import { AI_CONFIG } from "../config";
import type { JobAnalysisResult } from "../types";
import { generateCoverLetterWithGemini } from "../providers/gemini";
import { generateCoverLetterWithOpenAI } from "../providers/openai";
import { generateCoverLetterWithClaude } from "../providers/claude";

// =============================================================================
// UNIFIED COVER LETTER GENERATION
// =============================================================================

/**
 * Generate a cover letter based on job analysis and user CV
 * Routes to the configured AI provider
 */
export async function generateCoverLetter(
  analysis: JobAnalysisResult,
  userCV: string
): Promise<string> {
  switch (AI_CONFIG.provider) {
    case "gemini":
      return generateCoverLetterWithGemini(analysis, userCV);
    case "openai":
      return generateCoverLetterWithOpenAI(analysis, userCV);
    case "claude":
      return generateCoverLetterWithClaude(analysis, userCV);
    default:
      throw new Error(`Unsupported AI provider: ${AI_CONFIG.provider}`);
  }
}
