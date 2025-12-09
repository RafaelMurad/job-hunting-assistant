/**
 * Next.js Middleware for Route Protection
 *
 * Protects sensitive routes and redirects unauthenticated users to login.
 * Uses NextAuth.js auth() helper for server-side session validation.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

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

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route))) {
    // If user is logged in and trying to access login page, redirect to dashboard
    if (pathname === "/login" && req.auth) {
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
  if (isProtectedRoute && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin routes for admin role
  if (pathname.startsWith("/admin")) {
    const userRole = req.auth?.user?.role;
    if (userRole !== "ADMIN" && userRole !== "OWNER") {
      // Redirect non-admins to dashboard with error
      return NextResponse.redirect(new URL("/dashboard?error=unauthorized", req.url));
    }
  }

  return NextResponse.next();
});

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
