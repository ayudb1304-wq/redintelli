import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { SubredditList } from "@/components/discover/subreddit-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { DiscoveredSubreddit } from "@/lib/claude/prompts/discover";

export default async function DiscoverySessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: session } = await supabase
    .from("discovery_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!session) {
    notFound();
  }

  const subreddits = (session.discovered_subreddits ?? []) as DiscoveredSubreddit[];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/discover">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to discover
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-semibold">Discovery Results</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {session.product_description}
        </p>
        {session.target_audience && (
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium">Target audience:</span>{" "}
            {session.target_audience}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {format(new Date(session.created_at), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>

      <SubredditList subreddits={subreddits} loading={false} />
    </div>
  );
}
