/**
 * Social Integration Errors Tests
 */

import { describe, it, expect } from "vitest";
import {
  SocialIntegrationError,
  createOAuthError,
  createTokenExpiredError,
  createRateLimitError,
  createNetworkError,
  parseProviderError,
  toSocialError,
  getUserFriendlyMessage,
} from "@/lib/social/errors";

describe("Social Integration Errors", () => {
  describe("SocialIntegrationError", () => {
    it("should create error with correct properties", () => {
      const error = new SocialIntegrationError("OAUTH_ERROR", "Test error", {
        provider: "github",
        details: { foo: "bar" },
      });

      expect(error.name).toBe("SocialIntegrationError");
      expect(error.code).toBe("OAUTH_ERROR");
      expect(error.message).toBe("Test error");
      expect(error.provider).toBe("github");
      expect(error.details).toEqual({ foo: "bar" });
    });

    it("should mark retryable errors correctly", () => {
      const rateLimitError = new SocialIntegrationError("RATE_LIMITED", "Rate limited");
      const oauthError = new SocialIntegrationError("OAUTH_ERROR", "OAuth error");

      expect(rateLimitError.isRetryable).toBe(true);
      expect(oauthError.isRetryable).toBe(false);
    });
  });

  describe("Error Factory Functions", () => {
    it("should create OAuth error", () => {
      const error = createOAuthError("github", { code: "invalid_grant" });
      expect(error.code).toBe("OAUTH_ERROR");
      expect(error.provider).toBe("github");
    });

    it("should create token expired error", () => {
      const error = createTokenExpiredError("linkedin");
      expect(error.code).toBe("TOKEN_EXPIRED");
      expect(error.provider).toBe("linkedin");
    });

    it("should create rate limit error with retry time", () => {
      const error = createRateLimitError("github", 60);
      expect(error.code).toBe("RATE_LIMITED");
      expect(error.message).toContain("60 seconds");
    });

    it("should create network error", () => {
      const cause = new Error("ECONNREFUSED");
      const error = createNetworkError("github", cause);
      expect(error.code).toBe("NETWORK_ERROR");
      expect(error.cause).toBe(cause);
    });
  });

  describe("parseProviderError", () => {
    it("should parse 429 as rate limit error", () => {
      const error = parseProviderError("github", 429, { retry_after: 60 });
      expect(error.code).toBe("RATE_LIMITED");
    });

    it("should parse 401 as token invalid error", () => {
      const error = parseProviderError("github", 401, {});
      expect(error.code).toBe("TOKEN_INVALID");
    });

    it("should parse 403 as scope insufficient error", () => {
      const error = parseProviderError("linkedin", 403, {});
      expect(error.code).toBe("SCOPE_INSUFFICIENT");
    });

    it("should parse other errors as provider error", () => {
      const error = parseProviderError("github", 500, { message: "Internal error" });
      expect(error.code).toBe("PROVIDER_ERROR");
    });
  });

  describe("toSocialError", () => {
    it("should return SocialIntegrationError as-is", () => {
      const original = createOAuthError("github");
      const result = toSocialError(original, "github");
      expect(result).toBe(original);
    });

    it("should wrap regular Error", () => {
      const original = new Error("Something went wrong");
      const result = toSocialError(original, "github");
      expect(result).toBeInstanceOf(SocialIntegrationError);
      expect(result.cause).toBe(original);
    });

    it("should detect network errors from Error message", () => {
      const original = new Error("fetch failed: ECONNREFUSED");
      const result = toSocialError(original, "github");
      expect(result.code).toBe("NETWORK_ERROR");
    });
  });

  describe("getUserFriendlyMessage", () => {
    it("should return friendly message for each error code", () => {
      const codes = [
        { code: "OAUTH_ERROR" as const, contains: "connect" },
        { code: "TOKEN_EXPIRED" as const, contains: "expired" },
        { code: "RATE_LIMITED" as const, contains: "wait" },
        { code: "NETWORK_ERROR" as const, contains: "internet" },
        { code: "NOT_CONNECTED" as const, contains: "not connected" },
      ];

      codes.forEach(({ code, contains }) => {
        const error = new SocialIntegrationError(code, "Test");
        const message = getUserFriendlyMessage(error);
        expect(message.toLowerCase()).toContain(contains);
      });
    });
  });
});
