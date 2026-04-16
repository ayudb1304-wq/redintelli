"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";

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

  // Determine if this is a downgrade (current tier is higher)
  const tierOrder = { free: 0, starter: 1, pro: 2 };
  const currentOrder = tierOrder[(currentTier as keyof typeof tierOrder) ?? "free"];
  const thisOrder = tierOrder[tierKey as keyof typeof tierOrder];
  const isDowngrade = currentOrder > thisOrder;

  async function handleCheckout() {
    if (!productId) return;

    // If not logged in, redirect to signup first
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
    if (isFree && !isLoggedIn) return "Get Started";
    if (isDowngrade) return "Downgrade";
    if (!isLoggedIn) return "Get Started";
    return "Upgrade";
  }

  const isDisabled = isCurrentPlan || (isFree && !!isLoggedIn) || isDowngrade || loading;

  return (
    <Card
      className={`relative flex flex-col ${popular ? "border-primary ring-2 ring-primary" : ""}`}
    >
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{name}</CardTitle>
        <div className="mt-2">
          <span className="text-4xl font-bold">${price}</span>
          {price > 0 && (
            <span className="text-muted-foreground">/month</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <ul className="flex-1 space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
        <Button
          className="mt-6 w-full"
          variant={popular ? "default" : "outline"}
          disabled={isDisabled}
          onClick={!isFree && !isCurrentPlan && !isDowngrade ? handleCheckout : undefined}
          asChild={isFree && !isLoggedIn ? true : undefined}
        >
          {isFree && !isLoggedIn ? (
            <Link href="/signup">{getButtonText()}</Link>
          ) : (
            <span>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {getButtonText()}
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
