import { describe, expect, it } from "vitest";
import {
  buildArchiveHref,
  buildArchiveRouteSearchParams,
  parseArchiveRouteState,
} from "./archive-route";

describe("parseArchiveRouteState", () => {
  it("returns defaults for an empty archive route", () => {
    expect(parseArchiveRouteState(new URLSearchParams())).toEqual({
      edition: "current",
      section: "All",
      category: "All",
      query: "",
      date: "",
      source: "",
    });
  });

  it("accepts valid archive filters", () => {
    const params = new URLSearchParams(
      "edition=2026-04-05_v2&section=Technology&category=AI&q=openai&date=2026-04-04&source=OpenAI"
    );

    expect(parseArchiveRouteState(params)).toEqual({
      edition: "2026-04-05_v2",
      section: "Technology",
      category: "AI",
      query: "openai",
      date: "2026-04-04",
      source: "OpenAI",
    });
  });

  it("drops invalid date values", () => {
    const params = new URLSearchParams("date=04-04-2026&source=%20Reuters%20");

    expect(parseArchiveRouteState(params)).toEqual({
      edition: "current",
      section: "All",
      category: "All",
      query: "",
      date: "",
      source: "Reuters",
    });
  });
});

describe("buildArchiveRouteSearchParams", () => {
  it("omits defaults and empty facets", () => {
    expect(
      buildArchiveRouteSearchParams({
        edition: "current",
        section: "All",
        category: "All",
        query: "",
        date: "",
        source: "",
      }).toString()
    ).toBe("");
  });

  it("serializes archive-specific filters", () => {
    const params = buildArchiveRouteSearchParams({
      edition: "2026-04-05_v2",
      section: "Crypto & Markets",
      category: "ETFs",
      query: " btc ",
      date: "2026-04-04",
      source: "Bloomberg",
    });

    expect(params.get("edition")).toBe("2026-04-05_v2");
    expect(params.get("section")).toBe("Crypto & Markets");
    expect(params.get("category")).toBe("ETFs");
    expect(params.get("q")).toBe("btc");
    expect(params.get("date")).toBe("2026-04-04");
    expect(params.get("source")).toBe("Bloomberg");
  });
});

describe("buildArchiveHref", () => {
  it("returns the archive route with query params when active", () => {
    expect(
      buildArchiveHref({
        edition: "current",
        section: "All",
        category: "Regulation",
        query: "",
        date: "2026-04-04",
        source: "",
      })
    ).toBe("/archive?category=Regulation&date=2026-04-04");
  });
});
