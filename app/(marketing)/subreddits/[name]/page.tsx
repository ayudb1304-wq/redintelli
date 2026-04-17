import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Users,
  MessageSquare,
  FileText,
  TrendingUp,
  Shield,
} from "lucide-react";
import type { BriefContent } from "@/types/database";

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  return {
    title: `r/${name} Audience Analysis | RedIntelli`,
    description: `Understand r/${name}: pain points, language patterns, content strategy, and community rules. Free audience intelligence for Reddit marketers and founders.`,
  };
}

export default async function SubredditPage({ params }: Props) {
  const { name } = await params;
  const admin = createAdminClient();

  // Fetch subreddit data
  const { data: subreddit } = await admin
    .from("subreddits")
    .select("*")
    .eq("id", name)
    .single();

  if (!subreddit) {
    notFound();
  }

  // Try to find a completed brief for this subreddit
  const { data: brief } = await admin
    .from("audience_briefs")
    .select("content, created_at")
    .eq("subreddit_id", name)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const briefContent = brief?.content as BriefContent | undefined;
  const rules = subreddit.rules as string[] | null;
  const relatedSubs = subreddit.related_subreddits as string[] | null;

  return (
    <div className="min-h-svh">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pt-24">
        <Button variant="ghost" size="sm" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </Button>
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Subreddit analysis
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              r/{subreddit.display_name || name}
            </h1>
            {subreddit.title && (
              <p className="mt-2 text-lg text-muted-foreground">
                {subreddit.title}
              </p>
            )}
            {subreddit.public_description && (
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {subreddit.public_description.slice(0, 500)}
              </p>
            )}
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get a full brief for r/{name}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats sidebar */}
          <div className="lg:col-span-2 lg:pl-8">
            <div className="grid grid-cols-2 gap-4">
              {subreddit.subscribers && (
                <Card>
                  <CardContent className="p-5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="mt-3 text-2xl font-bold">
                      {subreddit.subscribers >= 1000000
                        ? `${(subreddit.subscribers / 1000000).toFixed(1)}M`
                        : subreddit.subscribers >= 1000
                          ? `${(subreddit.subscribers / 1000).toFixed(0)}K`
                          : subreddit.subscribers.toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Subscribers
                    </p>
                  </CardContent>
                </Card>
              )}
              {subreddit.posts_per_day != null && (
                <Card>
                  <CardContent className="p-5">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="mt-3 text-2xl font-bold">
                      {subreddit.posts_per_day}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Posts per day
                    </p>
                  </CardContent>
                </Card>
              )}
              {subreddit.avg_comments_per_post != null && (
                <Card>
                  <CardContent className="p-5">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <p className="mt-3 text-2xl font-bold">
                      {subreddit.avg_comments_per_post}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Avg comments per post
                    </p>
                  </CardContent>
                </Card>
              )}
              {subreddit.promo_tolerance && (
                <Card>
                  <CardContent className="p-5">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <p className="mt-3 text-2xl font-bold capitalize">
                      {subreddit.promo_tolerance}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Promo tolerance
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Brief insights (if we have a brief) */}
      {briefContent && (
        <>
          {/* Pain Points */}
          <section className="border-y bg-muted/20 py-24 sm:py-32">
            <div className="mx-auto max-w-6xl px-6">
              <div className="grid gap-16 lg:grid-cols-5">
                <div className="lg:col-span-2">
                  <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    Community snapshot
                  </p>
                  <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
                    What r/{name} users struggle with
                  </h2>
                  <p className="mt-4 text-muted-foreground">
                    {briefContent.snapshot.slice(0, 300)}
                    {briefContent.snapshot.length > 300 ? "..." : ""}
                  </p>
                </div>
                <div className="lg:col-span-3 lg:pl-8">
                  <div className="space-y-6">
                    {briefContent.pain_points.slice(0, 4).map((pp, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{pp.title}</h3>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <div
                                key={j}
                                className={`h-2 w-2 rounded-full ${
                                  j < pp.intensity ? "bg-red-500" : "bg-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {pp.quote && (
                          <blockquote className="mt-2 border-l-2 pl-4 text-sm italic text-muted-foreground">
                            &quot;{pp.quote.slice(0, 200)}&quot;
                          </blockquote>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Language Patterns */}
          {briefContent.language_patterns.length > 0 && (
            <section className="py-24 sm:py-32">
              <div className="mx-auto max-w-6xl px-6">
                <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  Language patterns
                </p>
                <h2 className="mt-4 max-w-lg text-3xl font-bold leading-tight sm:text-4xl">
                  How r/{name} users actually talk
                </h2>
                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {briefContent.language_patterns.slice(0, 6).map((lp, i) => (
                    <Card key={i}>
                      <CardContent className="p-5">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          &quot;{lp.user_says}&quot;
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground line-through">
                          &quot;{lp.not_say}&quot;
                        </p>
                        {lp.context && (
                          <p className="mt-3 text-xs text-muted-foreground">
                            {lp.context}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Content Strategy */}
          <section className="border-y bg-muted/20 py-24 sm:py-32">
            <div className="mx-auto max-w-6xl px-6">
              <div className="grid gap-16 lg:grid-cols-2">
                <div>
                  <p className="text-sm font-medium uppercase tracking-widest text-green-600">
                    What works in r/{name}
                  </p>
                  <div className="mt-6 space-y-3">
                    {briefContent.content_strategy.what_works.slice(0, 5).map((w, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-widest text-red-600">
                    What fails in r/{name}
                  </p>
                  <div className="mt-6 space-y-3">
                    {briefContent.content_strategy.what_fails.slice(0, 5).map((f, i) => (
                      <div key={i} className="flex gap-3 text-sm text-muted-foreground">
                        <span className="mt-0.5 shrink-0">&#x2715;</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Rules */}
      {rules && rules.length > 0 && (
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Community rules
            </p>
            <h2 className="mt-4 text-3xl font-bold">
              r/{name} posting rules
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {rules.map((rule, i) => (
                <div key={i} className="flex gap-3 rounded-lg border p-4 text-sm">
                  <span className="shrink-0 font-mono text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related subreddits */}
      {relatedSubs && relatedSubs.length > 0 && (
        <section className={`${rules && rules.length > 0 ? "border-t" : ""} bg-muted/20 py-24 sm:py-32`}>
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Related communities
            </p>
            <h2 className="mt-4 text-3xl font-bold">
              Subreddits related to r/{name}
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {relatedSubs.slice(0, 20).map((sub) => (
                <Link
                  key={sub}
                  href={`/subreddits/${sub}`}
                  className="rounded-full border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  r/{sub}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              Get the full audience brief for r/{name}.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Pain points, language patterns, content strategy, and actionable
              next steps. Generated in under two minutes.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get your first brief free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs tracking-wide text-muted-foreground">
              No credit card &middot; Research-only, never posts as you &middot;
              Built to outlast Reddit API changes
            </p>
          </div>
        </div>
      </section>

      {/* Categories/tags */}
      {subreddit.categories && subreddit.categories.length > 0 && (
        <div className="border-t py-8">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Categories:</span>
              {subreddit.categories.map((cat: string) => (
                <span key={cat} className="rounded-full border px-2.5 py-0.5">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
