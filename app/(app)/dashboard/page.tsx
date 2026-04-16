import { createClient } from "@/lib/supabase/server";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: sessions }, { count: briefCount }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single(),
      supabase
        .from("discovery_sessions")
        .select("id, product_description, discovered_subreddits, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("audience_briefs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id),
    ]);

  return (
    <DashboardView
      profile={profile}
      recentSessions={sessions ?? []}
      totalBriefs={briefCount ?? 0}
    />
  );
}
