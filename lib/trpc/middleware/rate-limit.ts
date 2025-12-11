/**
 * tRPC Rate Limiting Middleware
 *
 * Protects API endpoints from abuse and DoS attacks.
 */

import { TRPCError } from "@trpc/server";
import type { TRPCContext } from "../init";
import { rateLimiters, getRateLimitIdentifier } from "@/lib/rate-limit";

/**
 * General API rate limiting middleware
 *
 * Applies to all non-expensive operations.
 */
export const rateLimitMiddleware = async ({ ctx, next }: { ctx: TRPCContext; next: any }) => {
  const identifier = getRateLimitIdentifier(ctx.session?.user?.id);

  const result = await rateLimiters.general.limit(identifier);

  if (!result.success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Please try again in ${Math.ceil((result.reset - Date.now()) / 1000)} seconds.`,
    });
  }

  return next({
    ctx: {
      ...ctx,
      rateLimit: result,
    },
  });
});

/**
 * AI operations rate limiting middleware
 *
 * Stricter limits for expensive AI API calls.
 */
export const aiRateLimitMiddleware = async ({ ctx, next }: { ctx: TRPCContext; next: any }) => {
  const identifier = getRateLimitIdentifier(ctx.session?.user?.id);

  const result = await rateLimiters.ai.limit(identifier);

  if (!result.success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `AI rate limit exceeded. You can make ${result.limit} requests per minute. Please try again in ${Math.ceil((result.reset - Date.now()) / 1000)} seconds.`,
    });
  }

  return next({
    ctx: {
      ...ctx,
      rateLimit: result,
    },
  });
});

/**
 * File upload rate limiting middleware
 *
 * Limits file uploads to prevent storage abuse.
 */
export const uploadRateLimitMiddleware = async ({ ctx, next }: { ctx: TRPCContext; next: any }) => {
  const identifier = getRateLimitIdentifier(ctx.session?.user?.id);

  const result = await rateLimiters.upload.limit(identifier);

  if (!result.success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Upload rate limit exceeded. You can upload ${result.limit} files per minute. Please try again in ${Math.ceil((result.reset - Date.now()) / 1000)} seconds.`,
    });
  }

  return next({
    ctx: {
      ...ctx,
      rateLimit: result,
    },
  });
});
