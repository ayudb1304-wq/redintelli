import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "@/components/settings/settings-view";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account and subscription.
        </p>
      </div>
      <Suspense>
        <SettingsView profile={profile} userEmail={user!.email!} />
      </Suspense>
    </div>
  );
}
