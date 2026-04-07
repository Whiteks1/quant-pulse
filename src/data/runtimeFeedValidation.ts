import type {
  ExecutiveBriefItem,
  NewsItem,
  QuantPulseLinkType,
  QuantPulsePriority,
  QuantPulseSection,
  QuantPulseSourceTier,
  ScoreJustification,
  WatchItem,
} from "./mockNews";
import type { PulseBundle } from "./loadPulseData";
import type { ArchiveEditionSummary, ArchiveIndex } from "./loadArchiveData";

const allowedSections = new Set<QuantPulseSection>(["Technology", "Crypto & Markets", "Macro"]);
const allowedPriorities = new Set<QuantPulsePriority>(["P1", "P2", "P3"]);
const allowedSourceTiers = new Set<QuantPulseSourceTier>(["primary", "tier_1", "tier_2", "tier_3", "unlisted"]);
const allowedLinkTypes = new Set<QuantPulseLinkType>(["article", "source-section", "source-home"]);
const allowedSignalKinds = new Set<NewsItem["signalVsNoise"]>(["signal", "noise"]);
const allowedWatchTypes = new Set<WatchItem["type"]>(["earnings", "regulation", "event", "market"]);
const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const watchDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fail(context: string, message: string): never {
  throw new Error(`Invalid ${context}: ${message}`);
}

function assertRecord(value: unknown, context: string, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    fail(context, `${path} must be an object`);
  }

  return value;
}

function assertString(value: unknown, context: string, path: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(context, `${path} must be a non-empty string`);
  }

  return value;
}

function assertBoolean(value: unknown, context: string, path: string): boolean {
  if (typeof value !== "boolean") {
    fail(context, `${path} must be a boolean`);
  }

  return value;
}

function assertFiniteNumber(value: unknown, context: string, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(context, `${path} must be a finite number`);
  }

  return value;
}

function assertArray(value: unknown, context: string, path: string): unknown[] {
  if (!Array.isArray(value)) {
    fail(context, `${path} must be an array`);
  }

  return value;
}

function assertEnum<T extends string>(value: unknown, allowed: Set<T>, context: string, path: string): T {
  const normalized = assertString(value, context, path) as T;
  if (!allowed.has(normalized)) {
    fail(context, `${path} must be one of: ${Array.from(allowed).join(", ")}`);
  }

  return normalized;
}

function assertIsoDateTime(value: unknown, context: string, path: string): string {
  const normalized = assertString(value, context, path);
  if (!isoDateTimePattern.test(normalized) || Number.isNaN(Date.parse(normalized))) {
    fail(context, `${path} must be an ISO 8601 UTC date-time`);
  }

  return normalized;
}

function assertWatchDate(value: unknown, context: string, path: string): string {
  const normalized = assertString(value, context, path);
  if (!watchDatePattern.test(normalized)) {
    fail(context, `${path} must use YYYY-MM-DD format`);
  }

  return normalized;
}

function assertHttpUrl(value: unknown, context: string, path: string): string {
  const normalized = assertString(value, context, path);

  try {
    const url = new URL(normalized);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      fail(context, `${path} must use http or https`);
    }
  } catch {
    fail(context, `${path} must be a valid absolute URL`);
  }

  return normalized;
}

function assertStringArray(value: unknown, context: string, path: string): string[] {
  const arrayValue = assertArray(value, context, path);
  return arrayValue.map((entry, index) => assertString(entry, context, `${path}[${index}]`));
}

function validateScoreJustification(value: unknown, context: string, path: string): ScoreJustification {
  const record = assertRecord(value, context, path);

  return {
    recency: assertFiniteNumber(record.recency, context, `${path}.recency`),
    marketImpact: assertFiniteNumber(record.marketImpact, context, `${path}.marketImpact`),
    structuralImpact: assertFiniteNumber(record.structuralImpact, context, `${path}.structuralImpact`),
    sourceQuality: assertFiniteNumber(record.sourceQuality, context, `${path}.sourceQuality`),
    crossValidation: assertFiniteNumber(record.crossValidation, context, `${path}.crossValidation`),
    thematicRelevance: assertFiniteNumber(record.thematicRelevance, context, `${path}.thematicRelevance`),
    rationale: assertString(record.rationale, context, `${path}.rationale`),
  };
}

function validateNewsItem(value: unknown, context: string, path: string): NewsItem {
  const record = assertRecord(value, context, path);

  return {
    id: assertString(record.id, context, `${path}.id`),
    title: assertString(record.title, context, `${path}.title`),
    source: assertString(record.source, context, `${path}.source`),
    sourceTier: assertEnum(record.sourceTier, allowedSourceTiers, context, `${path}.sourceTier`),
    url: assertHttpUrl(record.url, context, `${path}.url`),
    linkType: assertEnum(record.linkType, allowedLinkTypes, context, `${path}.linkType`),
    publishedAt: assertIsoDateTime(record.publishedAt, context, `${path}.publishedAt`),
    category: assertString(record.category, context, `${path}.category`),
    section: assertEnum(record.section, allowedSections, context, `${path}.section`),
    summary: assertString(record.summary, context, `${path}.summary`),
    whyItMatters: assertString(record.whyItMatters, context, `${path}.whyItMatters`),
    impact: assertString(record.impact, context, `${path}.impact`),
    tags: assertStringArray(record.tags, context, `${path}.tags`),
    signalVsNoise: assertEnum(record.signalVsNoise, allowedSignalKinds, context, `${path}.signalVsNoise`),
    priority: assertEnum(record.priority, allowedPriorities, context, `${path}.priority`),
    relevanceScore: assertFiniteNumber(record.relevanceScore, context, `${path}.relevanceScore`),
    scoreJustification: validateScoreJustification(record.scoreJustification, context, `${path}.scoreJustification`),
    dedupeKey: assertString(record.dedupeKey, context, `${path}.dedupeKey`),
    editorialOverride: record.editorialOverride as NewsItem["editorialOverride"],
    imageUrl: record.imageUrl as NewsItem["imageUrl"],
    imageAlt: record.imageAlt as NewsItem["imageAlt"],
    imageSource: record.imageSource as NewsItem["imageSource"],
    featured: record.featured as NewsItem["featured"],
  };
}

