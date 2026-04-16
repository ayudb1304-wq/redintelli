# Development Tasks

## Pre-Development Setup (2-3 hours)

### Accounts & Services
- [x] Create Supabase project (free tier)
- [x] Get Anthropic API key (Claude)
- [x] Create Dodo Payments account and get API keys
- [x] Create Resend account for transactional emails
- [x] Create Vercel account and connect to GitHub repo

### Local Environment
- [x] Clone/setup Next.js + shadcn/ui template
- [x] Install Supabase dependencies (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] Install remaining dependencies (`@anthropic-ai/sdk`, `zod`, `rss-parser`, `date-fns`)
- [x] Set up environment variables (`.env.local` configured with all keys)
- [x] Create Supabase client helpers (`lib/supabase/server.ts`, `client.ts`, `middleware.ts`)
- [x] Create auth middleware (`middleware.ts`)
- [x] Supabase CLI initialized (`npx supabase init`)
- [x] Migration file created (`supabase/migrations/001_initial_schema.sql`)
- [x] Run migration SQL in Supabase SQL Editor (001 + 002)

---

## Weekend 1: Foundation + Subreddit Discovery

### Phase 0: shadcn/ui Components
- [x] Install components: card, input, textarea, label, separator, skeleton, badge, avatar, dropdown-menu, sheet, sidebar, tooltip
- [x] Add `TooltipProvider` to root layout

### Phase 1: Auth System
- [x] Auth callback route (`app/api/auth/callback/route.ts`)
- [x] Login page with email/password + Google OAuth (`app/(marketing)/login/page.tsx`)
- [x] Signup page with email/password + Google OAuth (`app/(marketing)/signup/page.tsx`)
- [x] Login form component (`components/auth/login-form.tsx`)
- [x] Signup form component (`components/auth/signup-form.tsx`)
- [x] `useUser` hook (`hooks/use-user.ts`)
- [x] Route protection in middleware (protected paths + auth page redirects)
- [x] Configure Supabase Auth URL + redirect URLs
- [x] Google OAuth provider enabled in Supabase

### Phase 2: Route Groups + App Layout
- [x] Marketing layout with top bar (`app/(marketing)/layout.tsx`)
- [x] App layout with auth check + profile fetch (`app/(app)/layout.tsx`)
- [x] App shell with SidebarProvider (`components/layout/app-shell.tsx`)
- [x] Sidebar nav: Dashboard, Discover, Briefs, Monitoring, Settings (`components/layout/app-sidebar.tsx`)
- [x] Header with user avatar dropdown + sign out (`components/layout/app-header.tsx`)
- [x] Sidebar collapses to icon mode (not hidden)
- [x] Placeholder dashboard page (`app/(app)/dashboard/page.tsx`)

### Phase 3: Types + Constants
- [x] App constants — tier limits, rate limits, API URLs, model ID (`lib/constants.ts`)
- [x] Arctic Shift types — Post, Comment, Subreddit, search options (`lib/arctic-shift/types.ts`)
- [x] Database types — all 7 tables + brief content sub-types (`types/database.ts`)

### Phase 4: Arctic Shift Client
- [x] `ArcticShiftClient` class (`lib/arctic-shift/client.ts`)
  - `searchSubreddits`, `getSubredditPosts`, `getSubredditComments`, `getSubredditMetadata`, `getCommentTree`

### Phase 5: Claude Client + Discovery Prompt
- [x] `generateWithClaude<T>()` wrapper (`lib/claude/client.ts`)
- [x] Discovery prompts + `DiscoveredSubreddit` type (`lib/claude/prompts/discover.ts`)
- [x] In-memory rate limiter (`lib/rate-limit.ts`)
- [x] Shared Zod schema + `DiscoverRequest` type (`lib/validations/discover.ts`)

### Phase 6: Subreddit Discovery Feature
- [x] Discovery API route (`app/api/subreddits/discover/route.ts`)
- [x] Discover page (`app/(app)/discover/page.tsx`)
- [x] Discover view orchestrator (`components/discover/discover-view.tsx`)
- [x] Discovery form (`components/discover/discovery-form.tsx`)
- [x] Subreddit result card (`components/discover/subreddit-card.tsx`)
- [x] Subreddit result list with sort + skeleton loading (`components/discover/subreddit-list.tsx`)

