import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AudienceBriefView } from "@/components/briefs/audience-brief-view";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { BriefContent } from "@/types/database";

export default async function BriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: brief } = await supabase
    .from("audience_briefs")
    .select("*")
    .eq("id", id)
    .single();

  if (!brief || (brief.user_id !== user!.id && !brief.is_cached)) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/briefs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to briefs
        </Link>
      </Button>

      <AudienceBriefView
        subredditId={brief.subreddit_id}
        content={brief.content as BriefContent}
      />
    </div>
  );
}
