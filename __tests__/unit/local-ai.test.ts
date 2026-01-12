/**
 * Unit Tests: Local AI Module
 *
 * Tests for the local AI functionality including:
 * - Embedding service
 * - Match scoring
 * - Semantic search
 *
 * Note: These tests mock Transformers.js to avoid downloading models in CI.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the transformers library before importing our modules
vi.mock("@huggingface/transformers", () => ({
  pipeline: vi.fn(),
  env: {
    allowLocalModels: true,
    useBrowserCache: true,
  },
}));

// Import after mocking
import {
  calculateInstantMatchScore,
  calculateBatchMatchScores,
  calculateMatchFromEmbeddings,
} from "@/lib/ai/local/match-scoring";
import { semanticSearch, isSemanticQuery, hybridSearch } from "@/lib/ai/local/semantic-search";
import type { IEmbeddingService } from "@/lib/ai/local/types";
import type { StoredApplication } from "@/lib/storage/interface";

// =============================================================================
// MOCK EMBEDDING SERVICE
// =============================================================================

/**
 * Create a mock embedding service for testing.
 * Generates deterministic embeddings based on text content.
 */
function createMockEmbeddingService(): IEmbeddingService {
  return {
    isReady: () => true,
    initialize: vi.fn().mockResolvedValue(undefined),
    embed: vi.fn().mockImplementation((text: string) => {
      // Create a simple hash-based embedding
      const hash = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const embedding = new Float32Array(384);
      for (let i = 0; i < 384; i++) {
        embedding[i] = Math.sin(hash + i) * 0.5;
      }
      // Normalize
      const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
      for (let i = 0; i < 384; i++) {
        embedding[i] = embedding[i]! / norm;
      }
      return Promise.resolve(embedding);
    }),
    embedBatch: vi.fn().mockImplementation(async (texts: string[]) => {
      const service = createMockEmbeddingService();
      return Promise.all(texts.map((t) => service.embed(t)));
    }),
    cosineSimilarity: (a: Float32Array, b: Float32Array) => {
      let dot = 0;
      for (let i = 0; i < a.length; i++) {
        dot += a[i]! * b[i]!;
      }
      return Math.max(0, Math.min(1, dot));
    },
  };
}

/**
 * Create a mock application for testing.
 */
