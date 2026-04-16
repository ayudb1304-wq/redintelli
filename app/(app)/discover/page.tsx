import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { DiscoverView } from "@/components/discover/discover-view";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("discovery_sessions")
    .select("id, product_description, discovered_subreddits, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Discover Subreddits</h1>
        <p className="mt-1 text-muted-foreground">
          Describe your product and we&apos;ll find the most relevant Reddit
          communities for your audience.
        </p>
      </div>

      <DiscoverView />

      {sessions && sessions.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h2 className="text-lg font-medium">Past Discoveries</h2>
            <div className="space-y-2">
              {sessions.map((session) => (
                <Link key={session.id} href={`/discover/${session.id}`}>
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {session.product_description.slice(0, 100)}
                          {session.product_description.length > 100
                            ? "..."
                            : ""}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {Array.isArray(session.discovered_subreddits)
                            ? session.discovered_subreddits.length
                            : 0}{" "}
                          subreddits found &middot;{" "}
                          {format(
                            new Date(session.created_at),
                            "MMM d, yyyy 'at' h:mm a"
                          )}
                        </p>
                      </div>
                      <ArrowRight className="ml-4 h-4 w-4 shrink-0 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
