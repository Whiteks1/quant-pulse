import { describe, expect, it } from "vitest";
import type { ArchiveEditionSummary } from "@/data/loadArchiveData";
import type { NewsItem } from "@/data/mockNews";
import { buildArchiveEditionComparison, getComparisonEdition } from "./archive-intelligence";

function makeEdition(
  slug: string,
  overrides: Partial<ArchiveEditionSummary> = {}
): ArchiveEditionSummary {
  return {
    slug,
    label: slug,
    updatedAt: "2026-04-06T09:00:00Z",
    version: 1,
    path: `data/archive/editions/${slug}.json`,
    isCurrent: slug === "current",
    totalItems: 6,
    signalCount: 4,
    p1Count: 2,
    ...overrides,
  };
}

function makeItem(id: string, section: NewsItem["section"]): NewsItem {
  return {
    id,
    title: id,
    source: "Reuters",
    sourceTier: "tier_1",
    url: "https://www.reuters.com/",
    linkType: "article",
    publishedAt: "2026-04-06T08:00:00Z",
    category:
      section === "Technology"
        ? "AI"
        : section === "Crypto & Markets"
          ? "ETFs"
          : "Rates",
    section,
    summary: "Summary",
    whyItMatters: "Why",
    impact: "Impact",
    tags: ["tag-a", "tag-b"],
    signalVsNoise: "signal",
    priority: "P2",
    relevanceScore: 60,
    scoreJustification: {
      recency: 10,
      marketImpact: 15,
      structuralImpact: 10,
      sourceQuality: 12,
      crossValidation: 5,
      thematicRelevance: 8,
      rationale: "Rationale",
    },
    dedupeKey: `${id}-dedupe`,
  };
}

