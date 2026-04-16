import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import type { BriefContentStrategy } from "@/types/database";

interface ContentStrategyProps {
  strategy: BriefContentStrategy;
}

export function ContentStrategy({ strategy }: ContentStrategyProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            What Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {strategy.what_works.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            What Fails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {strategy.what_fails.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="sm:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Best Times to Post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-sm">
            <span className="font-medium">Days:</span>{" "}
            {strategy.best_times.days.join(", ")}
          </p>
          <p className="text-sm">
            <span className="font-medium">Hours:</span>{" "}
            {strategy.best_times.hours}
          </p>
          {strategy.best_times.reasoning && (
            <p className="text-xs text-muted-foreground">
              {strategy.best_times.reasoning}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
