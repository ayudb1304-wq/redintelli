"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DiscoveryFormProps {
  onSubmit: (data: {
    product_description: string;
    target_audience?: string;
  }) => void;
  loading: boolean;
}

export function DiscoveryForm({ onSubmit, loading }: DiscoveryFormProps) {
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [showHint, setShowHint] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (description.length < 20) {
      setShowHint(true);
      return;
    }

    setShowHint(false);
    onSubmit({
      product_description: description,
      target_audience: audience || undefined,
    });
  }

  const charCount = description.length;
  const isValid = charCount >= 20 && charCount <= 2000;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Product Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your product, what problem it solves, and who it's for. The more detail you provide, the better the recommendations..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (e.target.value.length >= 20) setShowHint(false);
          }}
          rows={4}
          required
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground">
          <span className={charCount < 20 ? "text-destructive" : ""}>
            {charCount}
          </span>
          /2000 characters{" "}
          {charCount < 20 && `(${20 - charCount} more needed)`}
        </p>

        {showHint && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-800 dark:bg-yellow-950">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Tell us a bit more about your product! We need at least 20
              characters to find the right subreddits for you. Think: what does
              it do, and who is it for?
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="audience">
          Target Audience{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="audience"
          placeholder="e.g., Solo founders, indie hackers, SaaS developers"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          maxLength={500}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Discovering..." : "Discover Subreddits"}
      </Button>
    </form>
  );
}
