import type { NewsItem, WatchItem } from "./mockNews";

export interface PulseBundle {
  version: number;
  updatedAt: string;
  items: NewsItem[];
  executiveBrief: string[];
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
  const data = (await res.json()) as PulseBundle;
  if (!Array.isArray(data.items) || !Array.isArray(data.executiveBrief) || !Array.isArray(data.watchItems)) {
    throw new Error("Invalid pulse.json shape");
  }
  return data;
}
