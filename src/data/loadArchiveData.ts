import type { PulseBundle } from "./loadPulseData";
import { editionSlugFromPath, fetchArtifactWithStaticFallback } from "./liveFeedAdapter";
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

export async function fetchArchiveIndex(): Promise<ArchiveIndex> {
  return fetchArtifactWithStaticFallback({
    livePath: "/v1/archive/index",
    staticPath: "data/archive/index.json",
    liveLabel: "live archive index endpoint",
    staticLabel: "archive index",
    validate: validateArchiveIndex,
  });
}

export async function fetchArchiveEdition(relativePath: string): Promise<PulseBundle> {
  return fetchArtifactWithStaticFallback({
    livePath: `/v1/archive/editions/${encodeURIComponent(editionSlugFromPath(relativePath))}`,
    staticPath: relativePath,
    liveLabel: `live archive edition (${relativePath})`,
    staticLabel: `archive edition (${relativePath})`,
    validate: validatePulseBundle,
  });
}
