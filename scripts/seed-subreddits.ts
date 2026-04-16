/**
 * Seed subreddits table with real metadata from Arctic Shift.
 * Extracts: subscribers, descriptions, rules, related subreddits,
 * posts_per_day, avg_comments_per_post.
 *
 * Usage: npx tsx scripts/seed-subreddits.ts
 */

import { createClient } from "@supabase/supabase-js";
import { parseRules, parseRelatedSubreddits, computeActivityStats } from "../lib/arctic-shift/parse";
import type { ArcticShiftSubreddit } from "../lib/arctic-shift/types";

const ARCTIC_SHIFT_BASE_URL = "https://arctic-shift.photon-reddit.com/api";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Subreddit IDs with categories and promo tolerance (things Arctic Shift won't know)
const SUBREDDITS: {
  id: string;
  categories: string[];
  promo_tolerance: "none" | "low" | "medium" | "high";
}[] = [
  // Business & Entrepreneurship
  { id: "entrepreneur", categories: ["business", "startups"], promo_tolerance: "low" },
  { id: "startups", categories: ["business", "startups", "tech"], promo_tolerance: "low" },
  { id: "smallbusiness", categories: ["business", "smb"], promo_tolerance: "low" },
  { id: "EntrepreneurRideAlong", categories: ["business", "startups", "indie"], promo_tolerance: "high" },
  { id: "sweatystartup", categories: ["business", "bootstrapping"], promo_tolerance: "medium" },
  { id: "ecommerce", categories: ["business", "ecommerce"], promo_tolerance: "medium" },
  { id: "dropshipping", categories: ["business", "ecommerce"], promo_tolerance: "medium" },
  { id: "shopify", categories: ["business", "ecommerce", "software"], promo_tolerance: "medium" },
  { id: "freelance", categories: ["business", "freelance"], promo_tolerance: "low" },

  // Indie & Build in Public
  { id: "indiehackers", categories: ["business", "startups", "indie"], promo_tolerance: "high" },
  { id: "sideproject", categories: ["business", "projects", "indie"], promo_tolerance: "high" },
  { id: "buildinpublic", categories: ["business", "indie", "marketing"], promo_tolerance: "high" },
  { id: "microsaas", categories: ["business", "software", "indie"], promo_tolerance: "high" },
  { id: "saas", categories: ["business", "startups", "software"], promo_tolerance: "medium" },

  // Marketing & Growth
  { id: "marketing", categories: ["marketing"], promo_tolerance: "low" },
  { id: "digitalmarketing", categories: ["marketing", "digital"], promo_tolerance: "low" },
  { id: "socialmediamarketing", categories: ["marketing", "social"], promo_tolerance: "low" },
  { id: "content_marketing", categories: ["marketing", "content"], promo_tolerance: "low" },
  { id: "growthmarketing", categories: ["marketing", "growth"], promo_tolerance: "medium" },
  { id: "SEO", categories: ["marketing", "seo"], promo_tolerance: "low" },
  { id: "PPC", categories: ["marketing", "advertising"], promo_tolerance: "low" },
  { id: "copywriting", categories: ["marketing", "writing"], promo_tolerance: "low" },
  { id: "EmailMarketing", categories: ["marketing", "email"], promo_tolerance: "medium" },
  { id: "Affiliatemarketing", categories: ["marketing", "affiliate"], promo_tolerance: "medium" },

  // Tech & Development
  { id: "webdev", categories: ["tech", "development"], promo_tolerance: "low" },
  { id: "nocode", categories: ["tech", "nocode", "indie"], promo_tolerance: "medium" },
  { id: "artificial", categories: ["tech", "ai"], promo_tolerance: "low" },
  { id: "ChatGPT", categories: ["tech", "ai"], promo_tolerance: "low" },
  { id: "LocalLLaMA", categories: ["tech", "ai", "opensource"], promo_tolerance: "low" },
  { id: "webdesign", categories: ["tech", "design"], promo_tolerance: "low" },

  // Product & Design
  { id: "ProductManagement", categories: ["product", "business"], promo_tolerance: "low" },
  { id: "userexperience", categories: ["design", "ux"], promo_tolerance: "low" },
  { id: "design_critiques", categories: ["design", "feedback"], promo_tolerance: "high" },

  // Finance & Funding
  { id: "personalfinance", categories: ["finance"], promo_tolerance: "none" },
  { id: "fatFIRE", categories: ["finance", "investing"], promo_tolerance: "none" },
  { id: "venturecapital", categories: ["finance", "startups", "funding"], promo_tolerance: "low" },
  { id: "crowdfunding", categories: ["finance", "funding"], promo_tolerance: "high" },

  // Niche Communities
  { id: "juststart", categories: ["business", "seo", "content"], promo_tolerance: "medium" },
  { id: "WorkOnline", categories: ["business", "remote"], promo_tolerance: "medium" },
  { id: "digitalnomad", categories: ["lifestyle", "remote"], promo_tolerance: "low" },
  { id: "passiveincome", categories: ["finance", "business"], promo_tolerance: "medium" },
  { id: "INAT", categories: ["startups", "cofounder"], promo_tolerance: "high" },
  { id: "cofounder", categories: ["startups", "cofounder"], promo_tolerance: "high" },
  { id: "growmybusiness", categories: ["business", "marketing"], promo_tolerance: "high" },
  { id: "advancedentrepreneur", categories: ["business", "startups"], promo_tolerance: "medium" },

  // Sales
  { id: "sales", categories: ["business", "sales"], promo_tolerance: "low" },
  { id: "coldemail", categories: ["sales", "outreach"], promo_tolerance: "medium" },

  // Analytics
  { id: "analytics", categories: ["tech", "analytics"], promo_tolerance: "low" },
  { id: "bigseo", categories: ["marketing", "seo"], promo_tolerance: "low" },
];

async function fetchSubredditMetadata(name: string): Promise<ArcticShiftSubreddit | null> {
  const url = new URL(`${ARCTIC_SHIFT_BASE_URL}/subreddits/search`);
  url.searchParams.set("subreddit", name);
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return null;

  const json = (await res.json()) as { data: ArcticShiftSubreddit[] };
  return json.data?.[0] ?? null;
}

async function main() {
  console.log(`Seeding ${SUBREDDITS.length} subreddits from Arctic Shift...\n`);

  let success = 0;
  let fallback = 0;
  let failed = 0;

  for (const sub of SUBREDDITS) {
    try {
      const meta = await fetchSubredditMetadata(sub.id);

      // Parse enriched data from sidebar description
      const rules = meta?.description ? parseRules(meta.description) : [];
      const relatedSubs = meta?.description ? parseRelatedSubreddits(meta.description) : [];
      const selfName = sub.id.toLowerCase();
      const filteredRelated = relatedSubs.filter((r) => r !== selfName);

      // Compute activity stats from _meta
      const stats = meta ? computeActivityStats(meta) : { posts_per_day: null, avg_comments_per_post: null };

      const row = {
        id: sub.id,
        display_name: meta?.display_name ?? sub.id,
        title: meta?.title ?? null,
        description: meta?.description ?? null,
        public_description: meta?.public_description ?? null,
        subscribers: meta?.subscribers ?? null,
        created_utc: meta?.created_utc
          ? new Date(meta.created_utc * 1000).toISOString()
          : null,
        categories: sub.categories,
        promo_tolerance: sub.promo_tolerance,
        rules: rules.length > 0 ? rules : null,
        related_subreddits: filteredRelated.length > 0 ? filteredRelated : null,
        posts_per_day: stats.posts_per_day,
        avg_comments_per_post: stats.avg_comments_per_post,
        last_synced_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("subreddits").upsert(row, {
        onConflict: "id",
      });

      if (error) {
        console.error(`  ✗ ${sub.id}: ${error.message}`);
        failed++;
      } else if (meta) {
        const parts = [
          `${meta.subscribers?.toLocaleString() ?? "?"} subs`,
          `${rules.length} rules`,
          `${filteredRelated.length} related`,
          stats.posts_per_day !== null ? `${stats.posts_per_day} posts/day` : null,
          stats.avg_comments_per_post !== null ? `${stats.avg_comments_per_post} avg comments` : null,
        ].filter(Boolean);
        console.log(`  ✓ ${sub.id} — ${parts.join(", ")}`);
        success++;
      } else {
        console.log(`  ~ ${sub.id} — no Arctic Shift data, inserted with defaults`);
        fallback++;
      }

      // Be nice to the API
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.error(`  ✗ ${sub.id}: ${err}`);
      failed++;
    }
  }

  console.log(`\nDone: ${success} enriched, ${fallback} defaults, ${failed} failed`);
}

main();
