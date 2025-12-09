/**
 * Token Manager Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Token Manager", () => {
  const TEST_ENCRYPTION_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

  beforeEach(() => {
    vi.resetModules();
    // Set a test encryption key (32 bytes in hex = 64 chars)
    process.env.SOCIAL_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;
  });

  afterEach(() => {
    delete process.env.SOCIAL_ENCRYPTION_KEY;
  });

  describe("encryptToken and decryptToken", () => {
    it("should encrypt and decrypt a token correctly", async () => {
      const { encryptToken, decryptToken } = await import(
        "@/lib/social/token-manager"
      );

      const originalToken = "test-access-token-12345";
      const encrypted = encryptToken(originalToken);
      const decrypted = decryptToken(encrypted);

      expect(decrypted).toBe(originalToken);
    });

    it("should produce different ciphertext for same plaintext (due to IV)", async () => {
      const { encryptToken } = await import("@/lib/social/token-manager");

      // Encrypt the same token twice
      const encrypted1 = encryptToken("same-token");
      const encrypted2 = encryptToken("same-token");

      // Different ciphertext due to different IV
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe("isEncryptedToken", () => {
    it("should return true for valid encrypted token", async () => {
      const { encryptToken, isEncryptedToken } = await import(
        "@/lib/social/token-manager"
      );
      const encrypted = encryptToken("test-token");
      expect(isEncryptedToken(encrypted)).toBe(true);
    });

    it("should return false for plain text", async () => {
      const { isEncryptedToken } = await import("@/lib/social/token-manager");
      expect(isEncryptedToken("not-encrypted")).toBe(false);
    });

    it("should return false for empty string", async () => {
      const { isEncryptedToken } = await import("@/lib/social/token-manager");
      expect(isEncryptedToken("")).toBe(false);
    });
  });

  describe("safeDecryptToken", () => {
    it("should return decrypted token for valid input", async () => {
      const { encryptToken, safeDecryptToken } = await import(
        "@/lib/social/token-manager"
      );
      const encrypted = encryptToken("test-token");
      expect(safeDecryptToken(encrypted)).toBe("test-token");
    });

    it("should return null for invalid input", async () => {
      const { safeDecryptToken } = await import("@/lib/social/token-manager");
      expect(safeDecryptToken("invalid-base64!!!")).toBe(null);
    });
  });

  describe("isTokenExpired", () => {
    it("should return false for null expiry", async () => {
      const { isTokenExpired } = await import("@/lib/social/token-manager");
      expect(isTokenExpired(null)).toBe(false);
      expect(isTokenExpired(undefined)).toBe(false);
    });

    it("should return false for future expiry", async () => {
      const { isTokenExpired } = await import("@/lib/social/token-manager");
      const future = new Date(Date.now() + 60000); // 1 minute from now
      expect(isTokenExpired(future)).toBe(false);
    });

    it("should return true for past expiry", async () => {
      const { isTokenExpired } = await import("@/lib/social/token-manager");
      const past = new Date(Date.now() - 60000); // 1 minute ago
      expect(isTokenExpired(past)).toBe(true);
    });

    it("should respect buffer time", async () => {
      const { isTokenExpired } = await import("@/lib/social/token-manager");
      const soon = new Date(Date.now() + 30000); // 30 seconds from now

      // Without buffer, not expired
      expect(isTokenExpired(soon, 0)).toBe(false);

      // With 60 second buffer, considered expired
      expect(isTokenExpired(soon, 60000)).toBe(true);
    });
  });

  describe("calculateTokenExpiry", () => {
    it("should calculate correct expiry date", async () => {
      const { calculateTokenExpiry } = await import(
        "@/lib/social/token-manager"
      );
      const now = Date.now();
      const expiry = calculateTokenExpiry(3600); // 1 hour

      // Should be approximately 1 hour from now (within 1 second tolerance)
      expect(expiry.getTime()).toBeGreaterThan(now + 3599000);
      expect(expiry.getTime()).toBeLessThan(now + 3601000);
    });
  });
});
