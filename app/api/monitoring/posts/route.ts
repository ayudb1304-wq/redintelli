import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Sign in to view posts" } },
      { status: 401 }
    );
  }

  const { data: posts } = await supabase
    .from("matched_posts")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_dismissed", false)
    .order("intent_score", { ascending: false })
    .limit(50);

  return NextResponse.json({ posts: posts ?? [] });
}
