/**
 * API Key Manager Tests
 *
 * Tests for API key management via environment variables.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  getAPIKey,
  hasAPIKey,
  hasAnyAPIKey,
  validateKeyFormat,
  maskAPIKey,
  getAPIKeyStatus,
  getFirstAvailableProvider,
  PROVIDER_INFO,
} from "@/lib/ai/key-manager";

describe("API Key Manager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("PROVIDER_INFO", () => {
    it("should have info for all providers", () => {
      expect(PROVIDER_INFO.gemini).toBeDefined();
      expect(PROVIDER_INFO.openrouter).toBeDefined();
    });

    it("should have required fields for each provider", () => {
      for (const provider of ["gemini", "openrouter"] as const) {
        const info = PROVIDER_INFO[provider];
        expect(info.name).toBeDefined();
        expect(info.description).toBeDefined();
        expect(info.getKeyUrl).toMatch(/^https?:\/\//);
        expect(info.envVar).toBeDefined();
        expect(info.placeholder).toBeDefined();
      }
    });

    it("should have correct env var names", () => {
      expect(PROVIDER_INFO.gemini.envVar).toBe("GEMINI_API_KEY");
      expect(PROVIDER_INFO.openrouter.envVar).toBe("OPENROUTER_API_KEY");
    });
  });

  describe("validateKeyFormat", () => {
    it("should validate Gemini key format", () => {
      // Valid format: AIza followed by 35 alphanumeric chars (total 39 chars)
      const validGeminiKey = "AIzaSyB" + "a".repeat(32); // 39 chars total
      expect(validateKeyFormat("gemini", validGeminiKey)).toBe(true);
      expect(validateKeyFormat("gemini", "invalid-key")).toBe(false);
      expect(validateKeyFormat("gemini", "")).toBe(false);
      expect(validateKeyFormat("gemini", "AIza" + "a".repeat(30))).toBe(false); // Too short
    });

    it("should validate OpenRouter key format", () => {
      // Valid format: sk-or-v1- followed by 64 hex chars
      const validKey = "sk-or-v1-" + "a".repeat(64);
      expect(validateKeyFormat("openrouter", validKey)).toBe(true);
      expect(validateKeyFormat("openrouter", "invalid-key")).toBe(false);
      expect(validateKeyFormat("openrouter", "sk-or-v1-tooshort")).toBe(false);
    });
  });

  describe("maskAPIKey", () => {
    it("should mask middle of key", () => {
      const key = "AIzaSyA1234567890123456789012345678901234";
      const masked = maskAPIKey(key);

      expect(masked).toBe("AIza...1234");
      expect(masked).not.toContain(key.slice(4, -4));
    });

    it("should return **** for short keys", () => {
      expect(maskAPIKey("short")).toBe("****");
      expect(maskAPIKey("")).toBe("****");
    });
  });

  describe("getAPIKey", () => {
    it("should return null when env var is not set", () => {
      expect(getAPIKey("gemini")).toBeNull();
      expect(getAPIKey("openrouter")).toBeNull();
    });

    it("should return key when env var is set", () => {
      const testKey = "AIzaSyBtest123456789012345678901234567";
      vi.stubEnv("GEMINI_API_KEY", testKey);

      expect(getAPIKey("gemini")).toBe(testKey);
    });
  });

  describe("hasAPIKey", () => {
    it("should return false when no key is set", () => {
      expect(hasAPIKey("gemini")).toBe(false);
      expect(hasAPIKey("openrouter")).toBe(false);
    });

    it("should return true when key is set", () => {
      vi.stubEnv("GEMINI_API_KEY", "test-key");
      expect(hasAPIKey("gemini")).toBe(true);
    });
  });

  describe("hasAnyAPIKey", () => {
    it("should return false when no keys are set", () => {
      expect(hasAnyAPIKey()).toBe(false);
    });

    it("should return true when any key is set", () => {
      vi.stubEnv("OPENROUTER_API_KEY", "test-key");
      expect(hasAnyAPIKey()).toBe(true);
    });
  });

  describe("getFirstAvailableProvider", () => {
    it("should return null when no keys are set", () => {
      expect(getFirstAvailableProvider()).toBeNull();
    });

    it("should return gemini when it has a key", () => {
      vi.stubEnv("GEMINI_API_KEY", "test-key");
      expect(getFirstAvailableProvider()).toBe("gemini");
    });

    it("should return openrouter when only it has a key", () => {
      vi.stubEnv("OPENROUTER_API_KEY", "test-key");
      expect(getFirstAvailableProvider()).toBe("openrouter");
    });
  });

  describe("getAPIKeyStatus", () => {
    it("should return status for all providers", () => {
      const status = getAPIKeyStatus();

      expect(status.gemini).toBeDefined();
      expect(status.openrouter).toBeDefined();
      expect(status.gemini.hasKey).toBe(false);
      expect(status.gemini.envVar).toBe("GEMINI_API_KEY");
      expect(status.openrouter.hasKey).toBe(false);
      expect(status.openrouter.envVar).toBe("OPENROUTER_API_KEY");
    });

    it("should reflect configured keys", () => {
      const validKey = "AIzaSyB" + "a".repeat(32);
      vi.stubEnv("GEMINI_API_KEY", validKey);

      const status = getAPIKeyStatus();
      expect(status.gemini.hasKey).toBe(true);
      expect(status.gemini.isValid).toBe(true);
      expect(status.openrouter.hasKey).toBe(false);
    });
  });
});
