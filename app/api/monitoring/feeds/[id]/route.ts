import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Sign in to manage feeds" } },
      { status: 401 }
    );
  }

  // Verify ownership
  const { data: tracked } = await supabase
    .from("tracked_subreddits")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!tracked) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Tracked subreddit not found" } },
      { status: 404 }
    );
  }

  const { error } = await supabase
    .from("tracked_subreddits")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: { code: "delete_failed", message: "Failed to remove feed" } },
      { status: 500 }
    );
  }

  // Decrement count
  const { data: profile } = await supabase
    .from("profiles")
    .select("tracked_subreddits_count")
    .eq("id", user.id)
    .single();

  await supabase
    .from("profiles")
    .update({
      tracked_subreddits_count: Math.max(
        0,
        (profile?.tracked_subreddits_count ?? 1) - 1
      ),
    })
    .eq("id", user.id);

  return NextResponse.json({ success: true });
}
