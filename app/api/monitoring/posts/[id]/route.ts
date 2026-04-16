import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Sign in" } },
      { status: 401 }
    );
  }

  const body = await request.json();
  const updates: Record<string, boolean> = {};

  if (typeof body.is_read === "boolean") updates.is_read = body.is_read;
  if (typeof body.is_dismissed === "boolean") updates.is_dismissed = body.is_dismissed;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "No valid fields" } },
      { status: 400 }
    );
  }

  await supabase
    .from("matched_posts")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
