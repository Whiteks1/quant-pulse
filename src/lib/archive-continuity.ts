import type { ArchiveEditionSummary } from "@/data/loadArchiveData";

export interface ArchiveContinuityStep extends ArchiveEditionSummary {
  chronologicalIndex: number;
  totalEditions: number;
  isSelected: boolean;
  isBaseline: boolean;
  isLatest: boolean;
  isOldest: boolean;
}

export interface ArchiveContinuityModel {
  totalEditions: number;
  sequence: ArchiveContinuityStep[];
  selected: ArchiveContinuityStep | null;
  baseline: ArchiveContinuityStep | null;
  olderEdition: ArchiveContinuityStep | null;
  newerEdition: ArchiveContinuityStep | null;
  summary: string;
}

export function buildArchiveContinuity(
  editions: ArchiveEditionSummary[],
  selectedSlug: string | null,
  baselineSlug: string | null
): ArchiveContinuityModel {
  if (editions.length === 0) {
    return {
      totalEditions: 0,
      sequence: [],
      selected: null,
      baseline: null,
      olderEdition: null,
      newerEdition: null,
      summary: "No published archive editions are available yet.",
    };
  }

  const chronological = [...editions].reverse();
  const selectedEdition =
    chronological.find((edition) => edition.slug === selectedSlug) ?? chronological.at(-1) ?? null;
  const baselineEdition = baselineSlug
    ? chronological.find((edition) => edition.slug === baselineSlug) ?? null
    : null;

  const sequence = chronological.map((edition, index) => ({
    ...edition,
    chronologicalIndex: index,
    totalEditions: chronological.length,
    isSelected: edition.slug === selectedEdition?.slug,
    isBaseline: edition.slug === baselineEdition?.slug,
    isLatest: index === chronological.length - 1,
    isOldest: index === 0,
  }));

  const selected = sequence.find((edition) => edition.isSelected) ?? null;
  const baseline = sequence.find((edition) => edition.isBaseline) ?? null;
  const olderEdition = selected ? sequence[selected.chronologicalIndex - 1] ?? null : null;
  const newerEdition = selected ? sequence[selected.chronologicalIndex + 1] ?? null : null;

  return {
    totalEditions: sequence.length,
    sequence,
    selected,
    baseline,
    olderEdition,
    newerEdition,
    summary: buildContinuitySummary(sequence.length, selected, baseline, olderEdition, newerEdition),
  };
}

function buildContinuitySummary(
  totalEditions: number,
  selected: ArchiveContinuityStep | null,
  baseline: ArchiveContinuityStep | null,
  olderEdition: ArchiveContinuityStep | null,
  newerEdition: ArchiveContinuityStep | null
): string {
  if (!selected) {
    return "No published archive editions are available yet.";
  }

  if (totalEditions === 1) {
    return "Only one published archive edition is available so far.";
  }

  if (selected.isLatest && baseline) {
    return `Latest published edition. Baseline comparison is ${baseline.label}.`;
  }

  if (baseline && newerEdition) {
    return `Following continuity from ${selected.label} toward ${newerEdition.label}. Baseline comparison is ${baseline.label}.`;
  }

  if (olderEdition) {
    return `Viewing ${selected.label} with ${olderEdition.label} immediately behind it in the published sequence.`;
  }

  return `Viewing ${selected.label} within a ${totalEditions}-edition published archive sequence.`;
}
