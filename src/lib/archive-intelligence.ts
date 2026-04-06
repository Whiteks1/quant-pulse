import type { ArchiveEditionSummary } from "@/data/loadArchiveData";
import type { NewsItem } from "@/data/mockNews";

export interface ArchiveDelta {
  current: number;
  previous: number;
  delta: number;
}

export interface SectionMixDelta {
  label: string;
  currentCount: number;
  previousCount: number;
  delta: number;
  currentShare: number;
  previousShare: number;
}

export interface ArchiveEditionComparison {
  baseline: ArchiveEditionSummary;
  totals: ArchiveDelta;
  signals: ArchiveDelta;
  p1: ArchiveDelta;
  sectionMix: SectionMixDelta[];
}

const orderedSections = ["Technology", "Crypto & Markets", "Macro"] as const;

function share(count: number, total: number): number {
  if (total <= 0) return 0;
  return count / total;
}

export function getComparisonEdition(
  editions: ArchiveEditionSummary[],
  selectedSlug: string | null
): ArchiveEditionSummary | null {
  if (editions.length < 2) return null;

  const selectedIndex = editions.findIndex((edition) => edition.slug === selectedSlug);
  if (selectedIndex === -1) return editions[1] ?? null;

  return editions[selectedIndex + 1] ?? editions[selectedIndex - 1] ?? null;
}

export function buildArchiveEditionComparison(
  current: ArchiveEditionSummary,
  baseline: ArchiveEditionSummary,
  currentItems: NewsItem[],
  previousItems: NewsItem[]
): ArchiveEditionComparison {
  const currentTotal = currentItems.length;
  const previousTotal = previousItems.length;

  return {
    baseline,
    totals: {
      current: current.totalItems,
      previous: baseline.totalItems,
      delta: current.totalItems - baseline.totalItems,
    },
    signals: {
      current: current.signalCount,
      previous: baseline.signalCount,
      delta: current.signalCount - baseline.signalCount,
    },
    p1: {
      current: current.p1Count,
      previous: baseline.p1Count,
      delta: current.p1Count - baseline.p1Count,
    },
    sectionMix: orderedSections.map((label) => {
      const currentCount = currentItems.filter((item) => item.section === label).length;
      const previousCount = previousItems.filter((item) => item.section === label).length;

      return {
        label,
        currentCount,
        previousCount,
        delta: currentCount - previousCount,
        currentShare: share(currentCount, currentTotal),
        previousShare: share(previousCount, previousTotal),
      };
    }),
  };
}
