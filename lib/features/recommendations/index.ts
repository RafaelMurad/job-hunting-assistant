/**
 * Smart Recommendations Feature
 *
 * Job recommendations using similarity algorithms.
 *
 * @see docs/features/recommendations/README.md
 */

export { JobRecommendations } from "./components/JobRecommendations";
export { useRecommendations } from "./hooks/useRecommendations";
export { calculateSimilarity, tfidf } from "./utils/similarity";
