"use client";

import { useState } from "react";
import { DiscoveryForm } from "./discovery-form";
import { SubredditList } from "./subreddit-list";
import type { DiscoveredSubreddit } from "@/lib/claude/prompts/discover";

export function DiscoverView() {
  const [results, setResults] = useState<DiscoveredSubreddit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: {
    product_description: string;
    target_audience?: string;
  }) {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch("/api/subreddits/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error?.message ?? "Something went wrong");
        return;
      }

      setResults(json.subreddits);
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <DiscoveryForm onSubmit={handleSubmit} loading={loading} />

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <SubredditList subreddits={results} loading={loading} />
    </div>
  );
}
