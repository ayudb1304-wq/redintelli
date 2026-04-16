import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function MonitoringPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Monitoring</h1>
        <p className="mt-1 text-muted-foreground">
          Monitor subreddits for high-intent posts from potential customers.
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Activity className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">Coming Soon</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Track subreddits, classify buyer intent, and get daily digests —
            launching in Weekend 3.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
