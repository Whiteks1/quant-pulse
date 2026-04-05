import { format, parseISO } from "date-fns";
import type { NewsItem } from "@/data/mockNews";

export interface ArchiveEditionPreview {
  dateKey: string;
  label: string;
  totalItems: number;
  signalCount: number;
}

export interface ArchiveFacetPreview {
  value: string;
  count: number;
}

export interface ArchivePreviewData {
  editions: ArchiveEditionPreview[];
  categories: ArchiveFacetPreview[];
  sources: ArchiveFacetPreview[];
}

export interface ArchiveDateGroup {
  dateKey: string;
  label: string;
  items: NewsItem[];
}

export function buildArchivePreviewData(items: NewsItem[]): ArchivePreviewData {
  const editionMap = new Map<string, ArchiveEditionPreview>();
  const categoryMap = new Map<string, number>();
  const sourceMap = new Map<string, number>();

  for (const item of items) {
    const publishedDate = parseISO(item.publishedAt);
    const dateKey = format(publishedDate, "yyyy-MM-dd");

    const edition = editionMap.get(dateKey) ?? {
      dateKey,
      label: format(publishedDate, "MMMM d, yyyy"),
      totalItems: 0,
      signalCount: 0,
    };

    edition.totalItems += 1;
    if (item.signalVsNoise === "signal") {
      edition.signalCount += 1;
    }

    editionMap.set(dateKey, edition);
    categoryMap.set(item.category, (categoryMap.get(item.category) ?? 0) + 1);
    sourceMap.set(item.source, (sourceMap.get(item.source) ?? 0) + 1);
  }

  return {
    editions: [...editionMap.values()]
      .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
      .slice(0, 3),
    categories: sortFacetMap(categoryMap).slice(0, 6),
    sources: sortFacetMap(sourceMap).slice(0, 6),
  };
}

export function groupArchiveItemsByDate(items: NewsItem[]): ArchiveDateGroup[] {
  const sortedItems = [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const groups = new Map<string, ArchiveDateGroup>();

  for (const item of sortedItems) {
    const publishedDate = parseISO(item.publishedAt);
    const dateKey = format(publishedDate, "yyyy-MM-dd");
    const existingGroup = groups.get(dateKey);

    if (existingGroup) {
      existingGroup.items.push(item);
      continue;
    }

    groups.set(dateKey, {
      dateKey,
      label: format(publishedDate, "MMMM d, yyyy"),
      items: [item],
    });
  }

  return [...groups.values()].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

function sortFacetMap(map: Map<string, number>): ArchiveFacetPreview[] {
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.value.localeCompare(b.value);
    });
}
