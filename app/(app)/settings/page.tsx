import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account and subscription.
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Settings className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">Coming Soon</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Account settings, subscription management, and notification
            preferences — launching in Weekend 4.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
