import { createClient } from "@/lib/supabase/server";
import { PricingSection } from "@/components/shared/pricing-section";

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentTier: string | undefined;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();
    currentTier = profile?.subscription_tier;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Simple, transparent pricing</h1>
        <p className="mt-2 text-muted-foreground">
          Start free. Upgrade when you need more.
        </p>
      </div>

      <PricingSection
        currentTier={currentTier}
        isLoggedIn={!!user}
      />
    </div>
  );
}
