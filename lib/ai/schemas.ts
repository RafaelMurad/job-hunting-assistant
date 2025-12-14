/**
 * AI Response Schemas
 *
 * Zod schemas for validating AI API responses.
 * These ensure type safety at runtime, preventing crashes from malformed AI responses.
 *
 * @module lib/ai/schemas
 */

import { z } from "zod";

// =============================================================================
// JOB ANALYSIS SCHEMA
// =============================================================================

/**
 * Schema for job analysis results from AI.
 * All fields are required with sensible defaults for partial responses.
 */
export const jobAnalysisSchema = z.object({
  company: z.string().default("Unknown Company"),
  role: z.string().default("Unknown Role"),
  matchScore: z.number().min(0).max(100).default(0),
  topRequirements: z.array(z.string()).default([]),
  skillsMatch: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  redFlags: z.array(z.string()).default([]),
  keyPoints: z.array(z.string()).default([]),
});

export type JobAnalysisResult = z.infer<typeof jobAnalysisSchema>;

// =============================================================================
// CV PARSING SCHEMA
// =============================================================================

/**
 * Schema for basic CV data extraction.
 */
export const parsedCVDataSchema = z.object({
  name: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  summary: z.string().default(""),
  experience: z.string().default(""),
  skills: z.string().default(""),
});

export type ParsedCVData = z.infer<typeof parsedCVDataSchema>;

// =============================================================================
// ATS ANALYSIS SCHEMA
// =============================================================================

/**
 * Schema for ATS issue items.
 */
const atsIssueSchema = z.object({
  severity: z.enum(["error", "warning", "info"]).default("info"),
  message: z.string(),
  suggestion: z.string(),
});

/**
 * Schema for ATS compliance analysis results.
 */
export const atsAnalysisSchema = z.object({
  score: z.number().min(0).max(100).default(0),
  issues: z.array(atsIssueSchema).default([]),
  summary: z.string().default(""),
});

export type ATSAnalysisResult = z.infer<typeof atsAnalysisSchema>;

// =============================================================================
// CV CONTENT EXTRACTION SCHEMA (for templates)
// =============================================================================

/**
 * Contact information schema.
 */
export const contactSchema = z.object({
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  website: z.string().optional(),
});

/**
 * Skill category schema.
 */
export const skillCategorySchema = z.object({
  category: z.string(),
  items: z.string(),
});

/**
 * Work experience schema.
 */
export const experienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  bullets: z.array(z.string()).default([]),
});

/**
 * Education schema.
 */
export const educationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * Project schema.
 */
export const projectSchema = z.object({
  name: z.string(),
  url: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

/**
 * Language proficiency schema.
 */
export const languageSchema = z.object({
  language: z.string(),
  level: z.string(),
});

/**
 * Full CV content schema for template-based extraction.
 */
export const extractedCVContentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  contact: contactSchema,
  summary: z.string().default(""),
  skills: z.array(skillCategorySchema).default([]),
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  projects: z.array(projectSchema).optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(languageSchema).optional(),
});

export type ExtractedCVContent = z.infer<typeof extractedCVContentSchema>;

// =============================================================================
// FEATURE FLAGS SCHEMA
// =============================================================================

/**
 * Schema for feature flag state stored in localStorage.
 */
export const flagStateSchema = z.record(z.string(), z.boolean());

export type FlagState = z.infer<typeof flagStateSchema>;

// =============================================================================
// OAUTH STATE SCHEMA
// =============================================================================

/**
 * Schema for OAuth state stored in cookies.
 */
export const oauthStateSchema = z.object({
  redirectUrl: z.string(),
  nonce: z.string().min(1),
});

export type OAuthState = z.infer<typeof oauthStateSchema>;

// =============================================================================
// STRING ARRAY SCHEMA (for UX router JSON fields)
// =============================================================================

/**
 * Schema for JSON-encoded string arrays in database.
 */
export const stringArraySchema = z.array(z.string());

/**
 * Schema for persona examples (do/don't arrays).
 */
export const personaExamplesSchema = z.object({
  do: z.array(z.string()).default([]),
  dont: z.array(z.string()).default([]),
});
