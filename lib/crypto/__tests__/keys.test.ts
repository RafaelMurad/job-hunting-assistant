import { describe, it, expect } from "vitest";
import { deriveKeys, hashAuthKey, importMasterKey, clearKey } from "../keys";

describe("Key Derivation", () => {
  const testEmail = "test@example.com";
  const testPassword = "correct-horse-battery-staple";

  describe("deriveKeys", () => {
    it("produces 32-byte masterKey and authKey", async () => {
      const keys = await deriveKeys(testPassword, testEmail);

      expect(keys.masterKey).toBeInstanceOf(Uint8Array);
      expect(keys.masterKey.length).toBe(32);
      expect(keys.authKey).toBeInstanceOf(Uint8Array);
      expect(keys.authKey.length).toBe(32);
    });

    it("produces deterministic output for same inputs", async () => {
      const keys1 = await deriveKeys(testPassword, testEmail);
      const keys2 = await deriveKeys(testPassword, testEmail);

      expect(keys1.exportedMasterKey).toBe(keys2.exportedMasterKey);
      expect(hashAuthKey(keys1.authKey)).toBe(hashAuthKey(keys2.authKey));
    });

    it("produces different keys for different passwords", async () => {
      const keys1 = await deriveKeys("password1", testEmail);
      const keys2 = await deriveKeys("password2", testEmail);

      expect(keys1.exportedMasterKey).not.toBe(keys2.exportedMasterKey);
    });

    it("produces different keys for different emails", async () => {
      const keys1 = await deriveKeys(testPassword, "user1@example.com");
      const keys2 = await deriveKeys(testPassword, "user2@example.com");

      expect(keys1.exportedMasterKey).not.toBe(keys2.exportedMasterKey);
    });

    it("normalizes email case", async () => {
      const keys1 = await deriveKeys(testPassword, "Test@Example.COM");
      const keys2 = await deriveKeys(testPassword, "test@example.com");

      expect(keys1.exportedMasterKey).toBe(keys2.exportedMasterKey);
    });

    it("trims email whitespace", async () => {
      const keys1 = await deriveKeys(testPassword, "  test@example.com  ");
      const keys2 = await deriveKeys(testPassword, "test@example.com");

      expect(keys1.exportedMasterKey).toBe(keys2.exportedMasterKey);
    });

    it("produces different masterKey and authKey", async () => {
      const keys = await deriveKeys(testPassword, testEmail);

      // masterKey and authKey should be different halves
      const authKeyHex = Array.from(keys.authKey)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      expect(keys.exportedMasterKey).not.toBe(authKeyHex);
    });

    it("produces valid hex string for exportedMasterKey", async () => {
      const keys = await deriveKeys(testPassword, testEmail);

      // 32 bytes = 64 hex characters
      expect(keys.exportedMasterKey).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe("hashAuthKey", () => {
    it("produces 64-character hex string (SHA-256)", async () => {
      const keys = await deriveKeys(testPassword, testEmail);
      const hash = hashAuthKey(keys.authKey);

      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it("produces deterministic output", async () => {
      const keys = await deriveKeys(testPassword, testEmail);
      const hash1 = hashAuthKey(keys.authKey);
      const hash2 = hashAuthKey(keys.authKey);

      expect(hash1).toBe(hash2);
    });

    it("produces different hash for different authKeys", async () => {
      const keys1 = await deriveKeys("password1", testEmail);
      const keys2 = await deriveKeys("password2", testEmail);

      expect(hashAuthKey(keys1.authKey)).not.toBe(hashAuthKey(keys2.authKey));
    });
  });

  describe("importMasterKey", () => {
    it("round-trips with exportedMasterKey", async () => {
      const keys = await deriveKeys(testPassword, testEmail);
      const imported = importMasterKey(keys.exportedMasterKey);

      expect(imported).toEqual(keys.masterKey);
    });

    it("produces correct length Uint8Array", async () => {
      const keys = await deriveKeys(testPassword, testEmail);
      const imported = importMasterKey(keys.exportedMasterKey);

      expect(imported.length).toBe(32);
      expect(imported).toBeInstanceOf(Uint8Array);
    });
  });

  describe("clearKey", () => {
    it("zeros out the key array", async () => {
      const keys = await deriveKeys(testPassword, testEmail);
      const keyBefore = new Uint8Array(keys.masterKey);

      clearKey(keys.masterKey);

      expect(keys.masterKey.every((b) => b === 0)).toBe(true);
      expect(keyBefore.some((b) => b !== 0)).toBe(true); // Original had non-zero values
    });

    it("clears authKey as well", async () => {
      const keys = await deriveKeys(testPassword, testEmail);

      clearKey(keys.authKey);

      expect(keys.authKey.every((b) => b === 0)).toBe(true);
    });
  });
});
