/**
 * OAuth Utilities
 *
 * Handles OAuth 2.0 authorization flows.
 *
 * LEARNING EXERCISE: Understand OAuth 2.0 concepts.
 *
 * @see https://oauth.net/2/
 */

export interface OAuthConfig {
  clientId: string;
  authorizationUrl: string;
  tokenUrl: string;
  redirectUri: string;
  scopes: string[];
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  config: OAuthConfig;
}

/**
 * Available integrations
 */
export const INTEGRATIONS: Integration[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Import profile and connections",
    icon: "linkedin",
    connected: false,
    config: {
      clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || "",
      authorizationUrl: "https://www.linkedin.com/oauth/v2/authorization",
      tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/linkedin/callback`,
      scopes: ["r_liteprofile", "r_emailaddress"],
    },
  },
  {
    id: "google",
    name: "Google Calendar",
    description: "Sync interview schedules",
    icon: "google",
    connected: false,
    config: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`,
      scopes: ["calendar.readonly", "calendar.events"],
    },
  },
  {
    id: "github",
    name: "GitHub",
    description: "Showcase your projects",
    icon: "github",
    connected: false,
    config: {
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "",
      authorizationUrl: "https://github.com/login/oauth/authorize",
      tokenUrl: "https://github.com/login/oauth/access_token",
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/github/callback`,
      scopes: ["read:user", "repo"],
    },
  },
];

/**
 * TODO Exercise 1: Implement OAuth Authorization Flow
 *
 * OAuth 2.0 Authorization Code Flow:
 * 1. Redirect user to authorization URL with:
 *    - client_id
 *    - redirect_uri
 *    - response_type=code
 *    - scope
 *    - state (CSRF protection)
 * 2. User authorizes on provider's site
 * 3. Provider redirects to your callback with code
 * 4. Exchange code for access token (server-side)
 * 5. Store token securely
 */
export function buildAuthorizationUrl(integration: Integration): string {
  const { config } = integration;
  const state = generateState();

  // Store state in sessionStorage for CSRF verification
  if (typeof window !== "undefined") {
    sessionStorage.setItem(`oauth_state_${integration.id}`, state);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    state,
  });

  return `${config.authorizationUrl}?${params.toString()}`;
}

/**
 * Generate random state for CSRF protection
 */
export function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify state parameter matches stored state
 */
export function verifyState(integrationId: string, state: string): boolean {
  if (typeof window === "undefined") return false;

  const storedState = sessionStorage.getItem(`oauth_state_${integrationId}`);
  sessionStorage.removeItem(`oauth_state_${integrationId}`);

  return storedState === state;
}
