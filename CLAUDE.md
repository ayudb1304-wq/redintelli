# Reddit Audience Intelligence Platform

## Project Overview

A Reddit audience research tool that helps indie hackers and startup founders discover relevant subreddits, understand what those communities care about, and craft messages that resonate. This fills the gap left by GummySearch's November 2025 shutdown.

**Core Value Proposition:** AI-powered audience briefs that tell you what a subreddit's users actually struggle with, desire, and respond to — faster than manually reading thousands of posts.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **UI:** shadcn/ui + Tailwind CSS
- **Database:** Supabase (PostgreSQL + Auth + Edge Functions)
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Payments:** Dodo Payments (https://dodopayments.com)
- **Data Source:** Arctic Shift Reddit Archive (Hugging Face)
- **Hosting:** Vercel (free tier)
- **Email:** Resend (for daily digests)

## Project Structure

```
/app
  /api
    /briefs
      /generate/route.ts      # Generate audience brief for a subreddit
      /[id]/route.ts          # Get/update specific brief
    /subreddits
      /discover/route.ts      # AI-powered subreddit discovery
      /search/route.ts        # Search subreddit database
    /monitoring
      /feeds/route.ts         # RSS feed parsing
      /digest/route.ts        # Generate daily digest
    /webhooks
      /dodo/route.ts          # Dodo Payments webhooks
    /auth
      /callback/route.ts      # Supabase auth callback
  /(marketing)
    /page.tsx                 # Landing page
    /pricing/page.tsx         # Pricing page
  /(app)
    /dashboard/page.tsx       # Main dashboard
    /discover/page.tsx        # Subreddit discovery tool
    /briefs/page.tsx          # Saved audience briefs
    /briefs/[id]/page.tsx     # Individual brief view
    /monitoring/page.tsx      # RSS monitoring setup
    /settings/page.tsx        # Account settings
  /layout.tsx
  /globals.css

/components
  /ui                         # shadcn/ui components
  /briefs
    /AudienceBrief.tsx        # Main brief display component
    /PainPointCard.tsx        # Pain point with intensity meter
    /LanguagePattern.tsx      # Say this/not that component
    /ContentStrategy.tsx      # What works/doesn't work
  /discover
    /DiscoveryForm.tsx        # Product description input
    /SubredditCard.tsx        # Subreddit recommendation card
    /SubredditList.tsx        # List of discovered subreddits
  /monitoring
    /FeedManager.tsx          # Manage RSS feeds
    /DigestPreview.tsx        # Preview daily digest
  /shared
    /Header.tsx
    /Sidebar.tsx
    /PricingCard.tsx
    /UsageLimit.tsx

/lib
  /supabase
    /client.ts                # Supabase browser client
    /server.ts                # Supabase server client
    /middleware.ts            # Auth middleware
  /arctic-shift
    /client.ts                # Arctic Shift API client
    /types.ts                 # Type definitions
  /claude
    /client.ts                # Claude API wrapper
    /prompts
      /discover.ts            # Subreddit discovery prompts
      /brief.ts               # Audience brief generation prompts
      /intent.ts              # Intent classification prompts
  /dodo
    /client.ts                # Dodo Payments client
    /webhooks.ts              # Webhook handlers
  /rss
    /parser.ts                # RSS feed parser
    /scheduler.ts             # Cron job for feed checking
  /utils.ts
  /constants.ts

/types
  /database.ts                # Supabase generated types
  /briefs.ts                  # Brief-related types
  /subreddits.ts              # Subreddit types
```

## Database Schema (Supabase)

See `DATABASE.md` for complete schema.

## Key Features by Priority

### P0 - MVP (Weekends 1-4)
1. Subreddit discovery from product description
2. Audience brief generation for any subreddit
3. User authentication (Supabase Auth)
4. Basic usage limits (free tier: 2 briefs, paid: unlimited)
5. Dodo Payments integration
6. Landing page

### P1 - Post-Launch
1. RSS monitoring for tracked subreddits
2. Daily digest emails
3. Intent classification on new posts
4. Saved briefs library
5. Brief comparison view

### P2 - Growth
1. Team accounts
2. API access
3. Chrome extension
4. Slack/Discord integration

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Generate Supabase types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

# Run database migrations
npx supabase db push

# Deploy to Vercel
vercel deploy
```

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Claude API
ANTHROPIC_API_KEY=

# Dodo Payments
DODO_API_KEY=
DODO_WEBHOOK_SECRET=
NEXT_PUBLIC_DODO_PRODUCT_ID_STARTER=
NEXT_PUBLIC_DODO_PRODUCT_ID_PRO=

# Resend (for emails)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Coding Guidelines

1. **Use Server Components by default** - Only use 'use client' when needed for interactivity
2. **Keep API routes thin** - Business logic goes in /lib
3. **Type everything** - No `any` types
4. **Use Zod for validation** - All API inputs validated with Zod schemas
5. **Handle errors gracefully** - User-friendly error messages
6. **Cache Claude responses** - Audience briefs for popular subreddits should be cached
7. **Rate limit API routes** - Prevent abuse

## Testing Approach

- **Unit tests:** Vitest for lib functions
- **Integration tests:** Playwright for critical flows (signup → generate brief → upgrade)
- **Manual testing:** Each feature tested in staging before prod

## Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Supabase production project configured
- [ ] Dodo Payments webhooks pointing to production URL
- [ ] Domain configured
- [ ] Error monitoring (Sentry) set up
- [ ] Analytics (Plausible/PostHog) set up
