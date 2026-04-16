import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Activity,
  Zap,
  Target,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { PricingSection } from "@/components/shared/pricing-section";

export const metadata: Metadata = {
  title: "RedIntelli — Understand Any Reddit Audience in 60 Seconds",
  description:
    "AI-powered Reddit audience intelligence for indie hackers and startup founders. Discover subreddits, generate audience briefs, monitor high-intent posts. The best GummySearch alternative.",
};

const samplePainPoints = [
  { title: "Finding the right subreddits", intensity: 5 },
  { title: "Understanding community rules", intensity: 4 },
  { title: "Crafting non-salesy messages", intensity: 4 },
  { title: "Tracking relevant conversations", intensity: 3 },
];

const sampleLanguagePatterns = [
  { say: '"I built this to scratch my own itch"', not: '"Our innovative solution leverages..."' },
  { say: '"Honest feedback welcome, roast me"', not: '"We\'d love your input on our product"' },
  { say: '"Hit $1K MRR after 3 months"', not: '"Achieved significant revenue growth"' },
];

export default function LandingPage() {
  return (
    <div className="min-h-svh">
      {/* Nav */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold">
            RedIntelli
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <Badge variant="secondary" className="mb-4">
          The GummySearch alternative
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Understand any Reddit audience
          <br />
          <span className="text-primary">in 60 seconds</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          AI-powered audience briefs that tell you what a subreddit&apos;s users
          actually struggle with, desire, and respond to — so you can market on
          Reddit without getting banned.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">
              Generate your first brief free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          No credit card required. 2 free briefs every month.
        </p>
      </section>

      {/* How It Works */}
      <section className="border-y bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold">
            How it works
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
            From product idea to Reddit-ready messaging in three steps.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">1. Discover</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Describe your product. Our AI finds the most relevant subreddits
                where your target audience hangs out.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">2. Understand</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get an audience brief with pain points, language patterns,
                content strategy, and rules — all from real Reddit data.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">3. Monitor</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Track subreddits for high-intent posts. Get daily digests with
                the best engagement opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Brief Preview */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold">
            What you get in every brief
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
            Real data. Actionable insights. No fluff.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {/* Pain Points Preview */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-500" />
                  <h3 className="font-semibold">Pain Points</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  What your audience actually struggles with, ranked by intensity.
                </p>
                <div className="mt-4 space-y-3">
                  {samplePainPoints.map((pp) => (
                    <div
                      key={pp.title}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{pp.title}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-2 rounded-full ${
                              i < pp.intensity
                                ? "bg-red-500"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Language Patterns Preview */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Language Patterns</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Speak the community&apos;s language, not marketing speak.
                </p>
                <div className="mt-4 space-y-3">
                  {sampleLanguagePatterns.map((lp, i) => (
                    <div key={i} className="space-y-1 text-sm">
                      <p className="text-green-600 dark:text-green-400">
                        {lp.say}
                      </p>
                      <p className="text-muted-foreground line-through">
                        {lp.not}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Strategy Preview */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold">Content Strategy</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  What gets engagement vs. what gets downvoted.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-green-600 dark:text-green-400">
                      Works
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      <li className="flex gap-1.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                        Case studies with numbers
                      </li>
                      <li className="flex gap-1.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                        Honest post-mortems
                      </li>
                      <li className="flex gap-1.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                        Free tools and resources
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">
                      Fails
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      <li>Blatant self-promotion</li>
                      <li>Generic AI content</li>
                      <li>Link-only posts</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monitoring Preview */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold">Intent Monitoring</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Find people actively looking for solutions like yours.
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                    <span className="truncate">
                      &quot;Looking for a tool to analyze subreddits...&quot;
                    </span>
                    <Badge>92</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                    <span className="truncate">
                      &quot;Which Reddit analytics tool do you use?&quot;
                    </span>
                    <Badge variant="secondary">71</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                    <span className="truncate">
                      &quot;Frustrated with manual audience research...&quot;
                    </span>
                    <Badge variant="outline">45</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y bg-muted/30 py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-2xl font-bold">
            Built for indie hackers who market on Reddit
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-3xl font-bold">1.8B+</p>
              <p className="text-sm text-muted-foreground">
                Reddit posts analyzed
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">60s</p>
              <p className="text-sm text-muted-foreground">
                Average brief generation time
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">100+</p>
              <p className="text-sm text-muted-foreground">
                Posts and comments per brief
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
            Start free. Upgrade when you need more.
          </p>
          <PricingSection isLoggedIn={false} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold">
            Stop guessing. Start understanding.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Generate your first audience brief in under a minute — completely
            free. No credit card required.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link href="/signup">
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} RedIntelli</p>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
