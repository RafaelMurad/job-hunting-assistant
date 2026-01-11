/**
 * AI Module - Main Entry Point
 *
 * This file maintains backward compatibility with the original lib/ai.ts API.
 * All existing imports from "@/lib/ai" should continue to work.
 */

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  AIProvider,
  LatexExtractionModel,
  ModelInfo,
  JobAnalysisResult,
  ParsedCVData,
  ATSAnalysisResult,
  LatexExtractionResult,
  TemplateExtractionResult,
  CVTemplateId,
  ExtractedCVContent,
} from "./types";

// =============================================================================
// CONFIG EXPORTS
// =============================================================================

export {
  AI_CONFIG,
  LATEX_MODELS,
  isModelAvailable,
  getAvailableModels,
  getModelInfo,
  getModelName,
} from "./config";

// =============================================================================
// PROVIDER EXPORTS (for direct access if needed)
// =============================================================================

// Gemini
export {
  analyzeWithGemini,
  generateCoverLetterWithGemini,
  parseCVWithGeminiVision,
  parseCVWithGeminiText,
  extractLatexWithGemini,
  extractLatexTwoPass,
  extractContentWithGemini,
} from "./providers/gemini";

// OpenRouter
export { extractLatexWithOpenRouter, extractContentWithOpenRouter } from "./providers/openrouter";

// =============================================================================
// EXTRACTION EXPORTS
// =============================================================================

// Shared utilities
export { cleanAndValidateLatex, cleanJsonResponse, extractJsonFromText } from "./utils";

// LaTeX extraction
export {
  extractLatexFromPDF,
  extractLatexFromDocx,
  extractLatexWithModel,
  modifyLatexWithAI,
  analyzeATSCompliance,
} from "./extraction/latex";

// Content extraction (template-based)
export {
  extractWithTemplate,
  regenerateWithTemplate,
  parseExtractedContent,
  extractedCVContentSchema,
} from "./extraction/content";

// CV data extraction (with rate-limit fallback)
export { parseCVWithFallback, parseCVTextWithFallback } from "./extraction/cv-data";

// =============================================================================
// GENERATION EXPORTS (unified API)
// =============================================================================

export { analyzeJob } from "./generation/job-analysis";
export { generateCoverLetter } from "./generation/cover-letter";
