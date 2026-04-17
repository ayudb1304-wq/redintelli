"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, FileText, ArrowRight } from "lucide-react";
import { BriefLoading } from "./brief-loading";
import type { DiscoveredSubreddit } from "@/lib/claude/prompts/discover";

interface SubredditCardProps {
  subreddit: DiscoveredSubreddit;
}

function getScoreVariant(score: number) {
  if (score >= 80) return "default";
  if (score >= 50) return "secondary";
  return "outline";
}

function getOverlapColor(overlap: string) {
  if (overlap === "high") return "text-green-600 dark:text-green-400";
  if (overlap === "medium") return "text-yellow-600 dark:text-yellow-400";
  return "text-muted-foreground";
}

export function SubredditCard({ subreddit }: SubredditCardProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleGenerateBrief() {
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/briefs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subreddit_id: subreddit.subreddit_id }),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error?.message ?? "Failed to generate brief");
        return;
      }

      router.push(`/briefs/${json.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  if (generating) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-center text-sm font-medium">
            r/{subreddit.subreddit_id}
          </p>
          <BriefLoading />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">
            r/{subreddit.subreddit_id}
          </CardTitle>
          <Badge variant={getScoreVariant(subreddit.relevance_score)}>
            {subreddit.relevance_score}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{subreddit.reasoning}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className={getOverlapColor(subreddit.audience_overlap)}>
            {subreddit.audience_overlap} overlap
          </span>

          <span className="flex items-center gap-1">
            {subreddit.promo_friendly ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400">
                  Promo-friendly
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                <span className="text-red-600 dark:text-red-400">
                  Strict rules
                </span>
              </>
            )}
          </span>
        </div>

        <div className="rounded-md bg-muted px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">
            Best angle
          </p>
          <p className="text-sm">{subreddit.best_angle}</p>
        </div>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        <Button
          className="w-full"
          onClick={handleGenerateBrief}
        >
          <FileText className="mr-2 h-4 w-4" />
          Generate Audience Brief
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
