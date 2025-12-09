/**
 * LinkedIn OAuth Provider
 *
 * Implements OAuth 2.0 flow for LinkedIn integration.
 * Note: LinkedIn API access is restricted; requires approved app.
 */

import { SOCIAL_CONFIG } from "../config";
import {
  createNetworkError,
  createOAuthError,
  parseProviderError,
  toSocialError,
} from "../errors";
import { calculateTokenExpiry } from "../token-manager";
import type {
  LinkedInEmail,
  OAuthCallbackResult,
  OAuthTokens,
  SocialProvider,
  SocialUserProfile,
} from "../types";

// =============================================================================
// LINKEDIN PROVIDER IMPLEMENTATION
// =============================================================================

export class LinkedInProvider implements SocialProvider {
  readonly provider = "linkedin" as const;

  private config = SOCIAL_CONFIG.linkedin;

  /**
   * Generate LinkedIn OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(" "),
      state,
    });

    return `${this.config.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCode(code: string): Promise<OAuthCallbackResult> {
    try {
      const params = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: this.config.redirectUri,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      });

      const response = await fetch(this.config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw createOAuthError("linkedin", {
          status: response.status,
          body: errorBody,
        });
      }

      const data = (await response.json()) as {
        access_token: string;
        expires_in: number;
        refresh_token?: string;
        refresh_token_expires_in?: number;
        scope?: string;
        error?: string;
        error_description?: string;
      };

      if (data.error || !data.access_token) {
        throw createOAuthError("linkedin", {
          error: data.error,
          description: data.error_description,
        });
      }

      const tokens: OAuthTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: calculateTokenExpiry(data.expires_in),
        scope: data.scope,
      };

      // Fetch user profile
      const profile = await this.fetchProfile(tokens.accessToken);

      return {
        success: true,
        tokens,
        profile,
      };
    } catch (error) {
      const socialError = toSocialError(error, "linkedin");
      return {
        success: false,
        error: socialError.message,
      };
    }
  }

  /**
   * Refresh expired access token
   */
  async refreshToken(refreshToken: string): Promise<OAuthTokens> {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await fetch(this.config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw parseProviderError("linkedin", response.status, errorBody);
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
      refresh_token?: string;
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: calculateTokenExpiry(data.expires_in),
    };
  }

  /**
   * Fetch user profile from LinkedIn API
   */
  async fetchProfile(accessToken: string): Promise<SocialUserProfile> {
    // LinkedIn v2 API uses /userinfo endpoint for OpenID Connect
    const userInfo = await this.apiRequest<{
      sub: string;
      name: string;
      given_name: string;
      family_name: string;
      picture?: string;
      email?: string;
      email_verified?: boolean;
      locale?: { country: string; language: string };
    }>("/userinfo", accessToken, "https://api.linkedin.com");

    // Note: LinkedIn doesn't expose vanity URL via API anymore, so username is omitted
    return {
      provider: "linkedin",
      providerId: userInfo.sub,
      displayName: userInfo.name,
      email: userInfo.email,
      avatarUrl: userInfo.picture,
      profileUrl: `https://www.linkedin.com/in/me`, // Generic profile link
      rawData: userInfo as unknown as Record<string, unknown>,
    };
  }

  /**
   * Revoke LinkedIn access token
   */
  async revokeToken(accessToken: string): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        token: accessToken,
      });

      const response = await fetch("https://www.linkedin.com/oauth/v2/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Validate token by making a simple API request
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.fetchProfile(accessToken);
      return true;
    } catch {
      return false;
    }
  }

  // ===========================================================================
  // LINKEDIN-SPECIFIC DATA FETCHING
  // ===========================================================================

  /**
   * Fetch user's email address (requires r_emailaddress scope)
   * Note: This is a separate API call in LinkedIn v2
   */
  async fetchEmail(accessToken: string): Promise<string | null> {
    try {
      const response = await this.apiRequest<LinkedInEmail>(
        "/emailAddress?q=members&projection=(elements*(handle~))",
        accessToken
      );

      const email = response.elements?.[0]?.["handle~"]?.emailAddress;
      return email || null;
    } catch {
      return null;
    }
  }

  /**
   * Note: LinkedIn's Jobs API is very restricted.
   * Most job-related features require Marketing API access or partner status.
   * This is a placeholder for future implementation if API access is granted.
   */
  async fetchSavedJobs(_accessToken: string): Promise<never[]> {
    // LinkedIn doesn't provide public API access to saved jobs
    // This would require special API access from LinkedIn
    console.warn(
      "[LinkedIn] Saved jobs API not available. Requires LinkedIn partner access."
    );
    return [];
  }

  // ===========================================================================
  // PRIVATE HELPERS
  // ===========================================================================

  /**
   * Make authenticated API request to LinkedIn
   */
  private async apiRequest<T>(
    endpoint: string,
    accessToken: string,
    baseUrl: string = this.config.apiUrl
  ): Promise<T> {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw parseProviderError("linkedin", response.status, body);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof Error && error.name === "SocialIntegrationError") {
        throw error;
      }
      throw createNetworkError("linkedin", error instanceof Error ? error : undefined);
    }
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const linkedInProvider = new LinkedInProvider();
