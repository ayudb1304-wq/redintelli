import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/discover", "/briefs", "/monitoring", "/settings"],
    },
    sitemap: "https://redintelli.com/sitemap.xml",
  };
}