### Phase 7: Dashboard
- [x] Dashboard page with stats + quick actions + recent activity (`app/(app)/dashboard/page.tsx`)
- [x] Dashboard view component (`components/dashboard/dashboard-view.tsx`)

### Phase 8: Stub Pages
- [x] Briefs placeholder (`app/(app)/briefs/page.tsx`)
- [x] Monitoring placeholder (`app/(app)/monitoring/page.tsx`)
- [x] Settings placeholder (`app/(app)/settings/page.tsx`)

---

## Weekend 2: Audience Brief Generation

### Phase 9: Brief Generation Prompt + Validation
- [x] Brief generation prompts (`lib/claude/prompts/brief.ts`)
- [x] Shared Zod schema for brief requests (`lib/validations/brief.ts`)

### Phase 10: Brief Generation API
- [x] POST `/api/briefs/generate` route (`app/api/briefs/generate/route.ts`)
  - Auth + rate limit + usage limit check
  - Fetch posts + comments from Arctic Shift
  - Check for cached brief first
  - Call Claude with brief generation prompt
  - Store brief in `audience_briefs` table
  - Cache popular subreddit briefs (30-day TTL)
- [x] GET `/api/briefs` route — list user's briefs (`app/api/briefs/route.ts`)
- [x] GET/DELETE `/api/briefs/[id]` route (`app/api/briefs/[id]/route.ts`)

### Phase 11: Brief Display Components
- [x] `AudienceBriefView` — main brief layout (`components/briefs/audience-brief-view.tsx`)
- [x] `PainPointCard` — intensity dots visualization (`components/briefs/pain-point-card.tsx`)
- [x] `LanguagePattern` — say this / not that with context (`components/briefs/language-pattern.tsx`)
- [x] `ContentStrategy` — what works / what fails + best times (`components/briefs/content-strategy.tsx`)
- [x] `MentionedProducts` — product grid with sentiment badges (`components/briefs/mentioned-products.tsx`)
- [x] `RulesSummary` — promo rules with enforcement shield icons (`components/briefs/rules-summary.tsx`)

### Phase 12: Brief Pages + Discovery Integration
- [x] Briefs list page (`app/(app)/briefs/page.tsx`) — replaced stub
- [x] Single brief view page (`app/(app)/briefs/[id]/page.tsx`)
- [x] "Generate Brief" button on `SubredditCard` with loading + error states
- [x] Generates brief → redirects to `/briefs/[id]` view

---

## Weekend 3: Monitoring + Intelligence Layer

### Phase 13: RSS Parser + Intent Classification Prompts
- [x] RSS feed parser (`lib/rss/parser.ts`) — parse Reddit RSS, extract post IDs
- [x] Intent classification prompts (`lib/claude/prompts/intent.ts`) — single + batch + `IntentClassification` type
- [x] Zod schemas for monitoring requests (`lib/validations/monitoring.ts`)

### Phase 14: Monitoring API Routes
- [x] POST `/api/monitoring/feeds` — add tracked subreddit with limit check (`app/api/monitoring/feeds/route.ts`)
- [x] GET `/api/monitoring/feeds` — list tracked subreddits with unread counts
- [x] DELETE `/api/monitoring/feeds/[id]` — remove tracked subreddit (`app/api/monitoring/feeds/[id]/route.ts`)
- [x] POST `/api/monitoring/check` — fetch RSS, filter by keywords, batch classify intent with Claude, store matches (`app/api/monitoring/check/route.ts`)

### Phase 15: Daily Digest
- [x] Digest generation function (`lib/rss/digest.ts`) — fetch unread matches, sort by intent, summarize with Claude
- [x] Digest Claude prompt + types (`lib/claude/prompts/digest.ts`)
- [x] POST `/api/monitoring/digest` — generate/preview digest, Pro-only (`app/api/monitoring/digest/route.ts`)
- [x] Resend email template for daily digest (`lib/email/digest.ts`)

