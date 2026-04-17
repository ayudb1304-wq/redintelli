import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

interface ToolData {
  name: string;
  tagline: string;
  description: string;
  category: string;
  pricing: string;
  strengths: string[];
  advantages: string[];
  comparison: { feature: string; them: boolean; us: boolean }[];
}

const tools: Record<string, ToolData> = {
  syften: {
    name: "Syften",
    tagline: "Real-time Reddit and social monitoring",
    description:
      "Syften is a real-time social mention monitoring tool that tracks keywords across Reddit, Hacker News, and other platforms. It's built for alerting, not analysis.",
    category: "Social monitoring",
    pricing: "From $19/mo",
    strengths: [
      "Real-time keyword alerts",
      "Multi-platform monitoring (Reddit, HN, Twitter)",
      "Simple setup",
    ],
    advantages: [
      "Full audience analysis with structured briefs",
      "Automated pain point extraction from real posts",
      "Language pattern analysis (say this, not that)",
      "Deep research capabilities beyond simple alerts",
    ],
    comparison: [
      { feature: "Keyword monitoring", them: true, us: true },
      { feature: "Audience briefs", them: false, us: true },
      { feature: "Pain point extraction", them: false, us: true },
      { feature: "Language patterns", them: false, us: true },
      { feature: "Content strategy", them: false, us: true },
      { feature: "Multi-platform tracking", them: true, us: false },
      { feature: "AI-powered analysis", them: false, us: true },
      { feature: "API-independent data", them: false, us: true },
    ],
  },
  f5bot: {
    name: "F5Bot",
    tagline: "Free Reddit mention alerts",
    description:
      "F5Bot is a free tool that sends email notifications when your keyword is mentioned on Reddit, Hacker News, or Lobsters. Great for basic alerts, but no analysis.",
    category: "Free alerts",
    pricing: "Free forever",
    strengths: [
      "Completely free",
      "Simple keyword alerts",
      "Multiple platforms",
      "No signup friction",
    ],
    advantages: [
      "Full audience analysis and structured briefs",
      "Exportable reports with actionable insights",
      "Pain point and language pattern extraction",
      "In-app dashboard with real-time results",
      "Historical data analysis across months of posts",
    ],
    comparison: [
      { feature: "Basic keyword alerts", them: true, us: true },
      { feature: "Audience briefs", them: false, us: true },
      { feature: "Pain point extraction", them: false, us: true },
      { feature: "Subreddit discovery", them: false, us: true },
      { feature: "Language patterns", them: false, us: true },
      { feature: "Content strategy", them: false, us: true },
      { feature: "Free tier", them: true, us: true },
      { feature: "Historical analysis", them: false, us: true },
    ],
  },
  redreach: {
    name: "Redreach",
    tagline: "Reddit lead generation and outreach",
    description:
      "Redreach focuses on finding leads on Reddit and automating outreach. It's a lead-gen tool, not a research tool. They offer comment automation which carries account ban risk.",
    category: "Lead generation",
    pricing: "From $29/mo",
    strengths: [
      "Lead identification",
      "Reddit outreach automation",
      "CRM-style tracking",
    ],
    advantages: [
      "Ban-safe by design, never posts as you",
      "Research-first approach with audience briefs",
      "Structured deliverables, not just a lead list",
      "API-independent data source that can't be cut off",
    ],
    comparison: [
      { feature: "Lead identification", them: true, us: false },
      { feature: "Comment automation", them: true, us: false },
      { feature: "Audience briefs", them: false, us: true },
      { feature: "Pain point extraction", them: false, us: true },
      { feature: "Language patterns", them: false, us: true },
      { feature: "Ban-safe by design", them: false, us: true },
      { feature: "API-independent data", them: false, us: true },
      { feature: "Content strategy", them: false, us: true },
    ],
  },
  reddinbox: {
    name: "Reddinbox",
    tagline: "Reddit monitoring for businesses",
    description:
      "Reddinbox monitors Reddit mentions for brands and products. It's positioned for analysts and consultants who need ongoing monitoring dashboards.",
    category: "Brand monitoring",
    pricing: "From $24/mo",
    strengths: [
      "Real-time mention tracking",
      "Dashboard-based monitoring",
      "Sentiment analysis",
    ],
    advantages: [
      "Structured briefs you can share and act on",
      "AI-generated audience intelligence, not just mentions",
      "Language pattern analysis (say this, not that)",
      "Indie-hacker friendly pricing starting at $0",
    ],
    comparison: [
      { feature: "Mention monitoring", them: true, us: true },
      { feature: "Sentiment analysis", them: true, us: true },
      { feature: "Audience briefs", them: false, us: true },
      { feature: "Pain point extraction", them: false, us: true },
      { feature: "Language patterns", them: false, us: true },
      { feature: "Content strategy", them: false, us: true },
      { feature: "Dashboard UI", them: true, us: false },
      { feature: "API-independent data", them: false, us: true },
    ],
  },
  "subreddit-signals": {
    name: "Subreddit Signals",
    tagline: "Find buying-intent posts on Reddit",
    description:
      "Subreddit Signals focuses on finding high-intent posts where users are actively looking for solutions. It's lead-gen oriented with intent scoring.",
    category: "Intent detection",
    pricing: "From $29/mo",
    strengths: [
      "Intent scoring",
      "Buying-signal detection",
      "Lead identification",
    ],
    advantages: [
      "Full audience briefs with pain points and quotes",
      "Deep pain point analysis ranked by intensity",
      "Language patterns and content strategy per subreddit",
      "Research-first approach for understanding, not just selling",
    ],
    comparison: [
      { feature: "Intent detection", them: true, us: true },
      { feature: "Audience briefs", them: false, us: true },
      { feature: "Pain point extraction", them: false, us: true },
      { feature: "Language patterns", them: false, us: true },
      { feature: "Content strategy", them: false, us: true },
      { feature: "Lead scoring", them: true, us: false },
      { feature: "Subreddit discovery", them: true, us: true },
      { feature: "API-independent data", them: false, us: true },
    ],
  },
  brand24: {
    name: "Brand24",
    tagline: "Enterprise social listening platform",
    description:
      "Brand24 is a full-scale social listening platform covering all major social networks. It's enterprise-priced and designed for marketing teams, not indie founders.",
    category: "Enterprise social listening",
    pricing: "From $79/mo",
    strengths: [
      "Multi-platform coverage",
      "Enterprise-grade features",
      "Detailed analytics dashboards",
      "Team collaboration",
    ],
    advantages: [
      "Indie-hacker pricing (free tier, $29 starter)",
      "Reddit-specific, purpose-built for subreddit research",
      "AI-generated audience briefs with actionable insights",
      "Designed for solo founders, not enterprise teams",
      "Language pattern and content strategy analysis",
    ],
    comparison: [
      { feature: "Reddit monitoring", them: true, us: true },
      { feature: "Multi-platform", them: true, us: false },
      { feature: "Audience briefs", them: false, us: true },
      { feature: "Pain point extraction", them: false, us: true },
      { feature: "Language patterns", them: false, us: true },
      { feature: "Indie-hacker pricing", them: false, us: true },
      { feature: "Team features", them: true, us: false },
      { feature: "API-independent data", them: false, us: true },
    ],
  },
};

