/**
 * Job Analysis Module
 *
 * AI-powered job description analysis against user CVs.
 */

import type { JobAnalysisResult } from "../types";
import { analyzeWithGemini } from "../providers/gemini";

// =============================================================================
// UNIFIED JOB ANALYSIS
// =============================================================================

/**
 * Analyze a job description against a user's CV
 * Uses Gemini (free tier)
 */
export async function analyzeJob(
  jobDescription: string,
  userCV: string
): Promise<JobAnalysisResult> {
  return analyzeWithGemini(jobDescription, userCV);
}
