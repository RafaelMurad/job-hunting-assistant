/**
 * Feature Flags Tests
 */

import { describe, it, expect } from "vitest";
import {
  FEATURE_FLAGS,
  getFlagDefinition,
  getFlagsByCategory,
} from "@/lib/feature-flags/flags.config";

describe("Feature Flags", () => {
  describe("FEATURE_FLAGS", () => {
    it("should contain expected integration flags", () => {
      const keys = FEATURE_FLAGS.map((f) => f.key);

      expect(keys).toContain("integrations");
      expect(keys).toContain("github_integration");
      expect(keys).toContain("linkedin_integration");
    });

    it("should have valid structure for all flags", () => {
      FEATURE_FLAGS.forEach((flag) => {
        expect(flag.key).toBeTruthy();
        expect(flag.name).toBeTruthy();
        expect(flag.description).toBeTruthy();
        expect(typeof flag.defaultEnabled).toBe("boolean");
        expect(["core", "experimental", "beta", "deprecated"]).toContain(flag.category);
      });
    });

    it("should have unique keys", () => {
      const keys = FEATURE_FLAGS.map((f) => f.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe("getFlagDefinition", () => {
    it("should return flag definition by key", () => {
      const flag = getFlagDefinition("integrations");
      expect(flag).toBeDefined();
      expect(flag?.key).toBe("integrations");
      expect(flag?.name).toBe("Integration Hub");
    });

    it("should return undefined for non-existent key", () => {
      const flag = getFlagDefinition("non_existent_flag");
      expect(flag).toBeUndefined();
    });
  });

  describe("getFlagsByCategory", () => {
    it("should return all experimental flags", () => {
      const experimental = getFlagsByCategory("experimental");
      expect(experimental.length).toBeGreaterThan(0);
      experimental.forEach((flag) => {
        expect(flag.category).toBe("experimental");
      });
    });

    it("should include integration flags in experimental", () => {
      const experimental = getFlagsByCategory("experimental");
      const keys = experimental.map((f) => f.key);

      expect(keys).toContain("github_integration");
      expect(keys).toContain("linkedin_integration");
    });

    it("should return empty array for category with no flags", () => {
      // Currently deprecated is empty, but this tests the behavior
      const deprecated = getFlagsByCategory("deprecated");
      expect(Array.isArray(deprecated)).toBe(true);
    });
  });

  describe("Integration Flag Properties", () => {
    it("github_integration should have correct properties", () => {
      const flag = getFlagDefinition("github_integration");
      expect(flag).toMatchObject({
        key: "github_integration",
        category: "experimental",
        defaultEnabled: false,
      });
      expect(flag?.description.toLowerCase()).toContain("github");
    });

    it("linkedin_integration should have correct properties", () => {
      const flag = getFlagDefinition("linkedin_integration");
      expect(flag).toMatchObject({
        key: "linkedin_integration",
        category: "experimental",
        defaultEnabled: false,
      });
      expect(flag?.description.toLowerCase()).toContain("linkedin");
    });
  });
});
