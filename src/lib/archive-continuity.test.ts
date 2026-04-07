import { describe, expect, it } from "vitest";
import type { ArchiveEditionSummary } from "@/data/loadArchiveData";
import { buildArchiveContinuity } from "./archive-continuity";

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

describe("archive continuity", () => {
  it("builds a chronological sequence with older and newer navigation cues", () => {
    const continuity = buildArchiveContinuity(
      [makeEdition("current"), makeEdition("2026-04-05"), makeEdition("2026-04-04")],
      "2026-04-05",
      "2026-04-04"
    );

    expect(continuity.sequence.map((edition) => edition.slug)).toEqual([
      "2026-04-04",
      "2026-04-05",
      "current",
    ]);
    expect(continuity.selected?.slug).toBe("2026-04-05");
    expect(continuity.baseline?.slug).toBe("2026-04-04");
    expect(continuity.olderEdition?.slug).toBe("2026-04-04");
    expect(continuity.newerEdition?.slug).toBe("current");
    expect(continuity.summary).toBe(
      "Following continuity from 2026-04-05 toward current. Baseline comparison is 2026-04-04."
    );
  });

  it("frames the current edition against its baseline when the latest snapshot is selected", () => {
    const continuity = buildArchiveContinuity(
      [makeEdition("current", { label: "Current edition" }), makeEdition("2026-04-05_v2", { label: "2026-04-05 · v2" })],
      "current",
      "2026-04-05_v2"
    );

    expect(continuity.selected?.isLatest).toBe(true);
    expect(continuity.olderEdition?.slug).toBe("2026-04-05_v2");
    expect(continuity.newerEdition).toBeNull();
    expect(continuity.summary).toBe(
      "Latest published edition. Baseline comparison is 2026-04-05 · v2."
    );
  });

  it("handles a single published edition without navigation", () => {
    const continuity = buildArchiveContinuity([makeEdition("current")], "current", null);

    expect(continuity.totalEditions).toBe(1);
    expect(continuity.olderEdition).toBeNull();
    expect(continuity.newerEdition).toBeNull();
    expect(continuity.summary).toBe("Only one published archive edition is available so far.");
  });
});
