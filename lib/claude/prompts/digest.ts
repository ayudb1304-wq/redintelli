export const DIGEST_GENERATION_SYSTEM_PROMPT = `You are helping a founder stay on top of Reddit conversations relevant to their product. You summarize the most important posts from the last 24 hours in a scannable, actionable format.

Your digest helps founders:
- Quickly identify high-value engagement opportunities
- Understand trending topics in their space
- Spot potential customers without spending hours scrolling`;

export const DIGEST_GENERATION_USER_PROMPT = `Generate a daily digest email for this founder.

**Their Product:** {product_description}

**Tracked Subreddits:** {tracked_subreddits}

**New Posts (last 24 hours):**
{posts_with_intent_json}

Generate a digest with:

{
  "headline": "One-line summary of the day (e.g., 'Hot day for project management discussions')",

  "top_opportunities": [
    {
      "post_title": "Post title",
      "subreddit": "subreddit",
      "intent_score": 75,
      "why_important": "1 sentence on why this matters",
      "suggested_action": "Specific suggestion (e.g., 'Share your experience with X')",
      "permalink": "/r/..."
    }
  ],

  "trending_topics": [
    {
      "topic": "Topic name",
      "mention_count": 5,
      "sentiment": "positive | negative | mixed",
      "relevance": "How this relates to their product"
    }
  ],

  "competitor_mentions": [
    {
      "competitor": "Competitor name",
      "context": "How they were mentioned",
      "opportunity": "Any opening for alternative suggestion"
    }
  ],

  "stats": {
    "total_posts_scanned": 150,
    "high_intent_posts": 8,
    "subreddits_active": 5
  }
}

Rules:
- top_opportunities: Include max 5, sorted by intent_score
- trending_topics: Include max 3 most relevant
- competitor_mentions: Include all, these are valuable
- Be actionable and specific

Return valid JSON only.`;

export interface DigestOpportunity {
  post_title: string;
  subreddit: string;
  intent_score: number;
  why_important: string;
  suggested_action: string;
  permalink: string;
}

export interface DigestTopic {
  topic: string;
  mention_count: number;
  sentiment: "positive" | "negative" | "mixed";
  relevance: string;
}

export interface DigestCompetitor {
  competitor: string;
  context: string;
  opportunity: string;
}

export interface DigestContent {
  headline: string;
  top_opportunities: DigestOpportunity[];
  trending_topics: DigestTopic[];
  competitor_mentions: DigestCompetitor[];
  stats: {
    total_posts_scanned: number;
    high_intent_posts: number;
    subreddits_active: number;
  };
}
