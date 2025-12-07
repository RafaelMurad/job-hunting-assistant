/**
 * Analyze Validation Schemas
 *
 * Zod schemas for job analysis and cover letter generation.
 * Used by tRPC for input validation and type inference.
 */

import { z } from "zod";

/**
 * Schema for job analysis result (returned by AI).
 */
export const jobAnalysisResultSchema = z.object({
  company: z.string(),
  role: z.string(),
  matchScore: z.number().min(0).max(100),
  topRequirements: z.array(z.string()),
  skillsMatch: z.array(z.string()),
  gaps: z.array(z.string()),
  redFlags: z.array(z.string()),
  keyPoints: z.array(z.string()),
});

export type JobAnalysisResult = z.infer<typeof jobAnalysisResultSchema>;

/**
 * Schema for analyze job input.
 */
export const analyzeJobSchema = z.object({
  jobDescription: z.string().min(1, "Job description is required"),
  userId: z.string().min(1, "User ID is required"),
});

export type AnalyzeJobInput = z.infer<typeof analyzeJobSchema>;

/**
 * Schema for cover letter generation input.
 */
export const generateCoverLetterSchema = z.object({
  jobDescription: z.string().min(1, "Job description is required"),
  userId: z.string().min(1, "User ID is required"),
  analysis: jobAnalysisResultSchema,
});

export type GenerateCoverLetterInput = z.infer<typeof generateCoverLetterSchema>;
