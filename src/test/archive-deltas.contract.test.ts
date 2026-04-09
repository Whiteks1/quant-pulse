import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildArchiveDeltaArtifacts } from "../../scripts/archive-deltas.mjs";

function readEdition(slug: string) {
  const filePath = path.join(process.cwd(), "content", "archive", "editions", `${slug}.json`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function makeEditionEntry(slug: string) {
  const bundle = readEdition(slug);
  return {
    slug,
    label: slug.replace("_v", " · v"),
    updatedAt: bundle.updatedAt,
    version: bundle.version,
    path: `data/archive/editions/${slug}.json`,
    totalItems: bundle.items.length,
    signalCount: bundle.items.filter((item: { signalVsNoise: string }) => item.signalVsNoise === "signal").length,
    p1Count: bundle.items.filter((item: { priority: string }) => item.priority === "P1").length,
    bundle,
  };
}

describe("archive delta artifacts", () => {
  it("publishes a follow-up delta for the latest persisted real edition", () => {
    const artifacts = buildArchiveDeltaArtifacts(
      [makeEditionEntry("2026-04-05_v2"), makeEditionEntry("2026-04-09_v3")],
      { generatedAt: "2026-04-09T12:00:00Z" }
    );

    expect(artifacts.deltaIndex.deltas).toHaveLength(1);
    expect(artifacts.deltaIndex.deltas[0]).toMatchObject({
      editionSlug: "2026-04-09_v3",
      baselineSlug: "2026-04-05_v2",
      hasMaterialChanges: true,
      executiveBriefChanges: {
        added: 1,
        removed: 0,
      },
      watchChanges: {
        added: 2,
        removed: 2,
      },
    });

    const editionArtifact = artifacts.deltaArtifacts[0].artifact;
    expect(editionArtifact.summary.storyChanges).toEqual({
      added: 0,
      removed: 0,
      priorityRaised: 0,
      priorityLowered: 0,
    });
    expect(editionArtifact.highlights.map((item) => item.kind)).toContain("brief-added");
    expect(editionArtifact.highlights.map((item) => item.kind)).toContain("watch-added");
  });

  it("does not create delta artifacts for a lone archived edition without a baseline", () => {
    const artifacts = buildArchiveDeltaArtifacts([makeEditionEntry("2026-04-05_v2")], {
      generatedAt: "2026-04-05T00:10:00Z",
    });

    expect(artifacts.deltaArtifacts).toHaveLength(0);
    expect(artifacts.deltaIndex.deltas).toHaveLength(0);
  });
});
