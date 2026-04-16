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

### Goals
- RSS monitoring working
- Daily digest generation
- Intent classification on new posts

### Day 1 (Saturday) - 4-5 hours

#### Morning: RSS Parsing (2 hours)
- [ ] Set up RSS parser:
  ```typescript
  // lib/rss/parser.ts
  import Parser from 'rss-parser';
  
  export async function parseSubredditFeed(subredditId: string) {
    const parser = new Parser();
    const feed = await parser.parseURL(
      `https://www.reddit.com/r/${subredditId}/new.rss`
    );
    return feed.items.map(item => ({
      id: extractPostId(item.link),
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      // RSS doesn't include full content, just title/link
    }));
  }
  ```
- [ ] Create tracking management UI
- [ ] Implement `/api/monitoring/feeds` route
- [ ] Store tracked subreddits in database

#### Afternoon: Intent Classification (2-3 hours)
- [ ] Create Claude prompt for intent classification:
  ```typescript
  // lib/claude/prompts/intent.ts
  export const INTENT_CLASSIFICATION_PROMPT = `
  Classify this Reddit post's buyer intent for a {product_type} product.
  
  Post title: {title}
  Subreddit: r/{subreddit}
  
  Classify intent on a scale of 0-100:
  - 0-20: Just discussion, no buying intent
  - 21-40: Problem aware (describing a pain point)
  - 41-60: Solution seeking (asking for recommendations)
  - 61-80: Comparing options (evaluating specific solutions)
  - 81-100: Purchase ready (asking where to buy, pricing questions)
  
  Also provide:
  - intent_label: 'no_intent' | 'problem_aware' | 'solution_seeking' | 'comparing' | 'purchase_ready'
  - reasoning: 1 sentence explanation
  - keywords_matched: relevant keywords from the post
  
  Return as JSON.
  `;
  ```
- [ ] Batch classify new posts (to minimize API calls)
- [ ] Store matched posts in database

### Day 2 (Sunday) - 4-5 hours

#### Morning: Daily Digest (2-3 hours)
- [ ] Create digest generation function:
  ```typescript
  // lib/rss/digest.ts
  export async function generateDailyDigest(userId: string) {
    // Get user's tracked subreddits
    // Get unread matched posts from last 24h
    // Sort by intent score
    // Generate summary with Claude
    // Return formatted digest
  }
  ```
- [ ] Create digest email template (Resend)
- [ ] Set up Supabase Edge Function for scheduled execution
- [ ] Create `/api/monitoring/digest` for manual trigger/preview

#### Afternoon: Monitoring UI (2 hours)
- [ ] Create `/monitoring` page
- [ ] Build `FeedManager` component (add/remove tracked subreddits)
- [ ] Build `DigestPreview` component
- [ ] Build `MatchedPostsList` component with intent badges
- [ ] Add notification settings

### Weekend 3 Deliverable
- [ ] User can track subreddits and set keywords
- [ ] New posts are classified by intent
- [ ] Daily digest email ready to send

---

## Weekend 4: Payments + Launch

### Goals
- Dodo Payments fully integrated
- Landing page polished
- Product Hunt ready

### Day 1 (Saturday) - 4-5 hours

#### Morning: Dodo Payments Integration (2-3 hours)
- [ ] Create Dodo products:
  - Starter: $29/month
  - Pro: $59/month
- [ ] Implement Dodo client:
  ```typescript
  // lib/dodo/client.ts
  export async function createCheckoutSession(
    userId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    const response = await fetch('https://api.dodopayments.com/v1/checkout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DODO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_email: userEmail,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { user_id: userId },
      }),
    });
    return response.json();
  }
  ```
- [ ] Create webhook handler `/api/webhooks/dodo`:
  ```typescript
  // Handle events:
  // - subscription.created
  // - subscription.updated
  // - subscription.canceled
  // - payment.failed
  ```
- [ ] Update user profile on subscription changes
- [ ] Test checkout flow end-to-end

#### Afternoon: Pricing Page (2 hours)
- [ ] Create `/pricing` page
- [ ] Build `PricingCard` components:
  - Free: 2 briefs/month, 3 tracked subreddits
  - Starter ($29): 10 briefs/month, 10 tracked subreddits
  - Pro ($59): Unlimited briefs, 50 tracked subreddits, daily digest
- [ ] Add upgrade flow from dashboard
- [ ] Add usage display in settings
- [ ] Handle subscription management (cancel, update)

### Day 2 (Sunday) - 4-5 hours

#### Morning: Landing Page (2-3 hours)
- [ ] Create compelling landing page:
  - Hero: "Understand any Reddit audience in 60 seconds"
  - Pain point: "GummySearch is gone. Here's what's next."
  - Demo: Interactive brief preview (use sample data)
  - Social proof: Placeholder for testimonials
  - Pricing section
  - CTA: "Generate your first brief free"
- [ ] Add SEO meta tags
- [ ] Add OG image for social sharing

#### Afternoon: Polish & Deploy (2 hours)
- [ ] Test all flows end-to-end
- [ ] Fix any bugs
- [ ] Set up error monitoring (Sentry)
- [ ] Set up analytics (Plausible or PostHog)
- [ ] Configure production environment variables
- [ ] Deploy to Vercel
- [ ] Set up custom domain
- [ ] Prepare Product Hunt assets:
  - [ ] Tagline
  - [ ] Description
  - [ ] Screenshots
  - [ ] Maker comment

### Weekend 4 Deliverable
- [ ] Full product live and functional
- [ ] Payments working
- [ ] Ready for Product Hunt launch

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
