/**
 * Next.js Proxy for Route Protection (Next.js 16+)
 *
 * Replaces middleware.ts with the new proxy pattern.
 * Performs lightweight, optimistic authentication checks.
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
 * Unauthenticated users are redirected to /login.
 */
const protectedRoutes = [
  "/admin",
  "/settings",
  "/tracker",
  "/dashboard",
  "/profile",
  "/analyze",
  "/cv",
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
const publicRoutes = ["/", "/login", "/api/auth"];

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
    return pathname === route;
  });
}

/**
 * Next.js Proxy function
 *
 * Performs lightweight authentication checks using JWT token from cookie.
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

  // Get JWT token (edge-compatible, optimistic check from cookie only)
  // SECURITY: AUTH_SECRET must be set - empty secret would allow JWT forgery
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    console.error("[Proxy] CRITICAL: AUTH_SECRET environment variable is not set");
    return NextResponse.redirect(new URL("/login?error=configuration", req.url));
  }

  // In production/preview on Vercel, NextAuth uses secure cookie names (e.g. `__Secure-...`).
  // The edge runtime can mis-detect this depending on deployment URL/proto.
  // Force secure cookie parsing in prod to avoid redirect loops to /login.
  const secureCookie = process.env.NODE_ENV === "production";

  const token = await getToken({
    req,
    secret: authSecret,
    secureCookie,
  });

  const isAuthenticated = !!token;

  // Allow public routes
  if (isPublicPath(pathname)) {
    // Redirect authenticated users away from login page
    if (pathname === "/login" && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (isProtectedPath(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Optimistic admin check (full authorization in Server Components)
  if (isAdminPath(pathname) && isAuthenticated) {
    const userRole = token?.role as string | undefined;
    const isTrusted = token?.isTrusted as boolean | undefined;

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
