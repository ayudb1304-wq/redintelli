# Week 0: Validation Before Building

**Time Investment:** 4-6 hours over 1-2 days
**Goal:** Validate that people will pay for AI-powered Reddit audience intelligence before writing any code.

---

## The Core Assumption to Test

> "Indie hackers and startup founders will pay $29-59/month for AI-powered Reddit audience briefs when they could theoretically read the subreddits manually for free."

If this assumption is false, you should not build this product.

---

## Validation Method: Manual MVP

Create 3 audience briefs manually using existing tools, post them as free resources on Reddit, and measure response.

### Step 1: Generate Manual Briefs (2-3 hours)

#### Tools You'll Need
- **Arctic Shift Web Search:** https://arctic-shift.photon-reddit.com/
- **Claude:** https://claude.ai (free tier works)
- **Reddit:** For viewing live subreddits
- **Google Docs/Notion:** For organizing research

#### Niches to Research
Pick 3 popular indie hacker niches with active subreddits:

1. **Project Management SaaS**
   - Research: r/projectmanagement, r/agile, r/productivity
   
2. **AI Writing Tools**
   - Research: r/writing, r/copywriting, r/freelanceWriters
   
3. **Developer Tools**
   - Research: r/webdev, r/programming, r/SideProject

#### For Each Niche, Document:

**A. Audience Snapshot (2-3 sentences)**
- Who are these people?
- What's their relationship with products/tools?
- How do they feel about promotional content?

**B. Pain Points (4-5)**
For each pain point:
- Title
- Intensity (1-5)
- Frequency (how often mentioned)
- Real quote (copy from Reddit, anonymize username)

**C. Language Patterns (3-4)**
For each:
- What they actually say
- What sounds corporate/off
- Why it matters

**D. Content Strategy**
- 3-4 things that get engagement
- 3-4 things that get downvoted
- Best posting times (analyze post timestamps)

**E. Products They Mention**
- 5-6 products mentioned frequently
- Sentiment for each

**F. Next Steps**
- 4 specific recommendations for a founder entering this space

#### Template Prompt for Claude

Use this prompt to help analyze Reddit data:

```
I'm researching r/[subreddit] to understand the audience. Here are posts and comments I've collected:

[Paste 20-30 posts/comments from Arctic Shift]

Please analyze this data and extract:

1. AUDIENCE SNAPSHOT: 2-3 sentences on who these people are

2. PAIN POINTS: Identify 4-5 recurring problems. For each:
   - Clear title
   - Intensity (1-5)
   - How often it's mentioned
   - A representative quote

3. LANGUAGE PATTERNS: How do they talk? What insider terms do they use? What sounds fake/corporate?

4. WHAT GETS ENGAGEMENT: What types of posts get upvotes and comments?

5. WHAT FAILS: What gets ignored or downvoted?

6. PRODUCTS MENTIONED: What tools/products come up? What's the sentiment?

Format this as a structured brief I could share with founders.
```

### Step 2: Package the Briefs (30 mins)

Create a shareable format for each brief:
- **Option A:** Google Doc with nice formatting
- **Option B:** Notion page
- **Option C:** Simple markdown in a GitHub gist
- **Option D:** Screenshot of a mockup (use the React component we built)

Make it look valuable. Include:
- Clear sections with headers
- Visual elements (intensity dots, color coding)
- "Analyzed X posts and Y comments" for credibility
- Your name/contact (build personal brand)

### Step 3: Post on Reddit (1 hour)

#### Target Subreddits
- r/SaaS
- r/Entrepreneur  
- r/startups
- r/indiehackers
- r/SideProject

#### Post Templates

**Template A: Pure Value Post**
```
Title: I analyzed 10,000 Reddit posts about [niche] — here's what your potential customers are actually saying

Body:
I spent the weekend reading through thousands of Reddit posts and comments about [niche problem].

Here's what I learned about what people actually struggle with, the language they use, and what makes them engage vs. scroll past.

[Link to brief or embedded summary]

Key findings:
• [Pain point 1 - with real quote]
• [Pain point 2 - with real quote]  
• [Surprising insight]

Happy to do this for other niches if people find it useful.

What niche should I analyze next?
```

**Template B: Build-in-Public Angle**
```
Title: I'm building a GummySearch replacement — here's my first audience brief (free)

Body:
GummySearch shut down last year and left a gap. I'm exploring whether there's demand for AI-powered Reddit audience research.

Before I write any code, I manually created this audience brief for [niche] to see if the format is useful:

[Link to brief]

This took me ~2 hours manually. If I automate it, I could generate these in 60 seconds.

Questions:
1. Is this format useful for your Reddit marketing?
2. What would you want added/changed?
3. Would you pay $29/month for unlimited briefs like this?

Roast me or tell me what to build.
```

