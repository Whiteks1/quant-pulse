import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const sourcePath = path.join(root, "content", "pulse.source.json");
const outputPath = path.join(root, "public", "data", "pulse.json");

describe("feed source pipeline", () => {
  it("keeps the published feed aligned with the editorial source file", () => {
    const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
    const output = JSON.parse(fs.readFileSync(outputPath, "utf8"));

    expect(output.version).toBe(source.version);
    expect(output.updatedAt).toBe(source.updatedAt);
    expect(output.items.map((item: { id: string }) => item.id)).toEqual(
      source.items.map((item: { id: string }) => item.id)
    );
    expect(output.executiveBrief).toEqual(source.executiveBrief);
    expect(output.watchItems.map((item: { id: string }) => item.id)).toEqual(
      source.watchItems.map((item: { id: string }) => item.id)
    );
  });
});
