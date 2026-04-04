import { Activity } from "lucide-react";

export function SiteFooter() {
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
        <p className="text-xs text-muted-foreground text-center md:text-right max-w-sm">
          Curated summaries for technology and crypto signals. Built for fast decision-making.
        </p>
      </div>
    </footer>
  );
}
