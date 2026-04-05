import {
  buildFeedFilterSearchParams,
  parseFeedFilterState,
  type FeedFilterState,
} from "@/lib/feed-filters";

export interface ArchiveRouteState extends FeedFilterState {
  date: string;
  source: string;
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function parseArchiveRouteState(searchParams: URLSearchParams): ArchiveRouteState {
  const baseState = parseFeedFilterState(searchParams);
  const date = (searchParams.get("date") ?? "").trim();
  const source = (searchParams.get("source") ?? "").trim();

  return {
    ...baseState,
    date: datePattern.test(date) ? date : "",
    source,
  };
}

export function buildArchiveRouteSearchParams({
  section,
  category,
  query,
  date,
  source,
}: ArchiveRouteState): URLSearchParams {
  const params = buildFeedFilterSearchParams({ section, category, query });

  if (datePattern.test(date)) {
    params.set("date", date);
  }

  const trimmedSource = source.trim();
  if (trimmedSource.length > 0) {
    params.set("source", trimmedSource);
  }

  return params;
}

export function buildArchiveHref(state: ArchiveRouteState): string {
  const params = buildArchiveRouteSearchParams(state);
  const serialized = params.toString();
  return serialized.length > 0 ? `/archive?${serialized}` : "/archive";
}
