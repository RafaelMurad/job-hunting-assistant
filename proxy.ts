/**
 * Next.js Proxy for Route Protection (Next.js 16+)
 *
 * Replaces middleware.ts with the new proxy pattern.
 * Performs lightweight, optimistic authentication checks.
 *
 * Supports DUAL AUTH:
 * - NextAuth (legacy) via JWT cookie
 * - Neon Auth (new) via session cookie
 *
 * IMPORTANT: In Next.js 16+, proxy is the recommended pattern for:
 * - Route protection (redirect unauthenticated users)
 * - Request/response header manipulation
 * - Rewrites and redirects
 *
 * Full authorization checks should happen in Server Components or Server Actions,
 * closer to where the data is accessed (Data Access Layer pattern).
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 * @see https://nextjs.org/docs/app/guides/authentication
 */

import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const MAX_RSC_REQUEST_CONTENT_LENGTH_BYTES = 1_024;

function parseContentLength(headerValue: string | null): number | null {
  if (!headerValue) return null;
  const parsed = Number.parseInt(headerValue, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function isRscRequest(req: NextRequest): boolean {
  // App Router RSC requests commonly include the `_rsc` query param.
  return req.nextUrl.searchParams.has("_rsc");
}

function isServerActionRequest(req: NextRequest): boolean {
  // Next.js uses `Next-Action` to identify Server Actions requests.
  return req.headers.has("next-action") || req.headers.has("Next-Action");
}

/**
 * Protected route patterns
 *
 * Routes matching these patterns require authentication.
 * Unauthenticated users are redirected to /login (or /auth/sign-in for Neon).
 */
const protectedRoutes = [
  "/admin",
  "/settings",
  "/tracker",
  "/dashboard",
  "/profile",
  "/analyze",
  "/cv",
  "/account", // Neon Auth account pages
];

/**
 * Admin-only routes
 *
 * Routes requiring elevated permissions.
 */
const adminRoutes = ["/admin"];

/**
 * Public routes that should be accessible without auth
 */
const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/api/auth",
  "/api/neon-auth",
  "/auth", // Neon Auth pages (sign-in, sign-up, etc.)
];

/**
 * Check if a pathname matches a protected route pattern
 */
function isProtectedPath(pathname: string): boolean {
  return protectedRoutes.some((route) => {
    return pathname === route || pathname.startsWith(route + "/");
  });
}

/**
 * Check if a pathname is an admin route
 */
function isAdminPath(pathname: string): boolean {
  return adminRoutes.some((route) => {
    return pathname === route || pathname.startsWith(route + "/");
  });
}

/**
 * Check if a pathname is a public route
 */
function isPublicPath(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (route === "/") return pathname === "/";
    if (route === "/api/auth") return pathname === "/api/auth" || pathname.startsWith("/api/auth/");
    if (route === "/api/neon-auth")
      return pathname === "/api/neon-auth" || pathname.startsWith("/api/neon-auth/");
    if (route === "/auth") return pathname === "/auth" || pathname.startsWith("/auth/");
    return pathname === route;
  });
}

/**
 * Check if user is authenticated via Neon Auth
 * Neon Auth uses a session cookie - we check if it exists
 */
function hasNeonAuthSession(req: NextRequest): boolean {
  // Neon Auth typically uses 'better-auth.session_token' cookie
  const sessionCookie =
    req.cookies.get("better-auth.session_token") ?? req.cookies.get("neon_auth_session");
  return !!sessionCookie?.value;
}

/**
 * Next.js Proxy function
 *
 * Performs lightweight authentication checks using:
 * 1. Neon Auth session cookie (new)
 * 2. NextAuth JWT token (legacy fallback)
 *
 * Heavy authorization logic should be in Server Components/Actions.
 */
export default async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // --- Security guardrails (belt + suspenders) ---
  // These mitigate abuse patterns against RSC/Server Actions transport.
  // Primary fix is upgrading Next.js to patched versions.
  const isApiRoute = pathname === "/api" || pathname.startsWith("/api/");
  const method = req.method.toUpperCase();
  const contentLength = parseContentLength(req.headers.get("content-length"));

  // Server Actions are not used in this repo; block action-shaped requests.
  if (!isApiRoute && isServerActionRequest(req)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Pages/RSC endpoints should not receive state-changing HTTP methods.
  if (!isApiRoute && method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  // RSC fetches should be GET/HEAD with no body; reject abnormal payloads early.
  if (!isApiRoute && isRscRequest(req)) {
    if (method !== "GET" && method !== "HEAD") {
      return new NextResponse("Method Not Allowed", { status: 405 });
    }

    if (contentLength !== null && contentLength > MAX_RSC_REQUEST_CONTENT_LENGTH_BYTES) {
      return new NextResponse("Payload Too Large", { status: 413 });
    }

    const contentType = req.headers.get("content-type");
    if (contentType) {
      return new NextResponse("Bad Request", { status: 400 });
    }
  }

  // --- DUAL AUTH CHECK ---
  // Check Neon Auth first (new system), then fall back to NextAuth (legacy)
  let isAuthenticated = false;
  let token: { role?: string; isTrusted?: boolean } | null = null;

  // 1. Check Neon Auth session
  if (hasNeonAuthSession(req)) {
    isAuthenticated = true;
    // Note: For role/trust checks, we'd need to fetch from Neon Auth API
    // For now, assume authenticated Neon users have basic access
    token = { role: "USER", isTrusted: false };
  }

  // 2. Fall back to NextAuth JWT
  if (!isAuthenticated) {
    const authSecret = process.env.AUTH_SECRET;
    if (authSecret) {
      const secureCookie = process.env.NODE_ENV === "production";
      const nextAuthToken = await getToken({
        req,
        secret: authSecret,
        secureCookie,
      });
      if (nextAuthToken) {
        isAuthenticated = true;
        token = {
          role: (nextAuthToken.role as string) ?? undefined,
          isTrusted: (nextAuthToken.isTrusted as boolean) ?? undefined,
        };
      }
    }
  }

  // Allow public routes
  if (isPublicPath(pathname)) {
    // Redirect authenticated users away from login/auth pages
    if ((pathname === "/login" || pathname.startsWith("/auth/sign-")) && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  // Use /auth/sign-in for Neon Auth as primary, with /login as callback param for legacy
  if (isProtectedPath(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/auth/sign-in", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Optimistic admin check (full authorization in Server Components)
  if (isAdminPath(pathname) && isAuthenticated && token) {
    const userRole = token.role;
    const isTrusted = token.isTrusted;

    const hasAdminAccess = userRole === "ADMIN" || userRole === "OWNER" || isTrusted === true;

    if (!hasAdminAccess) {
      return NextResponse.redirect(new URL("/dashboard?error=unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

/**
 * Proxy configuration
 *
 * Match all routes except:
 * - Static files
 * - Next.js internals
 * - API routes (handled by tRPC/route handlers)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - API routes (start with /api, handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/).*)",
  ],
};