### Phase 16: Monitoring UI
- [x] Monitoring page — replaced stub (`app/(app)/monitoring/page.tsx`)
- [x] `MonitoringView` — orchestrator with feed/check/digest state (`components/monitoring/monitoring-view.tsx`)
- [x] `FeedManager` — tracked subreddits with keywords, unread badges, remove (`components/monitoring/feed-manager.tsx`)
- [x] `AddFeedForm` — subreddit input + keyword chips with Enter/Add (`components/monitoring/add-feed-form.tsx`)
- [x] `MatchedPostsList` — posts with intent score/label badges, external link, read/dismiss (`components/monitoring/matched-posts-list.tsx`)
- [x] `DigestPreview` — opportunities, trending topics, competitor mentions, stats (`components/monitoring/digest-preview.tsx`)

---

## Weekend 4: Payments + Launch

### Phase 17: Dodo Payments Integration
- [x] Dodo client library (`lib/dodo/client.ts`) — createCheckoutSession, getSubscription, cancelSubscription, createCustomerPortalSession
- [x] Webhook signature verification (`lib/dodo/webhooks.ts`)
- [x] Webhook handler route (`app/api/webhooks/dodo/route.ts`) — subscription.created/updated/canceled, payment.failed
- [x] Checkout API route (`app/api/checkout/route.ts`) — create checkout session for Starter/Pro

### Phase 18: Settings Page
- [x] Settings page — replaced stub (`app/(app)/settings/page.tsx`)
- [x] Profile section — avatar with initials, name, email
- [x] Subscription section — tier badge, status, period end, usage stats, upgrade buttons
- [x] Notification preferences — daily digest status (Pro badge or enabled)
- [x] Sign out button

### Phase 19: Pricing Page
- [x] Pricing page (`app/(marketing)/pricing/page.tsx`)
- [x] `PricingCard` component (`components/shared/pricing-card.tsx`) — Free / Starter ($29) / Pro ($59)
- [x] `PricingSection` reusable component (`components/shared/pricing-section.tsx`)
- [x] Checkout flow — upgrade button → `/api/checkout` → redirect to Dodo
- [x] Pricing link added to marketing nav

### Phase 20: Landing Page
- [x] Landing page — replaced placeholder (`app/page.tsx`)
- [x] Hero — "Understand any Reddit audience in 60 seconds" + GummySearch badge
- [x] How It Works — 3-step: Discover, Understand, Monitor
- [x] Sample brief preview — pain points, language patterns, content strategy, intent monitoring
- [x] Social proof — 1.8B+ posts, 60s generation, 100+ posts per brief
- [x] Pricing section — reuses `PricingSection` component
- [x] Final CTA + footer
- [x] SEO — global metadata in root layout (title, description, keywords, Open Graph, Twitter card, robots)

### Phase 21: Polish + Deploy
- [x] Typecheck — zero errors
- [x] Lint — zero warnings (fixed unused imports)
- [x] Production build — passes clean (26 routes)
- [x] SEO — robots.txt + sitemap.xml (`app/robots.ts`, `app/sitemap.ts`)
- [ ] Configure production environment variables in Vercel
- [ ] Deploy to Vercel production
- [ ] Set up custom domain
- [ ] Update Supabase Auth redirect URLs to production domain
- [ ] Update Dodo webhook URL to production domain

---

## Post-Launch Tasks

### Week 1 After Launch
- [ ] Monitor for bugs and fix quickly
- [ ] Respond to user feedback
- [ ] Post launch updates on Indie Hackers
- [ ] Create 2-3 audience briefs for popular niches (dogfooding)
- [ ] Share briefs as free content on Reddit

### Ongoing
- [ ] Monitor usage and costs
- [ ] A/B test pricing
- [ ] Add most-requested features
- [ ] Build affiliate/referral program

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|------------|
| Arctic Shift data outdated | RSS supplements with real-time posts |
| Claude API costs too high | Aggressive caching, batch processing |
| Supabase free tier limits | Monitor usage, upgrade if needed |
| Rate limits on RSS | Implement backoff, stagger checks |

### Business Risks
| Risk | Mitigation |
|------|------------|
| Low conversion rate | Offer day passes, lifetime deals |
| Users churn after 1 brief | Add ongoing monitoring value |
| Competition copies | Move fast, build community |
