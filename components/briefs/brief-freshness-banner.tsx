"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BriefFreshnessBannerProps {
  createdAt: string;
  subredditId: string;
  briefId?: string;
}

export function BriefFreshnessBanner({
  createdAt,
  subredditId,
  briefId,
}: BriefFreshnessBannerProps) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const ageMs = Date.now() - new Date(createdAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const ageLabel = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/briefs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subreddit_id: subredditId,
          force_refresh: true,
        }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/briefs/${data.id}`);
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Fresh: < 3 days
  if (ageDays < 3) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>Generated {ageLabel} &middot; Data is fresh</span>
      </div>
    );
  }

  // Aging: 3-7 days
  if (ageDays < 7) {
    return (
      <div className="flex items-center justify-between rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0" />
          <span>Generated {ageLabel} &middot; Consider refreshing for latest data</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-2 h-7 border-yellow-300 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-900"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`mr-1 h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
    );
  }

  // Stale: > 7 days
  return (
    <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>Generated {ageLabel} &middot; This data may be outdated</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="ml-2 h-7 border-red-300 text-red-800 hover:bg-red-100 dark:border-red-700 dark:text-red-200 dark:hover:bg-red-900"
        onClick={handleRefresh}
        disabled={refreshing}
      >
        <RefreshCw className={`mr-1 h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
        {refreshing ? "Refreshing..." : "Refresh"}
      </Button>
    </div>
  );
}
