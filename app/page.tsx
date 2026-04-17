import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  FileText,
  Activity,
  Target,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Shield,
  Database,
  Brain,
  Zap,
  X,
  Mail,
} from "lucide-react";
import { PricingSection } from "@/components/shared/pricing-section";

export const metadata: Metadata = {
  title: "RedIntelli — Reddit Audience Research & Market Intelligence Tool",
  description:
    "RedIntelli is a Reddit audience intelligence tool for indie hackers and SaaS founders. Find pain points, validate ideas, and monitor niches in minutes. Start free.",
};

const samplePainPoints = [
  { title: "Finding the right subreddits", intensity: 5 },
  { title: "Understanding community rules", intensity: 4 },
  { title: "Crafting non-salesy messages", intensity: 4 },
  { title: "Tracking relevant conversations", intensity: 3 },
];

const sampleLanguagePatterns = [
  {
    say: '"I built this to scratch my own itch"',
    not: '"Our innovative solution leverages..."',
  },
  {
    say: '"Honest feedback welcome, roast me"',
    not: '"We\'d love your input on our product"',
  },
  {
    say: '"Hit $1K MRR after 3 months"',
    not: '"Achieved significant revenue growth"',
  },
];

const faqItems = [
  {
    q: "Will RedIntelli shut down like GummySearch?",
    a: "GummySearch shut down because Reddit's commercial API license terms weren't workable for a bootstrapped tool. RedIntelli is built on Arctic Shift, a public open-source Reddit archive, plus Claude's API for analysis. We don't depend on a Reddit API license, which means we can operate sustainably without the compliance risk that forced GummySearch to close.",
  },
  {
    q: "Is RedIntelli really like GummySearch?",
    a: "We focus on the same core use case: understanding Reddit audiences for marketing and product validation. The key difference is we generate structured audience briefs instead of a dashboard, and our data source is API-independent.",
  },
  {
    q: "Can I import my GummySearch data?",
    a: "Yes. Email us your export or tell us your saved searches and we'll rebuild them for free.",
  },
  {
    q: "What data source do you use?",
    a: "Arctic Shift, an open-source Reddit archive hosted on Hugging Face. It's independent of Reddit's commercial API, which means we can't be cut off the way GummySearch was.",
  },
  {
    q: "Do you post or comment on Reddit for me?",
    a: "No. Research-only, by design. We never access your Reddit account or post anything. Your account stays safe.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-svh">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            RedIntelli
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/alternatives/gummysearch">GummySearch Alternative</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get your first brief free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero - Asymmetric */}
      <section className="mx-auto max-w-6xl px-6 pb-32 pt-20 sm:pt-28 lg:pt-36">
        <div className="grid items-start gap-16 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Reddit audience briefs
              <br />
              for indie hackers
              <br />
              <span className="text-primary">and SaaS founders.</span>
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Built on Arctic Shift&apos;s open Reddit archive and Claude.
              Ask a question, get a sourced audience brief in under two
              minutes. Not another keyword alert feed that might shut down
              next year.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get your first brief free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link href="/sample/entrepreneur">See a sample brief</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs tracking-wide text-muted-foreground">
              No credit card &middot; Research-only, never posts as you &middot;
              Built to outlast Reddit API changes
            </p>
          </div>

          {/* Hero visual - mini brief preview */}
          <div className="hidden lg:col-span-2 lg:block">
            <Card className="rotate-1 shadow-2xl">
              <CardContent className="p-6">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Sample brief
                </p>
                <p className="mt-2 text-sm font-semibold">r/entrepreneur</p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  A community of 4.5M+ founders sharing real struggles with
                  building and scaling businesses. Highly skeptical of
                  promotional content. Values authentic, experience-based
                  advice over polished marketing speak.
                </p>
                <div className="mt-5 space-y-2">
                  {samplePainPoints.slice(0, 3).map((pp) => (
                    <div
                      key={pp.title}
                      className="flex items-center justify-between text-xs"
                    >
                      <span>{pp.title}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 w-1.5 rounded-full ${
                              i < pp.intensity ? "bg-red-500" : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t pt-4">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Language tip
                  </p>
                  <p className="mt-1.5 text-xs text-green-600 dark:text-green-400">
                    Say &quot;cash-flow positive&quot;
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-through">
                    Not &quot;profitable&quot;
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pain Section - Asymmetric left-aligned narrative */}
      <section className="border-y bg-muted/20 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              You already know the feeling
            </p>
            <p className="mt-6 text-xl leading-relaxed sm:text-2xl">
              You open Reddit at 9am to validate an idea. It&apos;s 11am, you
              have 14 open tabs, and your doc is full of screenshots with no
              source links. Somebody just asked ChatGPT what you needed to know
              and got a worse answer.{" "}
              <strong>
                Your GummySearch data deletes in a few months.
              </strong>{" "}
              You&apos;re back to manual scrolling. Except now half the
              threads are bots.
            </p>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                The math
              </p>
            </div>
            <div className="lg:col-span-3">
              <p className="text-lg leading-relaxed text-muted-foreground">
                One manual Reddit research cycle takes three to four hours. At
                $75/hr of founder time, that&apos;s $225 every time you need to
                understand a new subreddit. RedIntelli generates the same brief
                in two minutes for the price of a coffee a week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Asymmetric staggered */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight sm:text-4xl">
            From &quot;what&apos;s happening in this subreddit?&quot; to a
            decision-ready brief in two minutes.
          </h2>

          <div className="mt-20 space-y-20">
            {/* Step 1 - left */}
            <div className="grid items-start gap-8 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  1
                </div>
                <h3 className="mt-4 text-xl font-semibold">Discover</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  Describe your product in plain English. Claude finds the
                  most relevant subreddits where your target audience
                  actually hangs out.
                </p>
              </div>
              <div className="lg:col-span-3 lg:pl-12">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      You type
                    </p>
                    <p className="mt-2 text-sm italic text-muted-foreground">
                      &quot;A tool that helps indie hackers find where their
                      audience hangs out on Reddit&quot;
                    </p>
                    <div className="mt-4 border-t pt-4">
                      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        RedIntelli finds
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {["r/entrepreneur", "r/SaaS", "r/indiehackers", "r/startups", "r/microsaas"].map((s) => (
                          <span key={s} className="rounded-full border px-3 py-1 text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Step 2 - right aligned */}
            <div className="grid items-start gap-8 lg:grid-cols-5">
              <div className="order-2 lg:order-1 lg:col-span-3 lg:pr-12">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-red-500" />
                      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        Pain points detected
                      </p>
                    </div>
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
                                  i < pp.intensity ? "bg-red-500" : "bg-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="order-1 lg:order-2 lg:col-span-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  2
                </div>
                <h3 className="mt-4 text-xl font-semibold">Understand</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  Get an audience brief with pain points, language patterns,
                  content strategy, and subreddit rules. All from real Reddit
                  data, with sources.
                </p>
              </div>
            </div>

            {/* Step 3 - left */}
            <div className="grid items-start gap-8 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  3
                </div>
                <h3 className="mt-4 text-xl font-semibold">Monitor</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  Track subreddits for high-intent posts. Get daily digests
                  with the best engagement opportunities delivered to your
                  inbox.
                </p>
              </div>
              <div className="lg:col-span-3 lg:pl-12">
                <Card>
                  <CardContent className="p-6 space-y-3">
                    {[
                      { text: "Looking for a tool to analyze subreddits...", score: 92 },
                      { text: "Which Reddit analytics tool do you use?", score: 71 },
                      { text: "Frustrated with manual audience research...", score: 45 },
                    ].map((item) => (
                      <div
                        key={item.text}
                        className="flex items-center justify-between rounded-md border p-3 text-sm"
                      >
                        <span className="truncate pr-4">&quot;{item.text}&quot;</span>
                        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {item.score}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brief preview - what you get */}
      <section className="border-y bg-muted/20 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            What&apos;s inside every brief
          </p>
          <h2 className="mt-4 max-w-lg text-3xl font-bold leading-tight sm:text-4xl">
            Claude reads 10,000 posts so you don&apos;t.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Every claim is sourced to a real Reddit permalink.
          </p>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <Target className="h-5 w-5 text-red-500" />
                <h3 className="mt-4 font-semibold">Pain Points</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  What your audience actually struggles with, ranked by
                  intensity with real quotes.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <h3 className="mt-4 font-semibold">Language Patterns</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Speak the community&apos;s language. &quot;Say this, not
                  that&quot; with context for each pattern.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Zap className="h-5 w-5 text-yellow-500" />
                <h3 className="mt-4 font-semibold">Content Strategy</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  What gets engagement vs. what gets downvoted. Best
                  times, formats, and angles.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Shield className="h-5 w-5 text-green-500" />
                <h3 className="mt-4 font-semibold">Rules Summary</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enforcement level, key restrictions, and workarounds so
                  you never get banned.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Search className="h-5 w-5 text-purple-500" />
                <h3 className="mt-4 font-semibold">Mentioned Products</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Which tools and products the community already talks
                  about, with sentiment analysis.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <FileText className="h-5 w-5 text-orange-500" />
                <h3 className="mt-4 font-semibold">Next Steps</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Actionable recommendations tailored to the subreddit.
                  Ready to execute, not just read.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/sample/entrepreneur">
                See a full sample brief
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Language Patterns preview - asymmetric */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-16 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Language patterns
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
                Speak like the community. Not like a marketer.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Every brief includes &quot;say this, not that&quot; language
                patterns so your posts feel native, not corporate.
              </p>
            </div>
            <div className="lg:col-span-3 lg:pl-8">
              <div className="space-y-6">
                {sampleLanguagePatterns.map((lp, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        <p className="text-xs font-medium uppercase tracking-widest text-green-700 dark:text-green-400">
                          Say
                        </p>
                      </div>
                      <p className="mt-2 text-sm font-medium">{lp.say}</p>
                    </div>
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                      <div className="flex items-center gap-2">
                        <X className="h-3.5 w-3.5 text-red-600" />
                        <p className="text-xs font-medium uppercase tracking-widest text-red-700 dark:text-red-400">
                          Not
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{lp.not}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust - Three things we won't do */}
      <section className="border-y bg-muted/20 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-16 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Our principles
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
                Three things we will never do.
              </h2>
            </div>
            <div className="lg:col-span-3 lg:pl-8">
              <div className="space-y-10">
                <div className="flex gap-5">
                  <Shield className="mt-1 h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <p className="text-lg font-semibold">
                      We will never post on Reddit for you.
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Research-only, by design. Your account stays safe.
                    </p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <Database className="mt-1 h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <p className="text-lg font-semibold">
                      We will never resell your research data.
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Your audience briefs are yours alone.
                    </p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <Brain className="mt-1 h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <p className="text-lg font-semibold">
                      We will never scrape the Reddit API in violation of
                      their policies.
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      We&apos;re built on the open archive precisely so we
                      can&apos;t. That&apos;s the whole point.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data provenance - why we won't die */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Data provenance
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              Other tools died because Reddit pulled their API. We
              can&apos;t be cut off.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              RedIntelli is built on Arctic Shift, a public open-source Reddit
              archive, plus Claude&apos;s API for analysis. We don&apos;t
              depend on a Reddit API license, which means we can operate
              sustainably without the compliance risk that forced GummySearch
              to close.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div className="rounded-xl border p-6">
              <Database className="h-6 w-6 text-muted-foreground" />
              <p className="mt-4 text-2xl font-bold">Arctic Shift</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Open-source Reddit archive on Hugging Face. Public,
                independent, community-maintained.
              </p>
            </div>
            <div className="rounded-xl border p-6">
              <Brain className="h-6 w-6 text-muted-foreground" />
              <p className="mt-4 text-2xl font-bold">Claude</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Anthropic&apos;s AI for analysis. Reads thousands of posts,
                extracts patterns, writes your brief.
              </p>
            </div>
            <div className="rounded-xl border p-6">
              <Shield className="h-6 w-6 text-muted-foreground" />
              <p className="mt-4 text-2xl font-bold">No Reddit API</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Zero commercial API dependency. The same data Reddit
                itself can&apos;t lock up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder letter */}
      <section className="border-y bg-muted/20 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              From the founder
            </p>
            <div className="mt-8 text-lg leading-relaxed">
              <p>
                Hey. I was a GummySearch paying customer until November 2025.
              </p>
              <p className="mt-6">
                When Fed announced the shutdown I spent three weeks trying
                every alternative, and none of them felt right. Either they
                were built for enterprise social listening, or they were
                lead-gen automation tools, or they were thin keyword alerts.
              </p>
              <p className="mt-6">
                So I built the one I wanted: Reddit audience briefs,
                generated by Claude, built on the open Arctic Shift archive
                so we won&apos;t die the same way.
              </p>
              <p className="mt-6">
                If you&apos;re reading this because your GummySearch export
                arrived, I&apos;ll personally rebuild your saved searches
                for free.{" "}
                <Link
                  href="mailto:ayucorp1304@gmail.com"
                  className="font-semibold underline underline-offset-4"
                >
                  Email me.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GummySearch migration */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Coming from GummySearch?
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
                We&apos;ll rebuild your saved searches for free.
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                Send us an email or paste your export. We&apos;ll have you
                up and running in 30 minutes. For the first 500 migrators,
                the founder does this personally.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="mailto:ayucorp1304@gmail.com">
                    <Mail className="mr-2 h-4 w-4" />
                    Start your free migration
                  </Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Use code <span className="font-mono font-semibold">GUMMYFRIEND</span> for
                50% off your first 3 months.
              </p>
            </div>
            <div className="lg:col-span-2 lg:pl-8">
              <div className="space-y-4 rounded-xl border p-6">
                <p className="text-sm font-semibold">What we migrate</p>
                {[
                  "Your saved subreddit lists",
                  "Tracked keyword searches",
                  "Audience segments and filters",
                  "Monitoring preferences",
                ].map((item) => (
                  <div key={item} className="flex gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-y bg-muted/20 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Pricing
          </p>
          <h2 className="mt-4 text-3xl font-bold">
            Simple, transparent pricing.
          </h2>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            Start free. Upgrade when you need more. 33% off with annual
            billing. 30-day money-back guarantee.
          </p>
          <PricingSection isLoggedIn={false} />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-16 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                FAQ
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
                Questions you&apos;re probably asking.
              </h2>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Get your first brief free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="lg:col-span-3 lg:pl-8">
              <div className="divide-y">
                {faqItems.map((item) => (
                  <div key={item.q} className="py-6 first:pt-0 last:pb-0">
                    <h3 className="font-semibold">{item.q}</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t bg-muted/20 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              Stop guessing.
              <br />
              Start understanding.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              From &quot;what&apos;s happening in this subreddit?&quot; to a
              decision-ready brief in two minutes.
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

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 sm:grid-cols-4">
            <div>
              <p className="font-semibold">RedIntelli</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Reddit audience intelligence for founders.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold">Product</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
                <Link href="/sample/entrepreneur" className="hover:text-foreground">Sample Brief</Link>
                <Link href="/signup" className="hover:text-foreground">Sign Up</Link>
                <Link href="/login" className="hover:text-foreground">Log In</Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Alternatives</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/alternatives/gummysearch" className="hover:text-foreground">vs GummySearch</Link>
                <Link href="/alternatives/redreach" className="hover:text-foreground">vs Redreach</Link>
                <Link href="/alternatives/brand24" className="hover:text-foreground">vs Brand24</Link>
                <Link href="/alternatives/syften" className="hover:text-foreground">vs Syften</Link>
                <Link href="/alternatives/f5bot" className="hover:text-foreground">vs F5Bot</Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Subreddits</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/subreddits/entrepreneur" className="hover:text-foreground">r/entrepreneur</Link>
                <Link href="/subreddits/saas" className="hover:text-foreground">r/saas</Link>
                <Link href="/subreddits/startups" className="hover:text-foreground">r/startups</Link>
                <Link href="/subreddits/indiehackers" className="hover:text-foreground">r/indiehackers</Link>
                <Link href="/subreddits/marketing" className="hover:text-foreground">r/marketing</Link>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-4 border-t pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} RedIntelli</p>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
              <Link href="/alternatives/gummysearch" className="hover:text-foreground">Alternatives</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "RedIntelli",
            description:
              "Reddit audience intelligence tool for indie hackers and SaaS founders",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            browserRequirements: "Requires a modern web browser",
            offers: [
              {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                name: "Free",
              },
              {
                "@type": "Offer",
                price: "29",
                priceCurrency: "USD",
                name: "Starter",
                priceValidUntil: "2027-12-31",
              },
              {
                "@type": "Offer",
                price: "59",
                priceCurrency: "USD",
                name: "Pro",
                priceValidUntil: "2027-12-31",
              },
            ],
          }),
        }}
      />
    </div>
  );
}
