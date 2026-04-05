import { formatDistanceToNowStrict, parseISO } from "date-fns";
import type { NewsItem } from "@/data/mockNews";

export type FeedFreshnessState = "fresh" | "aging" | "stale";

export interface FeedFreshnessMeta {
  state: FeedFreshnessState;
  hoursOld: number;
  relativeLabel: string;
}

export interface FeedStats {
  totalItems: number;
  signalCount: number;
  noiseCount: number;
  p1Count: number;
}

export function getFeedFreshness(updatedAt: string, now: Date = new Date()): FeedFreshnessMeta {
  const updatedAtDate = parseISO(updatedAt);
  const hoursOld = Math.max(0, (now.getTime() - updatedAtDate.getTime()) / 36e5);

  let state: FeedFreshnessState = "stale";
  if (hoursOld <= 6) state = "fresh";
  else if (hoursOld <= 24) state = "aging";

  return {
    state,
    hoursOld,
    relativeLabel: formatDistanceToNowStrict(updatedAtDate, { addSuffix: true }),
  };
}

export function formatFeedTimestamp(updatedAt: string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(parseISO(updatedAt));
}

export function getFeedStats(items: NewsItem[]): FeedStats {
  return items.reduce<FeedStats>(
    (stats, item) => {
      stats.totalItems += 1;
      if (item.signalVsNoise === "signal") stats.signalCount += 1;
      if (item.signalVsNoise === "noise") stats.noiseCount += 1;
      if (item.priority === "P1") stats.p1Count += 1;
      return stats;
    },
    { totalItems: 0, signalCount: 0, noiseCount: 0, p1Count: 0 }
  );
}

export function hasActiveFilters(section: string, category: string, query: string): boolean {
  return section !== "All" || category !== "All" || query.trim().length > 0;
}
