/**
 * API Key Manager Tests
 *
 * Tests for BYOK (Bring Your Own Key) functionality.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock window.localStorage
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Import after mocking
import {
  getAPIKey,
  setAPIKey,
  removeAPIKey,
  clearAllAPIKeys,
  validateKeyFormat,
  hasAPIKey,
  getAPIKeyStatus,
  getFirstAvailableProvider,
  hasAnyAPIKey,
  maskAPIKey,
  PROVIDER_INFO,
} from "@/lib/ai/key-manager";

describe("API Key Manager", () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Mock local mode
    vi.stubEnv("NEXT_PUBLIC_MODE", "local");
  });

  afterEach(() => {
    localStorageMock.clear();
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
        expect(info.placeholder).toBeDefined();
      }
    });
  });

  describe("validateKeyFormat", () => {
    it("should validate Gemini key format", () => {
      // Valid format: AIza followed by 35 alphanumeric chars (total 39 chars)
      // Example: AIza + SyB + 32 more chars = 39 total
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

  describe("setAPIKey and getAPIKey", () => {
    // Valid Gemini key format: AIza + 35 chars = 39 total
    const validGeminiKey = "AIzaSyB" + "a".repeat(32);

    it("should store and retrieve a key", () => {
      setAPIKey("gemini", validGeminiKey);

      const retrieved = getAPIKey("gemini");
      expect(retrieved).toBe(validGeminiKey);
    });

    it("should trim whitespace from keys", () => {
      const keyWithSpaces = `  ${validGeminiKey}  `;
      setAPIKey("gemini", keyWithSpaces);

      const retrieved = getAPIKey("gemini");
      expect(retrieved).toBe(validGeminiKey);
    });

    it("should return null for unset keys", () => {
      expect(getAPIKey("gemini")).toBeNull();
      expect(getAPIKey("openrouter")).toBeNull();
    });

    it("should remove key when empty string is passed", () => {
      setAPIKey("gemini", validGeminiKey);
      expect(getAPIKey("gemini")).not.toBeNull();

      setAPIKey("gemini", "");
      expect(getAPIKey("gemini")).toBeNull();
    });
  });

  describe("removeAPIKey", () => {
    const validGeminiKey = "AIzaSyB" + "a".repeat(32);

    it("should remove a stored key", () => {
      setAPIKey("gemini", validGeminiKey);
      expect(getAPIKey("gemini")).not.toBeNull();

      removeAPIKey("gemini");
      expect(getAPIKey("gemini")).toBeNull();
    });

    it("should not throw when removing non-existent key", () => {
      expect(() => removeAPIKey("gemini")).not.toThrow();
    });
  });

  describe("clearAllAPIKeys", () => {
    const validGeminiKey = "AIzaSyB" + "a".repeat(32);
    const validOpenRouterKey = "sk-or-v1-" + "a".repeat(64);

    it("should remove all stored keys", () => {
      setAPIKey("gemini", validGeminiKey);
      setAPIKey("openrouter", validOpenRouterKey);

      clearAllAPIKeys();

      expect(getAPIKey("gemini")).toBeNull();
      expect(getAPIKey("openrouter")).toBeNull();
    });
  });

  describe("hasAPIKey", () => {
    const validGeminiKey = "AIzaSyB" + "a".repeat(32);

    it("should return true when key is set", () => {
      setAPIKey("gemini", validGeminiKey);
      expect(hasAPIKey("gemini")).toBe(true);
    });

    it("should return false when key is not set", () => {
      expect(hasAPIKey("gemini")).toBe(false);
    });
  });

  describe("getAPIKeyStatus", () => {
    const validGeminiKey = "AIzaSyB" + "a".repeat(32);

    it("should return status for all providers", () => {
      const status = getAPIKeyStatus();

      expect(status.gemini).toBeDefined();
      expect(status.openrouter).toBeDefined();
      expect(status.gemini.hasKey).toBe(false);
      expect(status.openrouter.hasKey).toBe(false);
    });

    it("should reflect stored keys", () => {
      setAPIKey("gemini", validGeminiKey);

      const status = getAPIKeyStatus();
      expect(status.gemini.hasKey).toBe(true);
      expect(status.gemini.isValid).toBe(true);
      expect(status.openrouter.hasKey).toBe(false);
    });
  });

  describe("getFirstAvailableProvider", () => {
    const validGeminiKey = "AIzaSyB" + "a".repeat(32);
    const validOpenRouterKey = "sk-or-v1-" + "a".repeat(64);

    it("should return null when no keys are set", () => {
      expect(getFirstAvailableProvider()).toBeNull();
    });

    it("should return gemini when it has a key", () => {
      setAPIKey("gemini", validGeminiKey);
      expect(getFirstAvailableProvider()).toBe("gemini");
    });

    it("should return openrouter when only it has a key", () => {
      setAPIKey("openrouter", validOpenRouterKey);
      expect(getFirstAvailableProvider()).toBe("openrouter");
    });
  });

  describe("hasAnyAPIKey", () => {
    it("should return false when no keys are set", () => {
      expect(hasAnyAPIKey()).toBe(false);
    });

    it("should return true when any key is set", () => {
      setAPIKey("openrouter", "sk-or-v1-" + "a".repeat(64));
      expect(hasAnyAPIKey()).toBe(true);
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
});
