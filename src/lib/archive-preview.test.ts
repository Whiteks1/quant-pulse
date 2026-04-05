import { describe, expect, it } from "vitest";
import { buildArchivePreviewData } from "./archive-preview";

describe("buildArchivePreviewData", () => {
  it("groups items by date and counts signals", () => {
    const preview = buildArchivePreviewData([
      {
        publishedAt: "2026-04-05T09:00:00Z",
        category: "AI",
        source: "OpenAI",
        signalVsNoise: "signal",
      },
      {
        publishedAt: "2026-04-05T11:00:00Z",
        category: "AI",
        source: "Reuters",
        signalVsNoise: "noise",
      },
      {
        publishedAt: "2026-04-04T10:00:00Z",
        category: "ETFs",
        source: "Bloomberg",
        signalVsNoise: "signal",
      },
    ] as never[]);

    expect(preview.editions).toEqual([
      {
        dateKey: "2026-04-05",
        label: "April 5, 2026",
        totalItems: 2,
        signalCount: 1,
      },
      {
        dateKey: "2026-04-04",
        label: "April 4, 2026",
        totalItems: 1,
        signalCount: 1,
      },
    ]);
  });

  it("sorts categories and sources by count", () => {
    const preview = buildArchivePreviewData([
      {
        publishedAt: "2026-04-05T09:00:00Z",
        category: "AI",
        source: "OpenAI",
        signalVsNoise: "signal",
      },
      {
        publishedAt: "2026-04-04T11:00:00Z",
        category: "AI",
        source: "Reuters",
        signalVsNoise: "signal",
      },
      {
        publishedAt: "2026-04-04T12:00:00Z",
        category: "ETFs",
        source: "OpenAI",
        signalVsNoise: "noise",
      },
    ] as never[]);

    expect(preview.categories[0]).toEqual({ value: "AI", count: 2 });
    expect(preview.sources[0]).toEqual({ value: "OpenAI", count: 2 });
  });
});
