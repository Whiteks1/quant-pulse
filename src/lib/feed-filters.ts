import { categories, sections } from "@/data/mockNews";

export interface FeedFilterState {
  section: string;
  category: string;
  query: string;
}

const allowedSections = new Set(sections);
const allowedCategories = new Set(categories);

export function parseFeedFilterState(searchParams: URLSearchParams): FeedFilterState {
  const section = searchParams.get("section") ?? "All";
  const category = searchParams.get("category") ?? "All";
  const query = (searchParams.get("q") ?? "").trim();

  return {
    section: allowedSections.has(section as (typeof sections)[number]) ? section : "All",
    category: allowedCategories.has(category as (typeof categories)[number]) ? category : "All",
    query,
  };
}

export function buildFeedFilterSearchParams({
  section,
  category,
  query,
}: FeedFilterState): URLSearchParams {
  const params = new URLSearchParams();

  if (section !== "All") params.set("section", section);
  if (category !== "All") params.set("category", category);

  const trimmedQuery = query.trim();
  if (trimmedQuery.length > 0) params.set("q", trimmedQuery);

  return params;
}
