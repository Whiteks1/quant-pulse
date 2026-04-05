import { describe, expect, it } from "vitest";
import { buildFeedFilterSearchParams, parseFeedFilterState } from "./feed-filters";

describe("parseFeedFilterState", () => {
  it("returns defaults for an empty query string", () => {
    expect(parseFeedFilterState(new URLSearchParams())).toEqual({
      section: "All",
      category: "All",
      query: "",
    });
  });

  it("accepts valid query params", () => {
    const params = new URLSearchParams("section=Technology&category=AI&q=nvidia");

    expect(parseFeedFilterState(params)).toEqual({
      section: "Technology",
      category: "AI",
      query: "nvidia",
    });
  });

  it("falls back safely for invalid section and category values", () => {
    const params = new URLSearchParams("section=Bad&category=Worse&q=%20btc%20");

    expect(parseFeedFilterState(params)).toEqual({
      section: "All",
      category: "All",
      query: "btc",
    });
  });
});

describe("buildFeedFilterSearchParams", () => {
  it("omits default values from the URL", () => {
    expect(
      buildFeedFilterSearchParams({
        section: "All",
        category: "All",
        query: "",
      }).toString()
    ).toBe("");
  });

  it("serializes active filters into query params", () => {
    expect(
      buildFeedFilterSearchParams({
        section: "Crypto & Markets",
        category: "ETFs",
        query: " btc ",
      }).toString()
    ).toBe("section=Crypto+%26+Markets&category=ETFs&q=btc");
  });
});
