import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  AI: "bg-primary/15 text-primary border-primary/20",
  Software: "bg-secondary text-secondary-foreground border-border",
  Cybersecurity: "bg-noise/15 text-noise border-noise/20",
  "Big Tech": "bg-accent/15 text-accent border-accent/20",
  Startups: "bg-secondary text-secondary-foreground border-border",
  Cloud: "bg-primary/10 text-primary border-primary/15",
  Chips: "bg-highlight/15 text-highlight border-highlight/20",
  "Developer Tools": "bg-muted text-muted-foreground border-border",
  Infrastructure: "bg-accent/10 text-accent border-accent/15",
  BTC: "bg-highlight/15 text-highlight border-highlight/20",
  ETH: "bg-primary/15 text-primary border-primary/20",
  Altcoins: "bg-muted text-muted-foreground border-border",
  ETFs: "bg-highlight/15 text-highlight border-highlight/20",
  Regulation: "bg-highlight/15 text-highlight border-highlight/20",
  Exchanges: "bg-secondary text-secondary-foreground border-border",
  DeFi: "bg-accent/15 text-accent border-accent/20",
  Stablecoins: "bg-primary/10 text-primary border-primary/15",
  Security: "bg-noise/15 text-noise border-noise/20",
  Flows: "bg-highlight/10 text-highlight border-highlight/15",
  "Market Structure": "bg-muted text-muted-foreground border-border",
  Custody: "bg-secondary text-secondary-foreground border-border",
  "Monetary Policy": "bg-accent/15 text-accent border-accent/20",
  Inflation: "bg-noise/10 text-noise border-noise/15",
  Rates: "bg-primary/15 text-primary border-primary/20",
  Liquidity: "bg-highlight/15 text-highlight border-highlight/20",
  "Global Markets": "bg-muted text-muted-foreground border-border",
  "Risk Sentiment": "bg-accent/10 text-accent border-accent/15",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium font-mono uppercase tracking-wider",
        categoryColors[category] || "bg-secondary text-secondary-foreground border-border",
      )}
    >
      {category}
    </span>
  );
}
