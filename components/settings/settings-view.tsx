"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  CreditCard,
  Bell,
  LogOut,
  Loader2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { Profile } from "@/types/database";

interface SettingsViewProps {
  profile: Profile | null;
  userEmail: string;
}

export function SettingsView({ profile, userEmail }: SettingsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [digestEnabled, setDigestEnabled] = useState(
    profile?.digest_enabled !== false,
  );
  const [cancelLoading, setCancelLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const tier = profile?.subscription_tier ?? "free";
  const status = profile?.subscription_status ?? "active";
  const briefsUsed = profile?.briefs_generated_this_month ?? 0;
  const briefsLimit = profile?.briefs_limit ?? 2;
  const trackedUsed = profile?.tracked_subreddits_count ?? 0;
  const trackedLimit = profile?.tracked_subreddits_limit ?? 3;
  const periodEnd = profile?.subscription_current_period_end;
  const hasSubscription = !!profile?.dodo_subscription_id;
  const isCanceled = status === "canceled";
  const isPastDue = status === "past_due";

  const checkoutSuccess = searchParams.get("checkout") === "success";

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : userEmail[0].toUpperCase();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleCancel() {
    setCancelLoading(true);
    try {
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isCanceled ? "reactivate" : "cancel" }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Cancel error:", error);
    } finally {
      setCancelLoading(false);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleUpgrade(productId: string) {
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
    } catch (error) {
      console.error("Upgrade error:", error);
    }
  }

  const defaultTab = checkoutSuccess ? "billing" : "profile";

  return (
    <div className="space-y-6">
      {checkoutSuccess && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Payment successful! Your subscription is being activated. It may
            take a moment to reflect.
          </AlertDescription>
        </Alert>
      )}

      {isPastDue && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your last payment failed. Please update your payment method to keep
            your subscription active.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
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

          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      tier === "pro"
                        ? "default"
                        : tier === "starter"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-sm"
                  >
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </Badge>
                  {isCanceled && hasSubscription && (
                    <Badge variant="destructive" className="text-xs">
                      Cancels{" "}
                      {periodEnd
                        ? new Date(periodEnd).toLocaleDateString()
                        : "soon"}
                    </Badge>
                  )}
                  {isPastDue && (
                    <Badge variant="destructive" className="text-xs">
                      Past Due
                    </Badge>
                  )}
                </div>
                {hasSubscription && (
                  <p className="text-sm text-muted-foreground">
                    ${tier === "pro" ? "59" : "29"}/month
                  </p>
                )}
              </div>

              {hasSubscription && periodEnd && !isCanceled && (
                <p className="text-sm text-muted-foreground">
                  Next billing date:{" "}
                  {new Date(periodEnd).toLocaleDateString()}
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
                      / {briefsLimit === -1 ? "\u221e" : briefsLimit}
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
            </CardContent>
          </Card>

          {/* Manage Subscription */}
          {hasSubscription && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Manage Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handlePortal}
                  disabled={portalLoading}
                >
                  {portalLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-4 w-4" />
                  )}
                  Manage Payment Method
                </Button>

                {tier === "starter" && !isCanceled && (
                  <Button
                    className="w-full"
                    onClick={() =>
                      handleUpgrade(
                        process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_PRO!,
                      )
                    }
                  >
                    Upgrade to Pro &mdash; $59/month
                  </Button>
                )}

                <Separator />

                {isCanceled ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Your subscription is set to cancel
                      {periodEnd
                        ? ` on ${new Date(periodEnd).toLocaleDateString()}`
                        : ""}
                      . You&apos;ll keep access until then.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCancel}
                      disabled={cancelLoading}
                    >
                      {cancelLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Reactivate Subscription
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={handleCancel}
                    disabled={cancelLoading}
                  >
                    {cancelLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Cancel Subscription
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Upgrade Options for Free Users */}
          {!hasSubscription && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upgrade Your Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Starter</p>
                    <p className="text-sm text-muted-foreground">
                      10 briefs/month, 10 subreddits
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleUpgrade(
                        process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_STARTER!,
                      )
                    }
                  >
                    $29/mo
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-primary p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Pro</p>
                      <Badge className="text-xs">Popular</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Unlimited briefs, 50 subreddits, daily digest
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      handleUpgrade(
                        process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_PRO!,
                      )
                    }
                  >
                    $59/mo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications</CardTitle>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
