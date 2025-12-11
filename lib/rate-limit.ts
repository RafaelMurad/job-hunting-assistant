/**
 * Rate Limiting
 *
 * In-memory rate limiter for API protection.
 *
 * NOTE: This is best-effort for single-instance / warm serverless executions.
 * For true distributed rate limiting in production, prefer Upstash Redis or Vercel KV.
 */

type Timestamp = { timestamp: number };

export interface RateLimitResult {
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

class InMemoryRateLimiter {
  private requests = new Map<string, Timestamp[]>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.config.window;

    const previous = this.requests.get(identifier) ?? [];
    const inWindow = previous.filter((req) => req.timestamp > windowStart);

    const success = inWindow.length < this.config.limit;

    if (success) {
      inWindow.push({ timestamp: now });
      this.requests.set(identifier, inWindow);
    } else {
      // Even when blocked, keep pruned history to avoid unbounded growth.
      this.requests.set(identifier, inWindow);
    }

    // Best-effort cleanup for identifiers with no recent activity.
    this.cleanup(now);

    const remaining = Math.max(0, this.config.limit - inWindow.length);
    const reset = windowStart + this.config.window;

    return {
      success,
      limit: this.config.limit,
      remaining,
      reset,
    };
  }

  private cleanup(now: number): void {
    // Retain up to 2 windows for safety; anything older is irrelevant.
    const threshold = now - this.config.window * 2;

    for (const [key, requests] of this.requests.entries()) {
      const valid = requests.filter((req) => req.timestamp > threshold);
      if (valid.length === 0) this.requests.delete(key);
      else this.requests.set(key, valid);
    }
  }
}

const rateLimitConfigs = {
  ai: { limit: 10, window: 60 * 1000 },
  upload: { limit: 5, window: 60 * 1000 },
  general: { limit: 100, window: 60 * 1000 },
  auth: { limit: 5, window: 15 * 60 * 1000 },
} as const;

export const rateLimiters = {
  ai: new InMemoryRateLimiter(rateLimitConfigs.ai),
  upload: new InMemoryRateLimiter(rateLimitConfigs.upload),
  general: new InMemoryRateLimiter(rateLimitConfigs.general),
  auth: new InMemoryRateLimiter(rateLimitConfigs.auth),
};

export function getRateLimitIdentifier(userId?: string, ip?: string): string {
  if (userId) return `user:${userId}`;
  if (ip) return `ip:${ip}`;
  return "anonymous";
}
