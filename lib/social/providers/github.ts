/**
 * GitHub OAuth Provider
 *
 * Implements OAuth 2.0 flow for GitHub integration.
 * Fetches user profile, repositories, and languages.
 */

import { SOCIAL_CONFIG } from "../config";
import {
  createNetworkError,
  createOAuthError,
  parseProviderError,
  toSocialError,
} from "../errors";
import type {
  GitHubRepo,
  GitHubUser,
  OAuthCallbackResult,
  OAuthTokens,
  SocialProvider,
  SocialUserProfile,
} from "../types";

// =============================================================================
// GITHUB PROVIDER IMPLEMENTATION
// =============================================================================

export class GitHubProvider implements SocialProvider {
  readonly provider = "github" as const;

  private config = SOCIAL_CONFIG.github;

  /**
   * Generate GitHub OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(" "),
      state,
      allow_signup: "false", // Don't show signup, only login
    });

    return `${this.config.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCode(code: string): Promise<OAuthCallbackResult> {
    try {
      const response = await fetch(this.config.tokenUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          redirect_uri: this.config.redirectUri,
        }),
      });

      if (!response.ok) {
        throw createOAuthError("github", {
          status: response.status,
          statusText: response.statusText,
        });
      }

      const data = (await response.json()) as {
        access_token?: string;
        token_type?: string;
        scope?: string;
        error?: string;
        error_description?: string;
      };

      if (data.error || !data.access_token) {
        throw createOAuthError("github", {
          error: data.error,
          description: data.error_description,
        });
      }

      const tokens: OAuthTokens = {
        accessToken: data.access_token,
        scope: data.scope,
        // GitHub tokens don't expire unless revoked
      };

      // Fetch user profile
      const profile = await this.fetchProfile(tokens.accessToken);

      return {
        success: true,
        tokens,
        profile,
      };
    } catch (error) {
      const socialError = toSocialError(error, "github");
      return {
        success: false,
        error: socialError.message,
      };
    }
  }

  /**
   * GitHub tokens don't expire, so refresh is not applicable
   */
  async refreshToken(_refreshToken: string): Promise<OAuthTokens> {
    // GitHub access tokens don't expire and don't have refresh tokens
    // This method exists for interface compliance
    throw new Error("GitHub tokens do not support refresh. Re-authenticate instead.");
  }

  /**
   * Fetch user profile from GitHub API
   */
  async fetchProfile(accessToken: string): Promise<SocialUserProfile> {
    const response = await this.apiRequest<GitHubUser>("/user", accessToken);

    return {
      provider: "github",
      providerId: String(response.id),
      username: response.login,
      displayName: response.name || response.login,
      email: response.email || undefined,
      avatarUrl: response.avatar_url,
      profileUrl: response.html_url,
      rawData: response as unknown as Record<string, unknown>,
    };
  }

  /**
   * Revoke GitHub token (requires deleting the OAuth app authorization)
   */
  async revokeToken(accessToken: string): Promise<boolean> {
    try {
      // GitHub requires Basic auth with client credentials to revoke
      const auth = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`
      ).toString("base64");

      const response = await fetch(
        `https://api.github.com/applications/${this.config.clientId}/token`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ access_token: accessToken }),
        }
      );

      return response.ok || response.status === 404; // 404 = already revoked
    } catch {
      return false;
    }
  }

  /**
   * Validate token by making a simple API request
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.apiRequest("/user", accessToken);
      return true;
    } catch {
      return false;
    }
  }

  // ===========================================================================
  // GITHUB-SPECIFIC DATA FETCHING
  // ===========================================================================

  /**
   * Fetch user's repositories
   */
  async fetchRepositories(
    accessToken: string,
    options?: { perPage?: number; sort?: "created" | "updated" | "pushed" | "full_name" }
  ): Promise<GitHubRepo[]> {
    const perPage = options?.perPage || 100;
    const sort = options?.sort || "pushed";

    const repos = await this.apiRequest<GitHubRepo[]>(
      `/user/repos?per_page=${perPage}&sort=${sort}&type=owner`,
      accessToken
    );

    return repos;
  }

  /**
   * Fetch languages for a specific repository
   */
  async fetchRepoLanguages(
    accessToken: string,
    owner: string,
    repo: string
  ): Promise<Record<string, number>> {
    return this.apiRequest<Record<string, number>>(
      `/repos/${owner}/${repo}/languages`,
      accessToken
    );
  }

  /**
   * Fetch aggregated language statistics across all repositories
   */
  async fetchAggregatedLanguages(
    accessToken: string,
    repos: GitHubRepo[]
  ): Promise<Record<string, number>> {
    const languageTotals: Record<string, number> = {};

    // Only fetch languages for non-fork repos
    const ownRepos = repos.filter((r) => !r.fork).slice(0, 20); // Limit to avoid rate limits

    await Promise.all(
      ownRepos.map(async (repo) => {
        try {
          const [owner, repoName] = repo.full_name.split("/");
          if (!owner || !repoName) return;
          const languages = await this.fetchRepoLanguages(accessToken, owner, repoName);
          for (const [lang, bytes] of Object.entries(languages)) {
            languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
          }
        } catch {
          // Ignore errors for individual repos
        }
      })
    );

    return languageTotals;
  }

  /**
   * Check if repository has a README
   */
  async hasReadme(accessToken: string, owner: string, repo: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/repos/${owner}/${repo}/readme`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // ===========================================================================
  // PRIVATE HELPERS
  // ===========================================================================

  /**
   * Make authenticated API request to GitHub
   */
  private async apiRequest<T>(endpoint: string, accessToken: string): Promise<T> {
    try {
      const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw parseProviderError("github", response.status, body);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof Error && error.name === "SocialIntegrationError") {
        throw error;
      }
      throw createNetworkError("github", error instanceof Error ? error : undefined);
    }
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const githubProvider = new GitHubProvider();
