import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import dodo from "@/lib/dodo/client";
import { TIER_LIMITS } from "@/lib/constants";
import type { Subscription } from "dodopayments/resources/subscriptions";

// Service role client for admin operations (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function tierFromProductId(
  productId: string,
): "starter" | "pro" {
  if (productId === process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_PRO) {
    return "pro";
  }
  return "starter";
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headers: Record<string, string> = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
  };

  let event;
  try {
    event = dodo.webhooks.unwrap(body, { headers });
  } catch {
    console.error("Invalid webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency: check if we already processed this event
  const webhookId = headers["webhook-id"];
  const { data: existing } = await supabase
    .from("payment_events")
    .select("id")
    .eq("dodo_event_id", webhookId)
    .eq("processed", true)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true });
  }

  // Log the event
  await supabase.from("payment_events").insert({
    dodo_event_id: webhookId,
    event_type: event.type,
    payload: event.data as unknown as Record<string, unknown>,
  });

  try {
    switch (event.type) {
      case "subscription.active":
        await handleSubscriptionActive(event.data);
        break;

      case "subscription.renewed":
        await handleSubscriptionRenewed(event.data);
        break;

      case "subscription.plan_changed":
        await handleSubscriptionPlanChanged(event.data);
        break;

      case "subscription.on_hold":
        await handleSubscriptionOnHold(event.data);
        break;

      case "subscription.cancelled":
        await handleSubscriptionCancelled(event.data);
        break;

      case "subscription.expired":
        await handleSubscriptionExpired(event.data);
        break;

      case "subscription.failed":
        await handleSubscriptionFailed(event.data);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark as processed
    await supabase
      .from("payment_events")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("dodo_event_id", webhookId);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);

    await supabase
      .from("payment_events")
      .update({
        processed: false,
        error_message:
          error instanceof Error ? error.message : "Unknown error",
      })
      .eq("dodo_event_id", webhookId);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function handleSubscriptionActive(sub: Subscription) {
  const userId = sub.metadata?.user_id;
  if (!userId) {
    throw new Error("No user_id in subscription metadata");
  }

  const tier = tierFromProductId(sub.product_id);
  const limits = TIER_LIMITS[tier];

  await supabase
    .from("profiles")
    .update({
      subscription_tier: tier,
      subscription_status: "active",
      dodo_customer_id: sub.customer.customer_id,
      dodo_subscription_id: sub.subscription_id,
      subscription_current_period_end: sub.next_billing_date,
      briefs_limit: limits.briefs,
      tracked_subreddits_limit: limits.subreddits,
    })
    .eq("id", userId);
}

async function handleSubscriptionRenewed(sub: Subscription) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("dodo_subscription_id", sub.subscription_id)
    .single();

  if (!profile) {
    throw new Error("Profile not found for subscription");
  }

  await supabase
    .from("profiles")
    .update({
      subscription_status: "active",
      subscription_current_period_end: sub.next_billing_date,
    })
    .eq("id", profile.id);
}

async function handleSubscriptionPlanChanged(sub: Subscription) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("dodo_subscription_id", sub.subscription_id)
    .single();

  if (!profile) {
    throw new Error("Profile not found for subscription");
  }

  const tier = tierFromProductId(sub.product_id);
  const limits = TIER_LIMITS[tier];

  await supabase
    .from("profiles")
    .update({
      subscription_tier: tier,
      briefs_limit: limits.briefs,
      tracked_subreddits_limit: limits.subreddits,
    })
    .eq("id", profile.id);
}

async function handleSubscriptionOnHold(sub: Subscription) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("dodo_subscription_id", sub.subscription_id)
    .single();

  if (!profile) return;

  await supabase
    .from("profiles")
    .update({ subscription_status: "past_due" })
    .eq("id", profile.id);
}

async function handleSubscriptionCancelled(sub: Subscription) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("dodo_subscription_id", sub.subscription_id)
    .single();

  if (!profile) return;

  await supabase
    .from("profiles")
    .update({
      subscription_status: "canceled",
      subscription_current_period_end: sub.cancel_at_next_billing_date
        ? sub.next_billing_date
        : null,
    })
    .eq("id", profile.id);

  // If immediate cancel (not at period end), downgrade now
  if (!sub.cancel_at_next_billing_date) {
    await downgradeToFree(profile.id);
  }
}

async function handleSubscriptionExpired(sub: Subscription) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("dodo_subscription_id", sub.subscription_id)
    .single();

  if (!profile) return;

  await downgradeToFree(profile.id);
}

async function handleSubscriptionFailed(sub: Subscription) {
  const userId = sub.metadata?.user_id;
  if (!userId) return;

  // Initial mandate creation failed - no subscription was activated
  // Just log it, user stays on their current tier
  console.error(`Subscription setup failed for user ${userId}`);
}

async function downgradeToFree(userId: string) {
  const limits = TIER_LIMITS.free;
  await supabase
    .from("profiles")
    .update({
      subscription_tier: "free",
      subscription_status: "active",
      dodo_subscription_id: null,
      subscription_current_period_end: null,
      briefs_limit: limits.briefs,
      tracked_subreddits_limit: limits.subreddits,
    })
    .eq("id", userId);
}
