import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import dodo from "@/lib/dodo/client";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("dodo_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.dodo_customer_id) {
    return NextResponse.json(
      { error: "No billing account found" },
      { status: 400 },
    );
  }

  try {
    const session = await dodo.customers.customerPortal.create(
      profile.dodo_customer_id,
      { return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings` },
    );

    return NextResponse.json({ url: session.link });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 },
    );
  }
}
