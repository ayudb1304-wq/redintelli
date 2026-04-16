import { createClient } from "@/lib/supabase/server";
import { generateWithClaude } from "@/lib/claude/client";
import {
  DIGEST_GENERATION_SYSTEM_PROMPT,
  DIGEST_GENERATION_USER_PROMPT,
  type DigestContent,
} from "@/lib/claude/prompts/digest";

export async function generateDailyDigest(
  userId: string
): Promise<DigestContent | null> {
  const supabase = await createClient();

  // Check if user has digest enabled
  const { data: profile } = await supabase
    .from("profiles")
    .select("digest_enabled")
    .eq("id", userId)
    .single();

  if (profile && profile.digest_enabled === false) {
    return null;
  }

  // Get tracked subreddits
  const { data: tracked } = await supabase
    .from("tracked_subreddits")
    .select("subreddit_id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .eq("notify_digest", true);

  if (!tracked || tracked.length === 0) return null;

  const subredditIds = tracked.map((t) => t.subreddit_id);

  // Get matched posts from last 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: posts } = await supabase
    .from("matched_posts")
    .select("*")
    .eq("user_id", userId)
    .in("subreddit_id", subredditIds)
    .gte("matched_at", oneDayAgo)
    .order("intent_score", { ascending: false });

  if (!posts || posts.length === 0) return null;

  // Get product description from most recent discovery
  const { data: session } = await supabase
    .from("discovery_sessions")
    .select("product_description")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const productDescription =
    session?.product_description ?? "General product";

  // Build prompt
  const postsForDigest = posts.slice(0, 30).map((p) => ({
    post_id: p.post_id,
    title: p.title,
    subreddit: p.subreddit_id,
    intent_score: p.intent_score,
    intent_label: p.intent_label,
    permalink: p.permalink,
    matched_keywords: p.matched_keywords,
  }));

  const userPrompt = DIGEST_GENERATION_USER_PROMPT
    .replace("{product_description}", productDescription)
    .replace("{tracked_subreddits}", subredditIds.join(", "))
    .replace("{posts_with_intent_json}", JSON.stringify(postsForDigest));

  const { data: digest } = await generateWithClaude<DigestContent>({
    systemPrompt: DIGEST_GENERATION_SYSTEM_PROMPT,
    userPrompt,
    maxTokens: 2048,
    temperature: 0.7,
  });

  return digest;
}
