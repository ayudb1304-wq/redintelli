import { Badge } from "@/components/ui/badge";
import type { BriefMentionedProduct } from "@/types/database";

interface MentionedProductsProps {
  products: BriefMentionedProduct[];
}

function getSentimentVariant(sentiment: string) {
  if (sentiment === "positive") return "default";
  if (sentiment === "negative") return "destructive";
  return "secondary";
}

export function MentionedProducts({ products }: MentionedProductsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <div key={product.name} className="rounded-md border p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{product.name}</p>
            <Badge variant={getSentimentVariant(product.sentiment)} className="text-xs">
              {product.sentiment}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Mentions: {product.mentions}
          </p>
          {product.context && (
            <p className="text-xs text-muted-foreground">{product.context}</p>
          )}
        </div>
      ))}
    </div>
  );
}
