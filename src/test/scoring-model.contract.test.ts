import { describe, expect, it } from "vitest";
import {
  expectedRecencyScore,
  expectedSourceQualityScore,
  expectedThematicRelevanceScore,
  hasEditorialOverride,
} from "../../scripts/scoring-model.mjs";

describe("scoring model primitives", () => {
  it("returns null when no scoredAt is present", () => {
    expect(
      expectedRecencyScore({
        publishedAt: "2026-04-05T00:00:00Z",
      })
    ).toBeNull();
  });

  it("maps recency windows from publishedAt to scoredAt", () => {
    expect(
      expectedRecencyScore({
        publishedAt: "2026-04-05T00:00:00Z",
        scoredAt: "2026-04-05T01:30:00Z",
      })
    ).toBe(20);
    expect(
      expectedRecencyScore({
        publishedAt: "2026-04-05T00:00:00Z",
        scoredAt: "2026-04-05T05:00:00Z",
      })
    ).toBe(15);
    expect(
      expectedRecencyScore({
        publishedAt: "2026-04-05T00:00:00Z",
        scoredAt: "2026-04-05T12:00:00Z",
      })
    ).toBe(10);
    expect(
      expectedRecencyScore({
        publishedAt: "2026-04-05T00:00:00Z",
        scoredAt: "2026-04-06T12:00:00Z",
      })
    ).toBe(5);
    expect(
      expectedRecencyScore({
        publishedAt: "2026-04-05T00:00:00Z",
        scoredAt: "2026-04-09T12:00:00Z",
      })
    ).toBe(0);
  });

  it("maps deterministic sourceQuality by explicit source tier", () => {
    expect(expectedSourceQualityScore({ sourceTier: "primary" })).toBe(15);
    expect(expectedSourceQualityScore({ sourceTier: "tier_1" })).toBe(12);
    expect(expectedSourceQualityScore({ sourceTier: "tier_2" })).toBe(8);
    expect(expectedSourceQualityScore({ sourceTier: "tier_3" })).toBe(3);
    expect(expectedSourceQualityScore({ sourceTier: "unlisted" })).toBeNull();
  });

  it("maps thematicRelevance to 10 only for clearly core themes", () => {
    expect(
      expectedThematicRelevanceScore({
        section: "Technology",
        category: "AI",
        tags: ["OpenAI", "LLM"],
        title: "Frontier model launch",
        summary: "AI platform competition intensifies.",
        whyItMatters: "Directly relevant to infrastructure competition.",
        impact: "Higher bar for AI vendors.",
      })
    ).toBe(10);

    expect(
      expectedThematicRelevanceScore({
        section: "Crypto & Markets",
        category: "DeFi",
        tags: ["SOL", "memecoins"],
        title: "Speculative activity rises",
        summary: "TVL expands on speculative flows.",
        whyItMatters: "Interesting but not cleanly central.",
        impact: "Weak durable conclusion.",
      })
    ).toBeNull();
  });

  it("matches explicit recency override fields only", () => {
    expect(
      hasEditorialOverride(
        { editorialOverride: { field: "scoreJustification.recency", reason: "Timing context." } },
        "scoreJustification.recency"
      )
    ).toBe(true);
    expect(
      hasEditorialOverride(
        { editorialOverride: { field: "scoreJustification.sourceQuality", reason: "Manual discount." } },
        "scoreJustification.sourceQuality"
      )
    ).toBe(true);
    expect(
      hasEditorialOverride(
        { editorialOverride: { field: "scoreJustification.thematicRelevance", reason: "Manual thematic adjustment." } },
        "scoreJustification.thematicRelevance"
      )
    ).toBe(true);
    expect(
      hasEditorialOverride(
        { editorialOverride: { field: "relevanceScore", reason: "Composite override." } },
        "scoreJustification.recency"
      )
    ).toBe(false);
  });
});
