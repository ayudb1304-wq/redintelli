import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
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
  const enabled = typeof body.enabled === "boolean" ? body.enabled : true;

  await supabase
    .from("profiles")
    .update({ digest_enabled: enabled })
    .eq("id", user.id);

  return NextResponse.json({ digest_enabled: enabled });
}
