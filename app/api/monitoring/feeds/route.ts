import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { addFeedRequestSchema } from "@/lib/validations/monitoring";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Sign in to view feeds" } },
      { status: 401 }
    );
  }

  const [{ data: tracked }, { data: profile }] = await Promise.all([
    supabase
      .from("tracked_subreddits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("tracked_subreddits_count, tracked_subreddits_limit")
      .eq("id", user.id)
      .single(),
  ]);

  // Get unread counts per tracked subreddit
  const trackedWithCounts = await Promise.all(
    (tracked ?? []).map(async (t) => {
      const { count } = await supabase
        .from("matched_posts")
        .select("*", { count: "exact", head: true })
        .eq("tracked_subreddit_id", t.id)
        .eq("is_read", false);

      return { ...t, unread_count: count ?? 0 };
    })
  );

  return NextResponse.json({
    tracked: trackedWithCounts,
    limits: {
      used: profile?.tracked_subreddits_count ?? 0,
      max: profile?.tracked_subreddits_limit ?? 3,
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Sign in to add feeds" } },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const parsed = addFeedRequestSchema.safeParse(body);
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

  // Check limit
  const { data: profile } = await supabase
    .from("profiles")
    .select("tracked_subreddits_count, tracked_subreddits_limit")
    .eq("id", user.id)
    .single();

  if (
    profile &&
    profile.tracked_subreddits_count >= profile.tracked_subreddits_limit
  ) {
    return NextResponse.json(
      {
        error: {
          code: "limit_exceeded",
          message: `You can track up to ${profile.tracked_subreddits_limit} subreddits. Upgrade for more.`,
        },
      },
      { status: 403 }
    );
  }

  const { subreddit_id, keywords, min_intent_score, notify_email, notify_digest } =
    parsed.data;

  // Ensure subreddit exists in our table (use admin client to bypass RLS)
  const admin = createAdminClient();
  await admin.from("subreddits").upsert(
    { id: subreddit_id, display_name: subreddit_id },
    { onConflict: "id" }
  );

  // Insert tracked subreddit
  const { data: tracked, error } = await supabase
    .from("tracked_subreddits")
    .insert({
      user_id: user.id,
      subreddit_id,
      keywords,
      min_intent_score,
      notify_email,
      notify_digest,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error: {
            code: "already_tracked",
            message: `You are already tracking r/${subreddit_id}`,
          },
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: { code: "insert_failed", message: "Failed to add feed" } },
      { status: 500 }
    );
  }

  // Increment count
  await supabase
    .from("profiles")
    .update({
      tracked_subreddits_count: (profile?.tracked_subreddits_count ?? 0) + 1,
    })
    .eq("id", user.id);

  return NextResponse.json(tracked, { status: 201 });
}
