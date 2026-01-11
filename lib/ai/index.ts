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
  ATSAnalysisResult,
  CVTemplateId,
  ExtractedCVContent,
  JobAnalysisResult,
  LatexExtractionModel,
  LatexExtractionResult,
  ModelInfo,
  ParsedCVData,
  TemplateExtractionResult,
} from "./types";

// =============================================================================
// CONFIG EXPORTS
// =============================================================================

export {
  AI_CONFIG,
  getAPIKeyForProvider,
  getAvailableModels,
  getModelInfo,
  getModelName,
  hasAnyAIAvailable,
  hasBYOK,
  isModelAvailable,
  LATEX_MODELS,
  type AvailabilityOptions,
} from "./config";

// =============================================================================
// KEY MANAGER EXPORTS (BYOK support for local mode)
// =============================================================================

export {
  clearAllAPIKeys,
  getAPIKey,
  getAPIKeyStatus,
  getFirstAvailableProvider,
  hasAnyAPIKey,
  hasAPIKey,
  maskAPIKey,
  PROVIDER_INFO,
  removeAPIKey,
  setAPIKey,
  testAPIKey,
  validateKeyFormat,
} from "./key-manager";

// =============================================================================
// PROVIDER EXPORTS (for direct access if needed)
// =============================================================================

// Gemini
export {
  analyzeWithGemini,
  extractContentWithGemini,
  extractLatexTwoPass,
  extractLatexWithGemini,
  generateCoverLetterWithGemini,
  parseCVWithGeminiText,
  parseCVWithGeminiVision,
  type GeminiOptions,
} from "./providers/gemini";

// OpenRouter
export {
  extractContentWithOpenRouter,
  extractLatexWithOpenRouter,
  type OpenRouterOptions,
} from "./providers/openrouter";

// =============================================================================
// EXTRACTION EXPORTS
// =============================================================================

// Shared utilities
export { cleanAndValidateLatex, cleanJsonResponse, extractJsonFromText } from "./utils";

// LaTeX extraction
export {
  analyzeATSCompliance,
  extractLatexFromDocx,
  extractLatexFromPDF,
  extractLatexWithModel,
  modifyLatexWithAI,
  type AIOptions,
} from "./extraction/latex";

// Content extraction (template-based)
export {
  extractedCVContentSchema,
  extractWithTemplate,
  parseExtractedContent,
  regenerateWithTemplate,
} from "./extraction/content";

// CV data extraction (with rate-limit fallback)
export { parseCVTextWithFallback, parseCVWithFallback } from "./extraction/cv-data";

// =============================================================================
// GENERATION EXPORTS (unified API)
// =============================================================================

export { generateCoverLetter } from "./generation/cover-letter";
export { analyzeJob } from "./generation/job-analysis";
