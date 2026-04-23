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
  title: "GummySearch Alternative (2026) | RedIntelli",
  description:
    "GummySearch shut down in November 2025. RedIntelli does the same job: pain points, language patterns, and AI briefs for Reddit audience research. Free migration for existing users.",
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
    a: "Fed (@foliofed) built GummySearch into a $35K MRR business with 135,000+ users. In November 2025 he announced he was closing it because he couldn't agree on terms with Reddit's commercial API licensing. New signups stopped on November 30, 2025. Existing accounts keep working until December 1, 2026.",
  },
  {
    q: "Is RedIntelli just a GummySearch clone?",
    a: "Same problem, different approach. GummySearch gave you a monitoring dashboard. RedIntelli generates structured audience briefs with Claude: pain points, language patterns, content strategy, and rules. And we pull data from the Arctic Shift archive instead of Reddit's commercial API, which is the whole reason we can stay open.",
  },
  {
    q: "Can I bring my GummySearch data across?",
    a: "Yes. Send your export, or just a list of the subreddits you were tracking, and I'll rebuild your setup for you. Free, and I'll do it personally for the first 500 people.",
  },
  {
    q: "Could RedIntelli shut down the same way?",
    a: "Not for the same reason. Arctic Shift is a public, community-maintained Reddit archive. We don't hold a Reddit API license, so there's nothing for Reddit to revoke. Other risks exist (any startup's do), but the specific thing that killed GummySearch isn't one of them.",
  },
  {
    q: "How does pricing compare?",
    a: "We matched GummySearch on purpose: Free ($0, 2 briefs a month), Starter ($29/mo), Pro ($59/mo). If you're coming from GummySearch, use code GUMMYFRIEND for 50% off your first 3 months.",
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
            <span className="text-primary">RedIntelli does the same job.</span>
          </h1>
          <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
            GummySearch closed in November 2025 after Fed couldn&apos;t agree on
            terms with Reddit&apos;s new API licensing. 135,000+ founders lost
            the tool they used for Reddit research. RedIntelli is what I built
            to replace it. Different data source, so we shouldn&apos;t hit the
            same wall.
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
              What you get, compared to what you had.
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
                Why GummySearch closed, and why we&apos;re on firmer ground.
              </h2>
            </div>
            <div className="lg:col-span-3 lg:pl-8">
              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold">What happened to GummySearch</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    It ran on Reddit&apos;s commercial API. When Reddit rewrote
                    their licensing terms between 2023 and 2025, the costs
                    stopped making sense for a bootstrapped tool. Fed
                    couldn&apos;t reach a deal with Reddit, so he shut it down.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">What we use instead</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    RedIntelli runs on Arctic Shift, a public Reddit archive
                    hosted on Hugging Face. It&apos;s community-maintained and
                    doesn&apos;t touch Reddit&apos;s commercial API. Claude
                    handles the analysis on top. No API license to lose.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Research-only by design</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    We don&apos;t post, comment, or log into Reddit for you. We
                    never ask for your Reddit credentials. The tool has no
                    write access to Reddit at all, so even if we wanted to, we
                    couldn&apos;t.
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
                Move your setup over.
              </h2>
              <div className="mt-10 space-y-6">
                {[
                  { step: "1", title: "Export from GummySearch", desc: "You have until December 1, 2026 to pull your saved searches, subreddit lists, and segments out of GummySearch." },
                  { step: "2", title: "Send it to us", desc: "Email the export (or just a list of subreddits you track) to ayucorp1304@gmail.com. I'll load it in for you." },
                  { step: "3", title: "Run your first brief", desc: "Your subreddits will be ready in under 30 minutes. Run a brief and compare it to what you were getting before." },
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
                Questions people ask before switching.
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
              Your GummySearch account disappears on December 1.
              <br />
              Worth moving before it does.
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
              No credit card. Research-only access. Free migration for GummySearch users.
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
