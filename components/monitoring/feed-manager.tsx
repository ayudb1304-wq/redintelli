"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface TrackedFeed {
  id: string;
  subreddit_id: string;
  keywords: string[] | null;
  min_intent_score: number;
  is_active: boolean;
  last_checked_at: string | null;
  unread_count: number;
}

interface FeedManagerProps {
  feeds: TrackedFeed[];
  onRemove: (id: string) => void;
  removing: string | null;
}

export function FeedManager({ feeds, onRemove, removing }: FeedManagerProps) {
  if (feeds.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {feeds.map((feed) => (
        <Card key={feed.id}>
          <CardContent className="flex items-center justify-between py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">r/{feed.subreddit_id}</p>
                {feed.unread_count > 0 && (
                  <Badge variant="default" className="text-xs">
                    {feed.unread_count} new
                  </Badge>
                )}
                {!feed.is_active && (
                  <Badge variant="secondary" className="text-xs">
                    paused
                  </Badge>
                )}
              </div>
              {feed.keywords && feed.keywords.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {feed.keywords.map((kw) => (
                    <Badge key={kw} variant="outline" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              )}
              {feed.last_checked_at && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Last checked:{" "}
                  {new Date(feed.last_checked_at).toLocaleString()}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(feed.id)}
              disabled={removing === feed.id}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
