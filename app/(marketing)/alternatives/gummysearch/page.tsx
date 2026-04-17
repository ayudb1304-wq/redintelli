import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "GummySearch Alternative (2026) | RedIntelli Picks Up Where It Left Off",
  description:
    "GummySearch shut down in Nov 2025. RedIntelli is the direct successor: pain-point discovery, subreddit monitoring, and AI briefs for indie hackers. Import your GummySearch workflows free.",
};

const comparisonRows = [
  { feature: "Audience briefs", gummy: true, red: true },
  { feature: "Subreddit discovery", gummy: true, red: true },
  { feature: "Pain point extraction", gummy: true, red: true },
  { feature: "Language pattern analysis", gummy: false, red: true },
  { feature: "Content strategy per subreddit", gummy: false, red: true },
  { feature: "Rules summary and workarounds", gummy: false, red: true },
  { feature: "Intent monitoring", gummy: true, red: true },
  { feature: "Daily digest emails", gummy: true, red: true },
  { feature: "AI-powered analysis (Claude)", gummy: false, red: true },
  { feature: "API-independent data source", gummy: false, red: true },
  { feature: "Free tier", gummy: true, red: true },
  { feature: "Active development", gummy: false, red: true },
];

const faqItems = [
  {
    q: "Why did GummySearch shut down?",
    a: "GummySearch was built by Fed (@foliofed) and grew to $35K MRR with 135,000+ users. It shut down in November 2025 because Fed was unable to reach an agreement with Reddit's commercial API licensing policies. The product stopped accepting new signups November 30, 2025, and existing users retain access until December 1, 2026.",
  },
  {
    q: "Is RedIntelli a GummySearch clone?",
    a: "No. We focus on the same core problem (understanding Reddit audiences) but take a fundamentally different approach. Instead of a monitoring dashboard, we generate structured audience briefs powered by Claude. Instead of Reddit's commercial API, we use Arctic Shift's open archive. The architecture is designed to avoid the exact failure mode that killed GummySearch.",
  },
  {
    q: "Can I import my GummySearch data?",
    a: "Yes. Email us your export or tell us your saved searches and subreddit lists. We'll rebuild them for free. For the first 500 migrators, the founder does this personally.",
  },
  {
    q: "Will RedIntelli shut down like GummySearch?",
    a: "RedIntelli is built on Arctic Shift, a public open-source Reddit archive independent of Reddit's commercial API. We don't depend on a Reddit API license, which eliminates the compliance risk that forced GummySearch to close. Our data source is community-maintained and can't be unilaterally revoked.",
  },
  {
    q: "How does pricing compare to GummySearch?",
    a: "Our pricing deliberately mirrors GummySearch's structure: Free ($0, 2 briefs/month), Starter ($29/mo), and Pro ($59/mo). If you're coming from GummySearch, use code GUMMYFRIEND for 50% off your first 3 months.",
  },
];

export default function GummySearchAlternativePage() {
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
            GummySearch Alternative
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            GummySearch shut down.
            <br />
            <span className="text-primary">RedIntelli picks up where it left off.</span>
          </h1>
          <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
            Fed built something great. GummySearch trained an entire generation
            of founders to use Reddit for audience research. When it shut down
            in November 2025, 135,000+ users lost their workflows overnight.
            RedIntelli is built from the ground up to solve the same problem
            with an architecture that won&apos;t face the same fate.
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

      {/* What you'll miss and how we handle it */}
      <section className="border-y bg-muted/20 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Honest comparison
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              What you&apos;ll miss from GummySearch. And how we handle it.
            </h2>
          </div>

          {/* Feature comparison table */}
          <div className="mt-16 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-4 pr-8 text-left font-semibold">Feature</th>
                  <th className="pb-4 px-4 text-center font-semibold text-muted-foreground">
                    GummySearch
                  </th>
                  <th className="pb-4 px-4 text-center font-semibold text-primary">
                    RedIntelli
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b last:border-0">
                    <td className="py-4 pr-8">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {row.gummy ? (
                        <CheckCircle2 className="mx-auto h-4 w-4 text-muted-foreground" />
                      ) : (
                        <XCircle className="mx-auto h-4 w-4 text-muted-foreground/40" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.red ? (
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

      {/* Why GummySearch died and why we won't */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-16 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                The technical difference
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
                Why GummySearch died and why RedIntelli won&apos;t.
              </h2>
            </div>
            <div className="lg:col-span-3 lg:pl-8">
              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold">GummySearch&apos;s dependency</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    GummySearch relied on Reddit&apos;s commercial API. When
                    Reddit changed their licensing terms in 2023-2025, the
                    compliance costs became unworkable for a bootstrapped tool.
                    Fed couldn&apos;t reach an agreement, so he shut down.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">RedIntelli&apos;s architecture</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    RedIntelli is built on Arctic Shift, a public open-source
                    Reddit archive hosted on Hugging Face. It&apos;s
                    community-maintained and independent of Reddit&apos;s
                    commercial API. We pair this with Claude for AI analysis.
                    Zero commercial API dependency means zero platform risk.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Research-only by design</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    We never post or comment on Reddit for you. We never access
                    your Reddit account. This isn&apos;t just a policy, it&apos;s
                    a technical constraint. Our tool literally cannot interact
                    with Reddit on your behalf.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Migration */}
      <section className="border-y bg-muted/20 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                5-minute migration guide
              </p>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Move from GummySearch to RedIntelli.
              </h2>
              <div className="mt-10 space-y-6">
                {[
                  { step: "1", title: "Export your GummySearch data", desc: "Before December 1, 2026, export your saved searches, subreddit lists, and audience segments from GummySearch." },
                  { step: "2", title: "Email us your export", desc: "Send your export file (or just a list of your subreddits) to ayucorp1304@gmail.com. We'll set everything up for you." },
                  { step: "3", title: "Get your first brief", desc: "Within 30 minutes, we'll have your subreddits loaded. Generate your first audience brief and see the difference." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Button size="lg" asChild>
                  <Link href="mailto:ayucorp1304@gmail.com">
                    <Mail className="mr-2 h-4 w-4" />
                    Start your free migration
                  </Link>
                </Button>
                <p className="mt-3 text-sm text-muted-foreground">
                  Use code <span className="font-mono font-semibold">GUMMYFRIEND</span> for
                  50% off your first 3 months.
                </p>
              </div>
            </div>
            <div className="lg:col-span-2 lg:pl-8">
              <div className="rounded-xl border p-6">
                <p className="text-sm font-semibold">Pricing comparison</p>
                <div className="mt-6 space-y-4">
                  {[
                    { tier: "Free", gummy: "$0 (50 searches)", red: "$0 (2 briefs/mo)" },
                    { tier: "Starter", gummy: "$29/mo", red: "$29/mo" },
                    { tier: "Pro", gummy: "$59/mo", red: "$59/mo" },
                    { tier: "Mega", gummy: "$199/mo", red: "Coming soon" },
                  ].map((row) => (
                    <div key={row.tier} className="grid grid-cols-3 gap-2 text-sm">
                      <span className="font-medium">{row.tier}</span>
                      <span className="text-muted-foreground line-through">{row.gummy}</span>
                      <span className="text-primary">{row.red}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
                Questions about the switch.
              </h2>
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
              Your GummySearch data deletes December 1.
              <br />
              Don&apos;t wait.
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

      {/* Schema */}
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
    </div>
  );
}
