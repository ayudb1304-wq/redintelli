# API Routes Documentation

## Authentication

All protected routes require a valid Supabase session. The session is automatically handled via cookies by `@supabase/ssr`.

## Routes Overview

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/subreddits/discover` | Required | Discover relevant subreddits |
| GET | `/api/subreddits/search` | Optional | Search subreddit database |
| POST | `/api/briefs/generate` | Required | Generate audience brief |
| GET | `/api/briefs` | Required | List user's briefs |
| GET | `/api/briefs/[id]` | Required | Get specific brief |
| DELETE | `/api/briefs/[id]` | Required | Delete brief |
| GET | `/api/monitoring/feeds` | Required | Get tracked subreddits |
| POST | `/api/monitoring/feeds` | Required | Add tracked subreddit |
| DELETE | `/api/monitoring/feeds/[id]` | Required | Remove tracked subreddit |
| POST | `/api/monitoring/digest` | Required | Generate digest preview |
| POST | `/api/webhooks/dodo` | Webhook | Handle Dodo payment events |
| GET | `/api/auth/callback` | N/A | Supabase auth callback |

---

## Subreddit Discovery

### POST `/api/subreddits/discover`

Discover relevant subreddits based on product description.

#### Request Schema

```typescript
import { z } from 'zod';

export const DiscoverRequestSchema = z.object({
  product_description: z.string().min(20).max(2000),
  target_audience: z.string().max(500).optional(),
  exclude_subreddits: z.array(z.string()).max(20).optional(),
  min_subscribers: z.number().min(100).default(1000),
  max_results: z.number().min(5).max(30).default(15),
});

type DiscoverRequest = z.infer<typeof DiscoverRequestSchema>;
```

#### Example Request

```json
{
  "product_description": "A Reddit audience research tool that helps indie hackers understand what subreddit communities care about, their pain points, and how to craft messages that resonate. Built for founders who want to market on Reddit without getting banned.",
  "target_audience": "Solo founders, indie hackers, SaaS developers who want to find customers on Reddit",
  "min_subscribers": 5000,
  "max_results": 15
}
```

#### Response Schema

```typescript
export const DiscoverResponseSchema = z.object({
  session_id: z.string().uuid(),
  subreddits: z.array(z.object({
    subreddit_id: z.string(),
    display_name: z.string(),
    title: z.string(),
    subscribers: z.number(),
    relevance_score: z.number().min(0).max(100),
    reasoning: z.string(),
    audience_overlap: z.enum(['high', 'medium', 'low']),
    promo_tolerance: z.enum(['none', 'low', 'medium', 'high']),
  })),
  tokens_used: z.number(),
});
```

#### Example Response

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "subreddits": [
    {
      "subreddit_id": "indiehackers",
      "display_name": "indiehackers",
      "title": "Indie Hackers",
      "subscribers": 45000,
      "relevance_score": 95,
      "reasoning": "Core audience of solo founders building products. Highly receptive to tools that help with marketing and growth. Active discussions about Reddit marketing strategies.",
      "audience_overlap": "high",
      "promo_tolerance": "high"
    },
    {
      "subreddit_id": "saas",
      "display_name": "SaaS",
      "title": "Software as a Service",
      "subscribers": 85000,
      "relevance_score": 88,
      "reasoning": "SaaS founders frequently discuss customer acquisition channels. Reddit marketing is a recurring topic. Moderate self-promotion allowed with value-add.",
      "audience_overlap": "high",
      "promo_tolerance": "medium"
    }
  ],
  "tokens_used": 2450
}
```

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `invalid_request` | Request validation failed |
| 401 | `unauthorized` | No valid session |
| 429 | `rate_limited` | Too many requests |
| 500 | `generation_failed` | Claude API error |

---

## Brief Generation

### POST `/api/briefs/generate`

Generate an audience brief for a subreddit.

#### Request Schema

```typescript
export const GenerateBriefRequestSchema = z.object({
  subreddit_id: z.string().min(1).max(50),
  force_refresh: z.boolean().default(false), // Ignore cache
});
```

#### Example Request

```json
{
  "subreddit_id": "buildinpublic",
  "force_refresh": false
}
```

#### Response Schema

```typescript
export const BriefResponseSchema = z.object({
  id: z.string().uuid(),
  subreddit_id: z.string(),
  is_cached: z.boolean(),
  content: z.object({
    snapshot: z.string(),
    pain_points: z.array(z.object({
      title: z.string(),
      intensity: z.number().min(1).max(5),
      frequency: z.string(),
      quote: z.string(),
    })),
    language_patterns: z.array(z.object({
      user_says: z.string(),
      not_say: z.string(),
      context: z.string(),
    })),
    content_strategy: z.object({
      what_works: z.array(z.string()),
      what_fails: z.array(z.string()),
      best_times: z.object({
        days: z.array(z.string()),
        hours: z.string(),
      }),
    }),
    mentioned_products: z.array(z.object({
      name: z.string(),
      mentions: z.string(),
      sentiment: z.enum(['positive', 'mixed', 'negative', 'neutral']),
    })),
    rules_summary: z.object({
      promo_allowed: z.boolean(),
      key_rules: z.array(z.string()),
      enforcement_level: z.enum(['strict', 'moderate', 'light']),
    }),
    next_steps: z.array(z.string()),
    metadata: z.object({
      posts_analyzed: z.number(),
      comments_analyzed: z.number(),
      date_range: z.string(),
    }),
  }),
  created_at: z.string().datetime(),
});
```

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `invalid_subreddit` | Subreddit not found |
| 401 | `unauthorized` | No valid session |
| 403 | `limit_exceeded` | Monthly brief limit reached |
| 500 | `generation_failed` | Claude API error |

