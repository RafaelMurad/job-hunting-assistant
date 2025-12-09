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
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

/**
 * Context passed to every tRPC procedure.
 * Contains database client and auth session.
 */
export const createTRPCContext = async (): Promise<{
  prisma: typeof prisma;
  session: Session | null;
}> => {
  const session = await auth();
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
