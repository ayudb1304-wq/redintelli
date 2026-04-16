export type SubscriptionTier = "free" | "starter" | "pro";
export type SubscriptionStatus = "active" | "canceled" | "past_due";
export type BriefStatus = "pending" | "generating" | "completed" | "failed";
export type PromoTolerance = "none" | "low" | "medium" | "high";
export type AudienceOverlap = "high" | "medium" | "low";
export type Sentiment = "positive" | "mixed" | "negative" | "neutral";
export type EnforcementLevel = "strict" | "moderate" | "light";
export type IntentLabel =
  | "no_intent"
  | "problem_aware"
  | "solution_seeking"
  | "comparing"
  | "purchase_ready";

// --- Profiles ---

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  dodo_customer_id: string | null;
  dodo_subscription_id: string | null;
  subscription_current_period_end: string | null;
  briefs_generated_this_month: number;
  briefs_limit: number;
  tracked_subreddits_count: number;
  tracked_subreddits_limit: number;
  created_at: string;
  updated_at: string;
  last_brief_generated_at: string | null;
  usage_reset_at: string;
}

// --- Subreddits ---

export interface Subreddit {
  id: string;
  display_name: string;
  title: string | null;
  description: string | null;
  public_description: string | null;
  subscribers: number | null;
  active_users: number | null;
  created_utc: string | null;
  posts_per_day: number | null;
  avg_comments_per_post: number | null;
  promo_tolerance: PromoTolerance | null;
  categories: string[] | null;
  related_subreddits: string[] | null;
  rules: Record<string, unknown> | null;
  last_synced_at: string;
  created_at: string;
}

// --- Audience Briefs ---

export interface BriefPainPoint {
  title: string;
  intensity: number;
  frequency: string;
  quote: string;
  context?: string;
}

export interface BriefLanguagePattern {
  user_says: string;
  not_say: string;
  context: string;
}

export interface BriefContentStrategy {
  what_works: string[];
  what_fails: string[];
  best_times: {
    days: string[];
    hours: string;
    reasoning?: string;
  };
  ideal_post_format?: string;
}

export interface BriefMentionedProduct {
  name: string;
  mentions: string;
  sentiment: Sentiment;
  context?: string;
}

export interface BriefRulesSummary {
  promo_allowed: boolean;
  key_rules: string[];
  enforcement_level: EnforcementLevel;
  workarounds?: string;
}

export interface BriefContent {
  snapshot: string;
  pain_points: BriefPainPoint[];
  language_patterns: BriefLanguagePattern[];
  content_strategy: BriefContentStrategy;
  mentioned_products: BriefMentionedProduct[];
  rules_summary: BriefRulesSummary;
  next_steps: string[];
  metadata: {
    posts_analyzed: number;
    comments_analyzed: number;
    date_range: string;
  };
}

export interface AudienceBrief {
  id: string;
  user_id: string;
  subreddit_id: string;
  content: BriefContent;
  model_version: string;
  tokens_used: number | null;
  generation_time_ms: number | null;
  status: BriefStatus;
  error_message: string | null;
  is_cached: boolean;
  cache_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// --- Discovery Sessions ---

export interface DiscoveredSubredditResult {
  subreddit_id: string;
  relevance_score: number;
  reasoning: string;
  audience_overlap: AudienceOverlap;
  promo_friendly: boolean;
  best_angle: string;
}

export interface DiscoverySession {
  id: string;
  user_id: string;
  product_description: string;
  target_audience: string | null;
  discovered_subreddits: DiscoveredSubredditResult[];
  model_version: string | null;
  tokens_used: number | null;
  created_at: string;
}

// --- Tracked Subreddits ---

export interface TrackedSubreddit {
  id: string;
  user_id: string;
  subreddit_id: string;
  keywords: string[] | null;
  include_comments: boolean;
  min_intent_score: number;
  notify_email: boolean;
  notify_digest: boolean;
  is_active: boolean;
  last_checked_at: string | null;
  last_post_id: string | null;
  created_at: string;
  updated_at: string;
}

// --- Matched Posts ---

export interface MatchedPost {
  id: string;
  user_id: string;
  tracked_subreddit_id: string;
  post_id: string;
  subreddit_id: string;
  title: string;
  selftext: string | null;
  url: string | null;
  author: string | null;
  score: number | null;
  num_comments: number | null;
  created_utc: string | null;
  permalink: string | null;
  intent_score: number | null;
  intent_label: IntentLabel | null;
  matched_keywords: string[] | null;
  is_read: boolean;
  is_saved: boolean;
  is_dismissed: boolean;
  matched_at: string;
}

// --- Payment Events ---

export interface PaymentEvent {
  id: string;
  user_id: string | null;
  dodo_event_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  processed: boolean;
  processed_at: string | null;
  error_message: string | null;
  created_at: string;
}