function validateExecutiveBriefItem(
  value: unknown,
  itemIds: Set<string>,
  briefItemIds: Set<string>,
  context: string,
  path: string
): ExecutiveBriefItem {
  const record = assertRecord(value, context, path);
  const itemId = assertString(record.itemId, context, `${path}.itemId`);

  if (!itemIds.has(itemId)) {
    fail(context, `${path}.itemId must reference an existing item id`);
  }

  if (briefItemIds.has(itemId)) {
    fail(context, `${path}.itemId must not repeat within executiveBrief`);
  }

  briefItemIds.add(itemId);

  return {
    id: assertString(record.id, context, `${path}.id`),
    itemId,
    text: assertString(record.text, context, `${path}.text`),
  };
}

function validateWatchItem(value: unknown, context: string, path: string): WatchItem {
  const record = assertRecord(value, context, path);

  return {
    id: assertString(record.id, context, `${path}.id`),
    title: assertString(record.title, context, `${path}.title`),
    date: assertWatchDate(record.date, context, `${path}.date`),
    section: assertEnum(record.section, allowedSections, context, `${path}.section`),
    category: assertString(record.category, context, `${path}.category`),
    type: assertEnum(record.type, allowedWatchTypes, context, `${path}.type`),
    source: assertString(record.source, context, `${path}.source`),
    url: assertHttpUrl(record.url, context, `${path}.url`),
    description: assertString(record.description, context, `${path}.description`),
    whyWatch: assertString(record.whyWatch, context, `${path}.whyWatch`),
  };
}

function validateArchiveEditionSummary(value: unknown, context: string, path: string): ArchiveEditionSummary {
  const record = assertRecord(value, context, path);

  return {
    slug: assertString(record.slug, context, `${path}.slug`),
    label: assertString(record.label, context, `${path}.label`),
    updatedAt: assertIsoDateTime(record.updatedAt, context, `${path}.updatedAt`),
    version: assertFiniteNumber(record.version, context, `${path}.version`),
    path: assertString(record.path, context, `${path}.path`),
    isCurrent: assertBoolean(record.isCurrent, context, `${path}.isCurrent`),
    totalItems: assertFiniteNumber(record.totalItems, context, `${path}.totalItems`),
    signalCount: assertFiniteNumber(record.signalCount, context, `${path}.signalCount`),
    p1Count: assertFiniteNumber(record.p1Count, context, `${path}.p1Count`),
  };
}

export function validatePulseBundle(value: unknown, context = "published pulse bundle"): PulseBundle {
  const record = assertRecord(value, context, "payload");
  const items = assertArray(record.items, context, "payload.items").map((item, index) =>
    validateNewsItem(item, context, `payload.items[${index}]`)
  );
  const itemIds = new Set(items.map((item) => item.id));
  const briefItemIds = new Set<string>();
  const executiveBrief = assertArray(record.executiveBrief, context, "payload.executiveBrief").map(
    (entry, index) =>
      validateExecutiveBriefItem(entry, itemIds, briefItemIds, context, `payload.executiveBrief[${index}]`)
  );
  const watchItems = assertArray(record.watchItems, context, "payload.watchItems").map((entry, index) =>
    validateWatchItem(entry, context, `payload.watchItems[${index}]`)
  );

  return {
    version: assertFiniteNumber(record.version, context, "payload.version"),
    updatedAt: assertIsoDateTime(record.updatedAt, context, "payload.updatedAt"),
    items,
    executiveBrief,
    watchItems,
  };
}

export function validateArchiveIndex(value: unknown, context = "archive index"): ArchiveIndex {
  const record = assertRecord(value, context, "payload");
  const editions = assertArray(record.editions, context, "payload.editions").map((entry, index) =>
    validateArchiveEditionSummary(entry, context, `payload.editions[${index}]`)
  );
  const currentEditionSlug = assertString(record.currentEditionSlug, context, "payload.currentEditionSlug");

  if (editions.length === 0) {
    fail(context, "payload.editions must contain at least one edition");
  }

  if (!editions.some((edition) => edition.slug === currentEditionSlug)) {
    fail(context, "payload.currentEditionSlug must match one of the published editions");
  }

  return {
    generatedAt: assertIsoDateTime(record.generatedAt, context, "payload.generatedAt"),
    currentEditionSlug,
    editions,
  };
}
