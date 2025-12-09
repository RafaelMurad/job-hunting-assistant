/**
 * LinkedIn OAuth Callback Route
 *
 * GET /api/auth/linkedin/callback
 * Handles the OAuth callback from LinkedIn, exchanges code for tokens,
 * and stores the social profile in the database.
 */

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import {
  linkedInProvider,
  encryptToken,
  getUserFriendlyMessage,
  toSocialError,
} from "@/lib/social";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors from LinkedIn
  if (error) {
    console.error("[LinkedIn Callback] OAuth error:", error, errorDescription);
    return redirectWithError(request, errorDescription || "LinkedIn authorization was denied");
  }

  // Validate required parameters
  if (!code || !state) {
    return redirectWithError(request, "Missing authorization code or state");
  }

  try {
    // Verify state parameter (CSRF protection)
    const cookieStore = await cookies();
    const oauthStateCookie = cookieStore.get("oauth_state");

    if (!oauthStateCookie?.value) {
      return redirectWithError(request, "OAuth session expired. Please try again.");
    }

    const {
      state: storedState,
      userId,
      provider,
    } = JSON.parse(oauthStateCookie.value) as {
      state: string;
      userId: string;
      provider: string;
    };

    if (state !== storedState || provider !== "linkedin") {
      return redirectWithError(request, "Invalid OAuth state. Please try again.");
    }

    // Clear the OAuth state cookie
    cookieStore.delete("oauth_state");

    // Exchange code for tokens
    const result = await linkedInProvider.exchangeCode(code);

    if (!result.success || !result.tokens || !result.profile) {
      return redirectWithError(request, result.error || "Failed to connect to LinkedIn");
    }

    // Encrypt tokens for storage
    const encryptedAccessToken = encryptToken(result.tokens.accessToken);
    const encryptedRefreshToken = result.tokens.refreshToken
      ? encryptToken(result.tokens.refreshToken)
      : null;

    // Store or update social profile in database
    await prisma.socialProfile.upsert({
      where: {
        userId_provider: {
          userId,
          provider: "LINKEDIN",
        },
      },
      create: {
        userId,
        provider: "LINKEDIN",
        providerId: result.profile.providerId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry: result.tokens.expiresAt ?? null,
        scope: result.tokens.scope ?? null,
        username: result.profile.username ?? null,
        displayName: result.profile.displayName ?? null,
        avatarUrl: result.profile.avatarUrl ?? null,
        profileUrl: result.profile.profileUrl ?? null,
        profileData: result.profile.rawData ? JSON.stringify(result.profile.rawData) : null,
        lastSyncAt: new Date(),
        syncStatus: "COMPLETED",
      },
      update: {
        providerId: result.profile.providerId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry: result.tokens.expiresAt ?? null,
        scope: result.tokens.scope ?? null,
        username: result.profile.username ?? null,
        displayName: result.profile.displayName ?? null,
        avatarUrl: result.profile.avatarUrl ?? null,
        profileUrl: result.profile.profileUrl ?? null,
        profileData: result.profile.rawData ? JSON.stringify(result.profile.rawData) : null,
        lastSyncAt: new Date(),
        syncStatus: "COMPLETED",
      },
    });

    // Log the sync event
    await prisma.socialSync.create({
      data: {
        userId,
        provider: "LINKEDIN",
        syncType: "profile",
        status: "COMPLETED",
        startedAt: new Date(),
        completedAt: new Date(),
        itemsFound: 1,
        itemsSynced: 1,
      },
    });

    // Redirect to settings page with success
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/settings?connected=linkedin&success=true`);
  } catch (error) {
    console.error("[LinkedIn Callback] Error:", error);
    const socialError = toSocialError(error, "linkedin");
    return redirectWithError(request, getUserFriendlyMessage(socialError));
  }
}

/**
 * Redirect to settings page with error message
 */
function redirectWithError(_request: NextRequest, message: string): NextResponse {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const encodedMessage = encodeURIComponent(message);
  return NextResponse.redirect(`${baseUrl}/settings?error=${encodedMessage}&provider=linkedin`);
}
