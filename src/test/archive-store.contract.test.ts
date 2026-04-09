import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildArchiveEditionSlug,
  listPersistedArchiveEditions,
  persistArchiveEdition,
  readPersistedArchiveEdition,
} from "../../scripts/archive-store.mjs";

function makeValidBundle() {
  return {
    version: 3,
    updatedAt: "2026-04-09T10:30:00Z",
    items: [
      {
        id: "item-1",
        title: "Valid story",
        source: "OpenAI",
        sourceTier: "primary",
        url: "https://openai.com/",
        linkType: "source-home",
        publishedAt: "2026-04-09T09:00:00Z",
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

const tempDirs: string[] = [];

function makeTempStorageDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "qp-archive-store-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir && fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("archive storage contract", () => {
  it("builds deterministic archive edition slugs from the bundle timestamp and version", () => {
    expect(buildArchiveEditionSlug(makeValidBundle())).toBe("2026-04-09_v3");
  });

  it("persists and reads archive editions from backend-owned storage", () => {
    const storageDir = makeTempStorageDir();
    const bundle = makeValidBundle();

    const persisted = persistArchiveEdition(bundle, { storageDir });

    expect(persisted.created).toBe(true);
    expect(persisted.slug).toBe("2026-04-09_v3");

    const readBack = readPersistedArchiveEdition("2026-04-09_v3", { storageDir });

    expect(readBack.found).toBe(true);
    expect(readBack.bundle).toEqual(bundle);
  });

  it("lists persisted archive editions from the storage path", () => {
    const storageDir = makeTempStorageDir();
    persistArchiveEdition(makeValidBundle(), { storageDir });

    const editions = listPersistedArchiveEditions({ storageDir });

    expect(editions).toHaveLength(1);
    expect(editions[0].slug).toBe("2026-04-09_v3");
    expect(editions[0].found).toBe(true);
  });

  it("does not overwrite an existing archive edition unless forced", () => {
    const storageDir = makeTempStorageDir();
    const bundle = makeValidBundle();
    persistArchiveEdition(bundle, { storageDir });

    const duplicate = persistArchiveEdition(bundle, { storageDir });

    expect(duplicate.created).toBe(false);
    expect(duplicate.alreadyExists).toBe(true);
  });
});
