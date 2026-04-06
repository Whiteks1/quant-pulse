import { describe, expect, it } from "vitest";
import { formatSourceTierLabel, getEditorialLens, getEditorialRationalePreview } from "@/lib/news-card-metadata";

describe("news card metadata helpers", () => {
  it("formats source tier labels for display", () => {
    expect(formatSourceTierLabel("primary")).toBe("Primary source");
    expect(formatSourceTierLabel("tier_2")).toBe("Tier 2 source");
    expect(formatSourceTierLabel("unlisted")).toBe("Unlisted source");
  });

  it("derives an editorial lens from score weighting", () => {
    expect(
      getEditorialLens({
        scoreJustification: {
          recency: 10,
          marketImpact: 24,
          structuralImpact: 15,
          sourceQuality: 12,
          crossValidation: 5,
          thematicRelevance: 10,
          rationale: "Test",
        },
      })
    ).toBe("Market impact");

    expect(
      getEditorialLens({
        scoreJustification: {
          recency: 10,
          marketImpact: 12,
          structuralImpact: 19,
          sourceQuality: 12,
          crossValidation: 5,
          thematicRelevance: 10,
          rationale: "Test",
        },
      })
    ).toBe("Structural impact");

    expect(
      getEditorialLens({
        scoreJustification: {
          recency: 10,
          marketImpact: 18,
          structuralImpact: 17,
          sourceQuality: 12,
          crossValidation: 5,
          thematicRelevance: 10,
          rationale: "Test",
        },
      })
    ).toBe("Balanced impact");
  });

  it("shortens long editorial rationales without breaking readability", () => {
    const preview = getEditorialRationalePreview(
      "This is a long rationale that should be shortened for the news card so the editorial cue remains readable without taking over the full card layout.",
      72
    );

    expect(preview).toContain("This is a long rationale that should be shortened for the news card");
    expect(preview.endsWith("...")).toBe(true);
    expect(preview.length).toBeLessThanOrEqual(75);
  });
});
