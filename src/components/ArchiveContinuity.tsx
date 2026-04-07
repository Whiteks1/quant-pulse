import { ArrowLeft, ArrowRight, Calendar, History } from "lucide-react";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import type { ArchiveContinuityModel, ArchiveContinuityStep } from "@/lib/archive-continuity";
import { formatFeedTimestamp } from "@/lib/feed-status";
import { cn } from "@/lib/utils";

interface ArchiveContinuityProps {
  continuity: ArchiveContinuityModel;
  onSelectEdition: (slug: string) => void;
}

export function ArchiveContinuity({ continuity, onSelectEdition }: ArchiveContinuityProps) {
  if (!continuity.selected) return null;

  return (
    <section className="container py-8">
      <div className="rounded-[1.5rem] border border-border bg-card px-5 py-5 shadow-sm md:px-6">
        <div className="flex flex-col gap-4 border-b border-border/70 pb-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <History className="h-3.5 w-3.5" />
              Archive continuity
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Follow the published sequence
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">{continuity.summary}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {continuity.olderEdition ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => onSelectEdition(continuity.olderEdition!.slug)}
              >
                <ArrowLeft className="h-4 w-4" />
                Older snapshot
              </Button>
            ) : null}
            {continuity.newerEdition ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => onSelectEdition(continuity.newerEdition!.slug)}
              >
                Newer snapshot
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
          <MetaChip label={`Edition ${continuity.selected.chronologicalIndex + 1} of ${continuity.totalEditions}`} />
          <MetaChip label={`${continuity.totalEditions} published snapshots`} />
          {continuity.baseline ? <MetaChip label={`Baseline ${continuity.baseline.label}`} /> : null}
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {continuity.sequence.map((edition) => (
            <EditionCard key={edition.slug} edition={edition} onSelectEdition={onSelectEdition} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MetaChip({ label }: { label: string }) {
  return <span className="rounded-full bg-secondary px-2.5 py-1">{label}</span>;
}

function EditionCard({
  edition,
  onSelectEdition,
}: {
  edition: ArchiveContinuityStep;
  onSelectEdition: (slug: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelectEdition(edition.slug)}
      className={cn(
        "rounded-2xl border px-4 py-4 text-left shadow-sm transition-colors",
        edition.isSelected
          ? "border-primary bg-background/70"
          : "border-border/70 bg-background/50 hover:border-primary/40 hover:bg-background/70"
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {edition.isOldest ? <StateBadge tone="neutral" label="Sequence start" /> : null}
            {edition.isLatest ? <StateBadge tone="info" label="Latest published" /> : null}
            {edition.isSelected ? <StateBadge tone="primary" label="Selected" /> : null}
            {edition.isBaseline ? <StateBadge tone="success" label="Comparison baseline" /> : null}
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground">{edition.label}</h3>
            <p className="mt-1 text-xs font-mono text-muted-foreground">
              {edition.totalItems} stories • {edition.signalCount} signals • {edition.p1Count} P1
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          v{edition.version}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1 text-sm text-secondary-foreground">
        <span>{formatFeedTimestamp(edition.updatedAt)} UTC</span>
        <span className="text-xs font-mono text-muted-foreground">
          Updated {formatDistanceToNowStrict(parseISO(edition.updatedAt), { addSuffix: true })}
        </span>
      </div>
    </button>
  );
}

function StateBadge({
  label,
  tone,
}: {
  label: string;
  tone: "primary" | "success" | "info" | "neutral";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.14em]",
        tone === "primary" && "bg-primary text-primary-foreground",
        tone === "success" && "bg-emerald-500/10 text-emerald-300",
        tone === "info" && "bg-cyan-500/10 text-cyan-300",
        tone === "neutral" && "bg-secondary text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
}
