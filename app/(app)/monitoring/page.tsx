import { MonitoringView } from "@/components/monitoring/monitoring-view";

export const dynamic = "force-dynamic";

export default function MonitoringPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Monitoring</h1>
        <p className="mt-1 text-muted-foreground">
          Track subreddits for high-intent posts from potential customers.
        </p>
      </div>
      <MonitoringView />
    </div>
  );
}