interface Props {
  params: Promise<{ tool: string }>;
}

export async function generateStaticParams() {
  return Object.keys(tools).map((tool) => ({ tool }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool: slug } = await params;
  const tool = tools[slug];
  if (!tool) return {};
  return {
    title: `${tool.name} Alternative (2026) | RedIntelli`,
    description: `Compare ${tool.name} vs RedIntelli. RedIntelli offers AI-powered audience briefs, pain point extraction, and language patterns for indie hackers and SaaS founders.`,
  };
}

export default async function AlternativePage({ params }: Props) {
  const { tool: slug } = await params;
  const tool = tools[slug];

  if (!tool) {
    notFound();
  }

  return (
    <div className="min-h-svh">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-24">
        <Button variant="ghost" size="sm" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </Button>
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {tool.name} Alternative
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            {tool.name} vs RedIntelli.
            <br />
            <span className="text-primary">
              Research-first audience intelligence.
            </span>
          </h1>
          <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
            {tool.description} RedIntelli takes a different approach: AI-powered
            audience briefs built on open data, designed for indie hackers and
            SaaS founders.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-y bg-muted/20 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold">Feature comparison</h2>
          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-4 pr-8 text-left font-semibold">Feature</th>
                  <th className="pb-4 px-4 text-center font-semibold text-muted-foreground">
                    {tool.name}
                  </th>
                  <th className="pb-4 px-4 text-center font-semibold text-primary">
                    RedIntelli
                  </th>
                </tr>
              </thead>
              <tbody>
                {tool.comparison.map((row) => (
                  <tr key={row.feature} className="border-b last:border-0">
                    <td className="py-4 pr-8">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {row.them ? (
                        <CheckCircle2 className="mx-auto h-4 w-4 text-muted-foreground" />
                      ) : (
                        <XCircle className="mx-auto h-4 w-4 text-muted-foreground/40" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.us ? (
                        <CheckCircle2 className="mx-auto h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="mx-auto h-4 w-4 text-muted-foreground/40" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Strengths and weaknesses */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">
                Where {tool.name} is strong
              </h2>
              <div className="mt-6 space-y-3">
                {tool.strengths.map((s) => (
                  <div key={s} className="flex gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Where RedIntelli goes further
              </h2>
              <div className="mt-6 space-y-3">
                {tool.advantages.map((a) => (
                  <div key={a} className="flex gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/20 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              Try RedIntelli free. See the difference.
            </h2>
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

      {/* Other alternatives */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Other comparisons
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(tools)
              .filter(([key]) => key !== slug)
              .map(([key, t]) => (
                <Link
                  key={key}
                  href={`/alternatives/${key}`}
                  className="rounded-full border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  vs {t.name}
                </Link>
              ))}
            <Link
              href="/alternatives/gummysearch"
              className="rounded-full border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              vs GummySearch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
