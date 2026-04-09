import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  getLiveArchiveEdition,
  getLiveArchiveIndex,
  getLivePulseCurrent,
  resolveLiveFeedRequest,
} from "../../scripts/live-feed-backend.mjs";

const repoRoot = process.cwd();
const currentFeedPath = path.join(repoRoot, "public", "data", "pulse.json");
const archiveIndexPath = path.join(repoRoot, "public", "data", "archive", "index.json");
const archiveEditionPath = path.join(
  repoRoot,
  "content",
  "archive",
  "editions",
  "2026-04-05_v2.json"
);

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

describe("live feed backend contract", () => {
  it("builds the current pulse bundle as the canonical live payload", () => {
    expect(getLivePulseCurrent()).toEqual({
      ok: true,
      status: 200,
      body: readJson(currentFeedPath),
    });
  });

  it("builds the archive index as the canonical live payload", () => {
    expect(getLiveArchiveIndex()).toEqual({
      ok: true,
      status: 200,
      body: readJson(archiveIndexPath),
    });
  });

  it("builds archive editions by slug from the backend boundary", () => {
    expect(getLiveArchiveEdition("2026-04-05_v2")).toEqual({
      ok: true,
      status: 200,
      body: readJson(archiveEditionPath),
    });
  });

  it("returns a normalized 404 result for missing editions", () => {
    expect(getLiveArchiveEdition("does-not-exist")).toEqual({
      ok: false,
      status: 404,
      body: {
        error: {
          code: "edition_not_found",
          message: 'Archive edition "does-not-exist" was not found.',
        },
      },
    });
  });

  it("routes known and unknown paths through the same backend resolver", () => {
    expect(resolveLiveFeedRequest("/v1/pulse/current")).toEqual(getLivePulseCurrent());
    expect(resolveLiveFeedRequest("/v1/archive/index")).toEqual(getLiveArchiveIndex());
    expect(resolveLiveFeedRequest("/v1/archive/editions/2026-04-05_v2")).toEqual(
      getLiveArchiveEdition("2026-04-05_v2")
    );
    expect(resolveLiveFeedRequest("/v1/unknown")).toEqual({
      ok: false,
      status: 404,
      body: {
        error: {
          code: "not_found",
          message: "The requested endpoint does not exist.",
        },
      },
    });
  });
});
