import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateArchiveIndex, validatePulseBundle } from "@/data/runtimeFeedValidation";

function readJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8"));
}

describe("runtime feed validation", () => {
  it("accepts the published pulse bundle", () => {
    const payload = readJson("public/data/pulse.json");

    expect(() => validatePulseBundle(payload, "pulse.json")).not.toThrow();
  });

  it("rejects pulse bundles with invalid critical item fields", () => {
    const payload = readJson("public/data/pulse.json") as {
      items: Array<Record<string, unknown>>;
      executiveBrief: unknown[];
      watchItems: unknown[];
      version: number;
      updatedAt: string;
    };

    payload.items[0] = {
      ...payload.items[0],
      priority: "P9",
    };

    expect(() => validatePulseBundle(payload, "pulse.json")).toThrow(
      /payload\.items\[0\]\.priority must be one of: P1, P2, P3/
    );
  });

  it("rejects executive brief references to missing item ids", () => {
    const payload = readJson("public/data/pulse.json") as {
      items: unknown[];
      executiveBrief: Array<Record<string, unknown>>;
      watchItems: unknown[];
      version: number;
      updatedAt: string;
    };

    payload.executiveBrief[0] = {
      ...payload.executiveBrief[0],
      itemId: "missing-item-id",
    };

    expect(() => validatePulseBundle(payload, "pulse.json")).toThrow(
      /payload\.executiveBrief\[0\]\.itemId must reference an existing item id/
    );
  });

  it("accepts the published archive index", () => {
    const payload = readJson("public/data/archive/index.json");

    expect(() => validateArchiveIndex(payload, "archive index")).not.toThrow();
  });

  it("rejects archive indexes whose current edition is missing", () => {
    const payload = readJson("public/data/archive/index.json") as {
      generatedAt: string;
      currentEditionSlug: string;
      editions: Array<Record<string, unknown>>;
    };

    payload.currentEditionSlug = "missing-edition";

    expect(() => validateArchiveIndex(payload, "archive index")).toThrow(
      /payload\.currentEditionSlug must match one of the published editions/
    );
  });
});
