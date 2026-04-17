"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Check, X } from "lucide-react";

interface MatchedPost {
  id: string;
  post_id: string;
  subreddit_id: string;
  title: string;
  url: string | null;
  permalink: string | null;
  intent_score: number | null;
  intent_label: string | null;
  matched_keywords: string[] | null;
  is_read: boolean;
  matched_at: string;
}

interface MatchedPostsListProps {
  posts: MatchedPost[];
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

function getIntentColor(score: number | null) {
  if (!score) return "secondary";
  if (score >= 80) return "default" as const;
  if (score >= 60) return "default" as const;
  if (score >= 40) return "secondary" as const;
  return "outline" as const;
}

function getIntentLabel(label: string | null) {
  if (!label) return "Unknown";
  return label
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function MatchedPostsList({
  posts,
  onMarkRead,
  onDismiss,
}: MatchedPostsListProps) {
  if (posts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No matched posts yet. Check your feeds to find new posts.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => (
        <Card
          key={post.id}
          className={post.is_read ? "opacity-60" : ""}
        >
          <CardContent className="py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    r/{post.subreddit_id}
                  </span>
                  <Badge
                    variant={getIntentColor(post.intent_score)}
                    className="text-xs"
                  >
                    {post.intent_score ?? 0} · {getIntentLabel(post.intent_label)}
                  </Badge>
                </div>
                <p className="text-sm font-medium leading-snug">
                  {post.title}
                </p>
                {post.matched_keywords && post.matched_keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.matched_keywords.map((kw) => (
                      <Badge key={kw} variant="outline" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {post.url && (
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {!post.is_read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMarkRead(post.id)}
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDismiss(post.id)}
                  title="Dismiss"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
