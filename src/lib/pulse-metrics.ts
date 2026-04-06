import type { NewsItem, QuantPulseSection } from "@/data/mockNews";

const priorityOrder = ["P1", "P2", "P3"] as const;
const sectionOrder = ["Technology", "Crypto & Markets", "Macro"] as const satisfies readonly QuantPulseSection[];

export interface DistributionEntry {
  label: string;
  count: number;
  share: number;
}

export interface TopSourceConcentration {
  source: string;
  count: number;
  share: number;
}

export interface PulseDashboardMetrics {
  totalItems: number;
  signalCount: number;
  noiseCount: number;
  p1Count: number;
  signalShare: number;
  topSource: TopSourceConcentration | null;
  priorityDistribution: DistributionEntry[];
  signalNoiseDistribution: DistributionEntry[];
  sectionDistribution: DistributionEntry[];
}

function computeShare(count: number, total: number): number {
  if (total <= 0) return 0;
  return count / total;
}

export function getPulseDashboardMetrics(items: NewsItem[]): PulseDashboardMetrics {
  const totalItems = items.length;
  const signalCount = items.filter((item) => item.signalVsNoise === "signal").length;
  const noiseCount = items.filter((item) => item.signalVsNoise === "noise").length;
  const p1Count = items.filter((item) => item.priority === "P1").length;

  const sourceCounts = new Map<string, number>();
  for (const item of items) {
    sourceCounts.set(item.source, (sourceCounts.get(item.source) ?? 0) + 1);
  }

  const topSourceEntry =
    [...sourceCounts.entries()]
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
      })[0] ?? null;

  const topSource =
    topSourceEntry === null
      ? null
      : {
          source: topSourceEntry[0],
          count: topSourceEntry[1],
          share: computeShare(topSourceEntry[1], totalItems),
        };

  const priorityDistribution = priorityOrder.map((priority) => {
    const count = items.filter((item) => item.priority === priority).length;
    return {
      label: priority,
      count,
      share: computeShare(count, totalItems),
    };
  });

  const signalNoiseDistribution = [
    {
      label: "Signal",
      count: signalCount,
      share: computeShare(signalCount, totalItems),
    },
    {
      label: "Noise",
      count: noiseCount,
      share: computeShare(noiseCount, totalItems),
    },
  ];

  const sectionDistribution = sectionOrder.map((section) => {
    const count = items.filter((item) => item.section === section).length;
    return {
      label: section,
      count,
      share: computeShare(count, totalItems),
    };
  });

  return {
    totalItems,
    signalCount,
    noiseCount,
    p1Count,
    signalShare: computeShare(signalCount, totalItems),
    topSource,
    priorityDistribution,
    signalNoiseDistribution,
    sectionDistribution,
  };
}
