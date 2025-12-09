/**
 * Social Integration Module
 *
 * Barrel export for all social integration functionality.
 * Provides unified API for GitHub and LinkedIn OAuth integrations.
 */

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  // Provider types
  SocialProviderType,
  OAuthConfig,
  OAuthTokens,
  OAuthCallbackResult,

  // Profile types
  SocialUserProfile,
  GitHubUser,
  GitHubRepo,
  GitHubLanguages,
  LinkedInUser,
  LinkedInSavedJobData,

  // Sync types
  SyncType,
  SyncResult,
  SyncProgress,

  // Status types
  IntegrationStatus,

  // Error types
  SocialErrorCode,
  SocialError,

  // Provider interface
  SocialProvider,
} from "./types";

// =============================================================================
// CONFIGURATION EXPORTS
// =============================================================================

export {
  SOCIAL_CONFIG,
  isProviderConfigured,
  getProviderConfig,
  getConfiguredProviders,
  RATE_LIMITS,
  SYNC_CONFIG,
} from "./config";

// =============================================================================
// PROVIDER EXPORTS
// =============================================================================

export { GitHubProvider, githubProvider } from "./providers/github";
export { LinkedInProvider, linkedInProvider } from "./providers/linkedin";

// =============================================================================
// ERROR EXPORTS
// =============================================================================

export {
  SocialIntegrationError,
  createOAuthError,
  createTokenExpiredError,
  createTokenInvalidError,
  createRateLimitError,
  createNetworkError,
  createNotConnectedError,
  createSyncError,
  parseProviderError,
  toSocialError,
  getUserFriendlyMessage,
} from "./errors";

// =============================================================================
// TOKEN MANAGEMENT EXPORTS
// =============================================================================

export {
  encryptToken,
  decryptToken,
  isEncryptedToken,
  safeDecryptToken,
  isTokenExpired,
  calculateTokenExpiry,
  generateEncryptionKey,
} from "./token-manager";

// =============================================================================
// PROVIDER FACTORY
// =============================================================================

import type { SocialProvider, SocialProviderType } from "./types";
import { githubProvider } from "./providers/github";
import { linkedInProvider } from "./providers/linkedin";

/**
 * Get the appropriate provider instance for a given type
 */
export function getProvider(type: SocialProviderType): SocialProvider {
  switch (type) {
    case "github":
      return githubProvider;
    case "linkedin":
      return linkedInProvider;
    default:
      throw new Error(`Unknown social provider: ${type}`);
  }
}

/**
 * Get all available provider instances
 */
export function getAllProviders(): SocialProvider[] {
  return [githubProvider, linkedInProvider];
}
