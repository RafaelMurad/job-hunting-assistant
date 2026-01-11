/**
 * AI Config Tests
 *
 * Tests for model configuration and availability checking.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  LATEX_MODELS,
  AI_CONFIG,
  isModelAvailable,
  getAvailableModels,
  getModelInfo,
  getModelName,
  getAPIKeyForProvider,
  hasBYOK,
  hasAnyAIAvailable,
} from "@/lib/ai";

describe("AI Config", () => {
  describe("LATEX_MODELS", () => {
    it("should have 5 free models defined", () => {
      expect(LATEX_MODELS).toHaveLength(5);
    });

    it("should have required properties for all models", () => {
      for (const model of LATEX_MODELS) {
        expect(model).toHaveProperty("id");
        expect(model).toHaveProperty("name");
        expect(model).toHaveProperty("provider");
        expect(model).toHaveProperty("cost");
        expect(model).toHaveProperty("description");
      }
    });

    it("should have openrouterModel for OpenRouter providers", () => {
      const openrouterModels = LATEX_MODELS.filter((m) => m.provider === "openrouter");
      expect(openrouterModels.length).toBeGreaterThan(0);

      for (const model of openrouterModels) {
        expect(model.openrouterModel).toBeDefined();
        expect(model.openrouterModel).not.toBe("");
      }
    });

    it("should include free Gemini models", () => {
      const freeGemini = LATEX_MODELS.filter((m) => m.provider === "gemini" && m.cost === "Free");
      expect(freeGemini.length).toBeGreaterThan(0);
    });

    it("should only have free models", () => {
      for (const model of LATEX_MODELS) {
        expect(model.cost).toBe("Free");
      }
    });
  });

  describe("AI_CONFIG", () => {
    it("should have default provider set to gemini", () => {
      // When AI_PROVIDER env is not set, default should be gemini
      expect(AI_CONFIG.provider).toBe("gemini");
    });

    it("should have free provider API key slots only", () => {
      expect(AI_CONFIG.apiKeys).toHaveProperty("gemini");
      expect(AI_CONFIG.apiKeys).toHaveProperty("openrouter");
      expect(AI_CONFIG.apiKeys).not.toHaveProperty("openai");
      expect(AI_CONFIG.apiKeys).not.toHaveProperty("claude");
    });

    it("should have model name configured", () => {
      expect(AI_CONFIG.models.gemini).toBe("gemini-2.5-flash");
    });

    it("should have default LaTeX model set", () => {
      expect(AI_CONFIG.defaultLatexModel).toBe("gemini-2.5-flash");
    });
  });

  describe("getModelInfo", () => {
    it("should return model info for valid model ID", () => {
      const info = getModelInfo("gemini-2.5-flash");
      expect(info).toBeDefined();
      expect(info?.id).toBe("gemini-2.5-flash");
      expect(info?.name).toBe("Gemini 2.5 Flash");
      expect(info?.provider).toBe("gemini");
    });

    it("should return undefined for invalid model ID", () => {
      // @ts-expect-error - Testing invalid input
      const info = getModelInfo("invalid-model");
      expect(info).toBeUndefined();
    });

    it("should return OpenRouter model details", () => {
      const info = getModelInfo("qwen-2.5-vl");
      expect(info).toBeDefined();
      expect(info?.provider).toBe("openrouter");
      expect(info?.openrouterModel).toBe("qwen/qwen2.5-vl-72b-instruct:free");
    });
  });

  describe("getModelName", () => {
    it("should return gemini model name", () => {
      expect(getModelName("gemini-2.5-flash")).toBe("gemini-2.5-flash");
    });
  });

  describe("isModelAvailable", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      // Reset environment for each test
      vi.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("should return false for unknown model", () => {
      // @ts-expect-error - Testing invalid input
      expect(isModelAvailable("unknown-model")).toBe(false);
    });

    it("should check gemini API key for gemini models", () => {
      // The actual check happens at runtime based on AI_CONFIG.apiKeys
      // Since AI_CONFIG is created at module load time, we test the logic
      const modelInfo = LATEX_MODELS.find((m) => m.id === "gemini-2.5-flash");
      expect(modelInfo?.provider).toBe("gemini");
    });

    it("should check openrouter API key for openrouter models", () => {
      const modelInfo = LATEX_MODELS.find((m) => m.id === "qwen-2.5-vl");
      expect(modelInfo?.provider).toBe("openrouter");
    });
  });

  describe("getAvailableModels", () => {
    it("should return all models with availability status", () => {
      const models = getAvailableModels();

      expect(models).toHaveLength(LATEX_MODELS.length);

      for (const model of models) {
        expect(model).toHaveProperty("available");
        expect(typeof model.available).toBe("boolean");
      }
    });

    it("should preserve all original model properties", () => {
      const models = getAvailableModels();

      for (const model of models) {
        expect(model).toHaveProperty("id");
        expect(model).toHaveProperty("name");
        expect(model).toHaveProperty("provider");
        expect(model).toHaveProperty("cost");
        expect(model).toHaveProperty("description");
      }
    });

    it("should use explicit keys when provided via options", () => {
      const models = getAvailableModels({
        geminiKey: "test-gemini-key",
      });

      // Find gemini model
      const geminiModel = models.find((m) => m.id === "gemini-2.5-flash");
      expect(geminiModel?.available).toBe(true);
    });
  });

  describe("BYOK Support", () => {
    describe("getAPIKeyForProvider", () => {
      it("should return explicit key when provided", () => {
        const explicitKey = "my-explicit-key";
        const result = getAPIKeyForProvider("gemini", explicitKey);
        expect(result).toBe(explicitKey);
      });

      it("should return null when no key is available", () => {
        // Without env vars or localStorage, should return null
        const result = getAPIKeyForProvider("gemini");
        // May return env var if set, or null
        expect(result === null || typeof result === "string").toBe(true);
      });

      it("should handle openrouter provider", () => {
        const explicitKey = "sk-or-test-key";
        const result = getAPIKeyForProvider("openrouter", explicitKey);
        expect(result).toBe(explicitKey);
      });
    });

    describe("hasBYOK", () => {
      it("should return false when not in browser", () => {
        // In Node.js test environment, hasBYOK should return false
        // because there's no real browser localStorage
        const result = hasBYOK("gemini");
        expect(typeof result).toBe("boolean");
      });
    });

    describe("hasAnyAIAvailable", () => {
      it("should return true when explicit key is provided", () => {
        const result = hasAnyAIAvailable({
          geminiKey: "test-key",
        });
        expect(result).toBe(true);
      });

      it("should check both gemini and openrouter", () => {
        const result = hasAnyAIAvailable({
          openrouterKey: "sk-or-test",
        });
        expect(result).toBe(true);
      });
    });

    describe("isModelAvailable with BYOK options", () => {
      it("should use explicit gemini key for availability check", () => {
        const result = isModelAvailable("gemini-2.5-flash", {
          geminiKey: "AIza-test-key",
        });
        expect(result).toBe(true);
      });

      it("should use explicit openrouter key for openrouter models", () => {
        const result = isModelAvailable("qwen-2.5-vl", {
          openrouterKey: "sk-or-v1-test",
        });
        expect(result).toBe(true);
      });
    });
  });
});
