import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PricingSection } from "@/components/shared/pricing-section";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </Button>
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
