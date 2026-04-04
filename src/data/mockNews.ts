export type QuantPulseSection = "Technology" | "Crypto & Markets" | "Macro";
export type QuantPulsePriority = "P1" | "P2" | "P3";

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  /** ISO 8601 UTC (canónico) */
  publishedAt: string;
  category: string;
  section: QuantPulseSection;
  summary: string;
  whyItMatters: string;
  impact: string;
  tags: string[];
  signalVsNoise: "signal" | "noise";
  priority: QuantPulsePriority;
  relevanceScore: number;
  dedupeKey: string;
  imageUrl?: string;
  imageAlt?: string;
  imageSource?: string;
  /** Destacado en UI; debe ser coherente con priority/score editorial */
  featured?: boolean;
}

export interface WatchItem {
  id: string;
  title: string;
  date: string;
  type: "earnings" | "regulation" | "event" | "market";
  description: string;
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
