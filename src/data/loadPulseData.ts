import type { ExecutiveBriefItem, NewsItem, WatchItem } from "./mockNews";
import { validatePulseBundle } from "./runtimeFeedValidation";

export interface PulseBundle {
  version: number;
  updatedAt: string;
  items: NewsItem[];
  executiveBrief: ExecutiveBriefItem[];
  watchItems: WatchItem[];
}

function pulseUrl(): string {
  const base = import.meta.env.BASE_URL;
  return `${base}data/pulse.json`;
}

export async function fetchPulseData(): Promise<PulseBundle> {
  const res = await fetch(pulseUrl(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load pulse data: ${res.status} ${res.statusText}`);
  }

  return validatePulseBundle(await res.json(), "pulse.json");
}
