/**
 * Job Analysis Module
 *
 * AI-powered job description analysis against user CVs.
 */

import { AI_CONFIG } from "../config";
import type { JobAnalysisResult } from "../types";
import { analyzeWithGemini } from "../providers/gemini";
import { analyzeWithOpenAI } from "../providers/openai";
import { analyzeWithClaude } from "../providers/claude";

// =============================================================================
// UNIFIED JOB ANALYSIS
// =============================================================================

/**
 * Analyze a job description against a user's CV
 * Routes to the configured AI provider
 */
export async function analyzeJob(
  jobDescription: string,
  userCV: string
): Promise<JobAnalysisResult> {
  switch (AI_CONFIG.provider) {
    case "gemini":
      return analyzeWithGemini(jobDescription, userCV);
    case "openai":
      return analyzeWithOpenAI(jobDescription, userCV);
    case "claude":
      return analyzeWithClaude(jobDescription, userCV);
    default:
      throw new Error(`Unsupported AI provider: ${AI_CONFIG.provider}`);
  }
}
