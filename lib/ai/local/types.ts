/**
 * Local AI Types
 *
 * Shared type definitions for browser-based ML operations using Transformers.js.
 * These types support the local-first, privacy-focused AI features.
 *
 * @module lib/ai/local/types
 */

// =============================================================================
// EMBEDDING TYPES
// =============================================================================

/**
 * Source types for embeddings - what entity the embedding represents.
 */
export type EmbeddingSourceType = "cv" | "application" | "profile";

/**
 * Stored embedding in IndexedDB.
 * Embeddings are cached to avoid recomputing for unchanged content.
 */
export interface StoredEmbedding {
  /** Unique ID for this embedding */
  id: string;
  /** Type of source entity */
  sourceType: EmbeddingSourceType;
  /** Reference to the source entity ID */
  sourceId: string;
  /** The embedding vector (384 dimensions for MiniLM) */
  embedding: Float32Array;
  /** Hash of the source text to detect changes */
  textHash: string;
  /** When the embedding was created */
  createdAt: string;
}

/**
 * Input for creating a new embedding.
 */
export interface CreateEmbeddingInput {
  sourceType: EmbeddingSourceType;
  sourceId: string;
  embedding: Float32Array;
  textHash: string;
}

// =============================================================================
// SEARCH TYPES
// =============================================================================

/**
 * Result from semantic search.
 */
export interface SemanticSearchResult<T> {
  /** The matched item */
  item: T;
  /** Similarity score (0-1) */
  score: number;
  /** Which field was primarily matched */
  matchedOn: string;
}

/**
 * Options for semantic search.
 */
export interface SemanticSearchOptions {
  /** Maximum number of results to return */
  limit?: number;
  /** Minimum similarity score (0-1) to include in results */
  minScore?: number;
}

// =============================================================================
// MODEL TYPES
// =============================================================================

/**
 * Model loading progress information.
 */
export interface ModelLoadProgress {
  /** Current progress (0-100) */
  progress: number;
  /** Current status message */
  status: string;
  /** Whether loading is complete */
  loaded: boolean;
}

/**
 * Model configuration.
 */
export interface ModelConfig {
  /** Model identifier on Hugging Face */
  modelId: string;
  /** Human-readable name */
  name: string;
  /** Approximate size in MB */
  sizeMB: number;
  /** Embedding dimensions */
  dimensions: number;
}

/**
 * Available models for local AI.
 */
export const LOCAL_AI_MODELS: { embeddings: ModelConfig } = {
  embeddings: {
    modelId: "Xenova/all-MiniLM-L6-v2",
    name: "MiniLM L6 v2",
    sizeMB: 23,
    dimensions: 384,
  },
};

// =============================================================================
// SERVICE TYPES
// =============================================================================

/**
 * Callback for model loading progress.
 */
export type ProgressCallback = (progress: ModelLoadProgress) => void;

/**
 * Embedding service interface.
 */
export interface IEmbeddingService {
  /** Initialize the service and load models */
  initialize(onProgress?: ProgressCallback): Promise<void>;
  /** Check if the service is ready */
  isReady(): boolean;
  /** Generate embedding for text */
  embed(text: string): Promise<Float32Array>;
  /** Generate embeddings for multiple texts */
  embedBatch(texts: string[]): Promise<Float32Array[]>;
  /** Calculate cosine similarity between two embeddings */
  cosineSimilarity(a: Float32Array, b: Float32Array): number;
}