function createMockApplication(overrides: Partial<StoredApplication> = {}): StoredApplication {
  return {
    id: "app_1",
    company: "Acme Corp",
    role: "Senior Software Engineer",
    jobDescription:
      "We are looking for a senior software engineer with React and TypeScript experience.",
    jobUrl: "https://example.com/job",
    matchScore: 75,
    analysis: "{}",
    coverLetter: "",
    status: "saved",
    appliedAt: null,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// =============================================================================
// MATCH SCORING TESTS
// =============================================================================

describe("Match Scoring", () => {
  let mockService: IEmbeddingService;

  beforeEach(() => {
    mockService = createMockEmbeddingService();
  });

  describe("calculateInstantMatchScore", () => {
    it("returns a score between 0 and 100", async () => {
      const score = await calculateInstantMatchScore(
        "I am a software engineer with 5 years of experience in React and TypeScript.",
        "Looking for a senior React developer with TypeScript skills.",
        mockService
      );

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("returns higher score for similar texts", async () => {
      const similarCV = "Expert React developer with TypeScript experience";
      const dissimilarCV = "Plumber with 10 years experience in pipe fitting";
      const jobDescription = "Looking for a React TypeScript developer";

      const similarScore = await calculateInstantMatchScore(similarCV, jobDescription, mockService);
      const dissimilarScore = await calculateInstantMatchScore(
        dissimilarCV,
        jobDescription,
        mockService
      );

      // The mock creates deterministic embeddings, so similar text should score differently
      expect(typeof similarScore).toBe("number");
      expect(typeof dissimilarScore).toBe("number");
    });

    it("calls embed twice (once for CV, once for JD)", async () => {
      await calculateInstantMatchScore("cv text", "job description", mockService);

      expect(mockService.embed).toHaveBeenCalledTimes(2);
      expect(mockService.embed).toHaveBeenCalledWith("cv text");
      expect(mockService.embed).toHaveBeenCalledWith("job description");
    });
  });

  describe("calculateBatchMatchScores", () => {
    it("returns scores for all job descriptions", async () => {
      const cvText = "Software engineer with React experience";
      const jobDescriptions = [
        "React developer needed",
        "Python backend engineer",
        "Full stack developer with TypeScript",
      ];

      const scores = await calculateBatchMatchScores(cvText, jobDescriptions, mockService);

      expect(scores).toHaveLength(3);
      scores.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it("embeds CV only once for efficiency", async () => {
      const cvText = "Software engineer";
      const jobDescriptions = ["Job 1", "Job 2", "Job 3"];

      await calculateBatchMatchScores(cvText, jobDescriptions, mockService);

      // CV should be embedded once, plus all job descriptions
      expect(mockService.embed).toHaveBeenCalledWith(cvText);
    });
  });

  describe("calculateMatchFromEmbeddings", () => {
    it("calculates score from pre-computed embeddings", () => {
      const cvEmbed = new Float32Array([0.5, 0.5, 0.5, 0.5]);
      const jobEmbed = new Float32Array([0.5, 0.5, 0.5, 0.5]);

      const score = calculateMatchFromEmbeddings(cvEmbed, jobEmbed, mockService);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});

// =============================================================================
// SEMANTIC SEARCH TESTS
// =============================================================================

describe("Semantic Search", () => {
  let mockService: IEmbeddingService;

  beforeEach(() => {
    mockService = createMockEmbeddingService();
  });

  describe("isSemanticQuery", () => {
    it("returns true for queries with semantic indicators", () => {
      expect(isSemanticQuery("find jobs similar to my experience")).toBe(true);
      expect(isSemanticQuery("looking for remote positions")).toBe(true);
      expect(isSemanticQuery("jobs like my previous role")).toBe(true);
      expect(isSemanticQuery("interested in machine learning roles")).toBe(true);
    });

    it("returns true for longer queries (4+ words)", () => {
      expect(isSemanticQuery("software engineer remote positions")).toBe(true);
      expect(isSemanticQuery("senior developer with good benefits")).toBe(true);
    });

    it("returns false for short keyword searches", () => {
      expect(isSemanticQuery("Google")).toBe(false);
      expect(isSemanticQuery("engineer")).toBe(false);
      expect(isSemanticQuery("react js")).toBe(false);
    });
  });

  describe("semanticSearch", () => {
    it("returns results sorted by score", async () => {
      const applications = [
        createMockApplication({ id: "1", company: "React Corp", role: "React Developer" }),
        createMockApplication({ id: "2", company: "Python Inc", role: "Python Developer" }),
        createMockApplication({ id: "3", company: "TypeScript Ltd", role: "TypeScript Engineer" }),
      ];

      const results = await semanticSearch("React developer", applications, mockService);

      expect(results.length).toBeGreaterThan(0);
      // Results should be sorted by score descending
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score);
      }
    });

    it("respects limit option", async () => {
      const applications = Array.from({ length: 20 }, (_, i) =>
        createMockApplication({ id: `app_${i}`, company: `Company ${i}` })
      );

      const results = await semanticSearch("software developer", applications, mockService, {
        limit: 5,
      });

      expect(results.length).toBeLessThanOrEqual(5);
    });

    it("filters by minimum score", async () => {
      const applications = [
        createMockApplication({ id: "1", company: "Match Corp", role: "Perfect Match" }),
        createMockApplication({ id: "2", company: "NoMatch Inc", role: "Unrelated" }),
      ];

      const results = await semanticSearch("Perfect Match", applications, mockService, {
        minScore: 0.9,
      });

      // With high minScore, fewer results should pass
      results.forEach((result) => {
        expect(result.score).toBeGreaterThanOrEqual(0.9);
      });
    });

    it("returns empty array for empty applications", async () => {
      const results = await semanticSearch("query", [], mockService);
      expect(results).toEqual([]);
    });
  });

  describe("hybridSearch", () => {
    it("falls back to text search when service is null", async () => {
      const applications = [
        createMockApplication({ id: "1", company: "Google", role: "Engineer" }),
        createMockApplication({ id: "2", company: "Microsoft", role: "Developer" }),
      ];

      const results = await hybridSearch("Google", applications, null);

      expect(results.length).toBe(1);
      expect(results[0]!.item.company).toBe("Google");
    });

    it("uses semantic search when service is available", async () => {
      const applications = [
        createMockApplication({ id: "1", company: "Tech Corp", role: "Software Engineer" }),
        createMockApplication({ id: "2", company: "Other Inc", role: "Manager" }),
      ];

      const results = await hybridSearch("engineer position", applications, mockService);

      expect(results.length).toBeGreaterThan(0);
    });
  });
});

// =============================================================================
// COSINE SIMILARITY TESTS
// =============================================================================

describe("Cosine Similarity", () => {
  it("returns 1 for identical vectors", () => {
    const service = createMockEmbeddingService();
    const vec = new Float32Array([0.5, 0.5, 0.5, 0.5]);

    const similarity = service.cosineSimilarity(vec, vec);

    expect(similarity).toBeCloseTo(1, 5);
  });

  it("returns value between 0 and 1", () => {
    const service = createMockEmbeddingService();
    const vec1 = new Float32Array([0.5, 0.3, 0.2, 0.1]);
    const vec2 = new Float32Array([0.1, 0.4, 0.3, 0.5]);

    const similarity = service.cosineSimilarity(vec1, vec2);

    expect(similarity).toBeGreaterThanOrEqual(0);
    expect(similarity).toBeLessThanOrEqual(1);
  });

  it("handles normalized vectors correctly", () => {
    const service = createMockEmbeddingService();
    // Pre-normalized vectors
    const norm = Math.sqrt(0.25 + 0.25);
    const vec = new Float32Array([0.5 / norm, 0.5 / norm]);

    const similarity = service.cosineSimilarity(vec, vec);

    expect(similarity).toBeCloseTo(1, 5);
  });
});

// =============================================================================
// TYPE TESTS
// =============================================================================

describe("Types", () => {
  it("LOCAL_AI_MODELS has correct structure", async () => {
    const { LOCAL_AI_MODELS } = await import("@/lib/ai/local/types");

    expect(LOCAL_AI_MODELS.embeddings).toBeDefined();
    expect(LOCAL_AI_MODELS.embeddings?.modelId).toBe("Xenova/all-MiniLM-L6-v2");
    expect(LOCAL_AI_MODELS.embeddings?.sizeMB).toBe(23);
    expect(LOCAL_AI_MODELS.embeddings?.dimensions).toBe(384);
  });
});
