export const INTENT_CLASSIFICATION_SYSTEM_PROMPT = `You are an expert at identifying buyer intent in Reddit posts. You help founders find potential customers by classifying posts based on how likely the author is to purchase a solution.

Intent levels:
- 0-20: Discussion only, no buying intent
- 21-40: Problem aware (describing frustration but not seeking solutions)
- 41-60: Solution seeking (asking for recommendations)
- 61-80: Comparing options (evaluating specific solutions)
- 81-100: Purchase ready (asking about pricing, where to buy, specific features)`;

export const INTENT_CLASSIFICATION_USER_PROMPT = `Classify the buyer intent for this Reddit post.

**Product Context:** {product_description}

**Post:**
- Subreddit: r/{subreddit}
- Title: {title}
- Body: {selftext}

Return a JSON object:

{
  "intent_score": 0-100,
  "intent_label": "no_intent | problem_aware | solution_seeking | comparing | purchase_ready",
  "reasoning": "1-2 sentence explanation",
  "matched_keywords": ["relevant", "keywords", "from", "post"],
  "engagement_suggestion": "How to engage with this post helpfully (or null if not worth engaging)"
}

Rules:
- Be conservative - most posts are low intent
- Look for explicit signals: "looking for", "any recommendations", "which should I buy"
- Context matters: r/BuyItForLife has higher base intent than r/mildlyinteresting
- engagement_suggestion should be helpful, not salesy

Return valid JSON only.`;

export const BATCH_INTENT_CLASSIFICATION_PROMPT = `Classify buyer intent for multiple Reddit posts.

**Product Context:** {product_description}

**Posts:**
{posts_array_json}

For each post, return intent classification. Return as JSON array:

[
  {
    "post_id": "abc123",
    "intent_score": 65,
    "intent_label": "solution_seeking",
    "reasoning": "Asking for tool recommendations",
    "matched_keywords": ["recommendations", "tool"]
  }
]

Only include posts with intent_score > 30 in the response to save tokens.
Return valid JSON array only.`;

export interface IntentClassification {
  post_id: string;
  intent_score: number;
  intent_label:
    | "no_intent"
    | "problem_aware"
    | "solution_seeking"
    | "comparing"
    | "purchase_ready";
  reasoning: string;
  matched_keywords: string[];
  engagement_suggestion?: string | null;
}
