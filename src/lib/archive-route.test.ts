import { describe, expect, it } from "vitest";
import {
  buildArchiveHref,
  buildArchiveRouteSearchParams,
  parseArchiveRouteState,
} from "./archive-route";

describe("parseArchiveRouteState", () => {
  it("returns defaults for an empty archive route", () => {
    expect(parseArchiveRouteState(new URLSearchParams())).toEqual({
      section: "All",
      category: "All",
      query: "",
      date: "",
      source: "",
    });
  });

  it("accepts valid archive filters", () => {
    const params = new URLSearchParams(
      "section=Technology&category=AI&q=openai&date=2026-04-04&source=OpenAI"
    );

    expect(parseArchiveRouteState(params)).toEqual({
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
        section: "All",
        category: "All",
        query: "",
        date: "",
        source: "",
      }).toString()
    ).toBe("");
  });

  it("serializes archive-specific filters", () => {
    expect(
      buildArchiveRouteSearchParams({
        section: "Crypto & Markets",
        category: "ETFs",
        query: " btc ",
        date: "2026-04-04",
        source: "Bloomberg",
      }).toString()
    ).toBe(
      "section=Crypto+%26+Markets&category=ETFs&q=btc&date=2026-04-04&source=Bloomberg"
    );
  });
});

describe("buildArchiveHref", () => {
  it("returns the archive route with query params when active", () => {
    expect(
      buildArchiveHref({
        section: "All",
        category: "Regulation",
        query: "",
        date: "2026-04-04",
        source: "",
      })
    ).toBe("/archive?category=Regulation&date=2026-04-04");
  });
});
