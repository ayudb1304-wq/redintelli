import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import dodo from "@/lib/dodo/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("dodo_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.dodo_subscription_id) {
    return NextResponse.json(
      { error: "No active subscription" },
      { status: 400 },
    );
  }

  const body = await request.json();
  const { action } = body as { action: "cancel" | "reactivate" };

  try {
    if (action === "cancel") {
      // Cancel at period end — user keeps access until billing cycle ends
      await dodo.subscriptions.update(profile.dodo_subscription_id, {
        cancel_at_next_billing_date: true,
      });
    } else if (action === "reactivate") {
      // Reverse a pending cancellation
      await dodo.subscriptions.update(profile.dodo_subscription_id, {
        cancel_at_next_billing_date: false,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Billing cancel error:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 },
    );
  }
}
