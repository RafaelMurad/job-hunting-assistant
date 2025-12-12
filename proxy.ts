/**
 * Next.js Proxy for Route Protection (Next.js 16+)
 *
 * Protects sensitive routes and redirects unauthenticated users to login.
 * Uses getToken() from next-auth/jwt for edge-compatible auth checks.
 *
 * NOTE: We use getToken() instead of auth() to avoid importing Prisma,
 * which would exceed Vercel's Edge Function size limit (1 MB).
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 * @see https://authjs.dev/getting-started/session-management/protecting#nextjs-middleware
 */

import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Protected route patterns
 *
 * Routes matching these patterns require authentication.
 * Unauthenticated users are redirected to /login.
 */
const protectedRoutes = [
  "/admin",
  "/admin/:path*",
  "/settings",
  "/tracker",
  "/dashboard",
  "/profile",
  "/analyze",
  "/cv",
];

/**
 * Public routes that should be accessible without auth
 */
const publicRoutes = ["/", "/login", "/api/auth"];

export default async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // Get JWT token (edge-compatible, doesn't require Prisma)
  // Note: AUTH_SECRET is required for production
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? "",
  });

  const isAuthenticated = !!token;

  // Allow public routes
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === "/") return pathname === "/";
    if (route === "/api/auth") return pathname === "/api/auth" || pathname.startsWith("/api/auth/");
    return pathname === route;
  });

  if (isPublicRoute) {
    // If user is logged in and trying to access login page, redirect to dashboard
    if (pathname === "/login" && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => {
    // Handle wildcard patterns like /admin/:path*
    if (route.includes(":path*")) {
      const baseRoute = route.replace("/:path*", "");
      return pathname === baseRoute || pathname.startsWith(baseRoute + "/");
    }
    return pathname === route;
  });

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin routes for admin role
  if (pathname.startsWith("/admin")) {
    const userRole = token?.role as string | undefined;
    const isTrusted = token?.isTrusted as boolean | undefined;

    const hasAdminAccess = userRole === "ADMIN" || userRole === "OWNER" || isTrusted === true;

    if (!hasAdminAccess) {
      // Redirect non-admins to dashboard with error
      return NextResponse.redirect(new URL("/dashboard?error=unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

/**
 * Middleware configuration
 *
 * Match all routes except:
 * - API routes (handled by tRPC)
 * - Static files
 * - Next.js internals
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
