import type { NewsItem } from "@/data/mockNews";
import { CheckCircle2, XCircle } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";

export function SignalVsNoise({ items }: { items: NewsItem[] }) {
  const signals = items.filter((n) => n.signalVsNoise === "signal");
  const noise = items.filter((n) => n.signalVsNoise === "noise");

  if (signals.length === 0 && noise.length === 0) return null;

  return (
    <section className="container py-12 md:py-16">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Signal vs Noise</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Signal */}
        <div className="rounded-lg border border-accent/20 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-accent" />
            <h3 className="font-semibold text-accent text-lg">Signal</h3>
            <span className="text-xs text-muted-foreground font-mono">Real impact</span>
          </div>
          <div className="space-y-3">
            {signals.length > 0 ? (
              signals.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-md bg-surface-raised">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CategoryBadge category={item.category} />
                    </div>
                    <p className="text-sm font-medium text-foreground leading-snug">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.impact}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-md bg-surface-raised px-4 py-3 text-sm text-muted-foreground">
                No signal stories in the current selection.
              </p>
            )}
          </div>
        </div>

        {/* Noise */}
        <div className="rounded-lg border border-noise/20 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="h-5 w-5 text-noise" />
            <h3 className="font-semibold text-noise text-lg">Noise</h3>
            <span className="text-xs text-muted-foreground font-mono">Hype / inflated</span>
          </div>
          <div className="space-y-3">
            {noise.length > 0 ? (
              noise.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-md bg-surface-raised">
                  <div className="h-1.5 w-1.5 rounded-full bg-noise mt-2 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CategoryBadge category={item.category} />
                    </div>
                    <p className="text-sm font-medium text-foreground leading-snug line-through decoration-noise/30">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.impact}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-md bg-surface-raised px-4 py-3 text-sm text-muted-foreground">
                No noise stories in the current selection.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
