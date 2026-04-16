import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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
      { error: { code: "unauthorized", message: "Sign in to view briefs" } },
      { status: 401 }
    );
  }

  const { data: brief, error } = await supabase
    .from("audience_briefs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !brief) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Brief not found" } },
      { status: 404 }
    );
  }

  // Users can only view their own briefs or cached briefs
  if (brief.user_id !== user.id && !brief.is_cached) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Brief not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json(brief);
}

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
      { error: { code: "unauthorized", message: "Sign in to delete briefs" } },
      { status: 401 }
    );
  }

  const { error } = await supabase
    .from("audience_briefs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: { code: "delete_failed", message: "Failed to delete brief" } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
