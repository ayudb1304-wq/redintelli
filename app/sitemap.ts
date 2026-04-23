import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const baseUrl = "https://redintelli.com";

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${baseUrl}/pricing`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${baseUrl}/alternatives/gummysearch`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${baseUrl}/login`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.3,
  },
  {
    url: `${baseUrl}/signup`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
];

const alternativeTools = ["syften", "f5bot", "redreach", "reddinbox", "brand24"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const alternativeRoutes: MetadataRoute.Sitemap = alternativeTools.map((tool) => ({
    url: `${baseUrl}/alternatives/${tool}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  let subredditRoutes: MetadataRoute.Sitemap = [];
  let sampleRoutes: MetadataRoute.Sitemap = [];

  try {
    const admin = createAdminClient();

    const { data: subreddits } = await admin
      .from("subreddits")
      .select("id, updated_at")
      .order("subscribers", { ascending: false })
      .limit(5000);

    if (subreddits) {
      subredditRoutes = subreddits.map((s) => ({
        url: `${baseUrl}/subreddits/${s.id}`,
        lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      }));
    }

    const { data: sampleBriefs } = await admin
      .from("audience_briefs")
      .select("subreddit_id, created_at")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(2000);

    if (sampleBriefs) {
      const seen = new Set<string>();
      sampleRoutes = sampleBriefs
        .filter((b) => {
          if (!b.subreddit_id || seen.has(b.subreddit_id)) return false;
          seen.add(b.subreddit_id);
          return true;
        })
        .map((b) => ({
          url: `${baseUrl}/sample/${b.subreddit_id}`,
          lastModified: b.created_at ? new Date(b.created_at) : new Date(),
          changeFrequency: "weekly",
          priority: 0.5,
        }));
    }
  } catch {
    // If Supabase is unreachable at build time, ship the static sitemap.
  }

  return [...staticRoutes, ...alternativeRoutes, ...subredditRoutes, ...sampleRoutes];
}
