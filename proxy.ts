/**
 * Next.js Proxy for Route Protection (Next.js 16+)
 *
 * Uses Neon Auth's built-in middleware for session validation.
 * Redirects unauthenticated users to sign-in page.
 *
 * In local mode, auth is skipped entirely - users have full access.
 *
 * @see https://neon.com/docs/auth/quick-start/nextjs
 */

import { isLocalMode } from "@/lib/storage/interface";
import { neonAuthMiddleware } from "@neondatabase/auth/next/server";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Middleware handler that:
 * - In local mode: passes through all requests (no auth needed)
 * - In demo mode: uses Neon Auth to protect routes
 */
export default async function middleware(request: NextRequest): Promise<NextResponse> {
  // In local mode, skip auth entirely - all routes are accessible
  if (isLocalMode()) {
    return NextResponse.next();
  }

  // Demo mode: use Neon Auth middleware
  return await neonAuthMiddleware({
    loginUrl: "/auth/sign-in",
  })(request);
}

export const config = {
  matcher: [
    // Protected routes requiring authentication (demo mode only)
    "/dashboard/:path*",
    "/profile/:path*",
    "/analyze/:path*",
    "/cv/:path*",
    "/tracker/:path*",
    "/settings/:path*",
    "/account/:path*",
    "/admin/:path*",
  ],
};