describe("archive intelligence", () => {
  it("picks the adjacent older edition as baseline when available", () => {
    const editions = [makeEdition("current"), makeEdition("2026-04-05"), makeEdition("2026-04-04")];

    expect(getComparisonEdition(editions, "current")?.slug).toBe("2026-04-05");
    expect(getComparisonEdition(editions, "2026-04-05")?.slug).toBe("2026-04-04");
  });

  it("falls back to the adjacent newer edition when selected is the oldest", () => {
    const editions = [makeEdition("current"), makeEdition("2026-04-05"), makeEdition("2026-04-04")];

    expect(getComparisonEdition(editions, "2026-04-04")?.slug).toBe("2026-04-05");
  });

  it("builds edition deltas and section mix changes", () => {
    const comparison = buildArchiveEditionComparison(
      makeEdition("current", { totalItems: 5, signalCount: 4, p1Count: 2 }),
      makeEdition("2026-04-05", { totalItems: 4, signalCount: 2, p1Count: 1 }),
      [
        makeItem("1", "Technology"),
        makeItem("2", "Technology"),
        makeItem("3", "Crypto & Markets"),
        makeItem("4", "Crypto & Markets"),
        makeItem("5", "Macro"),
      ],
      [
        makeItem("6", "Technology"),
        makeItem("7", "Crypto & Markets"),
        makeItem("8", "Crypto & Markets"),
        makeItem("9", "Macro"),
      ]
    );

    expect(comparison.totals).toEqual({ current: 5, previous: 4, delta: 1 });
    expect(comparison.signals).toEqual({ current: 4, previous: 2, delta: 2 });
    expect(comparison.p1).toEqual({ current: 2, previous: 1, delta: 1 });
    expect(comparison.storyChanges).toEqual({
      added: 5,
      removed: 4,
      priorityRaised: 0,
      priorityLowered: 0,
    });
    expect(comparison.highlights).toEqual([
      {
        id: "new-story:1-dedupe",
        kind: "new-story",
        label: "New tracked story",
        title: "1",
        meta: "Technology • AI • Reuters",
        whyItMatters: "Why",
      },
      {
        id: "removed-story:6-dedupe",
        kind: "removed-story",
        label: "No longer in latest edition",
        title: "6",
        meta: "Technology • AI • Reuters",
        whyItMatters: "Why",
      },
    ]);
    expect(comparison.sectionMix).toEqual([
      {
        label: "Technology",
        currentCount: 2,
        previousCount: 1,
        delta: 1,
        currentShare: 0.4,
        previousShare: 0.25,
      },
      {
        label: "Crypto & Markets",
        currentCount: 2,
        previousCount: 2,
        delta: 0,
        currentShare: 0.4,
        previousShare: 0.5,
      },
      {
        label: "Macro",
        currentCount: 1,
        previousCount: 1,
        delta: 0,
        currentShare: 0.2,
        previousShare: 0.25,
      },
    ]);
  });

  it("surfaces additions, removals, and priority moves as editorial highlights", () => {
    const comparison = buildArchiveEditionComparison(
      makeEdition("current", { totalItems: 4, signalCount: 3, p1Count: 2 }),
      makeEdition("2026-04-05", { totalItems: 4, signalCount: 3, p1Count: 1 }),
      [
        makeItem("upgraded", "Crypto & Markets"),
        makeItem("new-p1", "Technology"),
        makeItem("steady", "Macro"),
        makeItem("lowered", "Technology"),
      ].map((item) => {
        if (item.id === "upgraded") {
          return {
            ...item,
            title: "Stablecoin settlement expansion",
            priority: "P1" as const,
            relevanceScore: 88,
            whyItMatters: "Settlement rails moved up the stack.",
          };
        }
        if (item.id === "new-p1") {
          return {
            ...item,
            title: "Exchange outage concentrates liquidity risk",
            priority: "P1" as const,
            relevanceScore: 91,
            whyItMatters: "A venue outage changes near-term operational risk.",
          };
        }
        if (item.id === "lowered") {
          return {
            ...item,
            title: "AI capex narrative cools",
            priority: "P3" as const,
            relevanceScore: 55,
            whyItMatters: "The signal remains tracked but with lower urgency.",
          };
        }
        return item;
      }),
      [
        makeItem("upgraded", "Crypto & Markets"),
        makeItem("steady", "Macro"),
        makeItem("lowered", "Technology"),
        makeItem("removed", "Technology"),
      ].map((item) => {
        if (item.id === "upgraded") {
          return {
            ...item,
            title: "Stablecoin settlement expansion",
            priority: "P2" as const,
            relevanceScore: 70,
          };
        }
        if (item.id === "lowered") {
          return {
            ...item,
            title: "AI capex narrative cools",
            priority: "P1" as const,
            relevanceScore: 79,
          };
        }
        if (item.id === "removed") {
          return {
            ...item,
            title: "Old security incident drops from front page",
            priority: "P2" as const,
            whyItMatters: "It had mattered as an infrastructure reliability signal.",
          };
        }
        return item;
      })
    );

    expect(comparison.storyChanges).toEqual({
      added: 1,
      removed: 1,
      priorityRaised: 1,
      priorityLowered: 1,
    });
    expect(comparison.highlights).toEqual([
      {
        id: "priority-raised:upgraded-dedupe",
        kind: "priority-raised",
        label: "Priority raised to P1",
        title: "Stablecoin settlement expansion",
        meta: "Crypto & Markets • ETFs • Reuters",
        whyItMatters: "Settlement rails moved up the stack.",
      },
      {
        id: "new-story:new-p1-dedupe",
        kind: "new-story",
        label: "New P1 story",
        title: "Exchange outage concentrates liquidity risk",
        meta: "Technology • AI • Reuters",
        whyItMatters: "A venue outage changes near-term operational risk.",
      },
      {
        id: "removed-story:removed-dedupe",
        kind: "removed-story",
        label: "No longer in latest edition",
        title: "Old security incident drops from front page",
        meta: "Technology • AI • Reuters",
        whyItMatters: "It had mattered as an infrastructure reliability signal.",
      },
      {
        id: "priority-lowered:lowered-dedupe",
        kind: "priority-lowered",
        label: "Priority lowered to P3",
        title: "AI capex narrative cools",
        meta: "Technology • AI • Reuters",
        whyItMatters: "The signal remains tracked but with lower urgency.",
      },
    ]);
  });
});
