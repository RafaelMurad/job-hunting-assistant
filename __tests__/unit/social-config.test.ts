/**
 * Social Integration Configuration Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Social Config", () => {
  beforeEach(() => {
    vi.resetModules();
    // Set up test environment variables
    process.env.GITHUB_CLIENT_ID = "test-github-client-id";
    process.env.GITHUB_CLIENT_SECRET = "test-github-client-secret";
    process.env.LINKEDIN_CLIENT_ID = "test-linkedin-client-id";
    process.env.LINKEDIN_CLIENT_SECRET = "test-linkedin-client-secret";
  });

  afterEach(() => {
    // Clean up
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
    delete process.env.LINKEDIN_CLIENT_ID;
    delete process.env.LINKEDIN_CLIENT_SECRET;
  });

  describe("isProviderConfigured", () => {
    it("should return true when GitHub credentials are set", async () => {
      const { isProviderConfigured } = await import("@/lib/social/config");
      expect(isProviderConfigured("github")).toBe(true);
    });

    it("should return true when LinkedIn credentials are set", async () => {
      const { isProviderConfigured } = await import("@/lib/social/config");
      expect(isProviderConfigured("linkedin")).toBe(true);
    });

    it("should return false when credentials are missing", async () => {
      process.env.GITHUB_CLIENT_ID = "";
      process.env.GITHUB_CLIENT_SECRET = "";
      vi.resetModules();
      const { isProviderConfigured } = await import("@/lib/social/config");
      expect(isProviderConfigured("github")).toBe(false);
    });
  });

  describe("getConfiguredProviders", () => {
    it("should return list of configured providers", async () => {
      const { getConfiguredProviders } = await import("@/lib/social/config");
      const providers = getConfiguredProviders();
      expect(providers).toContain("github");
      expect(providers).toContain("linkedin");
    });
  });

  describe("getProviderConfig", () => {
    it("should return OAuth config for configured provider", async () => {
      const { getProviderConfig } = await import("@/lib/social/config");
      const config = getProviderConfig("github");
      expect(config.clientId).toBe("test-github-client-id");
      expect(config.clientSecret).toBe("test-github-client-secret");
      expect(config.scopes).toContain("read:user");
    });

    it("should throw for unconfigured provider", async () => {
      process.env.GITHUB_CLIENT_ID = "";
      process.env.GITHUB_CLIENT_SECRET = "";
      vi.resetModules();
      const { getProviderConfig } = await import("@/lib/social/config");
      expect(() => getProviderConfig("github")).toThrow();
    });
  });
});
