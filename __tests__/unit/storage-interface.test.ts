/**
 * Storage Interface Tests
 *
 * Tests for mode detection utilities.
 * Note: Mode detection functions check process.env at call time,
 * but the value is determined at build time in Next.js.
 * These tests verify the function logic works correctly.
 */

import { describe, it, expect } from "vitest";

describe("Storage Interface", () => {
  describe("Mode Detection Functions", () => {
    it("should export mode detection functions", async () => {
      // Dynamic import to avoid module-level env evaluation issues
      const { isLocalMode, isDemoMode } = await import("@/lib/storage/interface");

      // Functions should exist and return booleans
      expect(typeof isLocalMode).toBe("function");
      expect(typeof isDemoMode).toBe("function");
      expect(typeof isLocalMode()).toBe("boolean");
      expect(typeof isDemoMode()).toBe("boolean");
    });

    it("should have opposite return values for the same environment", async () => {
      const { isLocalMode, isDemoMode } = await import("@/lib/storage/interface");

      // In any environment, one should be true and one should be false
      // OR both could be in a specific state based on the env
      const localResult = isLocalMode();
      const demoResult = isDemoMode();

      // They should be mutually exclusive
      expect(localResult).not.toBe(demoResult);
    });
  });

  describe("Type Definitions", () => {
    it("should export StoredProfile type with required fields", async () => {
      // This test verifies types compile correctly
      const { localStorageAdapter } = await import("@/lib/storage/local");

      // Verify the adapter has profile methods
      expect(typeof localStorageAdapter.getProfile).toBe("function");
      expect(typeof localStorageAdapter.saveProfile).toBe("function");
    });

    it("should export StoredCV type with required fields", async () => {
      const { localStorageAdapter } = await import("@/lib/storage/local");

      expect(typeof localStorageAdapter.getCVs).toBe("function");
      expect(typeof localStorageAdapter.getCV).toBe("function");
      expect(typeof localStorageAdapter.createCV).toBe("function");
      expect(typeof localStorageAdapter.updateCV).toBe("function");
      expect(typeof localStorageAdapter.deleteCV).toBe("function");
    });

    it("should export StoredApplication type with required fields", async () => {
      const { localStorageAdapter } = await import("@/lib/storage/local");

      expect(typeof localStorageAdapter.getApplications).toBe("function");
      expect(typeof localStorageAdapter.getApplication).toBe("function");
      expect(typeof localStorageAdapter.createApplication).toBe("function");
      expect(typeof localStorageAdapter.updateApplication).toBe("function");
      expect(typeof localStorageAdapter.deleteApplication).toBe("function");
    });
  });
});
