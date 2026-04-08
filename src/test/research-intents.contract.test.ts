import { describe, expect, it } from "vitest";
import { normalizePulseBundle, readSourceBundle } from "../../scripts/pulse-feed.mjs";
import { buildResearchIntentsArtifact } from "../../scripts/research-intents.mjs";

describe("research intents artifact", () => {
  it("builds a deterministic wrapper for the current editorial feed", () => {
    const { bundle, errors } = normalizePulseBundle(readSourceBundle());
    expect(errors).toEqual([]);

    const firstBuild = buildResearchIntentsArtifact(bundle);
    const secondBuild = buildResearchIntentsArtifact(bundle);

    expect(firstBuild.errors).toEqual([]);
    expect(secondBuild.errors).toEqual([]);
    expect(firstBuild.content).toBe(secondBuild.content);
    expect(firstBuild.document.generatedAt).toBe(bundle.updatedAt);
    expect(firstBuild.document.sourceVersion).toBe(bundle.version);
    expect(firstBuild.document.editionId).toBe("2026-04-05_v2");
  });

  it("emits one stable intent per eligible feed item", () => {
    const { bundle } = normalizePulseBundle(readSourceBundle());
    const artifact = buildResearchIntentsArtifact(bundle);
    const eligibleCount = bundle.items.filter(
      (item) => item.signalVsNoise === "signal" && (item.priority === "P1" || item.priority === "P2")
    ).length;

    expect(artifact.errors).toEqual([]);
    expect(artifact.document.intentCount).toBe(eligibleCount);
    expect(artifact.document.intents).toHaveLength(eligibleCount);

    const intentIds = artifact.document.intents.map((intent) => intent.intent_id);
    expect(new Set(intentIds).size).toBe(intentIds.length);
  });

  it("keeps the wrapper stable when no items are eligible", () => {
    const { bundle } = normalizePulseBundle(readSourceBundle());
    const emptyBundle = {
      ...bundle,
      items: bundle.items.map((item) => ({
        ...item,
        signalVsNoise: "noise",
        priority: "P3",
      })),
      executiveBrief: [],
    };

    const artifact = buildResearchIntentsArtifact(emptyBundle);

    expect(artifact.errors).toEqual([]);
    expect(artifact.document.editionId).toBe("2026-04-05_v2");
    expect(artifact.document.intentCount).toBe(0);
    expect(artifact.document.intents).toEqual([]);
  });
});
