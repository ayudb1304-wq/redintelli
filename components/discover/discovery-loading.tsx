"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

const messages = [
  "Scanning the Reddit universe...",
  "Reading thousands of posts so you don't have to...",
  "Asking Claude which subreddits are worth your time...",
  "Filtering out the meme subs (most of them)...",
  "Finding where your people actually hang out...",
  "Cross-referencing audience overlap patterns...",
  "Checking which communities won't ban you on sight...",
  "Almost there, Claude is being thorough...",
  "Ranking subreddits by relevance to your product...",
  "Wrapping up the best picks for you...",
];

export function DiscoveryLoading() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Search className="h-7 w-7 animate-pulse text-primary" />
        </div>
      </div>
      <p
        key={index}
        className="mt-8 animate-fade-in text-center text-lg font-medium"
      >
        {messages[index]}
      </p>
      <div className="mt-3 flex gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
