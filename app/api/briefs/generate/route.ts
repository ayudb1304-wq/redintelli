import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { arcticShift } from "@/lib/arctic-shift/client";
import { generateWithClaude } from "@/lib/claude/client";
import {
  AUDIENCE_BRIEF_SYSTEM_PROMPT,
  AUDIENCE_BRIEF_USER_PROMPT,
} from "@/lib/claude/prompts/brief";
import { generateBriefRequestSchema } from "@/lib/validations/brief";
import { createRateLimiter } from "@/lib/rate-limit";
import { RATE_LIMITS, CLAUDE_MODEL } from "@/lib/constants";
import type { BriefContent } from "@/types/database";

const rateLimiter = createRateLimiter(
  RATE_LIMITS.brief.maxRequests,
  RATE_LIMITS.brief.windowMs
);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Sign in to generate briefs" } },
      { status: 401 }
    );
  }

  // Rate limit
  const rateCheck = rateLimiter.check(user.id);
  if (!rateCheck.success) {
    return NextResponse.json(
      {
        error: {
          code: "rate_limited",
          message: "Too many requests. Please try again later.",
        },
      },
      { status: 429 }
    );
  }

  // Validate input
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const parsed = generateBriefRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  const { subreddit_id, force_refresh } = parsed.data;

  // Check usage limit
  const { data: profile } = await supabase
    .from("profiles")
    .select("briefs_generated_this_month, briefs_limit")
    .eq("id", user.id)
    .single();

  if (profile && profile.briefs_limit !== -1) {
    if (profile.briefs_generated_this_month >= profile.briefs_limit) {
      return NextResponse.json(
        {
          error: {
            code: "limit_exceeded",
            message:
              "You have reached your monthly brief limit. Upgrade for more briefs.",
            details: {
              used: profile.briefs_generated_this_month,
              limit: profile.briefs_limit,
            },
          },
        },
        { status: 403 }
      );
    }
  }

  // Check cache (unless force_refresh)
  if (!force_refresh) {
    const { data: cached } = await supabase
      .from("audience_briefs")
      .select("*")
      .eq("subreddit_id", subreddit_id)
      .eq("is_cached", true)
      .gt("cache_expires_at", new Date().toISOString())
      .eq("status", "completed")
      .single();

    if (cached) {
      // Increment usage even for cached briefs
      await supabase.rpc("increment_brief_count", { user_uuid: user.id });

      // Save a copy for this user
      const { data: userBrief } = await supabase
        .from("audience_briefs")
        .insert({
          user_id: user.id,
          subreddit_id,
          content: cached.content,
          model_version: cached.model_version,
          tokens_used: 0,
          generation_time_ms: 0,
          status: "completed",
          is_cached: false,
        })
        .select("id")
        .single();

      return NextResponse.json({
        id: userBrief?.id,
        subreddit_id,
        is_cached: true,
        content: cached.content,
        created_at: new Date().toISOString(),
      });
    }
  }

  // Generate new brief
  const startTime = Date.now();

  try {
    // Fetch data from Arctic Shift
    const [posts, comments, metadata] = await Promise.all([
      arcticShift.getSubredditPosts(subreddit_id, { limit: 100 }),
      arcticShift.getSubredditComments(subreddit_id, { limit: 100 }),
      arcticShift.getSubredditMetadata(subreddit_id),
    ]);

    if (posts.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "invalid_subreddit",
            message: `No data found for r/${subreddit_id}. The subreddit may not exist or have no posts.`,
          },
        },
        { status: 400 }
      );
    }

    // Build prompt
    const postsForPrompt = posts.slice(0, 100).map((p) => ({
      title: p.title,
      selftext: p.selftext?.slice(0, 500) || "",
      score: p.score,
      num_comments: p.num_comments,
      created_utc: p.created_utc,
    }));

    const commentsForPrompt = comments.slice(0, 200).map((c) => ({
      body: c.body?.slice(0, 300) || "",
      score: c.score,
    }));

    const userPrompt = AUDIENCE_BRIEF_USER_PROMPT
      .replace("{subreddit_name}", subreddit_id)
      .replace("{posts_json}", JSON.stringify(postsForPrompt))
      .replace("{comments_json}", JSON.stringify(commentsForPrompt))
      .replace("{subscribers}", String(metadata?.subscribers ?? "unknown"))
      .replace("{description}", metadata?.public_description || metadata?.description || "No description")
      .replace("{rules_json}", "Not available via API");

    const { data: briefContent, tokensUsed } =
      await generateWithClaude<BriefContent>({
        systemPrompt: AUDIENCE_BRIEF_SYSTEM_PROMPT,
        userPrompt,
        maxTokens: 4096,
        temperature: 0.7,
      });

    const generationTime = Date.now() - startTime;

    // Ensure subreddit exists in our table (upsert)
    await supabase.from("subreddits").upsert(
      {
        id: subreddit_id,
        display_name: metadata?.display_name || subreddit_id,
        title: metadata?.title || null,
        description: metadata?.description || null,
        public_description: metadata?.public_description || null,
        subscribers: metadata?.subscribers || null,
      },
      { onConflict: "id" }
    );

    // Store user's brief
    const { data: brief } = await supabase
      .from("audience_briefs")
      .insert({
        user_id: user.id,
        subreddit_id,
        content: briefContent,
        model_version: CLAUDE_MODEL,
        tokens_used: tokensUsed,
        generation_time_ms: generationTime,
        status: "completed",
        is_cached: false,
      })
      .select("id")
      .single();

    // Store cached version (30-day TTL)
    await supabase.from("audience_briefs").upsert(
      {
        user_id: user.id,
        subreddit_id,
        content: briefContent,
        model_version: CLAUDE_MODEL,
        tokens_used: tokensUsed,
        generation_time_ms: generationTime,
        status: "completed",
        is_cached: true,
        cache_expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      { onConflict: "subreddit_id", ignoreDuplicates: false }
    );

    // Increment usage
    await supabase.rpc("increment_brief_count", { user_uuid: user.id });

    return NextResponse.json({
      id: brief?.id,
      subreddit_id,
      is_cached: false,
      content: briefContent,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Brief generation error:", error);
    return NextResponse.json(
      {
        error: {
          code: "generation_failed",
          message: "Failed to generate brief. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
