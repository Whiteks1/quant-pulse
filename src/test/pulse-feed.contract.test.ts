import { describe, expect, it } from "vitest";
import { normalizePulseBundle } from "../../scripts/pulse-feed.mjs";

function makeValidBundle() {
  return {
    version: 1,
    updatedAt: "2026-04-05T00:10:00Z",
    items: [
      {
        id: "item-1",
        title: "Valid story",
        source: "OpenAI",
        sourceTier: "primary",
        url: "https://openai.com/",
        linkType: "source-home",
        publishedAt: "2026-04-05T00:00:00Z",
        section: "Technology",
        category: "AI",
        summary: "Summary",
        whyItMatters: "Why",
        impact: "Impact",
        signalVsNoise: "signal",
        priority: "P1",
        relevanceScore: 70,
        scoreJustification: {
          recency: 10,
          marketImpact: 20,
          structuralImpact: 15,
          sourceQuality: 15,
          crossValidation: 0,
          thematicRelevance: 10,
          rationale: "Rationale",
        },
        tags: ["tag-a", "tag-b"],
        dedupeKey: "item-1-key",
      },
    ],
    executiveBrief: [
      {
        id: "brief-1",
        itemId: "item-1",
        text: "Short brief.",
      },
    ],
    watchItems: [
      {
        id: "watch-1",
        title: "Watch event",
        date: "2026-04-10",
        section: "Technology",
        category: "AI",
        type: "event",
        source: "OpenAI",
        url: "https://openai.com/",
        description: "Desc",
        whyWatch: "Reason",
      },
    ],
  };
}

