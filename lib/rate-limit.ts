/**
 * Rate Limiting
 *
 * In-memory rate limiter for API protection. For production with multiple
 * instances, upgrade to Upstash Redis or Vercel KV.
 *
 * @see https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 * @see https://vercel.com/docs/storage/vercel-kv
 */

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  window: number;
}

/**
 * In-Memory Rate Limiter
 *
 * Simple sliding window rate limiter using in-memory Map.
 * Works for single-instance deployments.
 *
 * IMPORTANT: For production with multiple Vercel serverless functions,
 * upgrade to Upstash Redis or Vercel KV for distributed rate limiting.
 */
class InMemoryRateLimiter {
  private requests: Map<
    string,
    Array<{ timestamp: number }>
  > = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;

    // Clean up old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.config.window;

    // Get or create request history for this identifier
    let userRequests = this.requests.get(identifier) || [];

    // Remove requests outside the current window
    userRequests = userRequests.filter((req) => req.timestamp > windowStart);

    // Check if limit exceeded
    const success = userRequests.length < this.config.limit;

    if (success) {
      // Add new request
      userRequests.push({ timestamp: now });
      this.requests.set(identifier, userRequests);
    }

    const remaining = Math.max(0, this.config.limit - userRequests.length);
    const reset = windowStart + this.config.window;

    return {
      success,
      limit: this.config.limit,
      remaining,
      reset,
    };
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  private cleanup() {
    const now = Date.now();
    const threshold = now - this.config.window * 2;

    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter((req) => req.timestamp > threshold);

      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

/**
 * Rate limit configurations for different endpoint types
 */
const rateLimitConfigs = {
  /** AI operations (analysis, cover letter generation) */
  ai: {
    limit: 10,
    window: 60 * 1000, // 10 requests per minute
  },
  /** File uploads */
  upload: {
    limit: 5,
    window: 60 * 1000, // 5 uploads per minute
  },
  /** General API calls */
  general: {
    limit: 100,
    window: 60 * 1000, // 100 requests per minute
  },
  /** Authentication attempts */
  auth: {
    limit: 5,
    window: 15 * 60 * 1000, // 5 attempts per 15 minutes
  },
} as const;

/**
 * Rate limiters for different endpoint types
 */
export const rateLimiters = {
  ai: new InMemoryRateLimiter(rateLimitConfigs.ai),
  upload: new InMemoryRateLimiter(rateLimitConfigs.upload),
  general: new InMemoryRateLimiter(rateLimitConfigs.general),
  auth: new InMemoryRateLimiter(rateLimitConfigs.auth),
};

/**
 * Helper to get rate limit identifier from user session
 */
export function getRateLimitIdentifier(userId?: string, ip?: string): string {
  // Prefer user ID for authenticated requests
  if (userId) {
    return `user:${userId}`;
  }

  // Fallback to IP address for unauthenticated requests
  if (ip) {
    return `ip:${ip}`;
  }

  // Last resort: use a generic identifier (not recommended for production)
  return "anonymous";
}

/**
 * Migration path to Upstash Redis or Vercel KV
 *
 * To upgrade:
 * 1. Install dependencies:
 *    npm install @upstash/ratelimit @upstash/redis
 *    OR
 *    npm install @vercel/kv
 *
 * 2. Set environment variables:
 *    UPSTASH_REDIS_REST_URL=xxx
 *    UPSTASH_REDIS_REST_TOKEN=xxx
 *    OR
 *    KV_REST_API_URL=xxx
 *    KV_REST_API_TOKEN=xxx
 *
 * 3. Replace InMemoryRateLimiter with:
 *
 * ```typescript
 * import { Ratelimit } from "@upstash/ratelimit";
 * import { Redis } from "@upstash/redis";
 *
 * const redis = Redis.fromEnv();
 *
 * export const rateLimiters = {
 *   ai: new Ratelimit({
 *     redis,
 *     limiter: Ratelimit.slidingWindow(10, "60 s"),
 *     analytics: true,
 *   }),
 *   // ... other limiters
 * };
 * ```
 */
