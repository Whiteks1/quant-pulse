import type { PulseBundle } from "./loadPulseData";
import { validateArchiveIndex, validatePulseBundle } from "./runtimeFeedValidation";

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
  return validateArchiveIndex(await fetchJson<ArchiveIndex>("data/archive/index.json"), "archive index");
}

export async function fetchArchiveEdition(relativePath: string): Promise<PulseBundle> {
  return validatePulseBundle(await fetchJson<PulseBundle>(relativePath), `archive edition (${relativePath})`);
}
