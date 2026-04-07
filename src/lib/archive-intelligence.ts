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
  storyChanges: ArchiveStoryChanges;
  highlights: ArchiveChangeHighlight[];
}

const orderedSections = ["Technology", "Crypto & Markets", "Macro"] as const;
const priorityRank = { P1: 0, P2: 1, P3: 2 } as const;

export interface ArchiveStoryChanges {
  added: number;
  removed: number;
  priorityRaised: number;
  priorityLowered: number;
}

export interface ArchiveChangeHighlight {
  id: string;
  kind: "new-story" | "removed-story" | "priority-raised" | "priority-lowered";
  label: string;
  title: string;
  meta: string;
  whyItMatters: string;
}

interface PriorityChange {
  current: NewsItem;
  previous: NewsItem;
}

function share(count: number, total: number): number {
  if (total <= 0) return 0;
  return count / total;
}

function storyKey(item: NewsItem): string {
  return item.dedupeKey || item.id;
}

function comparePriority(current: NewsItem, previous: NewsItem): number {
  return priorityRank[current.priority] - priorityRank[previous.priority];
}

function sortStories(items: NewsItem[]): NewsItem[] {
  return [...items].sort((left, right) => {
    const priorityDelta = priorityRank[left.priority] - priorityRank[right.priority];
    if (priorityDelta !== 0) return priorityDelta;
    if (left.signalVsNoise !== right.signalVsNoise) {
      return left.signalVsNoise === "signal" ? -1 : 1;
    }
    return right.relevanceScore - left.relevanceScore;
  });
}

function sortPriorityChanges(changes: PriorityChange[]): PriorityChange[] {
  return [...changes].sort((left, right) => {
    const leftMagnitude = Math.abs(comparePriority(left.current, left.previous));
    const rightMagnitude = Math.abs(comparePriority(right.current, right.previous));
    if (leftMagnitude !== rightMagnitude) return rightMagnitude - leftMagnitude;

    const priorityDelta = priorityRank[left.current.priority] - priorityRank[right.current.priority];
    if (priorityDelta !== 0) return priorityDelta;

    return right.current.relevanceScore - left.current.relevanceScore;
  });
}

function formatStoryMeta(item: NewsItem): string {
  return `${item.section} • ${item.category} • ${item.source}`;
}

function buildStoryHighlights(
  addedStories: NewsItem[],
  removedStories: NewsItem[],
  raisedStories: PriorityChange[],
  loweredStories: PriorityChange[]
): ArchiveChangeHighlight[] {
  const candidates: Array<ArchiveChangeHighlight | null> = [
    raisedStories[0]
      ? {
          id: `priority-raised:${storyKey(raisedStories[0].current)}`,
          kind: "priority-raised",
          label: `Priority raised to ${raisedStories[0].current.priority}`,
          title: raisedStories[0].current.title,
          meta: formatStoryMeta(raisedStories[0].current),
          whyItMatters: raisedStories[0].current.whyItMatters,
        }
      : null,
    addedStories[0]
      ? {
          id: `new-story:${storyKey(addedStories[0])}`,
          kind: "new-story",
          label: addedStories[0].priority === "P1" ? "New P1 story" : "New tracked story",
          title: addedStories[0].title,
          meta: formatStoryMeta(addedStories[0]),
          whyItMatters: addedStories[0].whyItMatters,
        }
      : null,
    removedStories[0]
      ? {
          id: `removed-story:${storyKey(removedStories[0])}`,
          kind: "removed-story",
          label: "No longer in latest edition",
          title: removedStories[0].title,
          meta: formatStoryMeta(removedStories[0]),
          whyItMatters: removedStories[0].whyItMatters,
        }
      : null,
    loweredStories[0]
      ? {
          id: `priority-lowered:${storyKey(loweredStories[0].current)}`,
          kind: "priority-lowered",
          label: `Priority lowered to ${loweredStories[0].current.priority}`,
          title: loweredStories[0].current.title,
          meta: formatStoryMeta(loweredStories[0].current),
          whyItMatters: loweredStories[0].current.whyItMatters,
        }
      : null,
  ];

  return candidates.filter((candidate): candidate is ArchiveChangeHighlight => Boolean(candidate));
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
  const previousByKey = new Map(previousItems.map((item) => [storyKey(item), item]));
  const currentByKey = new Map(currentItems.map((item) => [storyKey(item), item]));
  const addedStories = sortStories(
    currentItems.filter((item) => !previousByKey.has(storyKey(item)))
  );
  const removedStories = sortStories(
    previousItems.filter((item) => !currentByKey.has(storyKey(item)))
  );
  const raisedStories = sortPriorityChanges(
    currentItems.flatMap((item) => {
      const previousItem = previousByKey.get(storyKey(item));
      if (!previousItem || previousItem.priority === item.priority) return [];
      if (comparePriority(item, previousItem) < 0) {
        return [{ current: item, previous: previousItem }];
      }
      return [];
    })
  );
  const loweredStories = sortPriorityChanges(
    currentItems.flatMap((item) => {
      const previousItem = previousByKey.get(storyKey(item));
      if (!previousItem || previousItem.priority === item.priority) return [];
      if (comparePriority(item, previousItem) > 0) {
        return [{ current: item, previous: previousItem }];
      }
      return [];
    })
  );

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
    storyChanges: {
      added: addedStories.length,
      removed: removedStories.length,
      priorityRaised: raisedStories.length,
      priorityLowered: loweredStories.length,
    },
    highlights: buildStoryHighlights(addedStories, removedStories, raisedStories, loweredStories),
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
