/**
 * Social Integration Configuration
 *
 * Centralized configuration for OAuth providers (GitHub, LinkedIn).
 * All sensitive values come from environment variables.
 */

import type { OAuthConfig, SocialProviderType } from "./types";

// =============================================================================
// PROVIDER CONFIGURATIONS
// =============================================================================

export const SOCIAL_CONFIG = {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    redirectUri:
      process.env.GITHUB_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/github/callback`,
    scopes: ["read:user", "user:email", "repo"], // Minimal scopes for profile + public repos
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    apiUrl: "https://api.github.com",
  },

  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || "",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
    redirectUri:
      process.env.LINKEDIN_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/linkedin/callback`,
    scopes: ["openid", "profile", "email"], // LinkedIn v2 API scopes
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    apiUrl: "https://api.linkedin.com/v2",
  },

  // Token encryption key (must be 32 bytes for AES-256)
  encryptionKey: process.env.SOCIAL_ENCRYPTION_KEY || "",
} as const;

// =============================================================================
// AVAILABILITY CHECKING
// =============================================================================

/**
 * Check if a social provider is configured (has required credentials)
 */
export function isProviderConfigured(provider: SocialProviderType): boolean {
  const config = SOCIAL_CONFIG[provider];
  return !!(config.clientId && config.clientSecret);
}

/**
 * Get OAuth config for a provider (throws if not configured)
 */
export function getProviderConfig(provider: SocialProviderType): OAuthConfig {
  if (!isProviderConfigured(provider)) {
    throw new Error(`Social provider '${provider}' is not configured. Missing credentials.`);
  }

  const config = SOCIAL_CONFIG[provider];
  return {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri,
    scopes: [...config.scopes],
  };
}

/**
 * Get list of configured providers
 */
export function getConfiguredProviders(): SocialProviderType[] {
  const providers: SocialProviderType[] = ["github", "linkedin"];
  return providers.filter(isProviderConfigured);
}

// =============================================================================
// RATE LIMITING CONFIGURATION
// =============================================================================

export const RATE_LIMITS = {
  github: {
    requestsPerHour: 5000, // With OAuth token
    reposPerSync: 100, // Max repos to fetch per sync
    syncCooldown: 5 * 60 * 1000, // 5 minutes between syncs
  },
  linkedin: {
    requestsPerDay: 100, // LinkedIn is very restrictive
    syncCooldown: 60 * 60 * 1000, // 1 hour between syncs
  },
} as const;

// =============================================================================
// SYNC CONFIGURATION
// =============================================================================

export const SYNC_CONFIG = {
  // How often to auto-refresh data (in milliseconds)
  autoRefreshInterval: 24 * 60 * 60 * 1000, // 24 hours

  // Token refresh buffer (refresh before actual expiry)
  tokenRefreshBuffer: 5 * 60 * 1000, // 5 minutes before expiry

  // Maximum retries for failed syncs
  maxRetries: 3,

  // Backoff multiplier for retries (exponential)
  retryBackoff: 2,

  // Initial retry delay
  initialRetryDelay: 1000, // 1 second
} as const;
