import { useEffect, useMemo, useState } from "react";
import {
  fetchArchiveEdition,
  fetchArchiveIndex,
  type ArchiveEditionSummary,
  type ArchiveIndex,
} from "@/data/loadArchiveData";
import type { PulseBundle } from "@/data/loadPulseData";

interface UseArchiveEditionResult {
  index: ArchiveIndex | null;
  selectedEdition: ArchiveEditionSummary | null;
  bundle: PulseBundle | null;
  loadState: "loading" | "ok" | "error";
  loadError: string | null;
}

export function useArchiveEdition(editionSlug: string): UseArchiveEditionResult {
  const [index, setIndex] = useState<ArchiveIndex | null>(null);
  const [bundle, setBundle] = useState<PulseBundle | null>(null);
  const [selectedEdition, setSelectedEdition] = useState<ArchiveEditionSummary | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ok" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchArchiveIndex()
      .then((nextIndex) => {
        if (cancelled) return;
        setIndex(nextIndex);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadState("error");
        setLoadError(error instanceof Error ? error.message : "Unknown error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedEdition = useMemo(() => {
    if (!index) return null;

    return (
      index.editions.find((edition) => edition.slug === editionSlug) ??
      index.editions.find((edition) => edition.slug === index.currentEditionSlug) ??
      index.editions[0] ??
      null
    );
  }, [editionSlug, index]);

  useEffect(() => {
    if (!resolvedEdition) {
      if (index && index.editions.length === 0) {
        setLoadState("error");
        setLoadError("Archive index does not contain any editions");
      }
      return;
    }

    let cancelled = false;
    setLoadState("loading");
    setLoadError(null);
    setSelectedEdition(resolvedEdition);

    fetchArchiveEdition(resolvedEdition.path)
      .then((nextBundle) => {
        if (cancelled) return;
        setBundle(nextBundle);
        setLoadState("ok");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadState("error");
        setLoadError(error instanceof Error ? error.message : "Unknown error");
      });

    return () => {
      cancelled = true;
    };
  }, [index, resolvedEdition]);

  return {
    index,
    selectedEdition,
    bundle,
    loadState,
    loadError,
  };
}
