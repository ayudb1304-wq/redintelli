import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { arcticShift } from "@/lib/arctic-shift/client";
import { generateWithClaude } from "@/lib/claude/client";
import {
  SUBREDDIT_DISCOVERY_SYSTEM_PROMPT,
  SUBREDDIT_DISCOVERY_USER_PROMPT,
  type DiscoveredSubreddit,
} from "@/lib/claude/prompts/discover";
import { discoverRequestSchema } from "@/lib/validations/discover";
import { createRateLimiter } from "@/lib/rate-limit";
import { RATE_LIMITS, CLAUDE_MODEL } from "@/lib/constants";

const rateLimiter = createRateLimiter(
  RATE_LIMITS.discovery.maxRequests,
  RATE_LIMITS.discovery.windowMs
);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Sign in to discover subreddits" } },
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
          details: { resetAt: rateCheck.resetAt },
        },
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": String(rateCheck.remaining),
          "X-RateLimit-Reset": String(rateCheck.resetAt),
        },
      }
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

  const parsed = discoverRequestSchema.safeParse(body);
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

  const { product_description, target_audience, max_results } = parsed.data;

  try {
    // Fetch subreddit candidates from Arctic Shift
    // Extract key terms from description for search
    const keywords = product_description
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .slice(0, 5)
      .join(" ");

    const [searchResults, localSubreddits] = await Promise.all([
      arcticShift.searchSubreddits(keywords, { limit: 50 }).catch(() => []),
      supabase.from("subreddits").select("*").limit(50).then((r) => r.data ?? []),
    ]);

    // Deduplicate and build sample for Claude
    const seen = new Set<string>();
    const subredditSample: Array<{
      name: string;
      title: string;
      description: string;
      subscribers: number;
    }> = [];

    for (const sub of searchResults) {
      if (!seen.has(sub.display_name.toLowerCase())) {
        seen.add(sub.display_name.toLowerCase());
        subredditSample.push({
          name: sub.display_name.toLowerCase(),
          title: sub.title || "",
          description: (sub.public_description || sub.description || "").slice(0, 200),
          subscribers: sub.subscribers || 0,
        });
      }
    }

    for (const sub of localSubreddits) {
      if (!seen.has(sub.id)) {
        seen.add(sub.id);
        subredditSample.push({
          name: sub.id,
          title: sub.title || "",
          description: (sub.public_description || sub.description || "").slice(0, 200),
          subscribers: sub.subscribers || 0,
        });
      }
    }

    // Build prompt
    const userPrompt = SUBREDDIT_DISCOVERY_USER_PROMPT
      .replace("{product_description}", product_description)
      .replace("{target_audience}", target_audience || "Not specified")
      .replace("{subreddits_sample}", JSON.stringify(subredditSample))
      .replace("{max_results}", String(max_results));

    // Call Claude
    const { data: subreddits, tokensUsed } = await generateWithClaude<
      DiscoveredSubreddit[]
    >({
      systemPrompt: SUBREDDIT_DISCOVERY_SYSTEM_PROMPT,
      userPrompt,
      maxTokens: 4096,
      temperature: 0.7,
    });

    // Store session
    const { data: session } = await supabase
      .from("discovery_sessions")
      .insert({
        user_id: user.id,
        product_description,
        target_audience: target_audience || null,
        discovered_subreddits: subreddits,
        model_version: CLAUDE_MODEL,
        tokens_used: tokensUsed,
      })
      .select("id")
      .single();

    return NextResponse.json(
      {
        session_id: session?.id,
        subreddits,
        tokens_used: tokensUsed,
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(rateCheck.remaining),
          "X-RateLimit-Reset": String(rateCheck.resetAt),
        },
      }
    );
  } catch (error) {
    console.error("Discovery error:", error);
    return NextResponse.json(
      {
        error: {
          code: "generation_failed",
          message: "Failed to discover subreddits. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
