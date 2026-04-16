import type { ArcticShiftSubreddit } from "./types";

/**
 * Parse numbered rules from subreddit sidebar markdown.
 * Matches patterns like "1) **No Self Promotion**" or "1. No spam"
 */
export function parseRules(description: string): string[] {
  if (!description) return [];

  const rules: string[] = [];
  const lines = description.split("\n");

  for (const line of lines) {
    // Match "1) ...", "1. ...", "**1.**", etc.
    const match = line.match(/^\s*\*?\*?\d+[.)]\*?\*?\s*\*?\*?(.+?)(?:\*\*)?$/);
    if (match) {
      // Clean markdown formatting
      let rule = match[1]
        .replace(/\*\*/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) -> text
        .trim();

      // Stop at " - " to get just the rule title, not the explanation
      const dashIdx = rule.indexOf(" - ");
      if (dashIdx > 0 && dashIdx < 80) {
        rule = rule.slice(0, dashIdx).trim();
      }

      if (rule.length > 3 && rule.length < 200) {
        rules.push(rule);
      }
    }
  }

  return rules;
}

/**
 * Parse related subreddit names from sidebar markdown.
 * Matches /r/name patterns.
 */
export function parseRelatedSubreddits(description: string): string[] {
  if (!description) return [];

  const matches = description.match(/\/r\/(\w+)/gi);
  if (!matches) return [];

  const seen = new Set<string>();
  const related: string[] = [];

  for (const match of matches) {
    const name = match.replace(/^\/r\//i, "").toLowerCase();
    // Skip common non-subreddit references and self-references
    if (!seen.has(name) && name.length > 1 && name !== "all" && name !== "popular") {
      seen.add(name);
      related.push(name);
    }
  }

  return related;
}

/**
 * Compute activity stats from Arctic Shift _meta field.
 */
export function computeActivityStats(sub: ArcticShiftSubreddit): {
  posts_per_day: number | null;
  avg_comments_per_post: number | null;
} {
  const meta = sub._meta;
  if (!meta) return { posts_per_day: null, avg_comments_per_post: null };

  let posts_per_day: number | null = null;
  let avg_comments_per_post: number | null = null;

  // avg comments per post
  if (meta.num_posts > 0 && meta.num_comments > 0) {
    avg_comments_per_post = Math.round((meta.num_comments / meta.num_posts) * 10) / 10;
  }

  // posts per day: use total posts / age in days
  if (meta.num_posts > 0 && meta.earliest_post > 0) {
    const nowSec = Math.floor(Date.now() / 1000);
    const ageDays = (nowSec - meta.earliest_post) / 86400;
    if (ageDays > 0) {
      posts_per_day = Math.round((meta.num_posts / ageDays) * 10) / 10;
    }
  }

  return { posts_per_day, avg_comments_per_post };
}
