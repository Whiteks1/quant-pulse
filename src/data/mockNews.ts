export type QuantPulseSection = "Technology" | "Crypto & Markets" | "Macro";
export type QuantPulsePriority = "P1" | "P2" | "P3";
export type QuantPulseSourceTier = "primary" | "tier_1" | "tier_2" | "tier_3" | "unlisted";
export type QuantPulseLinkType = "article" | "source-section" | "source-home";

export interface ScoreJustification {
  recency: number;
  marketImpact: number;
  structuralImpact: number;
  sourceQuality: number;
  crossValidation: number;
  thematicRelevance: number;
  rationale: string;
}

export interface EditorialOverride {
  field: "priority" | "relevanceScore" | "signalVsNoise" | "section" | "category" | "scoreJustification.recency";
  reason: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  sourceTier: QuantPulseSourceTier;
  url: string;
  linkType: QuantPulseLinkType;
  /** ISO 8601 UTC (canónico) */
  publishedAt: string;
  /** ISO 8601 UTC del momento en que se fijó el bloque de recencia; opcional mientras convive contenido histórico */
  scoredAt?: string;
  category: string;
  section: QuantPulseSection;
  summary: string;
  whyItMatters: string;
  impact: string;
  tags: string[];
  signalVsNoise: "signal" | "noise";
  priority: QuantPulsePriority;
  relevanceScore: number;
  scoreJustification: ScoreJustification;
  dedupeKey: string;
  editorialOverride?: EditorialOverride;
  imageUrl?: string;
  imageAlt?: string;
  imageSource?: string;
  /** Destacado en UI; debe ser coherente con priority/score editorial */
  featured?: boolean;
}

export interface ExecutiveBriefItem {
  id: string;
  itemId: string;
  text: string;
}

export interface WatchItem {
  id: string;
  title: string;
  date: string;
  section: QuantPulseSection;
  category: string;
  type: "earnings" | "regulation" | "event" | "market";
  source: string;
  url: string;
  description: string;
  whyWatch: string;
}

/** Categorías permitidas por taxonomía (`docs/category-taxonomy.es.md`) + "All" para filtros. */
export const categories = [
  "All",
  "AI",
  "Software",
  "Cybersecurity",
  "Big Tech",
  "Startups",
  "Cloud",
  "Chips",
  "Developer Tools",
  "Infrastructure",
  "BTC",
  "ETH",
  "Altcoins",
  "ETFs",
  "Regulation",
  "Exchanges",
  "DeFi",
  "Stablecoins",
  "Security",
  "Flows",
  "Market Structure",
  "Custody",
  "Monetary Policy",
  "Inflation",
  "Rates",
  "Liquidity",
  "Global Markets",
  "Risk Sentiment",
] as const;

export const sections = ["All", "Technology", "Crypto & Markets", "Macro"] as const;
