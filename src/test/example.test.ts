import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const sourcePath = path.join(root, "content", "pulse.source.json");
const outputPath = path.join(root, "public", "data", "pulse.json");

function readPulse() {
  return JSON.parse(fs.readFileSync(outputPath, "utf8")) as {
    items: Array<{ id: string; url: string; priority: string }>;
    executiveBrief: Array<{ itemId: string }>;
  };
}

describe("pulse feed", () => {
  it("keeps the published feed aligned with the editorial source file", () => {
    const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
    const output = JSON.parse(fs.readFileSync(outputPath, "utf8"));

    expect(output.version).toBe(source.version);
    expect(output.updatedAt).toBe(source.updatedAt);
    expect(output.items.map((item: { id: string }) => item.id)).toEqual(
      source.items.map((item: { id: string }) => item.id)
    );
    expect(output.executiveBrief.map((item: { id: string }) => item.id)).toEqual(
      source.executiveBrief.map((item: { id: string }) => item.id)
    );
    expect(output.watchItems.map((item: { id: string }) => item.id)).toEqual(
      source.watchItems.map((item: { id: string }) => item.id)
    );
  });

  it("does not use placeholder URLs", () => {
    const pulse = readPulse();
    for (const item of pulse.items) {
      expect(item.url).not.toContain("example.com");
    }
  });

  it("includes all P1 items in the executive brief", () => {
    const pulse = readPulse();
    const briefIds = new Set(pulse.executiveBrief.map((item) => item.itemId));
    const p1Ids = pulse.items.filter((item) => item.priority === "P1").map((item) => item.id);

    expect(p1Ids.every((id) => briefIds.has(id))).toBe(true);
  });
});
