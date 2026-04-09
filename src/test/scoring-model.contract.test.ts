import { describe, expect, it } from "vitest";
import { expectedRecencyScore, hasEditorialOverride } from "../../scripts/scoring-model.mjs";

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

  it("matches explicit recency override fields only", () => {
    expect(
      hasEditorialOverride(
        { editorialOverride: { field: "scoreJustification.recency", reason: "Timing context." } },
        "scoreJustification.recency"
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