---

## Brief Management

### GET `/api/briefs`

List user's generated briefs.

#### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 50) |
| `sort` | string | `created_at` | Sort field |
| `order` | string | `desc` | Sort order |

#### Example Response

```json
{
  "briefs": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "subreddit_id": "buildinpublic",
      "subreddit_display_name": "buildinpublic",
      "created_at": "2026-04-15T10:30:00Z",
      "is_cached": false
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

### GET `/api/briefs/[id]`

Get a specific brief by ID.

### DELETE `/api/briefs/[id]`

Delete a specific brief.

---

## Monitoring

### GET `/api/monitoring/feeds`

Get user's tracked subreddits.

#### Example Response

```json
{
  "tracked": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "subreddit_id": "saas",
      "keywords": ["project management", "productivity tool", "task management"],
      "min_intent_score": 40,
      "notify_email": true,
      "notify_digest": true,
      "is_active": true,
      "last_checked_at": "2026-04-16T08:00:00Z",
      "unread_count": 3
    }
  ],
  "limits": {
    "used": 3,
    "max": 10
  }
}
```

### POST `/api/monitoring/feeds`

Add a subreddit to monitoring.

#### Request Schema

```typescript
export const AddFeedRequestSchema = z.object({
  subreddit_id: z.string().min(1).max(50),
  keywords: z.array(z.string().max(50)).min(1).max(10),
  min_intent_score: z.number().min(0).max(100).default(0),
  notify_email: z.boolean().default(true),
  notify_digest: z.boolean().default(true),
});
```

---

## Dodo Payments Webhook

### POST `/api/webhooks/dodo`

Handle Dodo payment webhook events.

#### Headers

```
X-Dodo-Signature: <webhook_signature>
```

#### Event Types

| Event | Action |
|-------|--------|
| `subscription.created` | Update user to paid tier |
| `subscription.updated` | Update tier/limits |
| `subscription.canceled` | Downgrade to free at period end |
| `payment.failed` | Mark subscription as past_due |

#### Webhook Handler Implementation

```typescript
// app/api/webhooks/dodo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyDodoWebhook } from '@/lib/dodo/webhooks';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('X-Dodo-Signature');
  
  // Verify webhook signature
  const isValid = verifyDodoWebhook(body, signature);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = JSON.parse(body);
  const supabase = createClient();
  
  switch (event.type) {
    case 'subscription.created':
      await handleSubscriptionCreated(supabase, event.data);
      break;
    case 'subscription.updated':
      await handleSubscriptionUpdated(supabase, event.data);
      break;
    case 'subscription.canceled':
      await handleSubscriptionCanceled(supabase, event.data);
      break;
    case 'payment.failed':
      await handlePaymentFailed(supabase, event.data);
      break;
  }
  
  // Store event for debugging
  await supabase.from('payment_events').insert({
    dodo_event_id: event.id,
    event_type: event.type,
    payload: event.data,
  });
  
  return NextResponse.json({ received: true });
}

async function handleSubscriptionCreated(supabase, data) {
  const userId = data.metadata.user_id;
  const tier = data.price_id === process.env.DODO_PRICE_ID_PRO ? 'pro' : 'starter';
  
  const limits = {
    starter: { briefs: 10, subreddits: 10 },
    pro: { briefs: -1, subreddits: 50 }, // -1 = unlimited
  };
  
  await supabase.from('profiles').update({
    subscription_tier: tier,
    subscription_status: 'active',
    dodo_customer_id: data.customer_id,
    dodo_subscription_id: data.subscription_id,
    subscription_current_period_end: data.current_period_end,
    briefs_limit: limits[tier].briefs,
    tracked_subreddits_limit: limits[tier].subreddits,
  }).eq('id', userId);
}
```

---

## Rate Limiting

All API routes implement rate limiting:

| Route Type | Limit |
|------------|-------|
| Discovery | 10 requests / hour |
| Brief generation | 5 requests / hour |
| General API | 60 requests / minute |

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1618884000
```

---

## Error Response Format

All errors follow a consistent format:

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
```

Example:

```json
{
  "error": {
    "code": "limit_exceeded",
    "message": "You have reached your monthly brief limit. Upgrade to Pro for unlimited briefs.",
    "details": {
      "used": 2,
      "limit": 2,
      "resets_at": "2026-05-01T00:00:00Z"
    }
  }
}
```
