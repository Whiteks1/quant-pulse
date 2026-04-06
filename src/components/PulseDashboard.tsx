import { Activity, Layers3, PieChart, Radar, RefreshCcw, ShieldAlert } from "lucide-react";
import type { NewsItem } from "@/data/mockNews";
import { formatFeedTimestamp, getFeedFreshness } from "@/lib/feed-status";
import { getPulseDashboardMetrics } from "@/lib/pulse-metrics";
import { cn } from "@/lib/utils";

interface PulseDashboardProps {
  items: NewsItem[];
  updatedAt: string;
}

export function PulseDashboard({ items, updatedAt }: PulseDashboardProps) {
  const metrics = getPulseDashboardMetrics(items);
  const freshness = getFeedFreshness(updatedAt);

  return (
    <section className="container py-8 md:py-10">
      <div className="rounded-[1.75rem] border border-border/70 bg-card/95 px-5 py-6 shadow-[0_30px_80px_-50px_hsl(var(--primary)/0.55)] backdrop-blur md:px-7">
        <div className="flex flex-col gap-5 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-primary/80">
              Pulse Dashboard
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Lightweight signal instrumentation
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              A compact view of signal density, priority mix, source concentration, and section balance for the current edition.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                freshness.state === "fresh" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
                freshness.state === "aging" && "border-amber-500/20 bg-amber-500/10 text-amber-200",
                freshness.state === "stale" && "border-destructive/20 bg-destructive/10 text-red-200"
              )}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              {freshness.state} feed
            </div>
            <p className="text-xs font-mono text-muted-foreground">
              Updated {formatFeedTimestamp(updatedAt)} UTC
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <KpiCard icon={Layers3} label="Stories tracked" value={String(metrics.totalItems)} helper="Current edition size" />
          <KpiCard icon={Radar} label="Signals" value={String(metrics.signalCount)} helper={`${formatPercent(metrics.signalShare)} of feed`} />
          <KpiCard icon={ShieldAlert} label="P1 count" value={String(metrics.p1Count)} helper="Highest-priority items" />
          <KpiCard icon={PieChart} label="% signal" value={formatPercent(metrics.signalShare)} helper={`${metrics.noiseCount} noise items`} />
          <KpiCard
            icon={Activity}
            label="Source concentration"
            value={metrics.topSource ? formatPercent(metrics.topSource.share) : "0%"}
            helper={
              metrics.topSource
                ? `${metrics.topSource.source} leads with ${metrics.topSource.count} stories`
                : "No source concentration yet"
            }
          />
          <KpiCard icon={RefreshCcw} label="Freshness" value={freshness.state} helper={freshness.relativeLabel} />
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr_1fr]">
          <DashboardPanel
            eyebrow="Priority"
            title="P1 / P2 / P3 mix"
            caption="How much urgency sits inside the current feed."
          >
            <PriorityBar entries={metrics.priorityDistribution} />
          </DashboardPanel>

          <DashboardPanel
            eyebrow="Signal"
            title="Signal vs noise"
            caption="Editorial ratio for the published edition."
          >
            <SignalNoiseMeter entries={metrics.signalNoiseDistribution} />
          </DashboardPanel>

          <DashboardPanel
            eyebrow="Coverage"
            title="Section balance"
            caption="Distribution across Technology, Crypto & Markets, and Macro."
          >
            <SectionBars entries={metrics.sectionDistribution} />
          </DashboardPanel>
        </div>
      </div>
    </section>
  );
}

interface KpiCardProps {
  icon: typeof Layers3;
  label: string;
  value: string;
  helper: string;
}

function KpiCard({ icon: Icon, label, value, helper }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/65 px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

interface DashboardPanelProps {
  eyebrow: string;
  title: string;
  caption: string;
  children: React.ReactNode;
}

function DashboardPanel({ eyebrow, title, caption, children }: DashboardPanelProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/65 px-4 py-4 shadow-sm">
      <div className="mb-4 space-y-1">
        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
        <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{caption}</p>
      </div>
      {children}
    </div>
  );
}

function PriorityBar({ entries }: { entries: Array<{ label: string; count: number; share: number }> }) {
  return (
    <div className="space-y-4">
      <div className="flex h-4 overflow-hidden rounded-full bg-secondary">
        {entries.map((entry) => (
          <div
            key={entry.label}
            className={cn(
              "h-full transition-all",
              entry.label === "P1" && "bg-primary",
              entry.label === "P2" && "bg-accent",
              entry.label === "P3" && "bg-muted-foreground/60"
            )}
            style={{ width: `${entry.share * 100}%` }}
            aria-hidden
          />
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {entries.map((entry) => (
          <LegendRow
            key={entry.label}
            label={entry.label}
            count={entry.count}
            share={entry.share}
            dotClassName={
              entry.label === "P1"
                ? "bg-primary"
                : entry.label === "P2"
                  ? "bg-accent"
                  : "bg-muted-foreground/60"
            }
          />
        ))}
      </div>
    </div>
  );
}

function SignalNoiseMeter({ entries }: { entries: Array<{ label: string; count: number; share: number }> }) {
  const [signalEntry, noiseEntry] = entries;

  return (
    <div className="space-y-4">
      <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full border border-border/70 bg-secondary/40">
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background: `conic-gradient(hsl(var(--primary)) 0 ${signalEntry.share * 360}deg, hsl(var(--muted-foreground) / 0.35) ${signalEntry.share * 360}deg 360deg)`,
          }}
        />
        <div className="absolute inset-6 rounded-full bg-card" />
        <div className="relative text-center">
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {formatPercent(signalEntry.share)}
          </p>
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            Signal
          </p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <LegendRow label={signalEntry.label} count={signalEntry.count} share={signalEntry.share} dotClassName="bg-primary" />
        <LegendRow label={noiseEntry.label} count={noiseEntry.count} share={noiseEntry.share} dotClassName="bg-muted-foreground/60" />
      </div>
    </div>
  );
}

function SectionBars({ entries }: { entries: Array<{ label: string; count: number; share: number }> }) {
  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div key={entry.label} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-foreground">{entry.label}</span>
            <span className="text-xs font-mono text-muted-foreground">
              {entry.count} · {formatPercent(entry.share)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full",
                entry.label === "Technology" && "bg-primary",
                entry.label === "Crypto & Markets" && "bg-accent",
                entry.label === "Macro" && "bg-highlight"
              )}
              style={{ width: `${entry.share * 100}%` }}
              aria-hidden
            />
          </div>
        </div>
      ))}
    </div>
  );
}

interface LegendRowProps {
  label: string;
  count: number;
  share: number;
  dotClassName: string;
}

function LegendRow({ label, count, share, dotClassName }: LegendRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/70 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className={cn("h-2.5 w-2.5 rounded-full", dotClassName)} />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <span className="text-xs font-mono text-muted-foreground">
        {count} · {formatPercent(share)}
      </span>
    </div>
  );
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
