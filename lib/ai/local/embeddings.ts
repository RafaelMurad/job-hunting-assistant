/**
 * Embedding Service
 *
 * Browser-based text embedding using Transformers.js.
 * Uses the MiniLM-L6-v2 model for fast, lightweight embeddings.
 *
 * @module lib/ai/local/embeddings
 */

import type { IEmbeddingService, ProgressCallback } from "./types";
import { LOCAL_AI_MODELS } from "./types";

// Lazy import to avoid loading transformers.js on server
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Pipeline = any;

/**
 * Singleton embedding service for browser-based text embeddings.
 *
 * Uses Xenova/all-MiniLM-L6-v2 (23MB) for fast embeddings.
 * Models are cached in IndexedDB after first download.
 *
 * @example
 * ```typescript
 * const service = EmbeddingService.getInstance();
 * await service.initialize((progress) => console.log(progress.progress));
 * const embedding = await service.embed("Hello world");
 * ```
 */
export class EmbeddingService implements IEmbeddingService {
  private static instance: EmbeddingService | null = null;
  private embedder: Pipeline | null = null;
  private initPromise: Promise<void> | null = null;
  private ready = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the singleton instance of EmbeddingService.
   */
  static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  /**
   * Check if running in browser environment.
   */
  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  /**
   * Initialize the embedding service and load models.
   * Safe to call multiple times - will only initialize once.
   *
   * @param onProgress - Optional callback for loading progress
   */
  async initialize(onProgress?: ProgressCallback): Promise<void> {
    // Skip on server
    if (!this.isBrowser()) {
      return;
    }

    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    // Already ready
    if (this.ready && this.embedder) {
      return;
    }

    this.initPromise = this.doInitialize(onProgress);
    return this.initPromise;
  }

  private async doInitialize(onProgress?: ProgressCallback): Promise<void> {
    try {
      onProgress?.({
        progress: 0,
        status: "Loading transformers library...",
        loaded: false,
      });

      // Dynamic import to avoid server-side loading
      const { pipeline, env } = await import("@huggingface/transformers");

      // Configure for browser usage
      env.allowLocalModels = false;
      env.allowRemoteModels = true; // Allow downloading from Hugging Face
      env.useBrowserCache = true;

      const modelConfig = LOCAL_AI_MODELS.embeddings;
      if (!modelConfig) {
        throw new Error("Embeddings model configuration not found");
      }

      onProgress?.({
        progress: 10,
        status: `Loading ${modelConfig.name} model...`,
        loaded: false,
      });

      // Create the embedding pipeline
      this.embedder = await pipeline("feature-extraction", modelConfig.modelId, {
        progress_callback: (data: { progress?: number; status?: string }) => {
          if (data.progress !== undefined) {
            // Scale progress from 10-90%
            const scaledProgress = 10 + data.progress * 0.8;
            onProgress?.({
              progress: Math.round(scaledProgress),
              status: data.status || "Downloading model...",
              loaded: false,
            });
          }
        },
      });

      this.ready = true;

      onProgress?.({
        progress: 100,
        status: "Ready",
        loaded: true,
      });
    } catch (error) {
      this.initPromise = null;
      this.ready = false;
      throw error;
    }
  }

  /**
   * Check if the service is ready to generate embeddings.
   */
  isReady(): boolean {
    return this.ready && this.embedder !== null;
  }

  /**
   * Generate an embedding for a single text.
   *
   * @param text - The text to embed
   * @returns Float32Array of embedding values (384 dimensions)
   * @throws Error if service is not initialized
   */
  async embed(text: string): Promise<Float32Array> {
    if (!this.embedder) {
      throw new Error("EmbeddingService not initialized. Call initialize() first.");
    }

    // Truncate very long texts to avoid memory issues
    const truncatedText = text.slice(0, 8192);

    const result = await this.embedder(truncatedText, {
      pooling: "mean",
      normalize: true,
    });

    // Extract the embedding data
    // The result is a Tensor-like object with a data property
    const tensorResult = result as { data: ArrayLike<number> };
    return new Float32Array(tensorResult.data);
  }

  /**
   * Generate embeddings for multiple texts.
   * More efficient than calling embed() multiple times.
   *
   * @param texts - Array of texts to embed
   * @returns Array of Float32Array embeddings
   */
  async embedBatch(texts: string[]): Promise<Float32Array[]> {
    // Process in parallel with concurrency limit
    const results: Float32Array[] = [];
    const batchSize = 4;

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map((text) => this.embed(text)));
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Calculate cosine similarity between two embeddings.
   *
   * @param a - First embedding
   * @param b - Second embedding
   * @returns Similarity score between 0 and 1
   */
  cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length) {
      throw new Error("Embeddings must have the same dimensions");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i]! * b[i]!;
      normA += a[i]! * a[i]!;
      normB += b[i]! * b[i]!;
    }

    // Embeddings are already normalized, but handle edge cases
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;

    // Clamp to [0, 1] range (cosine similarity can be negative for opposite vectors)
    const similarity = dotProduct / denominator;
    return Math.max(0, Math.min(1, similarity));
  }
}

/**
 * Get the singleton embedding service instance.
 * Convenience function for accessing the service.
 */
export function getEmbeddingService(): EmbeddingService {
  return EmbeddingService.getInstance();
}
