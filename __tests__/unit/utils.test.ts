/**
 * Unit Tests: lib/utils.ts
 *
 * Tests for utility functions including:
 * - cn() - Tailwind class name merger
 * - parseAIError() - AI error message parser
 */

import { cn, parseAIError } from "@/lib/utils";
import { describe, expect, it } from "vitest";

describe("cn (class name merger)", () => {
  it("merges multiple class strings", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
  });

  it("handles falsy values gracefully", () => {
    expect(cn("base", false, null, undefined, "end")).toBe("base end");
  });

  it("merges conflicting Tailwind classes (last wins)", () => {
    // tailwind-merge should keep the last conflicting class
    expect(cn("px-4", "px-8")).toBe("px-8");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles array inputs", () => {
    expect(cn(["px-4", "py-2"])).toBe("px-4 py-2");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
  });
});

describe("parseAIError", () => {
  describe("rate limit errors", () => {
    it("detects 429 status code", () => {
      const result = parseAIError(new Error("Request failed with status 429"));
      expect(result).toContain("Rate limit");
    });

    it("detects 'Too Many Requests' message", () => {
      const result = parseAIError(new Error("Too Many Requests"));
      expect(result).toContain("Rate limit");
    });

    it("detects quota errors", () => {
      const result = parseAIError(new Error("quota exceeded"));
      expect(result).toContain("Rate limit");
    });

    it("provides specific message for premium Gemini models", () => {
      const result = parseAIError(new Error("429 gemini-2.5-pro requires billing"));
      expect(result).toContain("paid Google Cloud account");
    });
  });

  describe("authentication errors", () => {
    it("detects 401 status code", () => {
      const result = parseAIError(new Error("401 Unauthorized"));
      expect(result).toContain("API key");
    });

    it("detects 403 status code", () => {
      const result = parseAIError(new Error("403 Forbidden"));
      expect(result).toContain("API key");
    });

    it("detects API key errors", () => {
      const result = parseAIError(new Error("Invalid API key provided"));
      expect(result).toContain("API key");
    });
  });

  describe("model not found errors", () => {
    it("detects 404 status code", () => {
      const result = parseAIError(new Error("404 Model not found"));
      expect(result).toContain("model is not available");
    });

    it("detects 'not found' message", () => {
      const result = parseAIError(new Error("The requested model was not found"));
      expect(result).toContain("model is not available");
    });
  });

  describe("content/safety errors", () => {
    it("detects safety filter triggers", () => {
      const result = parseAIError(new Error("Content blocked by safety filter"));
      expect(result).toContain("blocked by AI safety filters");
    });

    it("detects blocked content", () => {
      const result = parseAIError(new Error("SAFETY: Request blocked"));
      expect(result).toContain("blocked by AI safety filters");
    });
  });

  describe("network errors", () => {
    it("detects timeout errors", () => {
      const result = parseAIError(new Error("Request timeout"));
      expect(result).toContain("timed out");
    });

    it("detects ETIMEDOUT", () => {
      const result = parseAIError(new Error("ETIMEDOUT"));
      expect(result).toContain("timed out");
    });

    it("detects connection refused", () => {
      const result = parseAIError(new Error("ECONNREFUSED"));
      expect(result).toContain("Network error");
    });

    it("detects fetch errors", () => {
      const result = parseAIError(new Error("fetch failed"));
      expect(result).toContain("Network error");
    });
  });

  describe("LaTeX-specific errors", () => {
    it("detects missing documentclass", () => {
      const result = parseAIError(new Error("Missing \\documentclass in output"));
      expect(result).toContain("extract valid LaTeX");
    });

    it("detects incomplete LaTeX", () => {
      // Test for LaTeX command - the backslash is intentional to match the actual error message
      const result = parseAIError(new Error(String.raw`Missing \end{document}`));
      expect(result).toContain("incomplete LaTeX");
    });
  });

  describe("provider-specific errors", () => {
    it("handles OpenAI billing errors", () => {
      const result = parseAIError(new Error("OpenAI billing exceeded"));
      expect(result).toContain("OpenAI billing");
    });

    it("handles generic OpenAI errors", () => {
      const result = parseAIError(new Error("OpenAI service unavailable"));
      expect(result).toContain("OpenAI error");
    });

    it("handles Claude/Anthropic errors", () => {
      const result = parseAIError(new Error("Anthropic API error"));
      expect(result).toContain("Claude API error");
    });
  });

  describe("edge cases", () => {
    it("handles non-Error objects", () => {
      const result = parseAIError("Simple string error");
      expect(result).toBe("Simple string error");
    });

    it("truncates very long error messages", () => {
      const longError = "A".repeat(150);
      const result = parseAIError(new Error(longError));
      expect(result).toContain("An error occurred");
    });

    it("returns short messages as-is", () => {
      const result = parseAIError(new Error("Short error"));
      expect(result).toBe("Short error");
    });
  });
});
