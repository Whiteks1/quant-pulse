import type { PulseBundle } from "./loadPulseData";

export interface ArchiveEditionSummary {
  slug: string;
  label: string;
  updatedAt: string;
  version: number;
  path: string;
  isCurrent: boolean;
  totalItems: number;
  signalCount: number;
  p1Count: number;
}

export interface ArchiveIndex {
  generatedAt: string;
  currentEditionSlug: string;
  editions: ArchiveEditionSummary[];
}

function archiveUrl(relativePath: string): string {
  const base = import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = relativePath.startsWith("/") ? relativePath.slice(1) : relativePath;
  return `${normalizedBase}${normalizedPath}`;
}

async function fetchJson<T>(relativePath: string): Promise<T> {
  const response = await fetch(archiveUrl(relativePath), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load ${relativePath}: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function fetchArchiveIndex(): Promise<ArchiveIndex> {
  const data = await fetchJson<ArchiveIndex>("data/archive/index.json");

  if (!Array.isArray(data.editions) || typeof data.currentEditionSlug !== "string") {
    throw new Error("Invalid archive index shape");
  }

  return data;
}

export async function fetchArchiveEdition(relativePath: string): Promise<PulseBundle> {
  const data = await fetchJson<PulseBundle>(relativePath);

  if (!Array.isArray(data.items) || !Array.isArray(data.executiveBrief) || !Array.isArray(data.watchItems)) {
    throw new Error("Invalid archive edition shape");
  }

  return data;
}
