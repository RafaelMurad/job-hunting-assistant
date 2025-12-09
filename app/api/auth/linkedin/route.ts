/**
 * LinkedIn OAuth Initiation Route
 *
 * GET /api/auth/linkedin
 * Redirects user to LinkedIn OAuth authorization page.
 */

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { linkedInProvider, isProviderConfigured } from "@/lib/social";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if LinkedIn integration is configured
    if (!isProviderConfigured("linkedin")) {
      return NextResponse.json(
        { error: "LinkedIn integration is not configured" },
        { status: 503 }
      );
    }

    // Get userId from query params (required)
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    // Generate state parameter for CSRF protection
    const state = randomBytes(32).toString("hex");

    // Store state and userId in a secure cookie
    const cookieStore = await cookies();
    cookieStore.set("oauth_state", JSON.stringify({ state, userId, provider: "linkedin" }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    // Generate authorization URL
    const authUrl = linkedInProvider.getAuthorizationUrl(state);

    // Redirect to LinkedIn
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("[LinkedIn OAuth] Error initiating OAuth:", error);
    return NextResponse.json({ error: "Failed to initiate LinkedIn OAuth" }, { status: 500 });
  }
}
