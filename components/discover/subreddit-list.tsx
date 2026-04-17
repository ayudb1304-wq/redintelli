"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { SubredditCard } from "./subreddit-card";
import { DiscoveryLoading } from "./discovery-loading";
import type { DiscoveredSubreddit } from "@/lib/claude/prompts/discover";

type SortKey = "relevance" | "overlap";

interface SubredditListProps {
  subreddits: DiscoveredSubreddit[];
  loading: boolean;
}

const overlapOrder = { high: 0, medium: 1, low: 2 } as const;

export function SubredditList({ subreddits, loading }: SubredditListProps) {
  const [sortBy, setSortBy] = useState<SortKey>("relevance");

  if (loading) {
    return <DiscoveryLoading />;
  }

  if (subreddits.length === 0) {
    return null;
  }

  const sorted = [...subreddits].sort((a, b) => {
    if (sortBy === "relevance") return b.relevance_score - a.relevance_score;
    return (
      overlapOrder[a.audience_overlap] - overlapOrder[b.audience_overlap]
    );
  });

  return (
    <div className="space-y-4">
      {/* Next step banner */}
      <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">
              Next step: Generate an audience brief
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a subreddit below and hit &quot;Generate Audience Brief&quot;
              to get pain points, language patterns, content strategy, and
              posting rules. It takes about 60 seconds.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {subreddits.length} subreddits found
        </p>
        <div className="flex gap-1">
          <Button
            variant={sortBy === "relevance" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSortBy("relevance")}
          >
            By relevance
          </Button>
          <Button
            variant={sortBy === "overlap" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSortBy("overlap")}
          >
            By overlap
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((sub) => (
          <SubredditCard key={sub.subreddit_id} subreddit={sub} />
        ))}
      </div>
    </div>
  );
}
