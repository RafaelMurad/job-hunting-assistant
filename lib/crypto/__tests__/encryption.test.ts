import { describe, it, expect } from "vitest";
import {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  type EncryptedPayload,
} from "../encryption";
import { deriveKeys } from "../keys";
import { createEmptyVault, type UserVault } from "../vault";

describe("Encryption", () => {
  // Use a fixed key for deterministic tests
  const testKey = new Uint8Array(32).fill(42);

  describe("encrypt/decrypt", () => {
    it("encrypts and decrypts a string correctly", () => {
      const plaintext = "Hello, World!";
      const encrypted = encrypt(plaintext, testKey);
      const decrypted = decrypt(encrypted, testKey);

      expect(decrypted).toBe(plaintext);
    });

    it("encrypts and decrypts unicode correctly", () => {
      const plaintext = "你好世界 🌍 مرحبا";
      const encrypted = encrypt(plaintext, testKey);
      const decrypted = decrypt(encrypted, testKey);

      expect(decrypted).toBe(plaintext);
    });

    it("encrypts and decrypts empty string", () => {
      const plaintext = "";
      const encrypted = encrypt(plaintext, testKey);
      const decrypted = decrypt(encrypted, testKey);

      expect(decrypted).toBe(plaintext);
    });

    it("encrypts and decrypts large content", () => {
      const plaintext = "x".repeat(100000);
      const encrypted = encrypt(plaintext, testKey);
      const decrypted = decrypt(encrypted, testKey);

      expect(decrypted).toBe(plaintext);
    });

    it("produces different ciphertext for same plaintext (random nonce)", () => {
      const plaintext = "Hello, World!";
      const encrypted1 = encrypt(plaintext, testKey);
      const encrypted2 = encrypt(plaintext, testKey);

      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
      expect(encrypted1.nonce).not.toBe(encrypted2.nonce);
    });

    it("fails to decrypt with wrong key", () => {
      const plaintext = "Hello, World!";
      const encrypted = encrypt(plaintext, testKey);
      const wrongKey = new Uint8Array(32).fill(99);

      expect(() => decrypt(encrypted, wrongKey)).toThrow();
    });

    it("fails to decrypt tampered ciphertext", () => {
      const plaintext = "Hello, World!";
      const encrypted = encrypt(plaintext, testKey);

      // Tamper with ciphertext by flipping a character
      const chars = encrypted.ciphertext.split("");
      chars[0] = chars[0] === "0" ? "1" : "0";
      const tampered: EncryptedPayload = {
        ...encrypted,
        ciphertext: chars.join(""),
      };

      expect(() => decrypt(tampered, testKey)).toThrow();
    });

    it("rejects invalid key length", () => {
      const shortKey = new Uint8Array(16);
      expect(() => encrypt("test", shortKey)).toThrow("masterKey must be 32 bytes");
    });

    it("rejects unsupported version", () => {
      const encrypted = encrypt("test", testKey);
      // @ts-expect-error - intentionally testing invalid version
      const badVersion: EncryptedPayload = { ...encrypted, v: 2 };

      expect(() => decrypt(badVersion, testKey)).toThrow("Unsupported encryption version");
    });

    it("produces valid hex strings", () => {
      const encrypted = encrypt("test", testKey);

      // Nonce should be 24 hex chars (12 bytes)
      expect(encrypted.nonce).toMatch(/^[0-9a-f]{24}$/);
      // Ciphertext should be valid hex
      expect(encrypted.ciphertext).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe("encryptObject/decryptObject", () => {
    it("encrypts and decrypts objects correctly", () => {
      const obj = { name: "Test", count: 42, nested: { value: true } };
      const encrypted = encryptObject(obj, testKey);
      const decrypted = decryptObject<typeof obj>(encrypted, testKey);

      expect(decrypted).toEqual(obj);
    });

    it("handles arrays", () => {
      const arr = [1, 2, 3, "test", { nested: true }];
      const encrypted = encryptObject(arr, testKey);
      const decrypted = decryptObject<typeof arr>(encrypted, testKey);

      expect(decrypted).toEqual(arr);
    });

    it("handles null and undefined values in objects", () => {
      const obj = { a: null, b: undefined, c: "value" };
      const encrypted = encryptObject(obj, testKey);
      const decrypted = decryptObject<typeof obj>(encrypted, testKey);

      // JSON.stringify removes undefined, keeps null
      expect(decrypted.a).toBeNull();
      expect(decrypted.b).toBeUndefined();
      expect(decrypted.c).toBe("value");
    });

    it("handles dates as ISO strings", () => {
      const obj = { date: new Date("2026-01-12T00:00:00.000Z").toISOString() };
      const encrypted = encryptObject(obj, testKey);
      const decrypted = decryptObject<typeof obj>(encrypted, testKey);

      expect(decrypted.date).toBe("2026-01-12T00:00:00.000Z");
    });
  });

  describe("UserVault encryption", () => {
    it("encrypts and decrypts an empty vault", () => {
      const vault = createEmptyVault("test@example.com");

      const encrypted = encryptObject(vault, testKey);
      const decrypted = decryptObject<UserVault>(encrypted, testKey);

      expect(decrypted.version).toBe(1);
      expect(decrypted.profile.email).toBe("test@example.com");
      expect(decrypted.applications).toEqual([]);
      expect(decrypted.documents).toEqual([]);
    });

    it("encrypts and decrypts a vault with data", () => {
      const vault = createEmptyVault("test@example.com");

      // Add profile data
      vault.profile.name = "Test User";
      vault.profile.skills = ["TypeScript", "React", "Node.js"];
      vault.profile.experience.push({
        id: "exp-1",
        company: "Test Corp",
        role: "Senior Engineer",
        startDate: "2020-01-01",
        current: true,
        description: "Building cool stuff",
        highlights: ["Led team of 5", "Shipped 3 major features"],
      });

      // Add an application
      vault.applications.push({
        id: "app-1",
        company: "Dream Company",
        role: "Staff Engineer",
        status: "applied",
        jobDescription: "A great opportunity...",
        jobUrl: "https://example.com/job",
        matchScore: 85,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Add a document
      vault.documents.push({
        id: "doc-1",
        type: "cv",
        name: "My Resume",
        content: "\\documentclass{article}...",
        mimeType: "text/x-tex",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const encrypted = encryptObject(vault, testKey);
      const decrypted = decryptObject<UserVault>(encrypted, testKey);

      expect(decrypted.profile.name).toBe("Test User");
      expect(decrypted.profile.skills).toEqual(["TypeScript", "React", "Node.js"]);
      expect(decrypted.profile.experience).toHaveLength(1);
      expect(decrypted.profile.experience[0]?.company).toBe("Test Corp");
      expect(decrypted.applications).toHaveLength(1);
      expect(decrypted.applications[0]?.matchScore).toBe(85);
      expect(decrypted.documents).toHaveLength(1);
      expect(decrypted.documents[0]?.type).toBe("cv");
    });

    it("encrypts vault with derived keys", async () => {
      const keys = await deriveKeys("password123", "test@example.com");
      const vault = createEmptyVault("test@example.com");
      vault.profile.name = "Encrypted User";

      const encrypted = encryptObject(vault, keys.masterKey);
      const decrypted = decryptObject<UserVault>(encrypted, keys.masterKey);

      expect(decrypted.profile.name).toBe("Encrypted User");
    });

    it("fails to decrypt with wrong password", async () => {
      const keys1 = await deriveKeys("correct-password", "test@example.com");
      const keys2 = await deriveKeys("wrong-password", "test@example.com");

      const vault = createEmptyVault("test@example.com");
      const encrypted = encryptObject(vault, keys1.masterKey);

      expect(() => decryptObject(encrypted, keys2.masterKey)).toThrow();
    });
  });
});
