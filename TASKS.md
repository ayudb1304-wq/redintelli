# Development Tasks

## Pre-Development Setup (2-3 hours)

### Accounts & Services
- [ ] Create Supabase project (free tier)
- [ ] Get Anthropic API key (Claude)
- [ ] Create Dodo Payments account and get API keys
- [ ] Create Resend account for transactional emails
- [ ] Create Vercel account (if not existing)

### Local Environment
- [ ] Clone/setup Next.js + shadcn/ui template
- [ ] Install additional dependencies:
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  npm install @anthropic-ai/sdk
  npm install zod
  npm install rss-parser
  npm install date-fns
  npm install lucide-react
  ```
- [ ] Set up environment variables (copy from `.env.example`)
- [ ] Initialize Supabase CLI: `npx supabase init`
- [ ] Link to Supabase project: `npx supabase link`

---

## Weekend 1: Foundation + Subreddit Discovery

### Goals
- Database schema deployed
- Supabase Auth working
- Subreddit discovery MVP functional
- Free tool live to start collecting users

### Day 1 (Saturday) - 4-5 hours

#### Morning: Database & Auth (2 hours)
- [ ] Create database tables (run migrations from DATABASE.md)
- [ ] Set up Supabase Auth with email/password
- [ ] Create auth callback route `/api/auth/callback`
- [ ] Set up middleware for protected routes
- [ ] Test signup/login flow

#### Afternoon: Subreddit Data (2-3 hours)
- [ ] Download Arctic Shift subreddit metadata
  - Source: https://huggingface.co/datasets/open-index/arctic
  - Focus on: top 100K subreddits by subscribers
- [ ] Write script to parse and import into Supabase
- [ ] Verify data imported correctly
- [ ] Add full-text search index

### Day 2 (Sunday) - 4-5 hours

#### Morning: Discovery API (2-3 hours)
- [ ] Create `/api/subreddits/discover` route
- [ ] Implement Claude prompt for subreddit matching:
  ```typescript
  // lib/claude/prompts/discover.ts
  export const DISCOVER_PROMPT = `
  You are a Reddit expert helping founders find relevant subreddits for their product.
  
  Given this product description:
  {product_description}
  
  And this target audience (optional):
  {target_audience}
  
  Search through the provided subreddit data and return the 15-20 most relevant subreddits.
  
  For each subreddit, provide:
  1. subreddit_id (the subreddit name, lowercase)
  2. relevance_score (0-100)
  3. reasoning (1-2 sentences on why this subreddit fits)
  4. audience_overlap (high/medium/low)
  5. promo_friendly (boolean - based on rules/culture)
  
  Return as JSON array. Prioritize:
  - Subreddits where the target audience actively discusses related problems
  - Subreddits with history of accepting product/tool recommendations
  - Smaller niche subreddits over huge general ones (quality over quantity)
  `;
  ```
- [ ] Add input validation with Zod
- [ ] Handle rate limiting

#### Afternoon: Discovery UI (2 hours)
- [ ] Create `/discover` page
- [ ] Build `DiscoveryForm` component (product description textarea)
- [ ] Build `SubredditCard` component (display results)
- [ ] Build `SubredditList` component (sortable results)
- [ ] Connect to API and display results
- [ ] Add loading states and error handling

### Weekend 1 Deliverable
- [ ] Functional subreddit discovery tool
- [ ] User can sign up, enter product description, get subreddit recommendations
- [ ] Deploy to Vercel for testing

---

## Weekend 2: Audience Brief Generation

### Goals
- Full audience brief generation working
- Brief display component polished
- Caching implemented for popular subreddits

### Day 1 (Saturday) - 4-5 hours

#### Morning: Arctic Shift Integration (2 hours)
- [ ] Set up Arctic Shift data fetching
  - Option A: Download relevant subreddit posts to Supabase
  - Option B: Query Arctic Shift API on-demand (slower but no storage)
- [ ] Create helper functions:
  ```typescript
  // lib/arctic-shift/client.ts
  export async function getSubredditPosts(
    subredditId: string,
    options: {
      limit?: number;
      after?: string; // timestamp
      before?: string;
    }
  ): Promise<RedditPost[]>
  
  export async function getSubredditComments(
    subredditId: string,
    options: { limit?: number }
  ): Promise<RedditComment[]>
  ```
- [ ] Test data retrieval for sample subreddits

#### Afternoon: Brief Generation API (2-3 hours)
- [ ] Create `/api/briefs/generate` route
- [ ] Implement Claude prompt for brief generation:
  ```typescript
  // lib/claude/prompts/brief.ts
  export const BRIEF_GENERATION_PROMPT = `
  You are an expert Reddit analyst. Analyze these posts and comments from r/{subreddit} and generate a comprehensive audience brief.
  
  Posts data:
  {posts_json}
  
  Comments data:
  {comments_json}
  
  Generate a structured brief with:
  
  1. SNAPSHOT: 2-3 sentence summary of who this audience is, what they care about, and their relationship with promotional content.
  
  2. PAIN_POINTS: Identify 4-6 recurring pain points. For each:
     - title: Clear problem name
     - intensity: 1-5 (how much does this bother them)
     - frequency: How often mentioned (daily/weekly/monthly)
     - quote: A real quote from the data (anonymized)
  
  3. LANGUAGE_PATTERNS: 4-6 patterns of how users speak. For each:
     - user_says: Phrases they actually use
     - not_say: Corporate/formal equivalent that sounds off
     - context: Why this matters
  
  4. CONTENT_STRATEGY:
     - what_works: 4-5 content types that get engagement
     - what_fails: 4-5 content types that get ignored/downvoted
     - best_times: Best days and hours to post (analyze post timestamps)
  
  5. MENTIONED_PRODUCTS: Products/tools frequently mentioned
     - name, mention frequency, sentiment
  
  6. RULES_SUMMARY:
     - promo_allowed: boolean
     - key_rules: Main rules affecting promotional content
     - enforcement_level: strict/moderate/light
  
  7. NEXT_STEPS: 4 specific, actionable recommendations for a founder wanting to engage this community
  
  Return as valid JSON matching this schema exactly.
  `;
  ```
- [ ] Add brief storage in Supabase
- [ ] Implement usage limit checking

### Day 2 (Sunday) - 4-5 hours

#### Morning: Brief Display Component (2-3 hours)
- [ ] Create `AudienceBrief` component (use sample from mockup)
- [ ] Create sub-components:
  - `PainPointCard` with intensity visualization
  - `LanguagePattern` with say/don't say
  - `ContentStrategy` with what works/fails
  - `MentionedProducts` grid
  - `RulesSummary` with color-coded rules
- [ ] Add collapsible sections
- [ ] Add copy/download functionality

#### Afternoon: Brief Pages (2 hours)
- [ ] Create `/briefs` page (list user's briefs)
- [ ] Create `/briefs/[id]` page (view single brief)
- [ ] Add "Generate Brief" flow from discovery results
- [ ] Implement caching for popular subreddits:
  ```typescript
  // Check if cached brief exists and is fresh
  const cachedBrief = await supabase
    .from('audience_briefs')
    .select('*')
    .eq('subreddit_id', subredditId)
    .eq('is_cached', true)
    .gt('cache_expires_at', new Date().toISOString())
    .single();
  ```
- [ ] Add loading/generating states

### Weekend 2 Deliverable
- [ ] User can generate audience brief for any discovered subreddit
- [ ] Briefs are beautifully displayed with all sections
- [ ] Popular subreddit briefs are cached to reduce API costs

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
