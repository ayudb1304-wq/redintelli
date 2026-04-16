export const AUDIENCE_BRIEF_SYSTEM_PROMPT = `You are an expert Reddit analyst who helps founders understand online communities deeply. You analyze Reddit posts and comments to extract actionable audience intelligence.

Your briefs help founders:
- Understand what really matters to a community
- Speak the community's language (not marketing speak)
- Create content that resonates and gets engagement
- Avoid common mistakes that lead to downvotes or bans

Be specific and practical. Use real quotes. Give actionable advice.`;

export const AUDIENCE_BRIEF_USER_PROMPT = `Analyze this Reddit data from r/{subreddit_name} and generate a comprehensive audience brief.

**Posts (newest first):**
{posts_json}

**Top Comments:**
{comments_json}

**Subreddit Metadata:**
- Subscribers: {subscribers}
- Description: {description}
- Rules: {rules_json}

Generate a structured audience brief with these exact sections:

## OUTPUT FORMAT (return as valid JSON):

{
  "snapshot": "2-3 sentence summary of WHO this audience is, WHAT they care about, and their relationship with products/promotions",

  "pain_points": [
    {
      "title": "Clear problem name",
      "intensity": 1-5,
      "frequency": "daily | weekly | monthly",
      "quote": "Exact quote from the data (anonymize usernames)",
      "context": "Brief context on when/why this pain occurs"
    }
  ],

  "language_patterns": [
    {
      "user_says": "Phrase they actually use",
      "not_say": "Corporate/formal equivalent that sounds off",
      "context": "Why this distinction matters"
    }
  ],

  "content_strategy": {
    "what_works": [
      "Specific content type with example"
    ],
    "what_fails": [
      "Specific content type that gets ignored/downvoted"
    ],
    "best_times": {
      "days": ["Tuesday", "Thursday"],
      "hours": "8-10am EST or 6-8pm EST",
      "reasoning": "Why these times work"
    },
    "ideal_post_format": "Describe the ideal post structure"
  },

  "mentioned_products": [
    {
      "name": "Product name",
      "mentions": "high | medium | low",
      "sentiment": "positive | mixed | negative | neutral",
      "context": "How/why it's discussed"
    }
  ],

  "rules_summary": {
    "promo_allowed": true,
    "key_rules": ["Most important rules affecting promotional content"],
    "enforcement_level": "strict | moderate | light",
    "workarounds": "Acceptable ways to mention products if promo is restricted"
  },

  "next_steps": [
    "Specific, actionable recommendation with example"
  ],

  "metadata": {
    "posts_analyzed": 100,
    "comments_analyzed": 500,
    "date_range": "March 2025 - April 2026"
  }
}

Requirements:
- Include 4-6 pain points, ranked by intensity
- Include 4-6 language patterns that distinguish insiders from outsiders
- Include 4-5 items each for what_works and what_fails
- Include 4-6 mentioned products
- Include 4 specific next_steps with concrete examples
- All quotes must be real quotes from the data (you can edit for clarity but preserve meaning)
- next_steps should reference specific subreddit context

Return valid JSON only, no markdown formatting.`;
