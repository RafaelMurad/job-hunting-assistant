/**
 * Local AI Module - Main Entry Point
 *
 * Browser-based ML capabilities using Transformers.js.
 * Provides instant, free, private AI features that complement cloud AI.
 *
 * @module lib/ai/local
 */

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  CreateEmbeddingInput,
  EmbeddingSourceType,
  IEmbeddingService,
  ModelConfig,
  ModelLoadProgress,
  ProgressCallback,
  SemanticSearchOptions,
  SemanticSearchResult,
  StoredEmbedding,
} from "./types";

export { LOCAL_AI_MODELS } from "./types";

// =============================================================================
// SERVICE EXPORTS
// =============================================================================

export { EmbeddingService, getEmbeddingService } from "./embeddings";

// =============================================================================
// MATCH SCORING EXPORTS
// =============================================================================

export {
  calculateBatchMatchScores,
  calculateInstantMatchScore,
  calculateMatchFromEmbeddings,
} from "./match-scoring";

// =============================================================================
// SEMANTIC SEARCH EXPORTS
// =============================================================================

export {
  hybridSearch,
  isSemanticQuery,
  semanticSearch,
  semanticSearchWithEmbeddings,
} from "./semantic-search";

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export { extractTextFromLatex, isLatexContent } from "./latex-utils";
