import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  AI: "bg-primary/15 text-primary border-primary/20",
  "Big Tech": "bg-accent/15 text-accent border-accent/20",
  Cybersecurity: "bg-noise/15 text-noise border-noise/20",
  ETF: "bg-highlight/15 text-highlight border-highlight/20",
  Blockchain: "bg-primary/15 text-primary border-primary/20",
  DeFi: "bg-accent/15 text-accent border-accent/20",
  Regulation: "bg-highlight/15 text-highlight border-highlight/20",
  Startups: "bg-secondary text-secondary-foreground border-border",
  NFT: "bg-muted text-muted-foreground border-border",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium font-mono uppercase tracking-wider",
        categoryColors[category] || "bg-secondary text-secondary-foreground border-border"
      )}
    >
      {category}
    </span>
  );
}
