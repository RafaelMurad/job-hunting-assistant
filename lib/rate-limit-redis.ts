/**
 * Redis-based Rate Limiting (for Demo Mode)
 *
 * Uses Upstash Redis for distributed rate limiting in the demo environment.
 * This ensures rate limits work across serverless function instances.
 *
 * Environment Variables Required:
 * - UPSTASH_REDIS_REST_URL: Upstash Redis REST API URL
 * - UPSTASH_REDIS_REST_TOKEN: Upstash Redis REST API token
 *
 * @module lib/rate-limit-redis
 */

import { isDemoMode } from "@/lib/storage/interface";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { rateLimiters as inMemoryRateLimiters, type RateLimitResult } from "./rate-limit";

// ============================================
// Configuration
// ============================================

/**
 * Rate limit configurations for demo mode
 * More restrictive than local mode to protect shared resources
 */
const DEMO_RATE_LIMITS = {
  // AI operations: 15 requests per minute (shared API keys)
  ai: { requests: 15, window: "1 m" as const },
  // File uploads: 10 per minute
  upload: { requests: 10, window: "1 m" as const },
  // General API: 60 requests per minute
  general: { requests: 60, window: "1 m" as const },
  // Auth attempts: 5 per 15 minutes
  auth: { requests: 5, window: "15 m" as const },
};

// ============================================
// Redis Client
// ============================================

let redis: Redis | null = null;

/**
 * Get or create Redis client
 * Returns null if Redis is not configured
 */
function getRedisClient(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("[rate-limit-redis] Upstash Redis not configured, falling back to in-memory");
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

// ============================================
// Rate Limiters
// ============================================

let aiRateLimiter: Ratelimit | null = null;
let uploadRateLimiter: Ratelimit | null = null;
let generalRateLimiter: Ratelimit | null = null;
let authRateLimiter: Ratelimit | null = null;

/**
 * Get or create AI rate limiter
 */
function getAIRateLimiter(): Ratelimit | null {
  if (aiRateLimiter) return aiRateLimiter;

  const client = getRedisClient();
  if (!client) return null;

  aiRateLimiter = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(DEMO_RATE_LIMITS.ai.requests, DEMO_RATE_LIMITS.ai.window),
    prefix: "careerpal:ratelimit:ai",
    analytics: true,
  });

  return aiRateLimiter;
}

/**
 * Get or create upload rate limiter
 */
function getUploadRateLimiter(): Ratelimit | null {
  if (uploadRateLimiter) return uploadRateLimiter;

  const client = getRedisClient();
  if (!client) return null;

  uploadRateLimiter = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(
      DEMO_RATE_LIMITS.upload.requests,
      DEMO_RATE_LIMITS.upload.window
    ),
    prefix: "careerpal:ratelimit:upload",
    analytics: true,
  });

  return uploadRateLimiter;
}

/**
 * Get or create general rate limiter
 */
function getGeneralRateLimiter(): Ratelimit | null {
  if (generalRateLimiter) return generalRateLimiter;

  const client = getRedisClient();
  if (!client) return null;

  generalRateLimiter = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(
      DEMO_RATE_LIMITS.general.requests,
      DEMO_RATE_LIMITS.general.window
    ),
    prefix: "careerpal:ratelimit:general",
    analytics: true,
  });

  return generalRateLimiter;
}

/**
 * Get or create auth rate limiter
 */
function getAuthRateLimiter(): Ratelimit | null {
  if (authRateLimiter) return authRateLimiter;

  const client = getRedisClient();
  if (!client) return null;

  authRateLimiter = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(DEMO_RATE_LIMITS.auth.requests, DEMO_RATE_LIMITS.auth.window),
    prefix: "careerpal:ratelimit:auth",
    analytics: true,
  });

  return authRateLimiter;
}

// ============================================
// Rate Limit Functions
// ============================================

/**
 * Convert Upstash result to our RateLimitResult format
 */
function toRateLimitResult(result: {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}): RateLimitResult {
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Rate limit an AI operation
 * Uses Redis in demo mode, in-memory otherwise
 */
export async function limitAI(identifier: string): Promise<RateLimitResult> {
  if (!isDemoMode()) {
    return inMemoryRateLimiters.ai.limit(identifier);
  }

  const limiter = getAIRateLimiter();
  if (!limiter) {
    return inMemoryRateLimiters.ai.limit(identifier);
  }

  const result = await limiter.limit(identifier);
  return toRateLimitResult(result);
}

/**
 * Rate limit a file upload
 * Uses Redis in demo mode, in-memory otherwise
 */
export async function limitUpload(identifier: string): Promise<RateLimitResult> {
  if (!isDemoMode()) {
    return inMemoryRateLimiters.upload.limit(identifier);
  }

  const limiter = getUploadRateLimiter();
  if (!limiter) {
    return inMemoryRateLimiters.upload.limit(identifier);
  }

  const result = await limiter.limit(identifier);
  return toRateLimitResult(result);
}

/**
 * Rate limit a general API request
 * Uses Redis in demo mode, in-memory otherwise
 */
export async function limitGeneral(identifier: string): Promise<RateLimitResult> {
  if (!isDemoMode()) {
    return inMemoryRateLimiters.general.limit(identifier);
  }

  const limiter = getGeneralRateLimiter();
  if (!limiter) {
    return inMemoryRateLimiters.general.limit(identifier);
  }

  const result = await limiter.limit(identifier);
  return toRateLimitResult(result);
}

/**
 * Rate limit an auth attempt
 * Uses Redis in demo mode, in-memory otherwise
 */
export async function limitAuth(identifier: string): Promise<RateLimitResult> {
  if (!isDemoMode()) {
    return inMemoryRateLimiters.auth.limit(identifier);
  }

  const limiter = getAuthRateLimiter();
  if (!limiter) {
    return inMemoryRateLimiters.auth.limit(identifier);
  }

  const result = await limiter.limit(identifier);
  return toRateLimitResult(result);
}

// ============================================
// Exports
// ============================================

/**
 * Get rate limit configuration for a type
 */
export function getDemoRateLimitConfig(
  type: keyof typeof DEMO_RATE_LIMITS
): (typeof DEMO_RATE_LIMITS)[typeof type] {
  return DEMO_RATE_LIMITS[type];
}

/**
 * Check if Redis rate limiting is available
 */
export function isRedisRateLimitingAvailable(): boolean {
  return getRedisClient() !== null;
}

/**
 * Get demo rate limits info (for UI display)
 */
export function getDemoRateLimits(): typeof DEMO_RATE_LIMITS {
  return DEMO_RATE_LIMITS;
}
