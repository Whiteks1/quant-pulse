import { useEffect, useState } from "react";
import { fetchPulseData, type PulseBundle } from "@/data/loadPulseData";

export interface UsePulseDataResult extends PulseBundle {
  loadState: "loading" | "ok" | "error";
  loadError: string | null;
}

const emptyBundle: PulseBundle = {
  version: 0,
  updatedAt: "",
  items: [],
  executiveBrief: [],
  watchItems: [],
};

export function usePulseData(): UsePulseDataResult {
  const [bundle, setBundle] = useState<PulseBundle>(emptyBundle);
  const [loadState, setLoadState] = useState<"loading" | "ok" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchPulseData()
      .then((nextBundle) => {
        if (cancelled) return;
        setBundle(nextBundle);
        setLoadState("ok");
        setLoadError(null);
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

  return {
    ...bundle,
    loadState,
    loadError,
  };
}
