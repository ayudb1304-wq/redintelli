"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DigestContent } from "@/lib/claude/prompts/digest";

interface DigestPreviewProps {
  digest: DigestContent;
}

export function DigestPreview({ digest }: DigestPreviewProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md bg-muted px-4 py-3">
        <p className="text-xs text-muted-foreground">Digest Preview</p>
        <p className="text-sm font-medium">{digest.headline}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {digest.stats.total_posts_scanned} posts scanned &middot;{" "}
          {digest.stats.high_intent_posts} high-intent &middot;{" "}
          {digest.stats.subreddits_active} subreddits
        </p>
      </div>

      {digest.top_opportunities.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {digest.top_opportunities.map((opp, i) => (
              <div key={i} className="space-y-1 border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <a
                    href={`https://reddit.com${opp.permalink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline"
                  >
                    {opp.post_title}
                  </a>
                  <Badge variant="secondary" className="text-xs">
                    {opp.intent_score}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  r/{opp.subreddit} &middot; {opp.why_important}
                </p>
                <p className="text-xs text-primary">
                  → {opp.suggested_action}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {digest.trending_topics.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Trending Topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {digest.trending_topics.map((topic, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{topic.topic}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {topic.mention_count} mentions
                  </span>
                </div>
                <Badge
                  variant={
                    topic.sentiment === "positive"
                      ? "default"
                      : topic.sentiment === "negative"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {topic.sentiment}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {digest.competitor_mentions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Competitor Mentions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {digest.competitor_mentions.map((comp, i) => (
              <div key={i} className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">{comp.competitor}</span>:{" "}
                  {comp.context}
                </p>
                <p className="text-xs text-primary">
                  Opportunity: {comp.opportunity}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