**Template C: Research Request**
```
Title: Would you pay for automated Reddit audience research? (building GummySearch alternative)

Body:
Quick background: GummySearch died, I'm exploring building a replacement focused specifically on audience intelligence (not lead gen or AI replies).

The core idea: You enter a product description, get:
1. Relevant subreddits ranked by fit
2. For each subreddit: pain points, language patterns, what content works, posting rules
3. Daily digest of high-intent posts

Here's a sample brief I created manually: [link]

Before I build this:
- Is this something you'd actually use?
- What would you pay? ($0 / $19 / $29 / $59)
- What's missing that would make you pay?

Not trying to sell anything, genuinely validating before building.
```

### Step 4: Measure Response (24-48 hours)

#### Success Metrics

| Signal | Weak | Moderate | Strong |
|--------|------|----------|--------|
| Upvotes | <10 | 10-50 | 50+ |
| Comments | <5 | 5-15 | 15+ |
| DMs asking for custom briefs | 0 | 1-2 | 3+ |
| "I'd pay for this" comments | 0 | 1-2 | 3+ |
| Email signups (if you add a form) | <5 | 5-15 | 15+ |

#### What Responses to Look For

**Strong Positive Signals:**
- "Can you do this for [my niche]?"
- "Shut up and take my money"
- "I'd pay $X for this"
- "This is exactly what I've been looking for"
- "GummySearch dying killed my workflow, this would help"
- DMs asking for access/pricing

**Moderate Signals:**
- "Cool resource, bookmarked"
- "Interesting data"
- "How did you collect this?"
- General engagement without purchase intent

**Negative Signals:**
- "I can just read the subreddit myself"
- "What's the point of this?"
- Low engagement, crickets
- "This is just ChatGPT wrapper"

### Step 5: Follow Up on Interest (30 mins)

For anyone who expresses interest:

1. **Reply publicly:** "Thanks! What niche would be most useful for you?"
2. **DM if they mention paying:** "Hey, I'm building this into a tool. Would you be interested in early access at a discount?"
3. **Collect emails:** Create a simple Tally/Typeform: "Get notified when this launches"

---

## Decision Framework

### ✅ BUILD if:
- 3+ people say "I'd pay for this"
- 5+ people ask "Can you do this for my niche?"
- 15+ email signups in 48 hours
- One of your posts gets 50+ upvotes and meaningful discussion

### ⏸️ PIVOT if:
- Moderate engagement but no purchase intent
- People like it but wouldn't pay
- "Nice but I can do this manually" feedback

Consider:
- Different positioning (monitoring vs research)
- Different audience (agencies vs founders)
- One-time reports instead of subscription

### ❌ DON'T BUILD if:
- Posts get ignored (< 10 upvotes, < 5 comments)
- Negative feedback ("useless", "why would I need this")
- Zero DMs or email signups
- Multiple posts across subreddits all flop

---

## Validation Artifacts to Save

Create a folder with:

```
/validation
  /briefs
    project-management-brief.md
    ai-writing-tools-brief.md
    developer-tools-brief.md
  /posts
    reddit-post-1-screenshot.png
    reddit-post-2-screenshot.png
    reddit-post-3-screenshot.png
  /responses
    interesting-comments.md
    dms-received.md
    email-signups.csv
  validation-summary.md
```

### validation-summary.md Template

```markdown
# Validation Summary

**Date:** [Date]
**Time Invested:** [X hours]

## Posts Made
| Subreddit | Title | Upvotes | Comments | Link |
|-----------|-------|---------|----------|------|
| r/SaaS | [title] | X | Y | [url] |

## Key Responses
### Positive
- [Quote + username]
- [Quote + username]

### Negative  
- [Quote + username]

### Neutral
- [Quote + username]

## Quantitative Results
- Total upvotes: X
- Total comments: Y
- DMs received: Z
- Email signups: W
- "Would pay" signals: N

## Decision
[ ] BUILD - Strong validation
[ ] PIVOT - Moderate interest, wrong angle
[ ] STOP - No market interest

## Notes for Build Phase
- [Key insight 1]
- [Key insight 2]
- [Feature request from comments]
```

---

## Timeline

| Day | Activity | Hours |
|-----|----------|-------|
| Day 1 AM | Create 3 manual briefs | 2-3 |
| Day 1 PM | Package and post on Reddit | 1-2 |
| Day 2 | Monitor, respond, collect signals | 1-2 |
| Day 3 AM | Compile results, make decision | 0.5 |

**Total: 4-7 hours before writing any code**

---

## If Validation Succeeds

Move to Weekend 1 with confidence:

1. You have proof people want this
2. You have 2-3 real briefs to use as examples
3. You have an email list of interested people
4. You have content to repurpose for launch
5. You've already started building your Reddit presence

---

## If Validation Fails

You saved 4 weekends of wasted effort. Consider:

1. **Different angle:** Maybe lead gen, not research
2. **Different market:** Maybe agencies, not founders
3. **Different product:** Maybe consulting, not SaaS
4. **Different problem:** Go back to pain point research

The goal isn't to validate your idea. The goal is to find the truth as fast as possible.
