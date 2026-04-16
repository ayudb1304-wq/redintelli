"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { User, CreditCard, Bell, LogOut } from "lucide-react";
import type { Profile } from "@/types/database";

interface SettingsViewProps {
  profile: Profile | null;
  userEmail: string;
}

export function SettingsView({ profile, userEmail }: SettingsViewProps) {
  const router = useRouter();
  const supabase = createClient();
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [digestEnabled, setDigestEnabled] = useState(
    profile?.digest_enabled !== false
  );

  const tier = profile?.subscription_tier ?? "free";
  const status = profile?.subscription_status ?? "active";
  const briefsUsed = profile?.briefs_generated_this_month ?? 0;
  const briefsLimit = profile?.briefs_limit ?? 2;
  const trackedUsed = profile?.tracked_subreddits_count ?? 0;
  const trackedLimit = profile?.tracked_subreddits_limit ?? 3;

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : userEmail[0].toUpperCase();

  async function handleUpgrade(productEnvKey: string) {
    const productId =
      productEnvKey === "starter"
        ? process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_STARTER
        : process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_PRO;

    if (!productId) return;

    setUpgrading(productEnvKey);
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
      // Silently fail — user can retry
    } finally {
      setUpgrading(null);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              {profile?.full_name && (
                <p className="font-medium">{profile.full_name}</p>
              )}
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge
              variant={tier === "pro" ? "default" : tier === "starter" ? "secondary" : "outline"}
              className="text-sm"
            >
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Badge>
            {status !== "active" && (
              <Badge variant="destructive" className="text-xs">
                {status}
              </Badge>
            )}
          </div>

          {profile?.subscription_current_period_end && (
            <p className="text-sm text-muted-foreground">
              Current period ends:{" "}
              {new Date(
                profile.subscription_current_period_end
              ).toLocaleDateString()}
            </p>
          )}

          <Separator />

          {/* Usage */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Briefs This Month</p>
              <p className="text-2xl font-bold">
                {briefsUsed}
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  / {briefsLimit === -1 ? "∞" : briefsLimit}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Tracked Subreddits</p>
              <p className="text-2xl font-bold">
                {trackedUsed}
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  / {trackedLimit}
                </span>
              </p>
            </div>
          </div>

          <Separator />

          {/* Upgrade options */}
          {tier === "free" && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpgrade("starter")}
                disabled={upgrading !== null}
              >
                {upgrading === "starter"
                  ? "Redirecting..."
                  : "Upgrade to Starter ($29/mo)"}
              </Button>
              <Button
                size="sm"
                onClick={() => handleUpgrade("pro")}
                disabled={upgrading !== null}
              >
                {upgrading === "pro"
                  ? "Redirecting..."
                  : "Upgrade to Pro ($59/mo)"}
              </Button>
            </div>
          )}

          {tier === "starter" && (
            <Button
              size="sm"
              onClick={() => handleUpgrade("pro")}
              disabled={upgrading !== null}
            >
              {upgrading === "pro"
                ? "Redirecting..."
                : "Upgrade to Pro ($59/mo)"}
            </Button>
          )}

          {tier === "pro" && (
            <p className="text-sm text-muted-foreground">
              You&apos;re on the Pro plan — unlimited briefs, 50 tracked
              subreddits, and daily digest.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Daily Digest Email</p>
              <p className="text-xs text-muted-foreground">
                {tier === "pro"
                  ? "Receive a daily summary of high-intent posts"
                  : "Available on Pro plan"}
              </p>
            </div>
            {tier === "pro" ? (
              <Switch
                checked={digestEnabled}
                onCheckedChange={async (checked) => {
                  setDigestEnabled(checked);
                  await fetch("/api/settings/digest", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ enabled: checked }),
                  });
                }}
              />
            ) : (
              <Badge variant="outline" className="text-xs">
                Pro Only
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button
        variant="outline"
        className="w-full"
        onClick={handleSignOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}
