/**
 * Next.js Proxy for Route Protection (Next.js 16+)
 *
 * Uses Neon Auth's built-in middleware for session validation.
 * Redirects unauthenticated users to sign-in page.
 *
 * Authentication is required in BOTH local and demo modes.
 * The only difference is where data is stored (IndexedDB vs PostgreSQL).
 *
 * @see https://neon.com/docs/auth/quick-start/nextjs
 */

import { neonAuthMiddleware } from "@neondatabase/auth/next/server";
import { type NextRequest, type NextResponse } from "next/server";

/**
 * Middleware handler that uses Neon Auth to protect routes.
 * Requires authentication in both local and demo modes.
 */
export default async function middleware(request: NextRequest): Promise<NextResponse> {
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
