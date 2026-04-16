import { Card, CardContent } from "@/components/ui/card";
import type { BriefPainPoint } from "@/types/database";

interface PainPointCardProps {
  painPoint: BriefPainPoint;
}

export function PainPointCard({ painPoint }: PainPointCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium">{painPoint.title}</h4>
          <div className="flex shrink-0 gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i < painPoint.intensity
                    ? "bg-red-500 dark:bg-red-400"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <blockquote className="border-l-2 pl-3 text-sm italic text-muted-foreground">
          &ldquo;{painPoint.quote}&rdquo;
        </blockquote>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Frequency: {painPoint.frequency}</span>
          {painPoint.context && <span>&middot; {painPoint.context}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
