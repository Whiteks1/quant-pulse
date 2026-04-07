import { ArrowRightLeft, BarChart3, Layers3, Signal, Sparkles, Zap } from "lucide-react";
import type { ArchiveEditionComparison } from "@/lib/archive-intelligence";
import { cn } from "@/lib/utils";

interface ArchiveIntelligenceProps {
  comparison: ArchiveEditionComparison | null;
}

export function ArchiveIntelligence({ comparison }: ArchiveIntelligenceProps) {
  if (!comparison) return null;

  return (
    <section className="container py-8">
      <div className="rounded-[1.5rem] border border-border bg-card px-5 py-5 shadow-sm md:px-6">
        <div className="flex flex-col gap-3 border-b border-border/70 pb-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Archive Intelligence
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              What changed versus {comparison.baseline.label}
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              A compact edition-to-edition comparison using only published archive snapshots.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <DeltaCard icon={Layers3} label="Stories tracked" metric={comparison.totals} />
          <DeltaCard icon={Signal} label="Signals" metric={comparison.signals} />
          <DeltaCard icon={Zap} label="P1 count" metric={comparison.p1} />
        </div>

        <div className="mt-5 rounded-2xl border border-border/70 bg-background/65 p-4 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border/60 pb-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Change highlights
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Story-level deltas that help explain what changed and why it matters between
                published editions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
              <SummaryChip label="Added" value={comparison.storyChanges.added} />
              <SummaryChip label="Removed" value={comparison.storyChanges.removed} />
              <SummaryChip label="Raised" value={comparison.storyChanges.priorityRaised} />
              <SummaryChip label="Lowered" value={comparison.storyChanges.priorityLowered} />
            </div>
          </div>

          {comparison.highlights.length > 0 ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {comparison.highlights.map((highlight) => (
                <article
                  key={highlight.id}
                  className={cn(
                    "rounded-2xl border bg-card/90 px-4 py-4 shadow-sm",
                    highlight.kind === "new-story" && "border-cyan-500/30",
                    highlight.kind === "removed-story" && "border-border/70",
                    highlight.kind === "priority-raised" && "border-emerald-500/30",
                    highlight.kind === "priority-lowered" && "border-amber-500/30"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.14em]",
                      highlight.kind === "new-story" && "bg-cyan-500/10 text-cyan-300",
                      highlight.kind === "removed-story" && "bg-secondary text-muted-foreground",
                      highlight.kind === "priority-raised" && "bg-emerald-500/10 text-emerald-300",
                      highlight.kind === "priority-lowered" && "bg-amber-500/10 text-amber-300"
                    )}
                  >
                    {highlight.label}
                  </span>
                  <h3 className="mt-3 text-base font-semibold leading-snug text-foreground">
                    {highlight.title}
                  </h3>
                  <p className="mt-2 text-xs font-mono text-muted-foreground">{highlight.meta}</p>
                  <p className="mt-3 text-sm leading-relaxed text-secondary-foreground">
                    {highlight.whyItMatters}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-border/70 bg-card/70 px-4 py-5">
              <p className="text-sm text-secondary-foreground">
                No story-level deltas detected between these published editions yet.
              </p>
              <p className="mt-2 text-xs font-mono text-muted-foreground">
                As more snapshots are published, this panel will surface additions, removals, and
                priority changes without relying on unpublished draft state.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-border/70 bg-background/65 p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" />
            Section mix
          </div>
          <div className="space-y-4">
            {comparison.sectionMix.map((entry) => (
              <div key={entry.label} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{entry.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-mono",
                        entry.delta > 0 && "bg-emerald-500/10 text-emerald-300",
                        entry.delta < 0 && "bg-red-500/10 text-red-200",
                        entry.delta === 0 && "bg-secondary text-muted-foreground"
                      )}
                    >
                      {formatDelta(entry.delta)}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatPercent(entry.currentShare)} now • {formatPercent(entry.previousShare)} before
                  </span>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <SectionMixBar label="Current" count={entry.currentCount} share={entry.currentShare} />
                  <SectionMixBar label="Baseline" count={entry.previousCount} share={entry.previousShare} muted />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full bg-secondary px-2.5 py-1">
      {label} {value}
    </span>
  );
}

function DeltaCard({
  icon: Icon,
  label,
  metric,
}: {
  icon: typeof Layers3;
  label: string;
  metric: { current: number; previous: number; delta: number };
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/65 px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{metric.current}</p>
          <p className="text-xs text-muted-foreground">Baseline {metric.previous}</p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-mono",
            metric.delta > 0 && "bg-emerald-500/10 text-emerald-300",
            metric.delta < 0 && "bg-red-500/10 text-red-200",
            metric.delta === 0 && "bg-secondary text-muted-foreground"
          )}
        >
          {formatDelta(metric.delta)}
        </span>
      </div>
    </div>
  );
}

function SectionMixBar({
  label,
  count,
  share,
  muted = false,
}: {
  label: string;
  count: number;
  share: number;
  muted?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/80 px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
        <span className="text-xs font-mono text-muted-foreground">
          {count} · {formatPercent(share)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full", muted ? "bg-muted-foreground/45" : "bg-primary")}
          style={{ width: `${share * 100}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatDelta(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return String(value);
  return "0";
}
