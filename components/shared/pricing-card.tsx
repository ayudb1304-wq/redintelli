"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface PricingCardProps {
  name: string;
  price: number;
  productId: string | null;
  features: string[];
  popular?: boolean;
  currentTier?: string;
  isLoggedIn?: boolean;
}

export function PricingCard({
  name,
  price,
  productId,
  features,
  popular,
  currentTier,
  isLoggedIn,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const tierKey = name.toLowerCase();
  const isCurrentPlan = currentTier === tierKey;
  const isFree = price === 0;

  const tierOrder = { free: 0, starter: 1, pro: 2 };
  const currentOrder = tierOrder[(currentTier as keyof typeof tierOrder) ?? "free"];
  const thisOrder = tierOrder[tierKey as keyof typeof tierOrder];
  const isDowngrade = currentOrder > thisOrder;

  async function handleCheckout() {
    if (!productId) return;

    if (!isLoggedIn) {
      router.push(`/signup?plan=${tierKey}`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  }

  function getButtonText() {
    if (isCurrentPlan) return "Current Plan";
    if (isFree && isLoggedIn) return "Current Plan";
    if (isFree && !isLoggedIn) return "Start free";
    if (isDowngrade) return "Downgrade";
    if (!isLoggedIn) return "Get Started";
    return "Upgrade";
  }

  const isDisabled = isCurrentPlan || (isFree && !!isLoggedIn) || isDowngrade || loading;

  return (
    <div
      className={`relative flex flex-col gap-4 rounded-2xl border p-7 ${
        popular
          ? "border-foreground bg-background shadow-[0_20px_50px_-30px_rgba(0,0,0,0.15)]"
          : "border-border bg-card"
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-primary px-3 py-1 font-mono text-[11px] tracking-wider text-primary-foreground">
          most founders pick this
        </span>
      )}
      <div>
        <div className="font-serif text-[28px] tracking-tight">{name}</div>
        <div className="text-sm text-muted-foreground">
          {isFree ? "For trying it on." : popular ? "For a serious side project." : "For full-time operators."}
        </div>
      </div>
      <div className="font-serif text-[56px] leading-none tracking-tight">
        <span className="align-top text-[26px] text-muted-foreground">$</span>
        {price}
        {price > 0 && <span className="ml-1.5 font-sans text-sm font-normal tracking-normal text-muted-foreground">/mo</span>}
      </div>
      <ul className="flex flex-1 flex-col gap-2.5 border-t border-dashed border-border pt-4 text-sm text-muted-foreground">
        {features.map((feature) => (
          <li key={feature} className="relative pl-4">
            <span className="absolute left-0 text-xs font-bold text-primary-foreground">&#10003;</span>
            {feature}
          </li>
        ))}
      </ul>
      {isFree && !isLoggedIn ? (
        <Link
          href="/signup"
          className={`flex w-full items-center justify-center rounded-full border px-4 py-3 text-sm font-medium transition-transform ${
            popular
              ? "border-transparent bg-foreground text-background hover:-translate-y-px hover:bg-foreground/90"
              : "border-border bg-transparent text-foreground hover:bg-secondary"
          } ${isDisabled ? "pointer-events-none opacity-50" : ""}`}
        >
          {getButtonText()}
        </Link>
      ) : (
        <button
          className={`flex w-full items-center justify-center rounded-full border px-4 py-3 text-sm font-medium transition-transform ${
            popular
              ? "border-transparent bg-foreground text-background hover:-translate-y-px hover:bg-foreground/90"
              : "border-border bg-transparent text-foreground hover:bg-secondary"
          } ${isDisabled ? "pointer-events-none opacity-50" : ""}`}
          disabled={isDisabled}
          onClick={!isFree && !isCurrentPlan && !isDowngrade ? handleCheckout : undefined}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getButtonText()}
        </button>
      )}
    </div>
  );
}
