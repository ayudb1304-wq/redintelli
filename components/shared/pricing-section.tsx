"use client";

import { PricingCard } from "./pricing-card";

interface PricingSectionProps {
  currentTier?: string;
  isLoggedIn?: boolean;
}

const plans = [
  {
    name: "Free",
    price: 0,
    productId: undefined,
    features: [
      "2 audience briefs / month",
      "3 tracked subreddits",
      "Subreddit discovery",
      "Community support",
    ],
  },
  {
    name: "Starter",
    price: 29,
    productIdEnv: "NEXT_PUBLIC_DODO_PRODUCT_ID_STARTER",
    features: [
      "10 audience briefs / month",
      "10 tracked subreddits",
      "Subreddit discovery",
      "Intent classification",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: 59,
    productIdEnv: "NEXT_PUBLIC_DODO_PRODUCT_ID_PRO",
    popular: true,
    features: [
      "Unlimited audience briefs",
      "50 tracked subreddits",
      "Subreddit discovery",
      "Intent classification",
      "Daily digest email",
      "Priority support",
    ],
  },
];

export function PricingSection({ currentTier, isLoggedIn }: PricingSectionProps) {
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-3">
      {plans.map((plan) => (
        <PricingCard
          key={plan.name}
          name={plan.name}
          price={plan.price}
          productId={
            plan.productIdEnv
              ? process.env[plan.productIdEnv]
              : undefined
          }
          features={plan.features}
          popular={plan.popular}
          currentTier={currentTier}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  );
}
