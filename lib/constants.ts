export const ARCTIC_SHIFT_BASE_URL =
  "https://arctic-shift.photon-reddit.com/api";

export const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export const TIER_LIMITS = {
  free: { briefs: 2, subreddits: 3 },
  starter: { briefs: 10, subreddits: 10 },
  pro: { briefs: -1, subreddits: 50 }, // -1 = unlimited
} as const;

export const RATE_LIMITS = {
  discovery: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10/hr
  brief: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5/hr
  general: { maxRequests: 60, windowMs: 60 * 1000 }, // 60/min
} as const;
