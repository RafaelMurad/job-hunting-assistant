/**
 * GitHub OAuth Provider
 *
 * Implements OAuth 2.0 flow for GitHub integration.
 * Fetches user profile, repositories, and languages.
 */

import { SOCIAL_CONFIG } from "../config";
import { createNetworkError, createOAuthError, parseProviderError, toSocialError } from "../errors";
import type {
  GitHubContributionData,
  GitHubEnhancedProfile,
  GitHubOrganization,
  GitHubReadmeResponse,
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
      const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString(
        "base64"
      );

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

  /**
   * Fetch README content from a repository
   * Returns the decoded README content or null if not found
   */
  async fetchReadmeContent(
    accessToken: string,
    owner: string,
    repo: string
  ): Promise<string | null> {
    try {
      const response = await this.apiRequest<GitHubReadmeResponse>(
        `/repos/${owner}/${repo}/readme`,
        accessToken
      );

      // Decode base64 content
      return Buffer.from(response.content, "base64").toString("utf-8");
    } catch {
      return null;
    }
  }

  /**
   * Fetch user's GitHub organizations
   */
  async fetchOrganizations(accessToken: string): Promise<GitHubOrganization[]> {
    try {
      return this.apiRequest<GitHubOrganization[]>("/user/orgs", accessToken);
    } catch {
      return [];
    }
  }

  /**
   * Fetch enhanced profile data with additional fields for CV analysis
   */
  async fetchEnhancedProfile(accessToken: string): Promise<GitHubEnhancedProfile> {
    const user = await this.apiRequest<GitHubUser & GitHubEnhancedProfile>("/user", accessToken);

    return {
      bio: user.bio,
      company: user.company,
      location: user.location,
      blog: user.blog,
      hireable: user.hireable ?? null,
      followers: user.followers,
      following: user.following,
      public_repos: user.public_repos,
      public_gists: user.public_gists ?? 0,
      created_at: user.created_at,
    };
  }

  /**
   * Calculate contribution statistics from repositories
   * This aggregates data from repos rather than using GraphQL
   */
  async calculateContributionStats(
    accessToken: string,
    repos: GitHubRepo[]
  ): Promise<GitHubContributionData> {
    const ownedRepos = repos.filter((r) => !r.fork);
    const forkedRepos = repos.filter((r) => r.fork);
    const openSourceRepos = repos.filter((r) => r.license && !r.private);

    // Calculate totals
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);

    // Get aggregated languages
    const languageBytes = await this.fetchAggregatedLanguages(accessToken, repos);

    // Sort languages by bytes and get top 10
    const topLanguages = Object.entries(languageBytes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([lang]) => lang);

    // Find date ranges from repos
    const repoDates = repos
      .map((r) => new Date(r.created_at))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    const pushDates = repos
      .filter((r) => r.pushed_at)
      .map((r) => new Date(r.pushed_at))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => b.getTime() - a.getTime());

    return {
      totalRepos: repos.length,
      ownedRepos: ownedRepos.length,
      forkedRepos: forkedRepos.length,
      openSourceRepos: openSourceRepos.length,
      totalStars,
      totalForks,
      languageBytes,
      topLanguages,
      oldestRepoDate: repoDates[0]?.toISOString() ?? null,
      newestRepoDate: repoDates[repoDates.length - 1]?.toISOString() ?? null,
      lastPushDate: pushDates[0]?.toISOString() ?? null,
    };
  }

  /**
   * Fetch repository contributors count
   * Returns the number of contributors or null if unavailable
   */
  async fetchContributorsCount(
    accessToken: string,
    owner: string,
    repo: string
  ): Promise<number | null> {
    try {
      // Use per_page=1 and check the Link header for total count
      const response = await fetch(
        `${this.config.apiUrl}/repos/${owner}/${repo}/contributors?per_page=1&anon=false`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      if (!response.ok) return null;

      // Try to get count from Link header (last page number)
      const linkHeader = response.headers.get("Link");
      if (linkHeader) {
        const lastMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
        if (lastMatch?.[1]) {
          return parseInt(lastMatch[1], 10);
        }
      }

      // If no Link header, count from response (small number of contributors)
      const contributors = await response.json();
      return Array.isArray(contributors) ? contributors.length : null;
    } catch {
      return null;
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
