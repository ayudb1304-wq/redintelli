"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";

const messages = [
  "Reading through hundreds of posts...",
  "Analyzing what makes this community tick...",
  "Extracting pain points from real conversations...",
  "Figuring out what language the community uses...",
  "Checking what gets upvoted vs. downvoted...",
  "Mapping out the unwritten rules...",
  "Identifying products people already talk about...",
  "Claude is writing your brief now...",
  "Sourcing every insight to a real post...",
  "Putting together your action plan...",
];

export function BriefLoading() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <FileText className="h-6 w-6 animate-pulse text-primary" />
      </div>
      <p className="mt-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Generating brief
      </p>
      <p
        key={index}
        className="mt-3 animate-fade-in text-center text-base"
      >
        {messages[index]}
      </p>
      <div className="mt-4 flex gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
