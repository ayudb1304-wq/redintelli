"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PricingCardProps {
  name: string;
  price: number;
  productId: string | undefined;
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

  const tierKey = name.toLowerCase();
  const isCurrentPlan = currentTier === tierKey;
  const isFree = price === 0;

  async function handleCheckout() {
    if (isFree || !productId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // User can retry
    } finally {
      setLoading(false);
    }
  }

  function getButtonText() {
    if (isCurrentPlan) return "Current Plan";
    if (isFree) return isLoggedIn ? "Current Plan" : "Get Started";
    if (loading) return "Redirecting...";
    return "Upgrade";
  }

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
          onClick={isFree ? undefined : handleCheckout}
          disabled={loading || isCurrentPlan || (isFree && isLoggedIn)}
          asChild={isFree && !isLoggedIn ? true : undefined}
        >
          {isFree && !isLoggedIn ? (
            <a href="/signup">{getButtonText()}</a>
          ) : (
            <span>{getButtonText()}</span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
