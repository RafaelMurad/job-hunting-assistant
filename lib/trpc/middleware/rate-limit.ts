/**
 * tRPC Rate Limiting Middleware
 *
 * Protects endpoints from abuse and basic DoS attempts.
 * Uses Redis in demo mode, in-memory otherwise.
 */

import { getRateLimitIdentifier, type RateLimitResult } from "@/lib/rate-limit";
import { limitAI, limitGeneral, limitUpload } from "@/lib/rate-limit-redis";
import { TRPCError, type AnyMiddlewareFunction } from "@trpc/server";
import type { TRPCContext } from "../init";

type AnyMiddlewareOpts = Parameters<AnyMiddlewareFunction>[0];
type RateLimitedContext = TRPCContext & { rateLimit: RateLimitResult };

export const rateLimitMiddleware: AnyMiddlewareFunction = async ({
  ctx,
  next,
}: AnyMiddlewareOpts & { ctx: TRPCContext }) => {
  const identifier = getRateLimitIdentifier(ctx.session?.user?.id);
  const result = await limitGeneral(identifier);

  if (!result.success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Please try again in ${Math.ceil((result.reset - Date.now()) / 1000)} seconds.`,
    });
  }

  const nextCtx: RateLimitedContext = {
    ...ctx,
    rateLimit: result,
  };

  return next({ ctx: nextCtx });
};

export const aiRateLimitMiddleware: AnyMiddlewareFunction = async ({
  ctx,
  next,
}: AnyMiddlewareOpts & { ctx: TRPCContext }) => {
  const identifier = getRateLimitIdentifier(ctx.session?.user?.id);
  const result = await limitAI(identifier);

  if (!result.success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `AI rate limit exceeded. You can make ${result.limit} requests per minute. Please try again in ${Math.ceil((result.reset - Date.now()) / 1000)} seconds.`,
    });
  }

  const nextCtx: RateLimitedContext = {
    ...ctx,
    rateLimit: result,
  };

  return next({ ctx: nextCtx });
};

export const uploadRateLimitMiddleware: AnyMiddlewareFunction = async ({
  ctx,
  next,
}: AnyMiddlewareOpts & { ctx: TRPCContext }) => {
  const identifier = getRateLimitIdentifier(ctx.session?.user?.id);
  const result = await limitUpload(identifier);

  if (!result.success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Upload rate limit exceeded. You can upload ${result.limit} files per minute. Please try again in ${Math.ceil((result.reset - Date.now()) / 1000)} seconds.`,
    });
  }

  const nextCtx: RateLimitedContext = {
    ...ctx,
    rateLimit: result,
  };

  return next({ ctx: nextCtx });
};
