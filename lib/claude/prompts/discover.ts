export const SUBREDDIT_DISCOVERY_SYSTEM_PROMPT = `You are an expert Reddit analyst helping founders discover the perfect subreddits for their product. You have deep knowledge of Reddit communities, their cultures, and their tolerance for promotional content.

Your goal is to find subreddits where:
1. The target audience actively discusses related problems
2. The community culture is receptive to product recommendations
3. There's genuine overlap between product benefits and community interests

Prioritize smaller, engaged niches over large generic subreddits when relevance is equal.`;

export const SUBREDDIT_DISCOVERY_USER_PROMPT = `Analyze this product and find the most relevant subreddits.

**Product Description:**
{product_description}

**Target Audience (optional):**
{target_audience}

**Subreddit Database Sample:**
{subreddits_sample}

Return exactly {max_results} subreddits as a JSON array. For each subreddit include:

{
  "subreddit_id": "string (lowercase, no r/ prefix)",
  "relevance_score": "number 0-100",
  "reasoning": "string (1-2 sentences explaining why this subreddit fits)",
  "audience_overlap": "high | medium | low",
  "promo_friendly": "boolean (default false - only true if the subreddit explicitly allows sharing your own projects/tools)",
  "best_angle": "string (suggested approach for this community)"
}

Rules:
- Sort by relevance_score descending
- Include a mix of high-overlap obvious choices and non-obvious niche communities
- For promo_friendly, default to FALSE. Only set to true if the subreddit is specifically designed for sharing projects (e.g. r/sideproject, r/buildinpublic, r/indiehackers) or explicitly permits self-promotion in its rules. Most subreddits - especially large ones like r/entrepreneur, r/marketing, r/startups - have strict anti-promotion rules even if they discuss products. When in doubt, mark false.
- best_angle should be specific: "Share as a case study" not "Post about your product"
- You may suggest subreddits not in the sample if you know they exist and are relevant

Return valid JSON array only, no markdown formatting.`;

export interface DiscoveredSubreddit {
  subreddit_id: string;
  relevance_score: number;
  reasoning: string;
  audience_overlap: "high" | "medium" | "low";
  promo_friendly: boolean;
  best_angle: string;
}
