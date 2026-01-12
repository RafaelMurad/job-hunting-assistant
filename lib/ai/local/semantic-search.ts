/**
 * Semantic Search
 *
 * Search applications by meaning, not just keywords.
 * Uses embeddings to find semantically similar content.
 *
 * @module lib/ai/local/semantic-search
 */

import type { StoredApplication } from "@/lib/storage/interface";
import type { IEmbeddingService, SemanticSearchOptions, SemanticSearchResult } from "./types";

/**
 * Default options for semantic search.
 */
const DEFAULT_SEARCH_OPTIONS: Required<SemanticSearchOptions> = {
  limit: 10,
  minScore: 0.3,
};

/**
 * Perform semantic search across applications.
 *
 * Finds applications that are semantically similar to the query,
 * even if they don't contain the exact keywords.
 *
 * @param query - The search query
 * @param applications - Array of applications to search
 * @param embeddingService - The embedding service
 * @param options - Search options
 * @returns Sorted array of search results
 *
 * @example
 * ```typescript
 * const results = await semanticSearch(
 *   "remote React developer position",
 *   applications,
 *   embeddingService,
 *   { limit: 5, minScore: 0.4 }
 * );
 * ```
 */
export async function semanticSearch(
  query: string,
  applications: StoredApplication[],
  embeddingService: IEmbeddingService,
  options?: SemanticSearchOptions
): Promise<SemanticSearchResult<StoredApplication>[]> {
  const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };

  if (applications.length === 0) {
    return [];
  }

  // Embed the query
  const queryEmbedding = await embeddingService.embed(query);

  // Score each application
  const scoredResults: SemanticSearchResult<StoredApplication>[] = [];

  for (const app of applications) {
    // Combine application text for embedding
    const appText = buildApplicationText(app);
    const appEmbedding = await embeddingService.embed(appText);

    const score = embeddingService.cosineSimilarity(queryEmbedding, appEmbedding);

    if (score >= opts.minScore) {
      // Determine what was primarily matched
      const matchedOn = await determineMatchField(query, app, embeddingService);

      scoredResults.push({
        item: app,
        score,
        matchedOn,
      });
    }
  }

  // Sort by score descending and limit
  return scoredResults.sort((a, b) => b.score - a.score).slice(0, opts.limit);
}

/**
 * Build searchable text from application.
 */
function buildApplicationText(app: StoredApplication): string {
  const parts = [app.company, app.role, app.jobDescription];

  if (app.notes) {
    parts.push(app.notes);
  }

  return parts.join(" ");
}

/**
 * Determine which field the query most closely matches.
 */
async function determineMatchField(
  query: string,
  app: StoredApplication,
  embeddingService: IEmbeddingService
): Promise<string> {
  const queryEmbed = await embeddingService.embed(query);

  const fields = [
    { name: "role", text: app.role },
    { name: "company", text: app.company },
    { name: "description", text: app.jobDescription.slice(0, 500) },
  ];

  let bestMatch = { name: "description", score: 0 };

  for (const field of fields) {
    const fieldEmbed = await embeddingService.embed(field.text);
    const score = embeddingService.cosineSimilarity(queryEmbed, fieldEmbed);

    if (score > bestMatch.score) {
      bestMatch = { name: field.name, score };
    }
  }

  return bestMatch.name;
}

/**
 * Search with pre-computed embeddings.
 *
 * More efficient when embeddings are already cached.
 *
 * @param queryEmbedding - Pre-computed query embedding
 * @param applicationEmbeddings - Map of application ID to embedding
 * @param applications - The applications (for returning full objects)
 * @param embeddingService - For similarity calculation
 * @param options - Search options
 */
export function semanticSearchWithEmbeddings(
  queryEmbedding: Float32Array,
  applicationEmbeddings: Map<string, Float32Array>,
  applications: StoredApplication[],
  embeddingService: IEmbeddingService,
  options?: SemanticSearchOptions
): SemanticSearchResult<StoredApplication>[] {
  const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
  const results: SemanticSearchResult<StoredApplication>[] = [];

  for (const app of applications) {
    const appEmbedding = applicationEmbeddings.get(app.id);
    if (!appEmbedding) continue;

    const score = embeddingService.cosineSimilarity(queryEmbedding, appEmbedding);

    if (score >= opts.minScore) {
      results.push({
        item: app,
        score,
        matchedOn: "description", // Default when using cached embeddings
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, opts.limit);
}

/**
 * Check if a query looks like it would benefit from semantic search.
 *
 * Simple heuristic to detect semantic queries vs exact keyword searches.
 */
export function isSemanticQuery(query: string): boolean {
  // Semantic indicators
  const semanticPatterns = [
    /similar to/i,
    /like/i,
    /related to/i,
    /find.*(?:jobs?|roles?|positions?)/i,
    /looking for/i,
    /interested in/i,
    /work.*(?:life|remote|flexible)/i,
    /good.*(?:culture|team|benefits)/i,
  ];

  // Check for semantic patterns
  for (const pattern of semanticPatterns) {
    if (pattern.test(query)) {
      return true;
    }
  }

  // If query is longer than typical keyword search, might be semantic
  const words = query.trim().split(/\s+/);
  if (words.length >= 4) {
    return true;
  }

  return false;
}

/**
 * Hybrid search combining text and semantic search.
 *
 * Falls back to text search if semantic search returns no results,
 * or combines results for better coverage.
 */
export async function hybridSearch(
  query: string,
  applications: StoredApplication[],
  embeddingService: IEmbeddingService | null,
  options?: SemanticSearchOptions & { textFallback?: boolean }
): Promise<SemanticSearchResult<StoredApplication>[]> {
  const queryLower = query.toLowerCase().trim();

  // Text-based search results
  const textResults = applications.filter((app) => {
    const searchable = `${app.company} ${app.role} ${app.jobDescription}`.toLowerCase();
    return searchable.includes(queryLower);
  });

  // If no embedding service or not a semantic query, return text results
  if (!embeddingService || !embeddingService.isReady()) {
    return textResults.map((item) => ({
      item,
      score: 1,
      matchedOn: "text",
    }));
  }

  // Perform semantic search
  const semanticResults = await semanticSearch(query, applications, embeddingService, options);

  // If semantic search found good results, prefer those
  if (semanticResults.length > 0 && semanticResults[0]!.score > 0.5) {
    return semanticResults;
  }

  // Combine results, preferring semantic but including text matches
  const combinedMap = new Map<string, SemanticSearchResult<StoredApplication>>();

  // Add text results first
  for (const item of textResults) {
    combinedMap.set(item.id, { item, score: 0.5, matchedOn: "text" });
  }

  // Overlay semantic results (higher priority)
  for (const result of semanticResults) {
    combinedMap.set(result.item.id, result);
  }

  return Array.from(combinedMap.values()).sort((a, b) => b.score - a.score);
}
