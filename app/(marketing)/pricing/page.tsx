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
        <p className="inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary"></span>
          Pricing
        </p>
        <h1 className="mt-4 font-serif text-4xl font-normal tracking-tight sm:text-5xl">
          Start free. <em>Upgrade when it pays for itself.</em>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
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
