# Dodo Payments Integration Guide

## Overview

Dodo Payments is a modern payment processor designed for SaaS and subscription businesses. This guide covers integrating Dodo for the Reddit Audience Intelligence platform.

**Why Dodo over Stripe:**
- Lower fees for small transactions
- Simpler API for subscription management
- Built-in tax handling
- Modern developer experience

## Setup

### 1. Create Dodo Account

1. Sign up at https://dodopayments.com
2. Complete business verification
3. Get API keys from Dashboard → Developers

### 2. Create Products

In Dodo Dashboard → Products, create:

**Product 1: Starter Plan**
- Name: "Starter Plan"
- Price: $29.00 USD / month
- Billing: Recurring monthly
- Description: "10 audience briefs/month, 10 tracked subreddits"

**Product 2: Pro Plan**
- Name: "Pro Plan"  
- Price: $59.00 USD / month
- Billing: Recurring monthly
- Description: "Unlimited briefs, 50 tracked subreddits, daily digest"

Copy the Product IDs to your `.env.local`.

### 3. Configure Webhooks

In Dodo Dashboard → Developers → Webhooks:

1. Add endpoint: `https://yourdomain.com/api/webhooks/dodo`
2. Select events:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - `payment.succeeded`
   - `payment.failed`
3. Copy the webhook secret to your `.env.local`

---

## Implementation

### Dodo Client Library

