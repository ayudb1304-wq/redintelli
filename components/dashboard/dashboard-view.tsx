import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Search, Activity, ArrowRight } from "lucide-react";
import type { Profile } from "@/types/database";

interface RecentSession {
  id: string;
  product_description: string;
  discovered_subreddits: unknown[];
  created_at: string;
}

interface DashboardViewProps {
  profile: Profile | null;
  recentSessions: RecentSession[];
  totalBriefs: number;
}

export function DashboardView({
  profile,
  recentSessions,
  totalBriefs,
}: DashboardViewProps) {
  const briefsUsed = profile?.briefs_generated_this_month ?? 0;
  const briefsLimit = profile?.briefs_limit ?? 2;
  const trackedCount = profile?.tracked_subreddits_count ?? 0;
  const trackedLimit = profile?.tracked_subreddits_limit ?? 3;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your Reddit audience research.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Briefs Used</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {briefsUsed}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                / {briefsLimit === -1 ? "∞" : briefsLimit}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tracked Subreddits
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trackedCount}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                / {trackedLimit}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">active monitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Discovery Sessions
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalBriefs} total briefs generated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/discover">
            <Search className="mr-2 h-4 w-4" />
            Discover Subreddits
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/briefs">
            <FileText className="mr-2 h-4 w-4" />
            View Briefs
          </Link>
        </Button>
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <h2 className="text-lg font-medium">Recent Discoveries</h2>
        {recentSessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Search className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No discoveries yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start by discovering relevant subreddits for your product.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/discover">Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {session.product_description.slice(0, 100)}
                      {session.product_description.length > 100 ? "..." : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {Array.isArray(session.discovered_subreddits)
                        ? session.discovered_subreddits.length
                        : 0}{" "}
                      subreddits found &middot;{" "}
                      {format(new Date(session.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <ArrowRight className="ml-4 h-4 w-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
