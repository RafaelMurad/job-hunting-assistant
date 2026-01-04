/**
 * Cover Letter Generation Module
 *
 * AI-powered cover letter generation based on job analysis.
 */

import type { JobAnalysisResult } from "../types";
import { generateCoverLetterWithGemini } from "../providers/gemini";

// =============================================================================
// UNIFIED COVER LETTER GENERATION
// =============================================================================

/**
 * Generate a cover letter based on job analysis and user CV
 * Uses Gemini (free tier)
 */
export async function generateCoverLetter(
  analysis: JobAnalysisResult,
  userCV: string
): Promise<string> {
  return generateCoverLetterWithGemini(analysis, userCV);
}
