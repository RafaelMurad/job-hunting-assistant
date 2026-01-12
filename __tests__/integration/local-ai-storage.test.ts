/**
 * Integration Tests: Local AI Storage
 *
 * Tests for embedding storage in IndexedDB via Dexie.
 * Uses fake-indexeddb for testing without a browser.
 */

import "fake-indexeddb/auto";
import { describe, expect, it, beforeEach, afterEach } from "vitest";

// Import after fake-indexeddb is set up
import { localStorageAdapter, localDB } from "@/lib/storage/local";
import type { CreateEmbeddingInput, EmbeddingSourceType } from "@/lib/storage/interface";

// =============================================================================
// SETUP & TEARDOWN
// =============================================================================

describe("Local AI Storage Integration", () => {
  beforeEach(async () => {
    // Clear all data before each test
    await localStorageAdapter.clearAll();
  });

  afterEach(async () => {
    // Clean up after each test
    await localStorageAdapter.clearAll();
  });

  // =============================================================================
  // EMBEDDING STORAGE TESTS
  // =============================================================================

  describe("Embedding Storage", () => {
    const createTestEmbedding = (
      sourceType: EmbeddingSourceType = "application",
      sourceId = "test_123"
    ): CreateEmbeddingInput => ({
      sourceType,
      sourceId,
      embedding: Array.from({ length: 384 }, (_, i) => Math.sin(i) * 0.5),
      textHash: "abc123hash",
    });

    describe("saveEmbedding", () => {
      it("creates a new embedding", async () => {
        const input = createTestEmbedding();
        const result = await localStorageAdapter.saveEmbedding(input);

        expect(result).toBeDefined();
        expect(result.id).toMatch(/^local_/);
        expect(result.sourceType).toBe("application");
        expect(result.sourceId).toBe("test_123");
        expect(result.embedding).toHaveLength(384);
        expect(result.textHash).toBe("abc123hash");
        expect(result.createdAt).toBeDefined();
      });

      it("updates existing embedding for same source", async () => {
        const input1 = createTestEmbedding();
        const result1 = await localStorageAdapter.saveEmbedding(input1);

        // Save with different hash (content changed)
        const input2 = {
          ...input1,
          textHash: "newhash456",
          embedding: Array.from({ length: 384 }, () => 0.1),
        };
        const result2 = await localStorageAdapter.saveEmbedding(input2);

        // Should update, not create new
        expect(result2.id).toBe(result1.id);
        expect(result2.textHash).toBe("newhash456");

        // Verify only one embedding exists
        const all = await localStorageAdapter.getAllEmbeddings();
        expect(all).toHaveLength(1);
      });

      it("creates separate embeddings for different sources", async () => {
        await localStorageAdapter.saveEmbedding(createTestEmbedding("application", "app_1"));
        await localStorageAdapter.saveEmbedding(createTestEmbedding("cv", "cv_1"));
        await localStorageAdapter.saveEmbedding(createTestEmbedding("profile", "profile_1"));

        const all = await localStorageAdapter.getAllEmbeddings();
        expect(all).toHaveLength(3);
      });
    });

    describe("getEmbedding", () => {
      it("retrieves embedding by source type and id", async () => {
        const input = createTestEmbedding("application", "app_123");
        await localStorageAdapter.saveEmbedding(input);

        const result = await localStorageAdapter.getEmbedding("application", "app_123");

        expect(result).not.toBeNull();
        expect(result!.sourceType).toBe("application");
        expect(result!.sourceId).toBe("app_123");
      });

      it("returns null for non-existent embedding", async () => {
        const result = await localStorageAdapter.getEmbedding("application", "nonexistent");
        expect(result).toBeNull();
      });

      it("distinguishes between source types", async () => {
        // Save embedding for application
        await localStorageAdapter.saveEmbedding(createTestEmbedding("application", "id_1"));

        // Query for CV with same ID should return null
        const result = await localStorageAdapter.getEmbedding("cv", "id_1");
        expect(result).toBeNull();
      });
    });

    describe("deleteEmbedding", () => {
      it("removes embedding by source", async () => {
        await localStorageAdapter.saveEmbedding(createTestEmbedding("application", "app_1"));

        await localStorageAdapter.deleteEmbedding("application", "app_1");

        const result = await localStorageAdapter.getEmbedding("application", "app_1");
        expect(result).toBeNull();
      });

      it("does not affect other embeddings", async () => {
        await localStorageAdapter.saveEmbedding(createTestEmbedding("application", "app_1"));
        await localStorageAdapter.saveEmbedding(createTestEmbedding("application", "app_2"));

        await localStorageAdapter.deleteEmbedding("application", "app_1");

        const remaining = await localStorageAdapter.getAllEmbeddings();
        expect(remaining).toHaveLength(1);
        expect(remaining[0]!.sourceId).toBe("app_2");
      });
    });

    describe("getAllEmbeddings", () => {
      it("returns all embeddings when no filter", async () => {
        await localStorageAdapter.saveEmbedding(createTestEmbedding("application", "app_1"));
        await localStorageAdapter.saveEmbedding(createTestEmbedding("cv", "cv_1"));
        await localStorageAdapter.saveEmbedding(createTestEmbedding("profile", "profile_1"));

        const all = await localStorageAdapter.getAllEmbeddings();

        expect(all).toHaveLength(3);
      });

      it("filters by source type", async () => {
        await localStorageAdapter.saveEmbedding(createTestEmbedding("application", "app_1"));
        await localStorageAdapter.saveEmbedding(createTestEmbedding("application", "app_2"));
        await localStorageAdapter.saveEmbedding(createTestEmbedding("cv", "cv_1"));

        const applications = await localStorageAdapter.getAllEmbeddings("application");

        expect(applications).toHaveLength(2);
        applications.forEach((e: { sourceType: string }) =>
          expect(e.sourceType).toBe("application")
        );
      });

      it("returns empty array when no embeddings", async () => {
        const all = await localStorageAdapter.getAllEmbeddings();
        expect(all).toEqual([]);
      });
    });

    describe("clearEmbeddings", () => {
      it("removes all embeddings", async () => {
        await localStorageAdapter.saveEmbedding(createTestEmbedding("application", "app_1"));
        await localStorageAdapter.saveEmbedding(createTestEmbedding("cv", "cv_1"));
        await localStorageAdapter.saveEmbedding(createTestEmbedding("profile", "profile_1"));

        await localStorageAdapter.clearEmbeddings();

        const all = await localStorageAdapter.getAllEmbeddings();
        expect(all).toEqual([]);
      });

      it("does not affect other data", async () => {
        // Create some other data
        await localStorageAdapter.saveProfile({
          name: "Test User",
          email: "test@example.com",
          location: "Test City",
          summary: "Test summary",
          experience: "Test experience",
          skills: ["skill1"],
        });

        await localStorageAdapter.saveEmbedding(createTestEmbedding());
        await localStorageAdapter.clearEmbeddings();

        // Profile should still exist
        const profile = await localStorageAdapter.getProfile();
        expect(profile).not.toBeNull();
        expect(profile!.name).toBe("Test User");
      });
    });
  });

  // =============================================================================
  // SCHEMA VERSION TESTS
  // =============================================================================

  describe("Schema Version", () => {
    it("embeddings table exists in database", async () => {
      // The table should exist and be accessible
      const count = await localDB.embeddings.count();
      expect(typeof count).toBe("number");
    });

    it("clearAll includes embeddings", async () => {
      await localStorageAdapter.saveEmbedding({
        sourceType: "application",
        sourceId: "test",
        embedding: [1, 2, 3],
        textHash: "hash",
      });

      await localStorageAdapter.clearAll();

      const embeddings = await localStorageAdapter.getAllEmbeddings();
      expect(embeddings).toEqual([]);
    });
  });

  // =============================================================================
  // EMBEDDING DATA INTEGRITY TESTS
  // =============================================================================

  describe("Embedding Data Integrity", () => {
    it("preserves embedding vector values", async () => {
      const originalEmbedding = Array.from({ length: 384 }, (_, i) => i / 384);
      await localStorageAdapter.saveEmbedding({
        sourceType: "cv",
        sourceId: "cv_test",
        embedding: originalEmbedding,
        textHash: "testhash",
      });

      const retrieved = await localStorageAdapter.getEmbedding("cv", "cv_test");

      expect(retrieved).not.toBeNull();
      expect(retrieved!.embedding).toHaveLength(384);
      // Check a few values
      expect(retrieved!.embedding[0]).toBeCloseTo(0, 5);
      expect(retrieved!.embedding[192]).toBeCloseTo(0.5, 2);
      expect(retrieved!.embedding[383]).toBeCloseTo(383 / 384, 2);
    });

    it("handles Float32Array conversion", async () => {
      // Test that we can work with the stored number[] as Float32Array
      const input = Array.from({ length: 384 }, () => Math.random());
      await localStorageAdapter.saveEmbedding({
        sourceType: "application",
        sourceId: "test",
        embedding: input,
        textHash: "hash",
      });

      const retrieved = await localStorageAdapter.getEmbedding("application", "test");
      expect(retrieved).not.toBeNull();

      // Should be able to convert to Float32Array for computation
      const float32 = new Float32Array(retrieved!.embedding);
      expect(float32).toHaveLength(384);
    });
  });
});
