import type { ExecutiveBriefItem, NewsItem, WatchItem } from "./mockNews";
import { fetchArtifactWithStaticFallback } from "./liveFeedAdapter";
import { validatePulseBundle } from "./runtimeFeedValidation";

export interface PulseBundle {
  version: number;
  updatedAt: string;
  items: NewsItem[];
  executiveBrief: ExecutiveBriefItem[];
  watchItems: WatchItem[];
}

export async function fetchPulseData(): Promise<PulseBundle> {
  return fetchArtifactWithStaticFallback({
    livePath: "/v1/pulse/current",
    staticPath: "data/pulse.json",
    liveLabel: "live pulse endpoint",
    staticLabel: "pulse.json",
    validate: validatePulseBundle,
  });
}
