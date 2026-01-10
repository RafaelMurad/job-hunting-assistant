/**
 * API Route Guards & Response Utilities
 *
 * Provides reusable authentication guards and standardized response helpers
 * for Next.js API routes following the Data Access Layer (DAL) pattern.
 *
 * In Next.js 16+, authentication checks should happen close to where data
 * is accessed (Server Components, Server Actions, Route Handlers), not in
 * the proxy layer. These guards implement that pattern.
 *
 * @see https://nextjs.org/docs/app/guides/authentication
 * @module lib/api/route-guards
 */

import { getNeonSession } from "@/lib/auth/neon-server";
import { logger } from "@/lib/logger";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Session type for Neon Auth compatibility
 */
interface Session {
  user: {
    id: string;
    email: string;
    name?: string | null | undefined;
    image?: string | null | undefined;
  };
}

// =============================================================================
// TYPES
// =============================================================================

/**
 * Authenticated request context passed to route handlers.
 */
export interface AuthenticatedContext {
  session: Session;
  userId: string;
}

/**
 * Handler function for authenticated routes.
 */
export type AuthenticatedHandler<T = unknown> = (
  request: NextRequest,
  context: AuthenticatedContext
) => Promise<NextResponse<T>>;

/**
 * Standard API error response structure.
 */
export interface APIErrorResponse {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

/**
 * Standard API success response structure.
 */
export interface APISuccessResponse<T = unknown> {
  success: true;
  data: T | undefined;
  message: string | undefined;
}

// =============================================================================
// ERROR RESPONSES
// =============================================================================

/**
 * Standard unauthorized response.
 */
export function unauthorized(message = "Unauthorized"): NextResponse<APIErrorResponse> {
  return NextResponse.json({ error: message, code: "UNAUTHORIZED" }, { status: 401 });
}

/**
 * Standard forbidden response.
 */
export function forbidden(message = "Forbidden"): NextResponse<APIErrorResponse> {
  return NextResponse.json({ error: message, code: "FORBIDDEN" }, { status: 403 });
}

/**
 * Standard bad request response.
 */
export function badRequest(
  message: string,
  details?: Record<string, unknown>
): NextResponse<APIErrorResponse> {
  const body: APIErrorResponse = { error: message, code: "BAD_REQUEST" };
  if (details) body.details = details;
  return NextResponse.json(body, { status: 400 });
}

/**
 * Standard not found response.
 */
export function notFound(message = "Not found"): NextResponse<APIErrorResponse> {
  return NextResponse.json({ error: message, code: "NOT_FOUND" }, { status: 404 });
}

/**
 * Standard internal server error response.
 */
export function serverError(
  message = "An unexpected error occurred. Please try again.",
  details?: Record<string, unknown>
): NextResponse<APIErrorResponse> {
  const body: APIErrorResponse = { error: message, code: "INTERNAL_ERROR" };
  if (details) body.details = details;
  return NextResponse.json(body, { status: 500 });
}

/**
 * Standard rate limit exceeded response.
 */
export function rateLimitExceeded(
  message = "Too many requests. Please try again later."
): NextResponse<APIErrorResponse> {
  return NextResponse.json({ error: message, code: "RATE_LIMIT_EXCEEDED" }, { status: 429 });
}

// =============================================================================
// SUCCESS RESPONSES
// =============================================================================

/**
 * Standard success response.
 */
export function success<T>(data?: T, message?: string): NextResponse<APISuccessResponse<T>> {
  return NextResponse.json({ success: true as const, data, message });
}

// =============================================================================
// AUTHENTICATION WRAPPER
// =============================================================================

/**
 * Higher-order function that wraps an API route handler with authentication.
 * Eliminates repetitive auth checks across routes.
 *
 * @example
 * ```ts
 * // Before (repetitive pattern in every route):
 * export async function POST(request: NextRequest) {
 *   const session = await getNeonSession();
 *   if (!session?.user?.id) {
 *     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 *   }
 *   // ... route logic
 * }
 *
 * // After (clean, DRY pattern):
 * export const POST = withAuth(async (request, { userId, session }) => {
 *   // ... route logic (already authenticated)
 * });
 * ```
 */
export function withAuth<T = unknown>(
  handler: AuthenticatedHandler<T>
): (request: NextRequest) => Promise<NextResponse<T | APIErrorResponse>> {
  return async (request: NextRequest) => {
    try {
      const neonSession = await getNeonSession();
      const user = neonSession?.data?.user;

      if (!user?.id) {
        return unauthorized();
      }

      // Create a session object compatible with our app
      const session: Session = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        },
      };

      return await handler(request, {
        session,
        userId: user.id,
      });
    } catch (error) {
      logger.error("API", "Unexpected error in authenticated route", error);
      return serverError();
    }
  };
}

/**
 * Higher-order function that wraps an API route handler with admin-only authentication.
 *
 * @example
 * ```ts
 * export const POST = withAdminAuth(async (request, { userId }) => {
 *   // Only admins can access this
 * });
 * ```
 */
export function withAdminAuth<T = unknown>(
  handler: AuthenticatedHandler<T>
): (request: NextRequest) => Promise<NextResponse<T | APIErrorResponse>> {
  return async (request: NextRequest) => {
    try {
      const neonSession = await getNeonSession();
      const user = neonSession?.data?.user;

      if (!user?.id) {
        return unauthorized();
      }

      // Create a session object compatible with our app
      const session: Session = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        },
      };

      // Note: Admin check deferred to Server Components since
      // role is stored in app's User table, not Neon Auth

      return await handler(request, {
        session,
        userId: user.id,
      });
    } catch (error) {
      logger.error("API", "Unexpected error in admin route", error);
      return serverError();
    }
  };
}

// =============================================================================
// LOGGING UTILITIES
// =============================================================================

/**
 * Consistent log prefix format for API routes.
 * Use this for all console.error/warn calls in API routes.
 *
 * @example
 * console.error(logPrefix("CV Store", "POST"), "Processing error:", error);
 * // Output: [CV Store:POST] Processing error: ...
 */
export function logPrefix(route: string, method?: string): string {
  return method ? `[${route}:${method}]` : `[${route}]`;
}
