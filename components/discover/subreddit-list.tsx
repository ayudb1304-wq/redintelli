"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SubredditCard } from "./subreddit-card";
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
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-10" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-14 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
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
