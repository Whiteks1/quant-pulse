import fs from "node:fs";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createLiveFeedServer } from "../../scripts/live-feed-server.mjs";

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

describe("live feed server contract", () => {
  const server = createLiveFeedServer();
  let baseUrl = "";

  beforeAll(async () => {
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  });

  it("serves the current pulse bundle from the live endpoint", async () => {
    const response = await fetch(`${baseUrl}/v1/pulse/current`);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(await response.json()).toEqual(readJson(currentFeedPath));
  });

  it("serves the archive index from the live endpoint", async () => {
    const response = await fetch(`${baseUrl}/v1/archive/index`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(readJson(archiveIndexPath));
  });

  it("serves an archive edition by slug", async () => {
    const response = await fetch(`${baseUrl}/v1/archive/editions/2026-04-05_v2`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(readJson(archiveEditionPath));
  });

  it("returns 404 for missing archive editions", async () => {
    const response = await fetch(`${baseUrl}/v1/archive/editions/does-not-exist`);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: {
        code: "edition_not_found",
        message: 'Archive edition "does-not-exist" was not found.',
      },
    });
  });

  it("returns 404 for unknown endpoints", async () => {
    const response = await fetch(`${baseUrl}/v1/unknown`);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: {
        code: "not_found",
        message: "The requested endpoint does not exist.",
      },
    });
  });
});
