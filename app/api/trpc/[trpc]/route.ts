/**
 * tRPC API Route Handler
 *
 * This file creates the HTTP endpoint for tRPC at /api/trpc/[...trpc].
 * All tRPC procedures are accessible through this single endpoint.
 */

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/lib/trpc/router";
import { createTRPCContext } from "@/lib/trpc/init";

const MAX_TRPC_POST_CONTENT_LENGTH_BYTES = 1_000_000;

function parseContentLength(headerValue: string | null): number | null {
  if (!headerValue) return null;
  const parsed = Number.parseInt(headerValue, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/**
 * Handle tRPC requests.
 * Works with Next.js App Router (fetch-based API routes).
 */
const handler = (req: Request): Promise<Response> => {
  if (req.method.toUpperCase() === "POST") {
    const contentLength = parseContentLength(req.headers.get("content-length"));
    if (contentLength !== null && contentLength > MAX_TRPC_POST_CONTENT_LENGTH_BYTES) {
      return Promise.resolve(new Response("Payload Too Large", { status: 413 }));
    }

    const contentType = req.headers.get("content-type");
    if (contentType && !contentType.toLowerCase().startsWith("application/json")) {
      return Promise.resolve(new Response("Unsupported Media Type", { status: 415 }));
    }
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });
};

export { handler as GET, handler as POST };
