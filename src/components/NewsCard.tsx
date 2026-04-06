import { useState } from "react";
import type { NewsItem } from "@/data/mockNews";
import { formatSourceTierLabel, getEditorialLens, getEditorialRationalePreview } from "@/lib/news-card-metadata";
import { relevanceTierFromScore } from "@/lib/relevance";
import { CategoryBadge } from "./CategoryBadge";
import { RelevanceDot } from "./RelevanceDot";
import { ExternalLink } from "lucide-react";

interface NewsCardProps {
  item: NewsItem;
  variant?: "default" | "featured";
}

const priorityStyles: Record<NewsItem["priority"], string> = {
  P1: "border-highlight/30 bg-highlight/10 text-highlight",
  P2: "border-primary/25 bg-primary/10 text-primary",
  P3: "border-border bg-muted/50 text-muted-foreground",
};

const signalStyles: Record<NewsItem["signalVsNoise"], string> = {
  signal: "border-accent/25 bg-accent/10 text-accent",
  noise: "border-noise/25 bg-noise/10 text-noise",
};

const sourceTierStyles: Record<NewsItem["sourceTier"], string> = {
  primary: "text-accent",
  tier_1: "text-primary",
  tier_2: "text-highlight",
  tier_3: "text-muted-foreground",
  unlisted: "text-noise",
};

function resolveImageUrl(imageUrl?: string): string | null {
  if (!imageUrl) return null;
  if (/^(https?:)?\/\//.test(imageUrl) || imageUrl.startsWith("data:")) return imageUrl;

  const base = import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
  return `${normalizedBase}${normalizedPath}`;
}

export function NewsCard({ item, variant = "default" }: NewsCardProps) {
  const isFeatured = variant === "featured";
  const relevance = relevanceTierFromScore(item.relevanceScore);
  const resolvedImageUrl = resolveImageUrl(item.imageUrl);
  const [imageAvailable, setImageAvailable] = useState(Boolean(resolvedImageUrl));
  const imageUrl = imageAvailable ? resolvedImageUrl : null;
  const sourceTierLabel = formatSourceTierLabel(item.sourceTier);
  const editorialLens = getEditorialLens(item);
  const editorialRationale = getEditorialRationalePreview(item.scoreJustification.rationale);

  return (
    <article
      className={`rounded-lg border bg-card p-5 card-hover flex flex-col gap-3 ${
        isFeatured ? "border-primary/20 md:p-6" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={item.category} />
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono font-medium uppercase tracking-wider ${
              priorityStyles[item.priority]
            }`}
          >
            {item.priority}
          </span>
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono font-medium uppercase tracking-wider ${
              signalStyles[item.signalVsNoise]
            }`}
          >
            {item.signalVsNoise}
          </span>
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-[11px] font-mono uppercase tracking-[0.12em] ${sourceTierStyles[item.sourceTier]}`}>
            {sourceTierLabel}
          </p>
          <p className="text-xs text-muted-foreground font-mono">{item.source}</p>
        </div>
      </div>

      {imageUrl ? (
        <figure className="overflow-hidden rounded-md border border-border/70 bg-surface-raised">
          <div className={`relative overflow-hidden ${isFeatured ? "aspect-[16/9]" : "aspect-[16/10]"}`}>
            <img
              src={imageUrl}
              alt={item.imageAlt || item.title}
              className="h-full w-full object-cover saturate-[0.9]"
              loading="lazy"
              onError={() => setImageAvailable(false)}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/25 via-transparent to-transparent" />
          </div>
          {item.imageSource ? (
            <figcaption className="flex items-center justify-between border-t border-border/70 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              <span>Visual</span>
              <span>{item.imageSource}</span>
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      <h3 className={`font-semibold leading-snug text-foreground ${isFeatured ? "text-lg" : "text-base"}`}>
        {item.title}
      </h3>

      <p className="text-sm text-secondary-foreground leading-relaxed">
        {item.summary}
      </p>

      <div className="grid gap-2 rounded-md border border-border/70 bg-surface-raised/70 p-3 sm:grid-cols-3">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">Score</p>
          <div className="mt-1 flex items-center gap-2">
            <RelevanceDot relevance={relevance} />
            <span className="text-sm font-semibold text-foreground">{item.relevanceScore}</span>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">Source</p>
          <p className="mt-1 text-sm font-medium text-foreground">{sourceTierLabel}</p>
        </div>
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">Lens</p>
          <p className="mt-1 text-sm font-medium text-foreground">{editorialLens}</p>
        </div>
      </div>

      <div className="rounded-md bg-surface-raised px-3 py-2">
        <p className="text-xs font-medium text-primary mb-1 uppercase tracking-wider">Why it matters</p>
        <p className="text-sm text-secondary-foreground">{item.whyItMatters}</p>
      </div>

      <div className="rounded-md border border-border/70 bg-background/40 px-3 py-2">
        <p className="mb-1 text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground">
          Editorial rationale
        </p>
        <p className="text-sm text-secondary-foreground">{editorialRationale}</p>
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
