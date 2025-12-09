/**
 * Social Integration Errors
 *
 * Custom error classes and error handling utilities for social integrations.
 */

import type { SocialErrorCode, SocialProviderType } from "./types";

// =============================================================================
// CUSTOM ERROR CLASS
// =============================================================================

export class SocialIntegrationError extends Error {
  readonly code: SocialErrorCode;
  readonly provider: SocialProviderType | undefined;
  readonly details: unknown;
  readonly isRetryable: boolean;

  constructor(
    code: SocialErrorCode,
    message: string,
    options?: {
      provider?: SocialProviderType | undefined;
      details?: unknown;
      cause?: Error | undefined;
    }
  ) {
    super(message);
    this.name = "SocialIntegrationError";
    this.code = code;
    this.provider = options?.provider ?? undefined;
    this.details = options?.details ?? undefined;
    if (options?.cause) {
      this.cause = options.cause;
    }
    this.isRetryable = RETRYABLE_ERRORS.has(code);
  }
}

// =============================================================================
// ERROR CODES CONFIGURATION
// =============================================================================

const RETRYABLE_ERRORS = new Set<SocialErrorCode>([
  "RATE_LIMITED",
  "NETWORK_ERROR",
  "PROVIDER_ERROR",
]);

const ERROR_MESSAGES: Record<SocialErrorCode, string> = {
  OAUTH_ERROR: "OAuth authentication failed",
  TOKEN_EXPIRED: "Access token has expired",
  TOKEN_INVALID: "Access token is invalid or revoked",
  RATE_LIMITED: "Rate limit exceeded, please try again later",
  SCOPE_INSUFFICIENT: "Additional permissions are required",
  PROVIDER_ERROR: "The service provider returned an error",
  NETWORK_ERROR: "Network error, please check your connection",
  NOT_CONNECTED: "Account is not connected",
  ALREADY_CONNECTED: "Account is already connected",
  SYNC_FAILED: "Data synchronization failed",
};

// =============================================================================
// ERROR FACTORY FUNCTIONS
// =============================================================================

export function createOAuthError(
  provider: SocialProviderType,
  details?: unknown
): SocialIntegrationError {
  return new SocialIntegrationError("OAUTH_ERROR", ERROR_MESSAGES.OAUTH_ERROR, {
    provider,
    details,
  });
}

export function createTokenExpiredError(provider: SocialProviderType): SocialIntegrationError {
  return new SocialIntegrationError("TOKEN_EXPIRED", ERROR_MESSAGES.TOKEN_EXPIRED, {
    provider,
  });
}

export function createTokenInvalidError(provider: SocialProviderType): SocialIntegrationError {
  return new SocialIntegrationError("TOKEN_INVALID", ERROR_MESSAGES.TOKEN_INVALID, {
    provider,
  });
}

export function createRateLimitError(
  provider: SocialProviderType,
  retryAfter?: number
): SocialIntegrationError {
  const message = retryAfter
    ? `${ERROR_MESSAGES.RATE_LIMITED}. Retry after ${retryAfter} seconds.`
    : ERROR_MESSAGES.RATE_LIMITED;

  return new SocialIntegrationError("RATE_LIMITED", message, {
    provider,
    details: { retryAfter },
  });
}

export function createNetworkError(
  provider: SocialProviderType,
  cause?: Error
): SocialIntegrationError {
  const options: { provider: SocialProviderType; cause?: Error } = { provider };
  if (cause) {
    options.cause = cause;
  }
  return new SocialIntegrationError("NETWORK_ERROR", ERROR_MESSAGES.NETWORK_ERROR, options);
}

export function createNotConnectedError(provider: SocialProviderType): SocialIntegrationError {
  return new SocialIntegrationError("NOT_CONNECTED", ERROR_MESSAGES.NOT_CONNECTED, {
    provider,
  });
}

export function createSyncError(
  provider: SocialProviderType,
  details?: unknown
): SocialIntegrationError {
  return new SocialIntegrationError("SYNC_FAILED", ERROR_MESSAGES.SYNC_FAILED, {
    provider,
    details,
  });
}

// =============================================================================
// ERROR PARSING UTILITIES
// =============================================================================

/**
 * Parse API error response and create appropriate error
 */
export function parseProviderError(
  provider: SocialProviderType,
  status: number,
  body: unknown
): SocialIntegrationError {
  // Rate limiting
  if (status === 429) {
    const retryAfter =
      typeof body === "object" && body !== null && "retry_after" in body
        ? Number((body as Record<string, unknown>).retry_after)
        : undefined;
    return createRateLimitError(provider, retryAfter);
  }

  // Unauthorized (token issues)
  if (status === 401) {
    return createTokenInvalidError(provider);
  }

  // Forbidden (scope issues)
  if (status === 403) {
    return new SocialIntegrationError(
      "SCOPE_INSUFFICIENT",
      ERROR_MESSAGES.SCOPE_INSUFFICIENT,
      { provider, details: body }
    );
  }

  // Generic provider error
  return new SocialIntegrationError("PROVIDER_ERROR", ERROR_MESSAGES.PROVIDER_ERROR, {
    provider,
    details: { status, body },
  });
}

/**
 * Convert unknown error to SocialIntegrationError
 */
export function toSocialError(
  error: unknown,
  provider?: SocialProviderType
): SocialIntegrationError {
  if (error instanceof SocialIntegrationError) {
    return error;
  }

  if (error instanceof Error) {
    // Network errors
    if (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("ECONNREFUSED")
    ) {
      return createNetworkError(provider || "github", error);
    }

    return new SocialIntegrationError("PROVIDER_ERROR", error.message, {
      provider,
      cause: error,
    });
  }

  return new SocialIntegrationError("PROVIDER_ERROR", String(error), {
    provider,
  });
}

// =============================================================================
// USER-FRIENDLY ERROR MESSAGES
// =============================================================================

/**
 * Get user-friendly error message for display
 */
export function getUserFriendlyMessage(error: SocialIntegrationError): string {
  switch (error.code) {
    case "OAUTH_ERROR":
      return "We couldn't connect to your account. Please try again.";
    case "TOKEN_EXPIRED":
      return "Your session has expired. Please reconnect your account.";
    case "TOKEN_INVALID":
      return "Your connection is no longer valid. Please reconnect your account.";
    case "RATE_LIMITED":
      return "Too many requests. Please wait a few minutes and try again.";
    case "SCOPE_INSUFFICIENT":
      return "Additional permissions are needed. Please reconnect with the required permissions.";
    case "PROVIDER_ERROR":
      return "The service is temporarily unavailable. Please try again later.";
    case "NETWORK_ERROR":
      return "Connection failed. Please check your internet and try again.";
    case "NOT_CONNECTED":
      return "This account is not connected. Please connect it first.";
    case "ALREADY_CONNECTED":
      return "This account is already connected.";
    case "SYNC_FAILED":
      return "We couldn't sync your data. Please try again.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}
