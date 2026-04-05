import { Activity } from "lucide-react";
import { formatFeedTimestamp, getFeedFreshness } from "@/lib/feed-status";

interface SiteFooterProps {
  updatedAt: string;
  version: number;
}

export function SiteFooter({ updatedAt, version }: SiteFooterProps) {
  const privacyHref = `${import.meta.env.BASE_URL}privacy.html`;
  const freshness = getFeedFreshness(updatedAt);

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground text-lg tracking-tight">Quant Pulse</span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Signal over noise in tech & crypto
          </p>
        </div>
        <div className="flex max-w-sm flex-col items-center gap-2 text-center md:items-end md:text-right">
          <p className="text-xs text-muted-foreground">
            Curated summaries for technology and crypto signals. Built for fast decision-making.
          </p>
          <p className="text-[11px] font-mono text-muted-foreground">
            Feed {freshness.state} • updated {formatFeedTimestamp(updatedAt)} UTC • v{version}
          </p>
          <a
            href={privacyHref}
            className="text-xs font-mono text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
