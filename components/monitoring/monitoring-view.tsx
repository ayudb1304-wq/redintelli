"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";
import { AddFeedForm } from "./add-feed-form";
import { FeedManager } from "./feed-manager";
import { MatchedPostsList } from "./matched-posts-list";
import { DigestPreview } from "./digest-preview";
import type { DigestContent } from "@/lib/claude/prompts/digest";

interface TrackedFeed {
  id: string;
  subreddit_id: string;
  keywords: string[] | null;
  min_intent_score: number;
  is_active: boolean;
  last_checked_at: string | null;
  unread_count: number;
}

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

export function MonitoringView() {
  const [feeds, setFeeds] = useState<TrackedFeed[]>([]);
  const [posts, setPosts] = useState<MatchedPost[]>([]);
  const [limits, setLimits] = useState({ used: 0, max: 3 });
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [digest, setDigest] = useState<DigestContent | null>(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeeds = useCallback(async () => {
    const res = await fetch("/api/monitoring/feeds");
    if (res.ok) {
      const data = await res.json();
      setFeeds(data.tracked);
      setLimits(data.limits);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    const res = await fetch("/api/monitoring/posts");
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts);
    }
  }, []);

  useEffect(() => {
    loadFeeds();
    loadPosts();
  }, [loadFeeds, loadPosts]);

  async function handleAddFeed(data: {
    subreddit_id: string;
    keywords: string[];
  }) {
    setAdding(true);
    setError(null);

    const res = await fetch("/api/monitoring/feeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error?.message ?? "Failed to add feed");
      setAdding(false);
      return;
    }

    setAdding(false);
    loadFeeds();
  }

  async function handleRemoveFeed(id: string) {
    setRemoving(id);
    await fetch(`/api/monitoring/feeds/${id}`, { method: "DELETE" });
    setRemoving(null);
    loadFeeds();
  }

  async function handleCheckFeeds() {
    setChecking(true);
    setError(null);

    try {
      const res = await fetch("/api/monitoring/check", { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message ?? "Failed to check feeds");
      }

      // Reload feeds and posts
      await Promise.all([loadFeeds(), loadPosts()]);
    } catch {
      setError("Failed to check feeds. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  async function handleGenerateDigest() {
    setDigestLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/monitoring/digest", { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message ?? "Failed to generate digest");
        return;
      }

      setDigest(json.digest);
    } catch {
      setError("Failed to generate digest.");
    } finally {
      setDigestLoading(false);
    }
  }

  async function handleMarkRead(postId: string) {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, is_read: true } : p))
    );
    await fetch(`/api/monitoring/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_read: true }),
    });
  }

  async function handleDismiss(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    await fetch(`/api/monitoring/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_dismissed: true }),
    });
  }

  return (
    <div className="space-y-6">
      {/* Usage */}
      <p className="text-sm text-muted-foreground">
        Tracking {limits.used} / {limits.max} subreddits
      </p>

      {/* Add Feed */}
      {limits.used < limits.max && (
        <AddFeedForm onSubmit={handleAddFeed} loading={adding} />
      )}

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Tracked Feeds */}
      {feeds.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Tracked Subreddits</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckFeeds}
              disabled={checking}
            >
              <RefreshCw
                className={`mr-2 h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`}
              />
              {checking ? "Checking..." : "Check Feeds"}
            </Button>
          </div>
          <FeedManager
            feeds={feeds}
            onRemove={handleRemoveFeed}
            removing={removing}
          />
        </div>
      )}

      {/* Matched Posts */}
      {posts.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h2 className="text-lg font-medium">Matched Posts</h2>
            <MatchedPostsList
              posts={posts}
              onMarkRead={handleMarkRead}
              onDismiss={handleDismiss}
            />
          </div>
        </>
      )}

      {/* Digest */}
      {feeds.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Daily Digest</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateDigest}
                disabled={digestLoading}
              >
                {digestLoading ? "Generating..." : "Preview Digest"}
              </Button>
            </div>
            {digest && <DigestPreview digest={digest} />}
          </div>
        </>
      )}
    </div>
  );
}
