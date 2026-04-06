import type { NewsItem, QuantPulseSourceTier } from "@/data/mockNews";

const sourceTierLabels: Record<QuantPulseSourceTier, string> = {
  primary: "Primary source",
  tier_1: "Tier 1 source",
  tier_2: "Tier 2 source",
  tier_3: "Tier 3 source",
  unlisted: "Unlisted source",
};

export function formatSourceTierLabel(sourceTier: QuantPulseSourceTier): string {
  return sourceTierLabels[sourceTier];
}

export function getEditorialLens(item: Pick<NewsItem, "scoreJustification">): string {
  const { marketImpact, structuralImpact } = item.scoreJustification;

  if (marketImpact - structuralImpact >= 5) return "Market impact";
  if (structuralImpact - marketImpact >= 5) return "Structural impact";
  return "Balanced impact";
}

export function getEditorialRationalePreview(rationale: string, maxLength = 110): string {
  const normalized = rationale.trim().replace(/\s+/g, " ");

  if (normalized.length <= maxLength) return normalized;

  const trimmed = normalized.slice(0, maxLength);
  const safeBoundary = trimmed.lastIndexOf(" ");
  const preview = safeBoundary > 0 ? trimmed.slice(0, safeBoundary) : trimmed;

  return `${preview.trimEnd().replace(/[.,;:!?-]+$/, "")}...`;
}