describe("normalizePulseBundle contract checks", () => {
  it("rejects invalid publishedAt values via schema", () => {
    const bundle = makeValidBundle();
    bundle.items[0].publishedAt = "04-05-2026";

    const result = normalizePulseBundle(bundle);
    expect(result.errors.some((error) => error.includes("publishedAt"))).toBe(true);
  });

  it("rejects additional properties not allowed by schema", () => {
    const bundle = makeValidBundle();
    (bundle.items[0] as { unexpectedField?: string }).unexpectedField = "not allowed";

    const result = normalizePulseBundle(bundle);
    expect(result.errors.some((error) => error.includes("must NOT have additional properties"))).toBe(
      true
    );
  });

  it("rejects executive brief references to missing item ids", () => {
    const bundle = makeValidBundle();
    bundle.executiveBrief[0].itemId = "does-not-exist";

    const result = normalizePulseBundle(bundle);
    expect(
      result.errors.some((error) => error.includes("Executive brief itemId not found in items"))
    ).toBe(true);
  });

  it("rejects invalid watch item date format", () => {
    const bundle = makeValidBundle();
    bundle.watchItems[0].date = "10-04-2026";

    const result = normalizePulseBundle(bundle);
    expect(
      result.errors.some((error) => error.includes("must include date in YYYY-MM-DD"))
    ).toBe(true);
  });

  it("rejects duplicate executive brief references to the same item", () => {
    const bundle = makeValidBundle();
    bundle.executiveBrief.push({
      id: "brief-2",
      itemId: "item-1",
      text: "Another angle.",
    });

    const result = normalizePulseBundle(bundle);
    expect(result.errors.some((error) => error.includes("Duplicate executiveBrief itemId"))).toBe(true);
  });

  it("rejects categories that do not belong to the section taxonomy", () => {
    const bundle = makeValidBundle();
    bundle.items[0].category = "Rates";

    const result = normalizePulseBundle(bundle);
    expect(result.errors.some((error) => error.includes("category (Rates) is not valid for section (Technology)"))).toBe(true);
  });

  it("rejects explicit tier_1 for a source not in approved sources", () => {
    const bundle = makeValidBundle();
    bundle.items[0].source = "OpenAI";
    bundle.items[0].sourceTier = "tier_1";

    const result = normalizePulseBundle(bundle);
    expect(
      result.errors.some((error) => error.includes("source (OpenAI) is not approved for explicit tier tier_1"))
    ).toBe(true);
  });

  it("rejects generic source classes as explicit tier identities", () => {
    const bundle = makeValidBundle();
    bundle.items[0].source = "company newsrooms";
    bundle.items[0].sourceTier = "tier_1";

    const result = normalizePulseBundle(bundle);
    expect(
      result.errors.some((error) =>
        error.includes("source (company newsrooms) is not approved for explicit tier tier_1")
      )
    ).toBe(true);
  });

  it("rejects explicit tier_2 for a source not in approved sources", () => {
    const bundle = makeValidBundle();
    bundle.items[0].source = "OpenAI";
    bundle.items[0].sourceTier = "tier_2";
    bundle.items[0].scoreJustification.sourceQuality = 8;
    bundle.items[0].scoreJustification.recency = 20;
    bundle.items[0].scoreJustification.marketImpact = 17;

    const result = normalizePulseBundle(bundle);
    expect(
      result.errors.some((error) => error.includes("source (OpenAI) is not approved for explicit tier tier_2"))
    ).toBe(true);
  });

  it("rejects source quality values above tier cap", () => {
    const bundle = makeValidBundle();
    bundle.items[0].sourceTier = "tier_3";
    bundle.items[0].scoreJustification.sourceQuality = 8;

    const result = normalizePulseBundle(bundle);
    expect(result.errors.some((error) => error.includes("sourceQuality (8) exceeds cap for sourceTier (tier_3)"))).toBe(
      true
    );
  });

  it("enforces deterministic sourceQuality for explicit tiers", () => {
    const bundle = makeValidBundle();
    bundle.items[0].sourceTier = "tier_1";
    bundle.items[0].source = "Bloomberg";
    bundle.items[0].scoreJustification.sourceQuality = 10;
    bundle.items[0].scoreJustification.marketImpact = 22;
    bundle.items[0].relevanceScore = 67;
    bundle.items[0].priority = "P2";

    const result = normalizePulseBundle(bundle);
    expect(
      result.errors.some((error) =>
        error.includes("sourceQuality drift: expected 12, found 10 (sourceTier tier_1)")
      )
    ).toBe(true);
    expect(
      result.errors.some((error) => error.includes("editorialOverride.field=scoreJustification.sourceQuality"))
    ).toBe(true);
  });

  it("allows deterministic sourceQuality mismatches when override is declared", () => {
    const bundle = makeValidBundle();
    bundle.items[0].sourceTier = "tier_1";
    bundle.items[0].source = "Bloomberg";
    bundle.items[0].scoreJustification.sourceQuality = 10;
    bundle.items[0].scoreJustification.marketImpact = 22;
    bundle.items[0].relevanceScore = 67;
    bundle.items[0].priority = "P2";
    bundle.items[0].editorialOverride = {
      field: "scoreJustification.sourceQuality",
      reason: "Source quality intentionally discounted despite tier due to editorial caution.",
    };

    const result = normalizePulseBundle(bundle);
    expect(
      result.errors.some((error) => error.includes("must match the deterministic value for sourceTier"))
    ).toBe(false);
  });

  it("keeps unlisted sources in cap-only mode", () => {
    const bundle = makeValidBundle();
    bundle.items[0].sourceTier = "unlisted";
    bundle.items[0].source = "DeFiLlama";
    bundle.items[0].scoreJustification.sourceQuality = 10;

    const result = normalizePulseBundle(bundle);
    expect(
      result.errors.some((error) => error.includes("must match the deterministic value for sourceTier"))
    ).toBe(false);
  });

  it("rejects noise items with P1 priority without override", () => {
    const bundle = makeValidBundle();
    bundle.items[0].signalVsNoise = "noise";

    const result = normalizePulseBundle(bundle);
    expect(
      result.errors.some((error) => error.includes("marked as noise cannot be P1 without editorialOverride"))
    ).toBe(true);
  });

  it("allows historical items without scoredAt to keep manual recency", () => {
    const bundle = makeValidBundle();
    bundle.items[0].scoreJustification.recency = 15;

    const result = normalizePulseBundle(bundle);
    expect(result.errors.some((error) => error.includes("must match scoredAt/publishedAt window"))).toBe(false);
  });

  it("enforces recency deterministically when scoredAt exists", () => {
    const bundle = makeValidBundle();
    bundle.items[0].scoredAt = "2026-04-06T12:00:00Z";
    bundle.items[0].scoreJustification.recency = 10;

    const result = normalizePulseBundle(bundle);
    expect(
      result.errors.some((error) => error.includes("recency drift: expected 5, found 10 (scoredAt/publishedAt window)"))
    ).toBe(true);
    expect(
      result.errors.some((error) => error.includes("editorialOverride.field=scoreJustification.recency"))
    ).toBe(true);
  });

  it("allows a recency mismatch when editorial override is declared", () => {
    const bundle = makeValidBundle();
    bundle.items[0].scoredAt = "2026-04-06T12:00:00Z";
    bundle.items[0].scoreJustification.recency = 10;
    bundle.items[0].editorialOverride = {
      field: "scoreJustification.recency",
      reason: "Editorially preserving urgency after overnight validation lag.",
    };

    const result = normalizePulseBundle(bundle);
    expect(result.errors.some((error) => error.includes("must match scoredAt/publishedAt window"))).toBe(false);
  });

  it("reports score total drift with an actionable override hint", () => {
    const bundle = makeValidBundle();
    bundle.items[0].relevanceScore = 68;

    const result = normalizePulseBundle(bundle);
    expect(
      result.errors.some((error) =>
        error.includes("relevanceScore drift: expected 70, found 68 (sum of scoreJustification blocks)")
      )
    ).toBe(true);
    expect(result.errors.some((error) => error.includes("editorialOverride.field=relevanceScore"))).toBe(true);
  });

  it("reports priority drift with the expected band", () => {
    const bundle = makeValidBundle();
    bundle.items[0].priority = "P2";

    const result = normalizePulseBundle(bundle);
    expect(
      result.errors.some((error) =>
        error.includes("priority drift: expected P1, found P2 (score band from relevanceScore=70)")
      )
    ).toBe(true);
    expect(result.errors.some((error) => error.includes("editorialOverride.field=priority"))).toBe(true);
  });

  it("rejects scoredAt earlier than publishedAt", () => {
    const bundle = makeValidBundle();
    bundle.items[0].scoredAt = "2026-04-04T23:00:00Z";
    bundle.items[0].publishedAt = "2026-04-05T00:00:00Z";

    const result = normalizePulseBundle(bundle);
    expect(result.errors.some((error) => error.includes("scoredAt must be the same as or later than publishedAt"))).toBe(true);
  });
});
