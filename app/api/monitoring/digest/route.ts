import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDailyDigest } from "@/lib/rss/digest";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Sign in to generate digest" } },
      { status: 401 }
    );
  }

  // Check if user is Pro (digest is Pro-only)
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  if (profile?.subscription_tier !== "pro") {
    return NextResponse.json(
      {
        error: {
          code: "upgrade_required",
          message: "Daily digest is available on the Pro plan.",
        },
      },
      { status: 403 }
    );
  }

  try {
    const digest = await generateDailyDigest(user.id);

    if (!digest) {
      return NextResponse.json({
        digest: null,
        message: "No new posts to summarize in the last 24 hours.",
      });
    }

    return NextResponse.json({ digest });
  } catch (error) {
    console.error("Digest generation error:", error);
    return NextResponse.json(
      {
        error: {
          code: "generation_failed",
          message: "Failed to generate digest. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
