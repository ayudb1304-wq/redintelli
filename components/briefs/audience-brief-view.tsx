import { Separator } from "@/components/ui/separator";
import { PainPointCard } from "./pain-point-card";
import { LanguagePattern } from "./language-pattern";
import { ContentStrategy } from "./content-strategy";
import { MentionedProducts } from "./mentioned-products";
import { RulesSummary } from "./rules-summary";
import { BriefFreshnessBanner } from "./brief-freshness-banner";
import type { BriefContent } from "@/types/database";

interface AudienceBriefViewProps {
  subredditId: string;
  content: BriefContent;
  createdAt?: string;
  briefId?: string;
}

export function AudienceBriefView({
  subredditId,
  content,
  createdAt,
  briefId,
}: AudienceBriefViewProps) {
  return (
    <div className="space-y-8">
      {/* Freshness Banner */}
      {createdAt && (
        <BriefFreshnessBanner
          createdAt={createdAt}
          subredditId={subredditId}
          briefId={briefId}
        />
      )}

      {/* Snapshot */}
      <section>
        <h2 className="text-lg font-semibold">r/{subredditId}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {content.snapshot}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Based on {content.metadata.posts_analyzed} posts and{" "}
          {content.metadata.comments_analyzed} comments &middot;{" "}
          {content.metadata.date_range}
        </p>
      </section>

      <Separator />

      {/* Pain Points */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold">Pain Points</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {content.pain_points.map((pp, i) => (
            <PainPointCard key={i} painPoint={pp} />
          ))}
        </div>
      </section>

      <Separator />

      {/* Language Patterns */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold">Language Patterns</h3>
        <p className="text-sm text-muted-foreground">
          Speak the community&apos;s language, not marketing speak.
        </p>
        <div className="space-y-2">
          {content.language_patterns.map((lp, i) => (
            <LanguagePattern key={i} pattern={lp} />
          ))}
        </div>
      </section>

      <Separator />

      {/* Content Strategy */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold">Content Strategy</h3>
        <ContentStrategy strategy={content.content_strategy} />
      </section>

      <Separator />

      {/* Mentioned Products */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold">Products Mentioned</h3>
        <MentionedProducts products={content.mentioned_products} />
      </section>

      <Separator />

      {/* Rules Summary */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold">Subreddit Rules</h3>
        <RulesSummary rules={content.rules_summary} />
      </section>

      <Separator />

      {/* Next Steps */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold">Recommended Next Steps</h3>
        <ol className="space-y-2">
          {content.next_steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
