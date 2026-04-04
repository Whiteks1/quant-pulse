import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readPulse() {
  const pulsePath = path.resolve(process.cwd(), "public", "data", "pulse.json");
  return JSON.parse(fs.readFileSync(pulsePath, "utf8")) as {
    items: Array<{ id: string; url: string; priority: string }>;
    executiveBrief: Array<{ itemId: string }>;
  };
}

describe("pulse feed", () => {
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
