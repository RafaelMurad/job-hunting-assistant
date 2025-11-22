/**
 * Similarity Algorithms
 *
 * Text similarity using TF-IDF and cosine similarity.
 *
 * LEARNING EXERCISE: Implement the similarity calculations.
 *
 * @see https://en.wikipedia.org/wiki/Tf%E2%80%93idf
 */

/**
 * Tokenize text into words
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

/**
 * Calculate term frequency
 */
export function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  // Normalize by document length
  for (const [term, count] of tf) {
    tf.set(term, count / tokens.length);
  }
  return tf;
}

/**
 * Calculate inverse document frequency
 */
export function inverseDocumentFrequency(
  documents: string[][],
  term: string
): number {
  const docsWithTerm = documents.filter((doc) => doc.includes(term)).length;
  if (docsWithTerm === 0) return 0;
  return Math.log(documents.length / docsWithTerm);
}

/**
 * TODO Exercise 1: Implement TF-IDF
 *
 * TF-IDF = Term Frequency × Inverse Document Frequency
 *
 * High TF-IDF = term is important in this document but rare overall
 */
export function tfidf(
  document: string,
  corpus: string[]
): Map<string, number> {
  const tokens = tokenize(document);
  const tf = termFrequency(tokens);
  const corpusTokens = corpus.map(tokenize);

  const tfidfScores = new Map<string, number>();

  for (const [term, tfScore] of tf) {
    const idfScore = inverseDocumentFrequency(corpusTokens, term);
    tfidfScores.set(term, tfScore * idfScore);
  }

  return tfidfScores;
}

/**
 * TODO Exercise 2: Implement Cosine Similarity
 *
 * Cosine similarity measures the angle between two vectors.
 * Range: 0 (orthogonal) to 1 (identical direction)
 */
export function cosineSimilarity(
  vec1: Map<string, number>,
  vec2: Map<string, number>
): number {
  // Get all unique terms
  const allTerms = new Set([...vec1.keys(), ...vec2.keys()]);

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (const term of allTerms) {
    const v1 = vec1.get(term) || 0;
    const v2 = vec2.get(term) || 0;

    dotProduct += v1 * v2;
    norm1 += v1 * v1;
    norm2 += v2 * v2;
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Calculate similarity between user profile and job
 */
export function calculateSimilarity(
  userSkills: string[],
  userExperience: string,
  jobSkills: string[],
  jobDescription: string
): number {
  // Combine user data into a document
  const userDoc = [...userSkills, userExperience].join(" ");
  const jobDoc = [...jobSkills, jobDescription].join(" ");

  // Create corpus for IDF calculation
  const corpus = [userDoc, jobDoc];

  // Calculate TF-IDF vectors
  const userVector = tfidf(userDoc, corpus);
  const jobVector = tfidf(jobDoc, corpus);

  // Calculate cosine similarity
  return cosineSimilarity(userVector, jobVector);
}

/**
 * Rank jobs by similarity to user profile
 */
export function rankJobs<T extends { skills: string[]; description: string }>(
  jobs: T[],
  userSkills: string[],
  userExperience: string
): Array<T & { similarity: number }> {
  return jobs
    .map((job) => ({
      ...job,
      similarity: calculateSimilarity(
        userSkills,
        userExperience,
        job.skills,
        job.description
      ),
    }))
    .sort((a, b) => b.similarity - a.similarity);
}