```typescript
// lib/dodo/client.ts

const DODO_API_URL = 'https://api.dodopayments.com/v1';

interface CreateCheckoutOptions {
  userId: string;
  userEmail: string;
  productId: string;
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutSession {
  id: string;
  url: string;
  expires_at: string;
}

export async function createCheckoutSession(
  options: CreateCheckoutOptions
): Promise<CheckoutSession> {
  const response = await fetch(`${DODO_API_URL}/checkout/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DODO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer_email: options.userEmail,
      line_items: [
        {
          product: options.productId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      metadata: {
        user_id: options.userId,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return response.json();
}

export async function getSubscription(subscriptionId: string) {
  const response = await fetch(
    `${DODO_API_URL}/subscriptions/${subscriptionId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.DODO_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get subscription');
  }

  return response.json();
}

export async function cancelSubscription(subscriptionId: string) {
  const response = await fetch(
    `${DODO_API_URL}/subscriptions/${subscriptionId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.DODO_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to cancel subscription');
  }

  return response.json();
}

export async function createCustomerPortalSession(customerId: string) {
  const response = await fetch(`${DODO_API_URL}/billing_portal/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DODO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create portal session');
  }

  return response.json();
}
```

### Webhook Verification

```typescript
// lib/dodo/webhooks.ts

import crypto from 'crypto';

export function verifyDodoWebhook(
  payload: string,
  signature: string | null
): boolean {
  if (!signature) return false;
  
  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (!secret) throw new Error('DODO_WEBHOOK_SECRET not set');
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export interface DodoWebhookEvent {
  id: string;
  type: string;
  created: number;
  data: {
    object: Record<string, any>;
  };
}

export function parseWebhookEvent(payload: string): DodoWebhookEvent {
  return JSON.parse(payload);
}
```

### Webhook Route Handler

```typescript
// app/api/webhooks/dodo/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyDodoWebhook, parseWebhookEvent } from '@/lib/dodo/webhooks';

// Use service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('X-Dodo-Signature');

  // Verify webhook signature
  if (!verifyDodoWebhook(body, signature)) {
    console.error('Invalid webhook signature');
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }

  const event = parseWebhookEvent(body);

  // Log event for debugging
  await supabase.from('payment_events').insert({
    dodo_event_id: event.id,
    event_type: event.type,
    payload: event.data,
  });

  try {
    switch (event.type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data.object);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark as processed
    await supabase
      .from('payment_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('dodo_event_id', event.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    await supabase
      .from('payment_events')
      .update({ 
        processed: false, 
        error_message: error instanceof Error ? error.message : 'Unknown error' 
      })
      .eq('dodo_event_id', event.id);

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Subscription tier limits
const TIER_LIMITS = {
  free: { briefs: 2, subreddits: 3 },
  starter: { briefs: 10, subreddits: 10 },
  pro: { briefs: -1, subreddits: 50 }, // -1 = unlimited
};

async function handleSubscriptionCreated(subscription: any) {
  const userId = subscription.metadata?.user_id;
  if (!userId) {
    throw new Error('No user_id in subscription metadata');
  }

  // Determine tier from product
  const productId = subscription.items[0]?.product;
  let tier: 'starter' | 'pro' = 'starter';
  
  if (productId === process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_PRO) {
    tier = 'pro';
  }

  const limits = TIER_LIMITS[tier];

  await supabase
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_status: 'active',
      dodo_customer_id: subscription.customer,
      dodo_subscription_id: subscription.id,
      subscription_current_period_end: subscription.current_period_end,
      briefs_limit: limits.briefs,
      tracked_subreddits_limit: limits.subreddits,
    })
    .eq('id', userId);
}

async function handleSubscriptionUpdated(subscription: any) {
  // Find user by subscription ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('dodo_subscription_id', subscription.id)
    .single();

  if (!profile) {
    throw new Error('Profile not found for subscription');
  }

  // Determine new tier
  const productId = subscription.items[0]?.product;
  let tier: 'free' | 'starter' | 'pro' = 'starter';
  
  if (productId === process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_PRO) {
    tier = 'pro';
  }

  const limits = TIER_LIMITS[tier];

  await supabase
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_status: subscription.status,
      subscription_current_period_end: subscription.current_period_end,
      briefs_limit: limits.briefs,
      tracked_subreddits_limit: limits.subreddits,
    })
    .eq('id', profile.id);
}

async function handleSubscriptionCanceled(subscription: any) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('dodo_subscription_id', subscription.id)
    .single();

  if (!profile) return;

  // Keep access until period end, then downgrade
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'canceled',
      // subscription_tier stays the same until period ends
      // A cron job should downgrade when current_period_end passes
    })
    .eq('id', profile.id);
}

async function handlePaymentFailed(payment: any) {
  const subscriptionId = payment.subscription;
  if (!subscriptionId) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('dodo_subscription_id', subscriptionId)
    .single();

  if (!profile) return;

  await supabase
    .from('profiles')
    .update({
      subscription_status: 'past_due',
    })
    .eq('id', profile.id);

  // TODO: Send email notifying user of failed payment
}
```

### Checkout Route

```typescript
// app/api/checkout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/dodo/client';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { productId } = body;

  // Validate product ID
  const validProducts = [
    process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_STARTER,
    process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_PRO,
  ];

  if (!validProducts.includes(productId)) {
    return NextResponse.json(
      { error: 'Invalid product' },
      { status: 400 }
    );
  }

  try {
    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email!,
      productId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

### Frontend Checkout Component

```typescript
// components/shared/PricingCard.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface PricingCardProps {
  name: string;
  price: number;
  productId: string;
  features: string[];
  popular?: boolean;
  currentTier?: string;
}

export function PricingCard({
  name,
  price,
  productId,
  features,
  popular,
  currentTier,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isCurrentPlan = currentTier === name.toLowerCase();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      // Show error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-xl border p-6 ${popular ? 'border-primary ring-2 ring-primary' : ''}`}>
      {popular && (
        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
          Most Popular
        </span>
      )}
      
      <h3 className="text-xl font-bold mt-2">{name}</h3>
      
      <div className="mt-4">
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-muted-foreground">/month</span>
      </div>

      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-green-500" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className="w-full mt-6"
        onClick={handleCheckout}
        disabled={loading || isCurrentPlan}
        variant={popular ? 'default' : 'outline'}
      >
        {loading ? 'Loading...' : isCurrentPlan ? 'Current Plan' : 'Upgrade'}
      </Button>
    </div>
  );
}
```

---

## Testing

### Test Mode

Dodo provides a test mode with test API keys. Use these for development:
- Prefix: `sk_test_...`
- Test card: 4242 4242 4242 4242

### Testing Webhooks Locally

Use the Dodo CLI to forward webhooks to localhost:

```bash
# Install Dodo CLI
npm install -g @dodopayments/cli

# Login
dodo login

# Forward webhooks
dodo listen --forward-to localhost:3000/api/webhooks/dodo
```

### Test Scenarios

1. **New subscription:** Complete checkout, verify profile updates
2. **Subscription upgrade:** Change from Starter to Pro
3. **Subscription cancel:** Cancel and verify status
4. **Payment failure:** Test with declining card
5. **Webhook retry:** Kill server during webhook, verify retry works

---

## Production Checklist

- [ ] Switch to production API keys
- [ ] Update webhook URL to production domain
- [ ] Enable webhook signature verification
- [ ] Set up Dodo email notifications
- [ ] Configure tax settings (if applicable)
- [ ] Test full purchase flow in production
- [ ] Set up revenue monitoring/alerts
