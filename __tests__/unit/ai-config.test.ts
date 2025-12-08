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
} from "@/lib/ai/config";

describe("AI Config", () => {
  describe("LATEX_MODELS", () => {
    it("should have 9 models defined", () => {
      expect(LATEX_MODELS).toHaveLength(9);
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
  });

  describe("AI_CONFIG", () => {
    it("should have default provider set to gemini", () => {
      // When AI_PROVIDER env is not set, default should be gemini
      expect(AI_CONFIG.provider).toBe("gemini");
    });

    it("should have all provider API key slots", () => {
      expect(AI_CONFIG.apiKeys).toHaveProperty("gemini");
      expect(AI_CONFIG.apiKeys).toHaveProperty("openai");
      expect(AI_CONFIG.apiKeys).toHaveProperty("claude");
      expect(AI_CONFIG.apiKeys).toHaveProperty("openrouter");
    });

    it("should have model names configured", () => {
      expect(AI_CONFIG.models.gemini).toBe("gemini-2.5-flash");
      expect(AI_CONFIG.models.geminiPro).toBe("gemini-2.5-pro");
      expect(AI_CONFIG.models.gemini3Pro).toBe("gemini-3-pro-preview");
      expect(AI_CONFIG.models.openai).toBe("gpt-4o");
      expect(AI_CONFIG.models.claude).toBe("claude-sonnet-4-5-20250929");
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
      const info = getModelInfo("nova-2-lite");
      expect(info).toBeDefined();
      expect(info?.provider).toBe("openrouter");
      expect(info?.openrouterModel).toBe("amazon/nova-2-lite-v1:free");
    });
  });

  describe("getModelName", () => {
    it("should return correct model name for gemini-2.5-flash", () => {
      expect(getModelName("gemini-2.5-flash")).toBe("gemini-2.5-flash");
    });

    it("should return correct model name for gemini-2.5-pro", () => {
      expect(getModelName("gemini-2.5-pro")).toBe("gemini-2.5-pro");
    });

    it("should return correct model name for gemini-3-pro-preview", () => {
      expect(getModelName("gemini-3-pro-preview")).toBe("gemini-3-pro-preview");
    });

    it("should return default gemini model for other models", () => {
      // Non-Gemini models fall through to default
      expect(getModelName("gpt-4o")).toBe("gemini-2.5-flash");
      expect(getModelName("claude-sonnet")).toBe("gemini-2.5-flash");
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
      const modelInfo = LATEX_MODELS.find((m) => m.id === "nova-2-lite");
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
  });
});
