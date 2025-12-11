/**
 * tRPC Rate Limiting Middleware
 *
 * Protects endpoints from abuse and basic DoS attempts.
 */

/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getRateLimitIdentifier, rateLimiters } from "@/lib/rate-limit";
import { TRPCError } from "@trpc/server";
import type { TRPCContext } from "../init";

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
};

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
};

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
};
