import type { BriefLanguagePattern } from "@/types/database";

interface LanguagePatternProps {
  pattern: BriefLanguagePattern;
}

export function LanguagePattern({ pattern }: LanguagePatternProps) {
  return (
    <div className="flex gap-3 rounded-md border p-3">
      <div className="flex-1 space-y-1">
        <p className="text-xs font-medium text-green-600 dark:text-green-400">
          Say this
        </p>
        <p className="text-sm">&ldquo;{pattern.user_says}&rdquo;</p>
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-xs font-medium text-red-600 dark:text-red-400">
          Not this
        </p>
        <p className="text-sm text-muted-foreground line-through">
          &ldquo;{pattern.not_say}&rdquo;
        </p>
      </div>
      <div className="hidden flex-1 space-y-1 sm:block">
        <p className="text-xs font-medium text-muted-foreground">Why</p>
        <p className="text-sm text-muted-foreground">{pattern.context}</p>
      </div>
    </div>
  );
}
