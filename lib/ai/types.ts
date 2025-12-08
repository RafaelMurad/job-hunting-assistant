/**
 * AI Module Types
 *
 * Shared type definitions for all AI providers and operations.
 */

// =============================================================================
// PROVIDER TYPES
// =============================================================================

export type AIProvider = "gemini" | "openai" | "claude" | "openrouter";

/**
 * Available models for LaTeX CV extraction
 * Order determines dropdown display order (recommended testing order)
 */
export type LatexExtractionModel =
  | "gemini-2.5-flash" // Free, fast (default)
  | "gemini-2.5-pro" // Paid, best reasoning
  | "gemini-3-pro-preview" // Paid, best multimodal
  | "gemini-2.0-flash-or" // Free via OpenRouter, different rate limits
  | "nova-2-lite" // Free via OpenRouter, Amazon vision model
  | "mistral-small-3.1" // Free via OpenRouter, Mistral vision model
  | "gemma-3-27b" // Free via OpenRouter, Google Gemma
  | "gpt-4o" // Paid ~$0.01/CV
  | "claude-sonnet"; // Paid ~$0.05/CV

/**
 * Model metadata for UI display and availability checks
 */
export interface ModelInfo {
  id: LatexExtractionModel;
  name: string;
  provider: AIProvider;
  cost: string;
  description: string;
  openrouterModel?: string; // Model ID for OpenRouter API
}

// =============================================================================
// JOB ANALYSIS TYPES
// =============================================================================

export interface JobAnalysisResult {
  company: string;
  role: string;
  matchScore: number;
  topRequirements: string[];
  skillsMatch: string[];
  gaps: string[];
  redFlags: string[];
  keyPoints: string[];
}

// =============================================================================
// CV PARSING TYPES
// =============================================================================

/**
 * Parsed CV data structure (basic extraction).
 */
export interface ParsedCVData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  skills: string;
}

// =============================================================================
// ATS ANALYSIS TYPES
// =============================================================================

/**
 * ATS Compliance analysis result
 */
export interface ATSAnalysisResult {
  score: number; // 0-100
  issues: Array<{
    severity: "error" | "warning" | "info";
    message: string;
    suggestion: string;
  }>;
  summary: string;
}

// =============================================================================
// LATEX EXTRACTION TYPES
// =============================================================================

/**
 * Result from LaTeX extraction including which model was used
 */
export interface LatexExtractionResult {
  latex: string;
  modelUsed: LatexExtractionModel;
  fallbackUsed: boolean;
}

/**
 * Result type for template-based extraction
 */
export interface TemplateExtractionResult {
  latex: string;
  content: ExtractedCVContent;
  templateId: CVTemplateId;
  modelUsed: LatexExtractionModel;
  fallbackUsed: boolean;
}

// =============================================================================
// CV CONTENT TYPES (for template-based extraction)
// =============================================================================

// Re-export from cv-templates for convenience
import type { CVTemplateId, ExtractedCVContent } from "@/lib/cv-templates";
export type { CVTemplateId, ExtractedCVContent };
