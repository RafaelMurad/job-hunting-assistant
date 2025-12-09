/**
 * Social Integration Types
 *
 * Type definitions for social OAuth integrations (GitHub, LinkedIn).
 */

// =============================================================================
// PROVIDER TYPES
// =============================================================================

export type SocialProviderType = "github" | "linkedin";

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string | undefined;
  expiresAt?: Date | undefined;
  scope?: string | undefined;
}

export interface OAuthCallbackResult {
  success: boolean;
  tokens?: OAuthTokens;
  profile?: SocialUserProfile;
  error?: string;
}

// =============================================================================
// USER PROFILE TYPES
// =============================================================================

export interface SocialUserProfile {
  provider: SocialProviderType;
  providerId: string;
  username?: string | undefined;
  displayName?: string | undefined;
  email?: string | undefined;
  avatarUrl?: string | undefined;
  profileUrl?: string | undefined;
  rawData?: Record<string, unknown> | undefined;
}

// =============================================================================
// GITHUB SPECIFIC TYPES
// =============================================================================

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  private: boolean;
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  license: { spdx_id: string; name: string } | null;
  default_branch: string;
  pushed_at: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubLanguages {
  [language: string]: number; // bytes of code
}

export interface GitHubOrganization {
  id: number;
  login: string;
  name?: string | null;
  description: string | null;
  html_url: string;
  avatar_url: string;
}

export interface GitHubReadmeResponse {
  content: string; // Base64 encoded
  encoding: string;
  size: number;
  name: string;
  path: string;
}

/**
 * Enhanced profile data for CV gap analysis
 */
export interface GitHubEnhancedProfile {
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  hireable: boolean | null;
  followers: number;
  following: number;
  public_repos: number;
  public_gists: number;
  created_at: string;
}

/**
 * Contribution stats fetched from GitHub
 */
export interface GitHubContributionData {
  totalRepos: number;
  ownedRepos: number;
  forkedRepos: number;
  openSourceRepos: number;
  totalStars: number;
  totalForks: number;
  languageBytes: Record<string, number>;
  topLanguages: string[];
  oldestRepoDate: string | null;
  newestRepoDate: string | null;
  lastPushDate: string | null;
}

// =============================================================================
// LINKEDIN SPECIFIC TYPES
// =============================================================================

export interface LinkedInUser {
  id: string;
  localizedFirstName: string;
  localizedLastName: string;
  profilePicture?: {
    displayImage: string;
  };
  vanityName?: string;
}

export interface LinkedInEmail {
  elements: Array<{
    "handle~": {
      emailAddress: string;
    };
  }>;
}

export interface LinkedInSavedJobData {
  id: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  jobUrl: string;
  postedAt?: Date;
  isRemote?: boolean;
  employmentType?: string;
}

// =============================================================================
// SYNC TYPES
// =============================================================================

export type SyncType = "profile" | "repos" | "jobs" | "connections" | "languages";

export interface SyncResult {
  success: boolean;
  syncType: SyncType;
  itemsFound: number;
  itemsSynced: number;
  error?: string;
  data?: unknown;
}

export interface SyncProgress {
  provider: SocialProviderType;
  syncType: SyncType;
  status: "pending" | "in_progress" | "completed" | "failed";
  progress: number; // 0-100
  message?: string;
}

// =============================================================================
// PROVIDER INTERFACE
// =============================================================================

export interface SocialProvider {
  readonly provider: SocialProviderType;

  /** Generate OAuth authorization URL */
  getAuthorizationUrl(state: string): string;

  /** Exchange authorization code for tokens */
  exchangeCode(code: string): Promise<OAuthCallbackResult>;

  /** Refresh expired access token */
  refreshToken(refreshToken: string): Promise<OAuthTokens>;

  /** Fetch user profile from provider */
  fetchProfile(accessToken: string): Promise<SocialUserProfile>;

  /** Revoke access token (disconnect) */
  revokeToken(accessToken: string): Promise<boolean>;

  /** Check if token is valid */
  validateToken(accessToken: string): Promise<boolean>;
}

// =============================================================================
// INTEGRATION STATUS
// =============================================================================

export interface IntegrationStatus {
  provider: SocialProviderType;
  connected: boolean;
  username?: string | undefined;
  displayName?: string | undefined;
  avatarUrl?: string | undefined;
  lastSyncAt?: Date | undefined;
  syncStatus?: "pending" | "in_progress" | "completed" | "failed" | undefined;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export type SocialErrorCode =
  | "OAUTH_ERROR"
  | "TOKEN_EXPIRED"
  | "TOKEN_INVALID"
  | "RATE_LIMITED"
  | "SCOPE_INSUFFICIENT"
  | "PROVIDER_ERROR"
  | "NETWORK_ERROR"
  | "NOT_CONNECTED"
  | "ALREADY_CONNECTED"
  | "SYNC_FAILED";

export interface SocialError {
  code: SocialErrorCode;
  message: string;
  provider?: SocialProviderType;
  details?: unknown;
}
