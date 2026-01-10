/**
 * Next.js Proxy for Route Protection (Next.js 16+)
 *
 * Uses Neon Auth's built-in middleware for session validation.
 * Redirects unauthenticated users to sign-in page.
 *
 * @see https://neon.com/docs/auth/quick-start/nextjs
 */

import { neonAuthMiddleware } from "@neondatabase/auth/next/server";

export default neonAuthMiddleware({
  // Redirects unauthenticated users to sign-in page
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: [
    // Protected routes requiring authentication
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
