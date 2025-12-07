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

import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { prisma } from "@/lib/db";

/**
 * Context passed to every tRPC procedure.
 * Contains database client and will later include auth session.
 */
export const createTRPCContext = async (): Promise<{ prisma: typeof prisma }> => {
  return {
    prisma,
    // FUTURE: Add auth session here
    // session: await getServerSession(authOptions),
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

// FUTURE: Add protected procedure with auth middleware
// export const protectedProcedure = t.procedure.use(isAuthed);
