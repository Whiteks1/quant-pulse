import { AlertTriangle, CheckCircle2, Clock3, Layers3, Signal, Zap } from "lucide-react";
import { formatFeedTimestamp, getFeedFreshness } from "@/lib/feed-status";
import { cn } from "@/lib/utils";

interface FeedStatusBarProps {
  updatedAt: string;
  version: number;
  totalItems: number;
  signalCount: number;
  p1Count: number;
}

const freshnessStyles = {
  fresh: {
    icon: CheckCircle2,
    label: "Fresh feed",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  },
  aging: {
    icon: Clock3,
    label: "Aging feed",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-200",
  },
  stale: {
    icon: AlertTriangle,
    label: "Stale feed",
    className: "border-destructive/20 bg-destructive/10 text-red-200",
  },
} as const;

export function FeedStatusBar({
  updatedAt,
  version,
  totalItems,
  signalCount,
  p1Count,
}: FeedStatusBarProps) {
  const freshness = getFeedFreshness(updatedAt);
  const config = freshnessStyles[freshness.state];
  const FreshnessIcon = config.icon;

  return (
    <section className="container py-6">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
        <div className="rounded-xl border border-border bg-card px-4 py-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                Feed Status
              </p>
              <p className="text-sm font-medium text-foreground">
                Updated {formatFeedTimestamp(updatedAt)}
              </p>
              <p className="text-xs text-muted-foreground">
                Last refresh was {freshness.relativeLabel}. Version {version}.
              </p>
            </div>
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                config.className
              )}
            >
              <FreshnessIcon className="h-3.5 w-3.5" />
              {config.label}
            </div>
          </div>
        </div>

        <StatusMetric
          icon={Layers3}
          label="Tracked"
          value={String(totalItems)}
          helper="Stories in this feed"
        />
        <StatusMetric
          icon={Signal}
          label="Signals"
          value={String(signalCount)}
          helper="Items marked as signal"
        />
        <StatusMetric
          icon={Zap}
          label="P1 Alerts"
          value={String(p1Count)}
          helper="Highest-priority stories"
        />
      </div>
    </section>
  );
}

interface StatusMetricProps {
  icon: typeof Layers3;
  label: string;
  value: string;
  helper: string;
}

function StatusMetric({ icon: Icon, label, value, helper }: StatusMetricProps) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between">
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
