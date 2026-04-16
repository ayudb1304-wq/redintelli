import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import type { BriefRulesSummary } from "@/types/database";

interface RulesSummaryProps {
  rules: BriefRulesSummary;
}

function getEnforcementIcon(level: string) {
  if (level === "strict")
    return <ShieldX className="h-5 w-5 text-red-600 dark:text-red-400" />;
  if (level === "moderate")
    return <ShieldAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
  return <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />;
}

function getEnforcementVariant(level: string) {
  if (level === "strict") return "destructive" as const;
  if (level === "moderate") return "secondary" as const;
  return "default" as const;
}

export function RulesSummary({ rules }: RulesSummaryProps) {
  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex items-center gap-3">
        {getEnforcementIcon(rules.enforcement_level)}
        <div>
          <p className="text-sm font-medium">
            Promotion{" "}
            {rules.promo_allowed ? "allowed" : "not allowed"}
          </p>
          <Badge
            variant={getEnforcementVariant(rules.enforcement_level)}
            className="mt-1 text-xs"
          >
            {rules.enforcement_level} enforcement
          </Badge>
        </div>
      </div>

      <ul className="space-y-1">
        {rules.key_rules.map((rule, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
            {rule}
          </li>
        ))}
      </ul>

      {rules.workarounds && (
        <div className="rounded-md bg-muted px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">
            Workaround
          </p>
          <p className="text-sm">{rules.workarounds}</p>
        </div>
      )}
    </div>
  );
}
