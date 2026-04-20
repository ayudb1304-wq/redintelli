# Dodo Payments - Subscription Implementation Guide

A complete, end-to-end guide for integrating Dodo Payments subscriptions into your product. Covers checkout, the full webhook lifecycle, plan changes (upgrade/downgrade), and cancellation - including the non-obvious edge cases (on-hold recovery, proration math, payment-failure policy, and cancel-at-period-end vs. immediate cancel).

> **Audience:** Backend engineers integrating Dodo Payments for the first time, or extending an existing integration to support plan changes and cancellation.
>
> **Scope:** Backend-focused. Code samples use Node.js and Python SDKs; REST equivalents are included where helpful.

---

## Table of Contents

1. [Prerequisites & Setup](#1-prerequisites--setup)
2. [Architecture Overview](#2-architecture-overview)
3. [Subscription Lifecycle & States](#3-subscription-lifecycle--states)
4. [Step 1 - Create a Subscription (Checkout Session)](#4-step-1--create-a-subscription-checkout-session)
5. [Step 2 - Webhook Handling](#5-step-2--webhook-handling)
6. [Step 3 - Handle On-Hold Subscriptions](#6-step-3--handle-on-hold-subscriptions)
7. [Step 4 - Plan Changes (Upgrade & Downgrade)](#7-step-4--plan-changes-upgrade--downgrade)
8. [Step 5 - Cancellation](#8-step-5--cancellation)
9. [Step 6 - Database Schema](#9-step-6--database-schema)
10. [Step 7 - Reactivation & Re-subscription](#10-step-7--reactivation--re-subscription)
11. [Testing Checklist](#11-testing-checklist)
12. [Production Best Practices](#12-production-best-practices)
13. [Reference: API Endpoints & Webhook Events](#13-reference-api-endpoints--webhook-events)

---

## 1. Prerequisites & Setup

Before writing any code, make sure you have:

- A Dodo Payments merchant account (test mode is fine to start)
- An **API key** and a **webhook signing secret** from the dashboard
- At least one **subscription product** created in the dashboard (note its `product_id`)
- A publicly reachable HTTPS endpoint for receiving webhooks (use `ngrok`, `cloudflared`, or a staging deployment during development)

### Environment variables

```bash
# .env
DODO_PAYMENTS_API_KEY=sk_test_xxx
DODO_WEBHOOK_SECRET=whsec_xxx
DODO_ENVIRONMENT=test_mode   # or live_mode
APP_URL=https://your-app.com
```

### Install the SDK

```bash
# Node.js
npm install dodopayments

# Python
pip install dodopayments
```

---

## 2. Architecture Overview

A production subscription integration has three moving parts:

1. **Checkout creation** - your backend calls Dodo to generate a hosted checkout URL, then redirects the customer there.
2. **Webhook ingestion** - Dodo calls your endpoint whenever something changes (activation, renewal, failure, cancellation). This is the source of truth for your database.
3. **Management APIs** - your backend calls Dodo to change plans, update payment methods, or cancel subscriptions on behalf of the customer.

```
┌──────────┐     redirect     ┌─────────────────────┐
│ Customer │ ───────────────▶ │ Dodo Hosted Checkout│
└──────────┘                  └──────────┬──────────┘
     ▲                                   │
     │ access grant/revoke               │ webhook events
     │                                   ▼
┌────┴─────────┐   API calls    ┌─────────────────┐
│  Your App    │ ─────────────▶ │  Dodo Payments  │
│  + Database  │ ◀───────────── │      API        │
└──────────────┘                └─────────────────┘
```

**Golden rule:** Never grant or revoke customer access based on an API response alone. Always wait for the corresponding webhook. API responses are acknowledgements; webhooks are truth.

---

## 3. Subscription Lifecycle & States

A Dodo subscription has the following statuses:

| Status      | Meaning                                                            |
| ----------- | ------------------------------------------------------------------ |
| `pending`   | Created but not yet activated (mandate still being set up)         |
| `active`    | Customer has access; billing will renew on schedule                |
| `on_hold`   | Renewal or plan-change charge failed; auto-renewal is paused       |
| `cancelled` | Subscription has been cancelled; access usually ends at period end |
| `failed`    | Mandate creation failed during initial setup                       |
| `expired`   | Subscription reached the end of its term                           |

### Happy-path flow

```
pending ─▶ active ─▶ (renewed repeatedly) ─▶ cancelled ─▶ expired
```

### Failure flow

```
active ─▶ on_hold ─▶ (payment method updated) ─▶ active
                 └─▶ (not fixed) ─▶ cancelled / expired
```

Your database should store the current status and update it **only in response to webhooks**.

---

## 4. Step 1 - Create a Subscription (Checkout Session)

Use **Checkout Sessions** for the vast majority of cases. Dodo hosts the payment page, handles PCI, 3DS, and regional payment methods, and redirects back to your `return_url` on completion.

### Node.js

```javascript
import DodoPayments from 'dodopayments';

const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: process.env.DODO_ENVIRONMENT, // 'test_mode' or 'live_mode'
});

export async function createSubscriptionCheckout({ userId, productId, email, name }) {
  const session = await client.checkoutSessions.create({
    product_cart: [
      { product_id: productId, quantity: 1 }
    ],
    // Optional: start with a free trial
    subscription_data: { trial_period_days: 14 },
    customer: { email, name },
    // Attach your internal user ID so webhooks can map back to your user
    metadata: { user_id: userId },
    return_url: `${process.env.APP_URL}/billing/success`,
  });

  return session.checkout_url; // redirect the user here
}
```

### Python

```python
import os
from dodopayments import DodoPayments

client = DodoPayments(
    bearer_token=os.environ["DODO_PAYMENTS_API_KEY"],
    environment=os.environ.get("DODO_ENVIRONMENT", "live_mode"),
)

def create_subscription_checkout(user_id, product_id, email, name):
    session = client.checkout_sessions.create(
        product_cart=[{"product_id": product_id, "quantity": 1}],
        subscription_data={"trial_period_days": 14},
        customer={"email": email, "name": name},
        metadata={"user_id": str(user_id)},
        return_url=f"{os.environ['APP_URL']}/billing/success",
    )
    return session.checkout_url
```

### Critical: use `metadata` to map Dodo objects back to your users

Webhook payloads include the metadata you set at checkout. Always set an internal user ID in metadata - it's the cleanest way to find the right row in your database when a webhook arrives.

### Response shape

```json
{
  "session_id": "cks_Gi6KGJ2zFJo9rq9Ukifwa",
  "checkout_url": "https://test.checkout.dodopayments.com/session/cks_..."
}
```

Redirect the customer to `checkout_url`. They'll complete checkout on Dodo's hosted page and return to your `return_url`. **Do not grant access on the return URL** - wait for the `subscription.active` webhook.

---

## 5. Step 2 - Webhook Handling

Webhooks are how you learn that a subscription activated, renewed, failed, or changed. Your endpoint must:

1. Verify the signature (reject the request if invalid)
2. Respond quickly (under ~3 seconds; process heavy work asynchronously)
3. Be idempotent (Dodo may retry; don't grant access twice)

### Minimal Express handler

```javascript
import express from 'express';
import DodoPayments from 'dodopayments';

const app = express();
const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
});

// IMPORTANT: use raw body for signature verification
app.post(
  '/webhooks/dodo',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const headers = {
      'webhook-id': req.header('webhook-id'),
      'webhook-signature': req.header('webhook-signature'),
      'webhook-timestamp': req.header('webhook-timestamp'),
    };
    const payload = req.body.toString('utf8');

    let event;
    try {
      // Verify using a Standard Webhooks library (e.g. `standardwebhooks`)
      event = verifyAndParse(payload, headers, process.env.DODO_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send('Invalid signature');
    }

    // Idempotency: skip if we've already processed this event
    if (await wasEventProcessed(event.id)) {
      return res.json({ received: true });
    }

    try {
      await handleEvent(event);
      await markEventProcessed(event.id);
    } catch (err) {
      console.error('Webhook handler error:', err);
      // Return 500 so Dodo retries
      return res.status(500).send('Handler failed');
    }

    res.json({ received: true });
  }
);

async function handleEvent(event) {
  const sub = event.data;

  switch (event.type) {
    // ── Activation / Renewal ──────────────────────────────────
    case 'subscription.active':
      await db.updateSubscription(sub.subscription_id, {
        status: 'active',
        next_billing_date: sub.next_billing_date,
        product_id: sub.product_id,
        quantity: sub.quantity,
      });
      await grantAccess(sub.metadata?.user_id, sub.product_id);
      break;

    case 'subscription.renewed':
      await db.updateSubscription(sub.subscription_id, {
        status: 'active',
        next_billing_date: sub.next_billing_date,
      });
      break;

    // ── Real-time sync (fires on ANY field change) ────────────
    case 'subscription.updated':
      await db.updateSubscription(sub.subscription_id, {
        status: sub.status,
        next_billing_date: sub.next_billing_date,
        cancel_at_next_billing_date: sub.cancel_at_next_billing_date,
        product_id: sub.product_id,
        quantity: sub.quantity,
      });
      break;

    // ── Plan change ───────────────────────────────────────────
    case 'subscription.plan_changed':
      await db.updateSubscription(sub.subscription_id, {
        product_id: sub.product_id,
        quantity: sub.quantity,
      });
      await refreshEntitlements(sub.metadata?.user_id, sub.product_id);
      break;

    // ── Failure states ────────────────────────────────────────
    case 'subscription.on_hold':
      await db.updateSubscription(sub.subscription_id, { status: 'on_hold' });
      await emailPaymentMethodUpdate(sub.metadata?.user_id);
      break;

    case 'subscription.failed':
      await db.updateSubscription(sub.subscription_id, { status: 'failed' });
      break;

    // ── Cancellation / Expiry ─────────────────────────────────
    case 'subscription.cancelled':
      await db.updateSubscription(sub.subscription_id, {
        status: 'cancelled',
        cancelled_at: new Date(),
      });
      // NOTE: do not revoke access here if cancel_at_next_billing_date was set;
      // access continues until expiry. Revoke on subscription.expired instead.
      if (!sub.cancel_at_next_billing_date) {
        await revokeAccess(sub.metadata?.user_id);
      }
      break;

    case 'subscription.expired':
      await db.updateSubscription(sub.subscription_id, { status: 'expired' });
      await revokeAccess(sub.metadata?.user_id);
      break;

    // ── Payments (for reconciliation) ─────────────────────────
    case 'payment.succeeded':
      await db.recordPayment(event.data);
      break;

    case 'payment.failed':
      await db.recordFailedPayment(event.data);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

app.listen(3000);
```

### Which events to listen for

**Drive business logic from subscription events; use payment events only for reconciliation.**

| Event                       | When it fires                                               | What you should do                         |
| --------------------------- | ----------------------------------------------------------- | ------------------------------------------ |
| `subscription.active`       | Subscription successfully activated                         | Grant access; set status = `active`        |
| `subscription.updated`      | Any field on the subscription changed                       | Sync fields to your DB                     |
| `subscription.renewed`      | Renewal charge succeeded                                    | Extend access window; update next bill date |
| `subscription.plan_changed` | Product/quantity/addons changed                             | Refresh entitlements                       |
| `subscription.on_hold`      | Renewal or plan-change charge failed                        | Email customer; prompt to update payment   |
| `subscription.failed`       | Mandate creation failed during initial setup                | Mark failed; prompt retry                  |
| `subscription.cancelled`    | Subscription cancelled (immediate or end-of-period set)     | See cancellation section for access rules  |
| `subscription.expired`      | Subscription reached end of term                            | Revoke access                              |

> `subscription.updated` overlaps with the specific events. Pick one strategy: either treat `subscription.updated` as your primary sync event and use the others as business-event signals, or ignore `subscription.updated` entirely and use only specific events. Don't do both and re-grant access twice.

### Idempotency - do this, it matters

Dodo will retry webhook deliveries on 5xx responses. Store the `event.id` (or `webhook-id` header) in a dedupe table with a unique constraint:

```sql
CREATE TABLE processed_webhook_events (
  event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);
```

Check for the row before processing; insert after processing. If the insert fails on the unique constraint, you've seen it before - skip.

---

## 6. Step 3 - Handle On-Hold Subscriptions

A subscription moves to `on_hold` when:

- An automatic renewal charge fails (card expired, insufficient funds, bank decline)
- A plan-change immediate charge fails
- Payment-method authorization for recurring charges fails

**On-hold subscriptions do not renew automatically.** The only way to reactivate is to update the payment method, which automatically creates a charge for the outstanding dues.

### Recovery flow

```
subscription.on_hold  ──▶  notify customer
                           │
                           ▼
                  customer updates payment method
                           │
                           ▼
               updatePaymentMethod API creates charge
                           │
                  ┌────────┴────────┐
                  ▼                 ▼
           payment.succeeded  payment.failed
                  │                 │
                  ▼                 ▼
         subscription.active   stays on_hold
```

### Node.js

```javascript
async function reactivateOnHoldSubscription(subscriptionId) {
  const response = await client.subscriptions.updatePaymentMethod(subscriptionId, {
    type: 'new',
    return_url: `${process.env.APP_URL}/billing/return`,
  });

  if (response.payment_id) {
    // Redirect customer to the payment link to complete the outstanding charge
    return response.payment_link;
  }
  return null;
}

// If the customer already has a saved payment method you want to use:
async function reactivateWithSavedMethod(subscriptionId, paymentMethodId) {
  return client.subscriptions.updatePaymentMethod(subscriptionId, {
    type: 'existing',
    payment_method_id: paymentMethodId,
  });
}
```

After calling this, watch for `payment.succeeded` followed by `subscription.active` to confirm reactivation.

---

## 7. Step 4 - Plan Changes (Upgrade & Downgrade)

Plan changes modify an active subscription's product, quantity, or addons. The three proration modes control how the immediate charge is calculated.

### 7.1 Proration modes - the key decision

Reference scenario: Basic at \$30/mo, upgrade target Pro at \$80/mo, 30-day cycle, change happens on day 16 (15 days remaining).

| Mode                      | Upgrade charge (Basic → Pro)                   | Downgrade credit (Pro → Starter)          | Billing cycle | Best for                                |
| ------------------------- | ---------------------------------------------- | ----------------------------------------- | ------------- | --------------------------------------- |
| `prorated_immediately`    | \$25 (prorated diff for remaining days)        | Prorated credit for unused days           | Unchanged     | Fair time-based billing (SaaS default)  |
| `difference_immediately`  | \$50 (full price difference, ignores timing)   | Full price diff added as subscription credit | Unchanged  | Simple upgrade/downgrade math           |
| `full_immediately`        | \$80 (full new plan price, no credit given)    | No credit                                 | **Resets**    | Resetting the billing cycle             |

> **Downgrade credits are subscription-scoped.** They auto-apply to future renewals of the same subscription and can't be transferred.

### 7.2 Preview before committing

Always show the customer the exact charge before they confirm.

```javascript
const preview = await client.subscriptions.previewChangePlan('sub_123', {
  product_id: 'prod_pro',
  quantity: 1,
  proration_billing_mode: 'prorated_immediately',
});

console.log('Immediate charge:', preview.immediate_charge.summary);
console.log('New plan details:', preview.new_plan);
```

Render this in a confirmation dialog. Your users will thank you.

### 7.3 Execute the change

```javascript
async function changePlan({ subscriptionId, newProductId, quantity = 1 }) {
  const result = await client.subscriptions.changePlan(subscriptionId, {
    product_id: newProductId,
    quantity,
    proration_billing_mode: 'prorated_immediately',
    // For upgrades, recommended: keep old plan if charge fails
    on_payment_failure: 'prevent_change',
  });

  // result.status will typically be "processing"
  // The final outcome arrives via webhooks
  return result;
}
```

### 7.4 `on_payment_failure` - an important safety knob

When the immediate plan-change charge fails, you have two policies:

| Value              | Behavior                                                                             | Use for                            |
| ------------------ | ------------------------------------------------------------------------------------ | ---------------------------------- |
| `prevent_change`   | Keep subscription on the current plan until payment succeeds. Safer.                 | Upgrades; seat increases; trial→paid |
| `apply_change` (default) | Apply the plan change regardless of payment outcome. Subscription may go `on_hold`. | Downgrades; trusted enterprise customers |

### 7.5 Modifying addons during a plan change

```javascript
// Add or change addons
await client.subscriptions.changePlan('sub_123', {
  product_id: 'prod_pro',
  quantity: 1,
  proration_billing_mode: 'prorated_immediately',
  addons: [{ addon_id: 'addon_seats', quantity: 3 }],
});

// Remove ALL addons - pass empty array
await client.subscriptions.changePlan('sub_123', {
  product_id: 'prod_pro',
  quantity: 1,
  proration_billing_mode: 'difference_immediately',
  addons: [],
});
```

Addons are included in proration calculations.

### 7.6 Webhooks to expect on a plan change

1. `subscription.plan_changed` - plan fields updated
2. `payment.succeeded` (if charge succeeded) or `payment.failed` (if it didn't)
3. `subscription.active` - confirms the subscription is live on the new plan
4. If payment failed and policy was `apply_change`: `subscription.on_hold` follows

Update entitlements on `subscription.plan_changed` (or `subscription.active` if you prefer a single event).

---

## 8. Step 5 - Cancellation

Cancellation is done via the **Update Subscription** endpoint (`PATCH /subscriptions/{id}`). There are two distinct patterns, and choosing between them is a product decision:

### 8.1 Cancel at period end (recommended default)

The customer keeps access through the already-paid period. No refund, no surprise loss of access. This is what most SaaS products do.

```javascript
await client.subscriptions.update('sub_123', {
  cancel_at_next_billing_date: true,
});
```

**What happens:**

- `subscription.updated` fires with `cancel_at_next_billing_date: true`
- The subscription keeps status `active` until the next billing date
- At the billing date, instead of renewing, the subscription transitions to `cancelled` → `expired`
- You receive `subscription.cancelled` then `subscription.expired`

**Access handling:** Keep access granted until you receive `subscription.expired`.

### 8.2 Cancel immediately

The subscription is cancelled right away. Use this sparingly - typically for refund scenarios, abuse, or compliance actions.

```javascript
await client.subscriptions.update('sub_123', {
  status: 'cancelled',
});
```

**What happens:**

- `subscription.cancelled` fires immediately
- Access should be revoked immediately

### 8.3 Reversing a pending cancellation

If the customer clicks "Don't cancel" before the period ends:

```javascript
await client.subscriptions.update('sub_123', {
  cancel_at_next_billing_date: false,
});
```

### 8.4 Cancellation decision tree

```
customer requests cancel
        │
        ├── refund owed or compliance issue?
        │     └── YES → status: "cancelled"        (immediate, revoke access now)
        │
        └── normal SaaS churn?
              └── YES → cancel_at_next_billing_date: true   (access until period end)
```

### 8.5 Full example: cancellation flow with grace period

```javascript
// API route: POST /api/subscriptions/:id/cancel
app.post('/api/subscriptions/:id/cancel', async (req, res) => {
  const { id } = req.params;
  const { immediate = false } = req.body;

  try {
    if (immediate) {
      await client.subscriptions.update(id, { status: 'cancelled' });
    } else {
      await client.subscriptions.update(id, {
        cancel_at_next_billing_date: true,
      });
    }
    // Don't update your local DB here - let the webhook do it
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

And in your webhook handler:

```javascript
case 'subscription.cancelled':
  await db.updateSubscription(sub.subscription_id, {
    status: 'cancelled',
    cancelled_at: new Date(),
  });
  // Only revoke immediately if it wasn't a "cancel at period end"
  if (!sub.cancel_at_next_billing_date) {
    await revokeAccess(sub.metadata.user_id);
  }
  break;

case 'subscription.expired':
  await db.updateSubscription(sub.subscription_id, { status: 'expired' });
  await revokeAccess(sub.metadata.user_id);
  break;
```

---

## 9. Step 6 - Database Schema

A minimal schema that supports everything above:

```sql
CREATE TABLE subscriptions (
  id                          TEXT PRIMARY KEY,              -- Dodo subscription_id
  user_id                     BIGINT NOT NULL REFERENCES users(id),
  status                      TEXT NOT NULL,                 -- pending|active|on_hold|cancelled|failed|expired
  product_id                  TEXT NOT NULL,
  quantity                    INTEGER NOT NULL DEFAULT 1,
  next_billing_date           TIMESTAMPTZ,
  cancel_at_next_billing_date BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_at                TIMESTAMPTZ,
  expires_at                  TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

CREATE TABLE processed_webhook_events (
  event_id     TEXT PRIMARY KEY,
  event_type   TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id                TEXT PRIMARY KEY,                        -- Dodo payment_id
  subscription_id   TEXT REFERENCES subscriptions(id),
  amount            INTEGER NOT NULL,                        -- smallest currency unit
  currency          TEXT NOT NULL,
  status            TEXT NOT NULL,                           -- succeeded|failed
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Access-granting helper

```javascript
async function hasActiveAccess(userId) {
  const sub = await db.subscriptions.findLatestByUserId(userId);
  if (!sub) return false;

  // Active, or scheduled to cancel but still in paid period
  if (sub.status === 'active') return true;

  // Grace period handling for on_hold - business decision
  if (sub.status === 'on_hold' && sub.expires_at > new Date()) return true;

  return false;
}
```

---

## 10. Step 7 - Reactivation & Re-subscription

### After cancel-at-period-end, before expiry

Flip the flag back:

```javascript
await client.subscriptions.update(subscriptionId, {
  cancel_at_next_billing_date: false,
});
```

### After full cancellation or expiry

Create a new subscription via a fresh checkout session. The old subscription cannot be "un-cancelled" - it's closed.

```javascript
const checkoutUrl = await createSubscriptionCheckout({
  userId,
  productId,
  email,
  name,
});
```

---

## 11. Testing Checklist

Before going live, verify these scenarios in test mode:

**Creation**

- [ ] Checkout completes → `subscription.active` webhook → access granted
- [ ] Checkout with `trial_period_days` → access granted immediately, billing delayed
- [ ] Checkout with declined card → `subscription.failed` webhook

**Renewal**

- [ ] Successful renewal → `subscription.renewed` + `payment.succeeded`
- [ ] Failed renewal → `subscription.on_hold` webhook
- [ ] Update payment method on on-hold → `payment.succeeded` + `subscription.active`

**Plan changes**

- [ ] Upgrade with `prorated_immediately` - charge amount matches preview
- [ ] Upgrade with `difference_immediately` - full price difference charged
- [ ] Upgrade with `full_immediately` - billing cycle resets
- [ ] Downgrade with `prorated_immediately` - credit applied to next renewal
- [ ] Plan change with failed payment + `prevent_change` - stays on old plan
- [ ] Plan change with failed payment + `apply_change` - moves to `on_hold`
- [ ] Adding addons during plan change
- [ ] Removing all addons (empty array)

**Cancellation**

- [ ] `cancel_at_next_billing_date: true` - access continues until `subscription.expired`
- [ ] `status: "cancelled"` - immediate cancellation, access revoked
- [ ] Reverse pending cancellation before period end
- [ ] Re-subscription after full cancellation (new subscription created)

**Webhook robustness**

- [ ] Signature verification rejects tampered payloads
- [ ] Duplicate webhook deliveries are idempotent (no double-grants)
- [ ] Handler returns 500 on failure → Dodo retries
- [ ] Handler survives out-of-order event delivery

---

## 12. Production Best Practices

**Webhooks**

- Verify signatures with a Standard Webhooks library. Don't roll your own.
- Process webhook work in a queue (e.g., BullMQ, SQS). Your endpoint should only verify, dedupe, enqueue, and return 200 fast.
- Log every webhook with its full payload for debugging. Retention of 30–90 days is usually enough.
- Alert on repeated `subscription.on_hold` or `payment.failed` events.

**State management**

- The webhook handler is the only writer for subscription status. Never mutate status from API response paths.
- On startup, consider a reconciliation job that fetches each non-terminal subscription from Dodo and compares with your DB.
- Store the raw webhook `event.id` alongside every state change for audit.

**User experience**

- Always show the preview charge before executing a plan change.
- For cancellation, default to `cancel_at_next_billing_date: true`. Customers expect to retain access through the period they paid for.
- Send transactional emails on: activation, renewal, on-hold, plan change, cancellation scheduled, expiration.

**Security**

- Keep `DODO_WEBHOOK_SECRET` in a secret manager, not in source control.
- Scope API keys as narrowly as permissions allow.
- Rotate keys annually, or after any incident.

---

## 13. Reference: API Endpoints & Webhook Events

### Endpoints used in this guide

| Action                     | Method + Path                                    | SDK                                     |
| -------------------------- | ------------------------------------------------ | --------------------------------------- |
| Create checkout session    | `POST /checkouts`                                | `client.checkoutSessions.create`        |
| Preview plan change        | `POST /subscriptions/{id}/change-plan/preview`   | `client.subscriptions.previewChangePlan` |
| Change plan                | `POST /subscriptions/{id}/change-plan`           | `client.subscriptions.changePlan`       |
| Update payment method      | `POST /subscriptions/{id}/update-payment-method` | `client.subscriptions.updatePaymentMethod` |
| Update subscription (cancel, etc.) | `PATCH /subscriptions/{id}`              | `client.subscriptions.update`           |
| Get subscription           | `GET /subscriptions/{id}`                        | `client.subscriptions.retrieve`         |

### All subscription webhook events

| Event                       | Fires when                                                       |
| --------------------------- | ---------------------------------------------------------------- |
| `subscription.active`       | Subscription successfully activated                              |
| `subscription.updated`      | Any field on the subscription changed                            |
| `subscription.renewed`      | Renewal charge succeeded and next cycle started                  |
| `subscription.on_hold`      | Renewal or plan-change charge failed; auto-renewal paused        |
| `subscription.plan_changed` | Plan was upgraded, downgraded, or addons modified                |
| `subscription.cancelled`    | Subscription cancelled (immediate or scheduled)                  |
| `subscription.failed`       | Initial mandate creation failed                                  |
| `subscription.expired`      | Subscription reached end of term (post-cancel or natural expiry) |

### Relevant payment webhooks

| Event               | Fires when                          |
| ------------------- | ----------------------------------- |
| `payment.succeeded` | Any payment (initial, renewal, plan change, on-hold recovery) succeeded |
| `payment.failed`    | Any payment failed                  |

---

## Further reading

- Dodo docs: Subscription Integration Guide - `/developer-resources/subscription-integration-guide`
- Dodo docs: Subscription Upgrade & Downgrade Guide - `/developer-resources/subscription-upgrade-downgrade`
- Dodo docs: Checkout Sessions - `/developer-resources/checkout-session`
- Dodo docs: Webhooks - `/developer-resources/webhooks`
- Dodo docs: On-Demand Subscriptions - `/developer-resources/ondemand-subscriptions` (for metered/flexible charging)
- Dodo docs: Customer Portal - `/features/customer-portal` (lets customers self-serve cancellation and plan changes without you building UI)
