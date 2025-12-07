/**
 * tRPC API Route Handler
 *
 * This file creates the HTTP endpoint for tRPC at /api/trpc/[...trpc].
 * All tRPC procedures are accessible through this single endpoint.
 */

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/lib/trpc/router";
import { createTRPCContext } from "@/lib/trpc/init";

/**
 * Handle tRPC requests.
 * Works with Next.js App Router (fetch-based API routes).
 */
const handler = (req: Request): Promise<Response> =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
