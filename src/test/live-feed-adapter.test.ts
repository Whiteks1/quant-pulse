import { describe, expect, it, vi } from "vitest";
import { editionSlugFromPath, fetchArtifactWithStaticFallback } from "@/data/liveFeedAdapter";

function makeJsonResponse(payload: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });
}

describe("live feed adapter", () => {
  it("uses the static artifact directly when no live origin is configured", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(makeJsonResponse({ source: "static" }));

    const result = await fetchArtifactWithStaticFallback({
      liveOrigin: "",
      basePath: "/quant-pulse/",
      fetchImpl,
      livePath: "/v1/pulse/current",
      staticPath: "data/pulse.json",
      liveLabel: "live pulse endpoint",
      staticLabel: "pulse.json",
      validate: (payload) => payload as { source: string },
    });

    expect(result).toEqual({ source: "static" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith("/quant-pulse/data/pulse.json", { cache: "no-store" });
  });

  it("prefers the live endpoint when configured and valid", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(makeJsonResponse({ source: "live" }));

    const result = await fetchArtifactWithStaticFallback({
      liveOrigin: "http://127.0.0.1:8787/",
      basePath: "/quant-pulse/",
      fetchImpl,
      livePath: "/v1/pulse/current",
      staticPath: "data/pulse.json",
      liveLabel: "live pulse endpoint",
      staticLabel: "pulse.json",
      validate: (payload) => payload as { source: string },
    });

    expect(result).toEqual({ source: "live" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith("http://127.0.0.1:8787/v1/pulse/current", { cache: "no-store" });
  });

  it("falls back to the static artifact when the live endpoint fails", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "service unavailable" }), {
          status: 503,
          statusText: "Service Unavailable",
        })
      )
      .mockResolvedValueOnce(makeJsonResponse({ source: "static" }));

    const result = await fetchArtifactWithStaticFallback({
      liveOrigin: "http://127.0.0.1:8787",
      basePath: "/quant-pulse/",
      fetchImpl,
      livePath: "/v1/archive/index",
      staticPath: "data/archive/index.json",
      liveLabel: "live archive index endpoint",
      staticLabel: "archive index",
      validate: (payload) => payload as { source: string },
    });

    expect(result).toEqual({ source: "static" });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[1][0]).toBe("/quant-pulse/data/archive/index.json");
  });

  it("falls back to the static artifact when live validation fails", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(makeJsonResponse({ source: "live" }))
      .mockResolvedValueOnce(makeJsonResponse({ source: "static" }));

    const validate = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error("live payload invalid");
      })
      .mockImplementationOnce((payload) => payload);

    const result = await fetchArtifactWithStaticFallback({
      liveOrigin: "http://127.0.0.1:8787",
      basePath: "/",
      fetchImpl,
      livePath: "/v1/archive/index",
      staticPath: "data/archive/index.json",
      liveLabel: "live archive index endpoint",
      staticLabel: "archive index",
      validate,
    });

    expect(result).toEqual({ source: "static" });
    expect(validate).toHaveBeenCalledTimes(2);
  });

  it("surfaces a combined error when both live and static paths fail", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "service unavailable" }), {
          status: 503,
          statusText: "Service Unavailable",
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "not found" }), {
          status: 404,
          statusText: "Not Found",
        })
      );

    await expect(
      fetchArtifactWithStaticFallback({
        liveOrigin: "http://127.0.0.1:8787",
        basePath: "/",
        fetchImpl,
        livePath: "/v1/pulse/current",
        staticPath: "data/pulse.json",
        liveLabel: "live pulse endpoint",
        staticLabel: "pulse.json",
        validate: (payload) => payload,
      })
    ).rejects.toThrow(
      "Live fetch failed (Failed to load live pulse endpoint: 503 Service Unavailable); static fallback failed (Failed to load pulse.json: 404 Not Found)"
    );
  });

  it("derives archive edition slugs from current and historical paths", () => {
    expect(editionSlugFromPath("data/archive/current.json")).toBe("current");
    expect(editionSlugFromPath("data/archive/editions/2026-04-05_v2.json")).toBe("2026-04-05_v2");
  });
});
