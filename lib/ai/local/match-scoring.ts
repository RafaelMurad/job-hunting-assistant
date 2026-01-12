/**
 * Match Scoring
 *
 * Calculate instant CV-to-job match scores using local embeddings.
 * Provides fast, free, privacy-preserving match calculations.
 *
 * @module lib/ai/local/match-scoring
 */

import type { IEmbeddingService } from "./types";

/**
 * Calculate instant match score between CV and job description.
 *
 * Uses semantic similarity via embeddings to determine how well
 * a CV matches a job description. This is faster and free compared
 * to cloud API calls.
 *
 * @param cvText - The CV content as text
 * @param jobDescription - The job description text
 * @param embeddingService - The embedding service instance
 * @returns Match score from 0-100
 *
 * @example
 * ```typescript
 * const service = getEmbeddingService();
 * await service.initialize();
 * const score = await calculateInstantMatchScore(cvText, jobDescription, service);
 * console.log(`Match: ${score}%`);
 * ```
 */
export async function calculateInstantMatchScore(
  cvText: string,
  jobDescription: string,
  embeddingService: IEmbeddingService
): Promise<number> {
  // Generate embeddings in parallel
  const [cvEmbed, jobEmbed] = await Promise.all([
    embeddingService.embed(cvText),
    embeddingService.embed(jobDescription),
  ]);

  // Calculate similarity
  const similarity = embeddingService.cosineSimilarity(cvEmbed, jobEmbed);

  // Convert to 0-100 scale
  // Raw cosine similarity for text tends to cluster around 0.3-0.8
  // We apply a transformation to spread scores across the full range
  const adjustedScore = transformSimilarityToScore(similarity);

  return adjustedScore;
}

/**
 * Transform raw cosine similarity to a more intuitive 0-100 score.
 *
 * Raw cosine similarity for semantic text matching typically falls
 * in the 0.3-0.8 range. This function maps that to a more useful
 * 0-100 scale with better distribution.
 *
 * @param similarity - Raw cosine similarity (0-1)
 * @returns Adjusted score (0-100)
 */
function transformSimilarityToScore(similarity: number): number {
  // Define the expected range of raw similarities
  const minExpected = 0.25; // Very poor match
  const maxExpected = 0.85; // Excellent match

  // Clamp to expected range
  const clamped = Math.max(minExpected, Math.min(maxExpected, similarity));

  // Linear transformation to 0-100
  const normalized = (clamped - minExpected) / (maxExpected - minExpected);
  const score = Math.round(normalized * 100);

  return Math.max(0, Math.min(100, score));
}

/**
 * Batch calculate match scores for multiple job descriptions.
 *
 * More efficient than calling calculateInstantMatchScore multiple times
 * when you have many jobs to score against the same CV.
 *
 * @param cvText - The CV content
 * @param jobDescriptions - Array of job descriptions
 * @param embeddingService - The embedding service
 * @returns Array of scores in same order as jobDescriptions
 */
export async function calculateBatchMatchScores(
  cvText: string,
  jobDescriptions: string[],
  embeddingService: IEmbeddingService
): Promise<number[]> {
  // Embed CV once
  const cvEmbed = await embeddingService.embed(cvText);

  // Embed all job descriptions
  const jobEmbeds = await embeddingService.embedBatch(jobDescriptions);

  // Calculate scores
  return jobEmbeds.map((jobEmbed) => {
    const similarity = embeddingService.cosineSimilarity(cvEmbed, jobEmbed);
    return transformSimilarityToScore(similarity);
  });
}

/**
 * Calculate match score from pre-computed embeddings.
 *
 * Useful when embeddings are already cached in IndexedDB.
 *
 * @param cvEmbedding - Pre-computed CV embedding
 * @param jobEmbedding - Pre-computed job embedding
 * @param embeddingService - The embedding service (for similarity calculation)
 * @returns Match score (0-100)
 */
export function calculateMatchFromEmbeddings(
  cvEmbedding: Float32Array,
  jobEmbedding: Float32Array,
  embeddingService: IEmbeddingService
): number {
  const similarity = embeddingService.cosineSimilarity(cvEmbedding, jobEmbedding);
  return transformSimilarityToScore(similarity);
}
