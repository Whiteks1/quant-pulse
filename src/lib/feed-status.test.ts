import { describe, expect, it } from "vitest";
import { getFeedFreshness, getFeedStats, hasActiveFilters } from "./feed-status";

describe("getFeedFreshness", () => {
  const now = new Date("2026-04-05T12:00:00Z");

  it("marks recently updated feeds as fresh", () => {
    expect(getFeedFreshness("2026-04-05T09:30:00Z", now).state).toBe("fresh");
  });

  it("marks mid-age feeds as aging", () => {
    expect(getFeedFreshness("2026-04-04T18:00:00Z", now).state).toBe("aging");
  });

  it("marks old feeds as stale", () => {
    expect(getFeedFreshness("2026-04-03T10:00:00Z", now).state).toBe("stale");
  });
});

describe("getFeedStats", () => {
  it("counts total, signal, noise and P1 items", () => {
    const stats = getFeedStats([
      { priority: "P1", signalVsNoise: "signal" },
      { priority: "P2", signalVsNoise: "signal" },
      { priority: "P3", signalVsNoise: "noise" },
    ] as never[]);

    expect(stats).toEqual({
      totalItems: 3,
      signalCount: 2,
      noiseCount: 1,
      p1Count: 1,
    });
  });
});

describe("hasActiveFilters", () => {
  it("detects when no filters are active", () => {
    expect(hasActiveFilters("All", "All", "")).toBe(false);
  });

  it("detects active filters", () => {
    expect(hasActiveFilters("Technology", "All", "")).toBe(true);
    expect(hasActiveFilters("All", "AI", "")).toBe(true);
    expect(hasActiveFilters("All", "All", "nvidia")).toBe(true);
  });
});
