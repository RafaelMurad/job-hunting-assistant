/**
 * tRPC Server Initialization
 *
 * This file sets up the core tRPC infrastructure:
 * - Context creation (database, session, etc.)
 * - Base router and procedure definitions
 *
 * WHY tRPC?
 * - End-to-end type safety between client and server
 * - No code generation needed (unlike GraphQL)
 * - Automatic input validation with Zod
 * - Great DX with autocomplete
 *
 * Authentication is required in BOTH local and demo modes.
 * The only difference is where data is stored (IndexedDB vs PostgreSQL).
 */

import { getNeonSession } from "@/lib/auth/neon-server";
import { prisma } from "@/lib/db";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import {
  aiRateLimitMiddleware,
  rateLimitMiddleware,
  uploadRateLimitMiddleware,
} from "./middleware/rate-limit";

/**
 * Session type for Neon Auth
 * Maps Neon Auth session to our app's user structure
 */
export interface NeonAuthSession {
  user: {
    id: string;
    email: string;
    name?: string | null | undefined;
    image?: string | null | undefined;
    role?: string;
    isTrusted?: boolean;
  };
}

/**
 * Context passed to every tRPC procedure.
 * Contains database client and auth session.
 */
export const createTRPCContext = async (): Promise<{
  prisma: typeof prisma;
  session: NeonAuthSession | null;
}> => {
  // Use Neon Auth session for both local and demo modes
  const neonSession = await getNeonSession();

  // Map Neon Auth session to our app's session structure
  // Neon Auth returns { data: { user: ... }, error: ... }
  let session: NeonAuthSession | null = null;
  const neonUser = neonSession?.data?.user;

  if (neonUser) {
    // Try to find linked app user to get role/trust status
    const appUser = await prisma.user.findUnique({
      where: { neonAuthId: neonUser.id },
      select: { id: true, role: true, isTrusted: true },
    });

    session = {
      user: {
        id: appUser?.id ?? neonUser.id,
        email: neonUser.email,
        name: neonUser.name,
        image: neonUser.image,
        role: appUser?.role ?? "USER",
        isTrusted: appUser?.isTrusted ?? false,
      },
    };
  }

  return {
    prisma,
    session,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC with context type and superjson transformer.
 * superjson allows sending Dates, Maps, Sets, etc. over the wire.
 */
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

/**
 * Export reusable router and procedure helpers.
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export { t };

/**
 * Middleware to enforce authentication.
 * Throws UNAUTHORIZED if no session exists.
 */
const enforceAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to access this resource",
    });
  }
  return next({
    ctx: {
      ...ctx,
      // TypeScript now knows session is not null
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

/**
 * Protected procedure - requires authentication.
 * Use this for endpoints that need a logged-in user.
 */
export const protectedProcedure = t.procedure.use(enforceAuth);

/**
 * Middleware to enforce admin role.
 * Must be used after enforceAuth.
 */
const enforceAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to access this resource",
    });
  }

  if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "OWNER") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must be an admin to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

/**
 * Admin procedure - requires admin role.
 * Use this for admin-only endpoints.
 */
export const adminProcedure = t.procedure.use(enforceAdmin);

/**
 * Middleware to enforce owner role.
 * Only OWNER can access these endpoints.
 */
const enforceOwner = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to access this resource",
    });
  }

  if (ctx.session.user.role !== "OWNER") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only the owner can access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

/**
 * Owner procedure - requires owner role.
 * Use this for owner-only endpoints (e.g., managing trusted users).
 */
export const ownerProcedure = t.procedure.use(enforceOwner);

/**
 * Rate-limited protected procedure.
 * Use for general protected endpoints with rate limiting.
 */
export const rateLimitedProcedure = protectedProcedure.use(t.middleware(rateLimitMiddleware));

/**
 * AI rate-limited procedure.
 * Use for expensive AI operations (analysis, generation, etc.)
 */
export const aiProcedure = protectedProcedure.use(t.middleware(aiRateLimitMiddleware));

/**
 * Upload rate-limited procedure.
 * Use for file upload endpoints.
 */
export const uploadProcedure = protectedProcedure.use(t.middleware(uploadRateLimitMiddleware));
