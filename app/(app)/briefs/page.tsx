import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Search } from "lucide-react";

export default async function BriefsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: briefs } = await supabase
    .from("audience_briefs")
    .select("id, subreddit_id, status, created_at")
    .eq("user_id", user!.id)
    .eq("is_cached", false)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audience Briefs</h1>
          <p className="mt-1 text-muted-foreground">
            Your generated audience intelligence reports.
          </p>
        </div>
        <Button asChild>
          <Link href="/discover">
            <Search className="mr-2 h-4 w-4" />
            Discover & Generate
          </Link>
        </Button>
      </div>

      {!briefs || briefs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No briefs yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Discover subreddits first, then generate audience briefs.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/discover">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {briefs.map((brief) => (
            <Link key={brief.id} href={`/briefs/${brief.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        r/{brief.subreddit_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(brief.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        brief.status === "completed" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {brief.status}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
