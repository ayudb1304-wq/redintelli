interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

class RateLimiter {
  private requests = new Map<string, number[]>();

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing timestamps and filter to current window
    const timestamps = (this.requests.get(key) ?? []).filter(
      (t) => t > windowStart
    );

    if (timestamps.length >= this.maxRequests) {
      const oldest = timestamps[0];
      return {
        success: false,
        remaining: 0,
        resetAt: oldest + this.windowMs,
      };
    }

    timestamps.push(now);
    this.requests.set(key, timestamps);

    return {
      success: true,
      remaining: this.maxRequests - timestamps.length,
      resetAt: now + this.windowMs,
    };
  }
}

export function createRateLimiter(
  maxRequests: number,
  windowMs: number
): RateLimiter {
  return new RateLimiter(maxRequests, windowMs);
}
