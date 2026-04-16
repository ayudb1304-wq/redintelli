import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyDodoWebhook, parseWebhookEvent } from "@/lib/dodo/webhooks";
import { TIER_LIMITS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const body = await request.text();

  // Standard Webhooks headers
  const webhookId = request.headers.get("webhook-id");
  const webhookTimestamp = request.headers.get("webhook-timestamp");
  const webhookSignature = request.headers.get("webhook-signature");

  if (!verifyDodoWebhook(body, webhookId, webhookTimestamp, webhookSignature)) {
    console.error("Invalid webhook signature");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  const event = parseWebhookEvent(body);
  const supabase = createAdminClient();
  const data = event.data;

  // Extract user_id from payload metadata
  const metadata = data.metadata as Record<string, string> | undefined;
  const userId = metadata?.user_id || null;

  // Log event
  await supabase.from("payment_events").insert({
    dodo_event_id: webhookId || event.timestamp,
    event_type: event.type,
    payload: data,
    user_id: userId,
  });

  try {
    switch (event.type) {
      case "subscription.active":
        await handleSubscriptionActive(data);
        break;
      case "subscription.updated":
      case "subscription.plan_changed":
      case "subscription.renewed":
        await handleSubscriptionUpdated(data);
        break;
      case "subscription.cancelled":
      case "subscription.expired":
        await handleSubscriptionCanceled(data);
        break;
      case "subscription.on_hold":
      case "subscription.failed":
      case "payment.failed":
        await handlePaymentFailed(data);
        break;
      case "payment.succeeded":
      case "payment.processing":
      case "payment.cancelled":
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark as processed
    await supabase
      .from("payment_events")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("dodo_event_id", webhookId || event.timestamp);

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
      .eq("dodo_event_id", webhookId || event.timestamp);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

function determineTier(data: Record<string, unknown>): "starter" | "pro" {
  const productId = data.product_id as string | undefined;
  if (productId === process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_PRO) return "pro";
  return "starter";
}

async function findUserByMetadataOrSubscription(
  data: Record<string, unknown>
): Promise<string | null> {
  const supabase = createAdminClient();

  // Try metadata first
  const metadata = data.metadata as Record<string, string> | undefined;
  if (metadata?.user_id) return metadata.user_id;

  // Try finding by subscription ID
  const subscriptionId = data.subscription_id as string | undefined;
  if (subscriptionId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("dodo_subscription_id", subscriptionId)
      .single();
    if (profile) return profile.id;
  }

  // Try finding by customer email
  const customerEmail = data.customer_email as string | undefined;
  if (customerEmail) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", customerEmail)
      .single();
    if (profile) return profile.id;
  }

  return null;
}

async function handleSubscriptionActive(data: Record<string, unknown>) {
  const supabase = createAdminClient();
  const userId = await findUserByMetadataOrSubscription(data);

  if (!userId) {
    console.error("Could not find user for subscription.active", data);
    throw new Error("User not found for subscription");
  }

  const tier = determineTier(data);
  const limits = TIER_LIMITS[tier];

  await supabase
    .from("profiles")
    .update({
      subscription_tier: tier,
      subscription_status: "active",
      dodo_customer_id: (data.customer_id as string) || null,
      dodo_subscription_id: (data.subscription_id as string) || null,
      briefs_limit: limits.briefs,
      tracked_subreddits_limit: limits.subreddits,
    })
    .eq("id", userId);
}

async function handleSubscriptionUpdated(data: Record<string, unknown>) {
  const supabase = createAdminClient();
  const userId = await findUserByMetadataOrSubscription(data);
  if (!userId) return;

  const tier = determineTier(data);
  const limits = TIER_LIMITS[tier];

  await supabase
    .from("profiles")
    .update({
      subscription_tier: tier,
      subscription_status: (data.status as string) || "active",
      briefs_limit: limits.briefs,
      tracked_subreddits_limit: limits.subreddits,
    })
    .eq("id", userId);
}

async function handleSubscriptionCanceled(data: Record<string, unknown>) {
  const supabase = createAdminClient();
  const userId = await findUserByMetadataOrSubscription(data);
  if (!userId) return;

  await supabase
    .from("profiles")
    .update({ subscription_status: "canceled" })
    .eq("id", userId);
}

async function handlePaymentFailed(data: Record<string, unknown>) {
  const supabase = createAdminClient();
  const userId = await findUserByMetadataOrSubscription(data);
  if (!userId) return;

  await supabase
    .from("profiles")
    .update({ subscription_status: "past_due" })
    .eq("id", userId);
}
