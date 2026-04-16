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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
          minLength={20}
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground">
          <span className={charCount < 20 ? "text-destructive" : ""}>
            {charCount}
          </span>
          /2000 characters{" "}
          {charCount < 20 && `(${20 - charCount} more needed)`}
        </p>
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

      <Button type="submit" disabled={loading || !isValid}>
        {loading ? "Discovering..." : "Discover Subreddits"}
      </Button>
    </form>
  );
}
