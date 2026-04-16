import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseSubredditFeed } from "@/lib/rss/parser";
import { generateWithClaude } from "@/lib/claude/client";
import {
  INTENT_CLASSIFICATION_SYSTEM_PROMPT,
  BATCH_INTENT_CLASSIFICATION_PROMPT,
  type IntentClassification,
} from "@/lib/claude/prompts/intent";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Sign in to check feeds" } },
      { status: 401 }
    );
  }

  // Get user's active tracked subreddits
  const { data: trackedList } = await supabase
    .from("tracked_subreddits")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (!trackedList || trackedList.length === 0) {
    return NextResponse.json({ checked: 0, matched: 0 });
  }

  // Get user's product description from most recent discovery session
  const { data: recentSession } = await supabase
    .from("discovery_sessions")
    .select("product_description")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const productDescription =
    recentSession?.product_description ?? "General product";

  let totalChecked = 0;
  let totalMatched = 0;

  for (const tracked of trackedList) {
    try {
      // Fetch RSS feed
      const feedPosts = await parseSubredditFeed(tracked.subreddit_id);
      totalChecked += feedPosts.length;

      // Filter out already-matched posts
      const existingPostIds = new Set<string>();
      const { data: existing } = await supabase
        .from("matched_posts")
        .select("post_id")
        .eq("user_id", user.id)
        .eq("tracked_subreddit_id", tracked.id);

      if (existing) {
        for (const e of existing) {
          existingPostIds.add(e.post_id);
        }
      }

      const newPosts = feedPosts.filter((p) => !existingPostIds.has(p.id));
      if (newPosts.length === 0) {
        // Update last_checked_at
        await supabase
          .from("tracked_subreddits")
          .update({ last_checked_at: new Date().toISOString() })
          .eq("id", tracked.id);
        continue;
      }

      // Filter by keywords if set
      const keywords = tracked.keywords ?? [];
      const relevantPosts =
        keywords.length > 0
          ? newPosts.filter((p) =>
              keywords.some((kw: string) =>
                p.title.toLowerCase().includes(kw.toLowerCase())
              )
            )
          : newPosts;

      if (relevantPosts.length === 0) {
        await supabase
          .from("tracked_subreddits")
          .update({ last_checked_at: new Date().toISOString() })
          .eq("id", tracked.id);
        continue;
      }

      // Batch classify intent with Claude
      const postsForClassification = relevantPosts.slice(0, 20).map((p) => ({
        post_id: p.id,
        subreddit: tracked.subreddit_id,
        title: p.title,
      }));

      const prompt = BATCH_INTENT_CLASSIFICATION_PROMPT
        .replace("{product_description}", productDescription)
        .replace("{posts_array_json}", JSON.stringify(postsForClassification));

      const { data: classifications } = await generateWithClaude<
        IntentClassification[]
      >({
        systemPrompt: INTENT_CLASSIFICATION_SYSTEM_PROMPT,
        userPrompt: prompt,
        maxTokens: 2048,
        temperature: 0.3,
      });

      // Build a lookup for classifications
      const classificationMap = new Map<string, IntentClassification>();
      for (const c of classifications) {
        classificationMap.set(c.post_id, c);
      }

      // Store matched posts
      const minScore = tracked.min_intent_score ?? 0;
      const postsToInsert = relevantPosts
        .map((p) => {
          const classification = classificationMap.get(p.id);
          const intentScore = classification?.intent_score ?? 0;

          if (intentScore < minScore) return null;

          return {
            user_id: user.id,
            tracked_subreddit_id: tracked.id,
            post_id: p.id,
            subreddit_id: tracked.subreddit_id,
            title: p.title,
            url: p.link,
            permalink: p.link,
            created_utc: p.pubDate
              ? new Date(p.pubDate).toISOString()
              : null,
            intent_score: intentScore,
            intent_label: classification?.intent_label ?? "no_intent",
            matched_keywords: classification?.matched_keywords ?? [],
          };
        })
        .filter(Boolean);

      if (postsToInsert.length > 0) {
        await supabase
          .from("matched_posts")
          .upsert(postsToInsert, { onConflict: "user_id,post_id" });

        totalMatched += postsToInsert.length;
      }

      // Update last_checked_at
      await supabase
        .from("tracked_subreddits")
        .update({
          last_checked_at: new Date().toISOString(),
          last_post_id: feedPosts[0]?.id ?? null,
        })
        .eq("id", tracked.id);
    } catch (error) {
      console.error(
        `Error checking feed for r/${tracked.subreddit_id}:`,
        error
      );
    }
  }

  return NextResponse.json({ checked: totalChecked, matched: totalMatched });
}
