"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface AddFeedFormProps {
  onSubmit: (data: {
    subreddit_id: string;
    keywords: string[];
  }) => void;
  loading: boolean;
}

export function AddFeedForm({ onSubmit, loading }: AddFeedFormProps) {
  const [subreddit, setSubreddit] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  function addKeyword() {
    const kw = keywordInput.trim().toLowerCase();
    if (kw && !keywords.includes(kw) && keywords.length < 10) {
      setKeywords([...keywords, kw]);
      setKeywordInput("");
    }
  }

  function removeKeyword(kw: string) {
    setKeywords(keywords.filter((k) => k !== kw));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subreddit.trim() || keywords.length === 0) return;

    onSubmit({
      subreddit_id: subreddit.trim().toLowerCase().replace(/^r\//, ""),
      keywords,
    });

    setSubreddit("");
    setKeywords([]);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border p-4">
      <div className="space-y-2">
        <Label htmlFor="subreddit">Subreddit</Label>
        <Input
          id="subreddit"
          placeholder="e.g., saas or r/saas"
          value={subreddit}
          onChange={(e) => setSubreddit(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="keyword">Keywords</Label>
        <div className="flex gap-2">
          <Input
            id="keyword"
            placeholder="Add a keyword and press Enter"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={50}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addKeyword}
            disabled={!keywordInput.trim() || keywords.length >= 10}
          >
            Add
          </Button>
        </div>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {keywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="gap-1 pr-1">
                {kw}
                <button
                  type="button"
                  onClick={() => removeKeyword(kw)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {keywords.length}/10 keywords · posts matching any keyword will be tracked
        </p>
      </div>

      <Button
        type="submit"
        disabled={loading || !subreddit.trim() || keywords.length === 0}
      >
        {loading ? "Adding..." : "Track Subreddit"}
      </Button>
    </form>
  );
}
