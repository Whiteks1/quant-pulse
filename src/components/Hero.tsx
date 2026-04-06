import { Activity, Archive, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFeedTimestamp } from "@/lib/feed-status";

interface HeroProps {
  onViewPulse: () => void;
  onBrowseArchive: () => void;
  updatedAt: string;
  totalItems: number;
  signalCount: number;
}

export function Hero({
  onViewPulse,
  onBrowseArchive,
  updatedAt,
  totalItems,
  signalCount,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-gradient-hero">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="container relative grid gap-10 py-20 md:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="flex flex-col gap-6 text-center lg:text-left">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <Activity className="h-8 w-8 text-primary animate-pulse-glow" />
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Quant Pulse
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Upstream signal layer
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter">
            <span className="text-gradient-primary">Quant</span>{" "}
            <span className="text-foreground">Pulse</span>
          </h1>

          <p className="text-lg md:text-xl font-medium text-primary font-mono tracking-wide">
            Signal over noise in tech & crypto
          </p>

          <p className="max-w-2xl text-secondary-foreground text-sm md:text-base leading-relaxed">
            Quant Pulse filters market context into prioritized research intents,
            so QuantLab Research can validate what matters and ignore the rest.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Button
              size="lg"
              onClick={onViewPulse}
              className="bg-gradient-primary text-primary-foreground font-semibold px-6 hover:opacity-90 transition-opacity shadow-[0_14px_32px_-12px_rgba(90,169,255,0.45)]"
            >
              <Activity className="mr-2 h-4 w-4" />
              View Today's Pulse
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onBrowseArchive}
              className="border-border bg-background/30 text-foreground hover:bg-secondary"
            >
              <Archive className="mr-2 h-4 w-4" />
              Browse Archive
            </Button>
          </div>

          <p className="text-xs text-muted-foreground font-mono">
            Updated {formatFeedTimestamp(updatedAt)} UTC • {totalItems} stories tracked • {signalCount} signals
          </p>
        </div>

        <div className="rounded-[28px] border border-border/70 bg-card/70 p-5 shadow-[var(--shadow-elevated)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-4">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Signal console
              </div>
              <div className="mt-1 text-lg font-semibold text-foreground">
                QuantPulse ↔ QuantLab Research
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.16em] text-accent">
              <ShieldCheck className="h-3.5 w-3.5" />
              Live
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Routing
              </div>
              <div className="mt-2 text-sm font-semibold text-foreground">Research intents</div>
              <p className="mt-2 text-sm text-secondary-foreground">
                Structured handoff only when a story can become a hypothesis, risk filter, or product priority.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Boundary
              </div>
              <div className="mt-2 text-sm font-semibold text-foreground">QuantLab Research</div>
              <p className="mt-2 text-sm text-secondary-foreground">
                QuantLab validates; Quant Pulse does not decide trades or execution.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Output
              </div>
              <div className="mt-2 text-sm font-semibold text-foreground">Signal / noise split</div>
              <p className="mt-2 text-sm text-secondary-foreground">
                Prioritize only what changes risk, narrative, or research direction.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-background/50 p-4 font-mono text-xs text-secondary-foreground">
            <div className="flex items-center justify-between gap-3">
              <span className="uppercase tracking-[0.18em] text-muted-foreground">Status</span>
              <span className="text-accent">Upstream signal layer</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-card/60 px-3 py-2">
                <span className="text-muted-foreground">Stories</span>
                <div className="mt-1 text-sm text-foreground">{totalItems}</div>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/60 px-3 py-2">
                <span className="text-muted-foreground">Signals</span>
                <div className="mt-1 text-sm text-foreground">{signalCount}</div>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/60 px-3 py-2">
                <span className="text-muted-foreground">Updated</span>
                <div className="mt-1 text-sm text-foreground">{formatFeedTimestamp(updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
