import { describe, expect, it } from "vitest";
import { getPulseDashboardMetrics } from "./pulse-metrics";
import type { NewsItem } from "@/data/mockNews";

function makeItem(
  id: string,
  overrides: Partial<NewsItem> = {}
): NewsItem {
  return {
    id,
    title: `${id} title`,
    source: "Reuters",
    sourceTier: "tier_1",
    url: "https://www.reuters.com/",
    linkType: "article",
    publishedAt: "2026-04-06T08:00:00Z",
    category: "Regulation",
    section: "Crypto & Markets",
    summary: "Summary",
    whyItMatters: "Why it matters",
    impact: "Impact",
    tags: ["crypto", "regulation"],
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
      rationale: "Valid rationale",
    },
    dedupeKey: `${id}-dedupe`,
    ...overrides,
  };
}

describe("getPulseDashboardMetrics", () => {
  it("computes counts and distributions from feed items", () => {
    const items = [
      makeItem("one", {
        source: "Reuters",
        priority: "P1",
        signalVsNoise: "signal",
        section: "Crypto & Markets",
      }),
      makeItem("two", {
        source: "Reuters",
        priority: "P2",
        signalVsNoise: "signal",
        section: "Technology",
        category: "AI",
      }),
      makeItem("three", {
        source: "Bloomberg",
        priority: "P3",
        signalVsNoise: "noise",
        section: "Macro",
        category: "Rates",
      }),
    ];

    const metrics = getPulseDashboardMetrics(items);

    expect(metrics.totalItems).toBe(3);
    expect(metrics.signalCount).toBe(2);
    expect(metrics.noiseCount).toBe(1);
    expect(metrics.p1Count).toBe(1);
    expect(metrics.signalShare).toBeCloseTo(2 / 3);
    expect(metrics.topSource).toEqual({
      source: "Reuters",
      count: 2,
      share: 2 / 3,
    });
    expect(metrics.priorityDistribution).toEqual([
      { label: "P1", count: 1, share: 1 / 3 },
      { label: "P2", count: 1, share: 1 / 3 },
      { label: "P3", count: 1, share: 1 / 3 },
    ]);
    expect(metrics.signalNoiseDistribution).toEqual([
      { label: "Signal", count: 2, share: 2 / 3 },
      { label: "Noise", count: 1, share: 1 / 3 },
    ]);
    expect(metrics.sectionDistribution).toEqual([
      { label: "Technology", count: 1, share: 1 / 3 },
      { label: "Crypto & Markets", count: 1, share: 1 / 3 },
      { label: "Macro", count: 1, share: 1 / 3 },
    ]);
  });

  it("returns safe zero metrics for an empty feed", () => {
    const metrics = getPulseDashboardMetrics([]);

    expect(metrics.totalItems).toBe(0);
    expect(metrics.signalCount).toBe(0);
    expect(metrics.noiseCount).toBe(0);
    expect(metrics.p1Count).toBe(0);
    expect(metrics.signalShare).toBe(0);
    expect(metrics.topSource).toBeNull();
    expect(metrics.priorityDistribution.every((entry) => entry.count === 0 && entry.share === 0)).toBe(
      true
    );
    expect(metrics.signalNoiseDistribution.every((entry) => entry.count === 0 && entry.share === 0)).toBe(
      true
    );
    expect(metrics.sectionDistribution.every((entry) => entry.count === 0 && entry.share === 0)).toBe(
      true
    );
  });
});
