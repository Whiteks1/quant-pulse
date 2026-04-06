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
});
