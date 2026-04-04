import type { NewsItem } from "@/data/mockNews";
import { relevanceTierFromScore } from "@/lib/relevance";
import { CategoryBadge } from "./CategoryBadge";
import { RelevanceDot } from "./RelevanceDot";
import { ExternalLink } from "lucide-react";

interface NewsCardProps {
  item: NewsItem;
  variant?: "default" | "featured";
}

export function NewsCard({ item, variant = "default" }: NewsCardProps) {
  const isFeatured = variant === "featured";
  const relevance = relevanceTierFromScore(item.relevanceScore);

  return (
    <article
      className={`rounded-lg border bg-card p-5 card-hover flex flex-col gap-3 ${
        isFeatured ? "border-primary/20 md:p-6" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={item.category} />
          <RelevanceDot relevance={relevance} />
        </div>
        <span className="text-xs text-muted-foreground font-mono shrink-0">
          {item.source}
        </span>
      </div>

      <h3 className={`font-semibold leading-snug text-foreground ${isFeatured ? "text-lg" : "text-base"}`}>
        {item.title}
      </h3>

      <p className="text-sm text-secondary-foreground leading-relaxed">
        {item.summary}
      </p>

      <div className="rounded-md bg-surface-raised px-3 py-2">
        <p className="text-xs font-medium text-primary mb-1 uppercase tracking-wider">Why it matters</p>
        <p className="text-sm text-secondary-foreground">{item.whyItMatters}</p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground font-mono">
          {item.impact}
        </span>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Read source
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </article>
  );
}
