/**
 * Unit Tests: Password Change Utilities
 *
 * Tests the password strength checker and validation logic.
 * Note: Full password change flow requires server mocking.
 */

import { describe, expect, it } from "vitest";
import { checkPasswordStrength } from "../password-change";

describe("checkPasswordStrength", () => {
  describe("weak passwords", () => {
    it("gives score 0 for very short passwords", () => {
      const result = checkPasswordStrength("abc");
      expect(result.score).toBe(0);
      expect(result.feedback).toContain("8 characters");
    });

    it("gives score 1 for short lowercase only", () => {
      const result = checkPasswordStrength("abcdefgh");
      expect(result.score).toBe(1);
    });

    it("gives score 1 for short uppercase only", () => {
      const result = checkPasswordStrength("ABCDEFGH");
      expect(result.score).toBe(1);
    });
  });

  describe("medium passwords", () => {
    it("gives score 2 for mixed case", () => {
      const result = checkPasswordStrength("AbCdEfGh");
      expect(result.score).toBe(2);
    });

    it("gives score 2 for lowercase with numbers", () => {
      const result = checkPasswordStrength("abcdefg1");
      expect(result.score).toBe(2);
    });

    it("gives score 3 for mixed case with numbers", () => {
      const result = checkPasswordStrength("AbCdEfG1");
      expect(result.score).toBe(3);
    });
  });

  describe("strong passwords", () => {
    it("gives score 4 for long password with all character types", () => {
      const result = checkPasswordStrength("AbCdEfGh1!");
      expect(result.score).toBe(4);
    });

    it("gives score 4 for very long complex password", () => {
      const result = checkPasswordStrength("MySecureP@ssw0rd123!");
      expect(result.score).toBe(4);
    });

    it("gives positive feedback for strong passwords", () => {
      const result = checkPasswordStrength("AbCdEfGh1!");
      expect(result.feedback).toBe("Very strong");
    });
  });

  describe("feedback messages", () => {
    it("suggests adding numbers when missing", () => {
      const result = checkPasswordStrength("AbCdEfGh");
      expect(result.feedback).toContain("numbers");
    });

    it("suggests mixing case when all lowercase", () => {
      const result = checkPasswordStrength("abcdefgh1");
      expect(result.feedback).toContain("uppercase");
    });

    it("suggests special characters when missing", () => {
      const result = checkPasswordStrength("AbCdEfGh1");
      expect(result.feedback).toContain("special");
    });
  });

  describe("edge cases", () => {
    it("handles empty string", () => {
      const result = checkPasswordStrength("");
      expect(result.score).toBe(0);
    });

    it("handles unicode characters", () => {
      const result = checkPasswordStrength("Pässwörd123!");
      expect(result.score).toBeGreaterThanOrEqual(3);
    });

    it("handles very long passwords", () => {
      const longPassword = "A".repeat(100) + "1!";
      const result = checkPasswordStrength(longPassword);
      expect(result.score).toBeGreaterThanOrEqual(3);
    });
  });
});
