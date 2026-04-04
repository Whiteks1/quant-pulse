import { describe, expect, it } from "vitest";
import { relevanceTierFromScore } from "./relevance";

describe("relevanceTierFromScore", () => {
  it("maps score bands to tiers", () => {
    expect(relevanceTierFromScore(100)).toBe("high");
    expect(relevanceTierFromScore(70)).toBe("high");
    expect(relevanceTierFromScore(69)).toBe("medium");
    expect(relevanceTierFromScore(40)).toBe("medium");
    expect(relevanceTierFromScore(39)).toBe("low");
    expect(relevanceTierFromScore(0)).toBe("low");
  });
});
