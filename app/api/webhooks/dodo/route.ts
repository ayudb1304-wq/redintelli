import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyDodoWebhook, parseWebhookEvent } from "@/lib/dodo/webhooks";
import { TIER_LIMITS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("X-Dodo-Signature");

  if (!verifyDodoWebhook(body, signature)) {
    console.error("Invalid webhook signature");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  const event = parseWebhookEvent(body);
  const supabase = createAdminClient();

  // Log event for debugging
  await supabase.from("payment_events").insert({
    dodo_event_id: event.id,
    event_type: event.type,
    payload: event.data,
  });

  try {
    switch (event.type) {
      case "subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;
      case "subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;
      case "subscription.canceled":
        await handleSubscriptionCanceled(event.data.object);
        break;
      case "payment.failed":
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark as processed
    await supabase
      .from("payment_events")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("dodo_event_id", event.id);

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
      .eq("dodo_event_id", event.id);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(subscription: Record<string, unknown>) {
  const supabase = createAdminClient();
  const metadata = subscription.metadata as Record<string, string> | undefined;
  const userId = metadata?.user_id;

  if (!userId) {
    throw new Error("No user_id in subscription metadata");
  }

  const items = subscription.items as Array<{ product: string }> | undefined;
  const productId = items?.[0]?.product;
  const tier =
    productId === process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_PRO
      ? "pro"
      : "starter";

  const limits = TIER_LIMITS[tier];

  await supabase
    .from("profiles")
    .update({
      subscription_tier: tier,
      subscription_status: "active",
      dodo_customer_id: subscription.customer as string,
      dodo_subscription_id: subscription.id as string,
      subscription_current_period_end:
        subscription.current_period_end as string,
      briefs_limit: limits.briefs,
      tracked_subreddits_limit: limits.subreddits,
    })
    .eq("id", userId);
}

async function handleSubscriptionUpdated(subscription: Record<string, unknown>) {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("dodo_subscription_id", subscription.id as string)
    .single();

  if (!profile) {
    throw new Error("Profile not found for subscription");
  }

  const items = subscription.items as Array<{ product: string }> | undefined;
  const productId = items?.[0]?.product;
  const tier =
    productId === process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_PRO
      ? "pro"
      : "starter";

  const limits = TIER_LIMITS[tier];

  await supabase
    .from("profiles")
    .update({
      subscription_tier: tier,
      subscription_status: subscription.status as string,
      subscription_current_period_end:
        subscription.current_period_end as string,
      briefs_limit: limits.briefs,
      tracked_subreddits_limit: limits.subreddits,
    })
    .eq("id", profile.id);
}

async function handleSubscriptionCanceled(subscription: Record<string, unknown>) {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("dodo_subscription_id", subscription.id as string)
    .single();

  if (!profile) return;

  await supabase
    .from("profiles")
    .update({
      subscription_status: "canceled",
    })
    .eq("id", profile.id);
}

async function handlePaymentFailed(payment: Record<string, unknown>) {
  const supabase = createAdminClient();
  const subscriptionId = payment.subscription as string | undefined;
  if (!subscriptionId) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("dodo_subscription_id", subscriptionId)
    .single();

  if (!profile) return;

  await supabase
    .from("profiles")
    .update({
      subscription_status: "past_due",
    })
    .eq("id", profile.id);
}
