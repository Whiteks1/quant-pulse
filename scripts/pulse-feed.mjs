import fs from "node:fs";
import path from "node:path";

export const rootDir = process.cwd();
export const sourcePath = path.join(rootDir, "content", "pulse.source.json");
export const outputPath = path.join(rootDir, "public", "data", "pulse.json");

const allowedSections = new Set(["Technology", "Crypto & Markets", "Macro"]);
const allowedPriorities = new Set(["P1", "P2", "P3"]);
const allowedSignalValues = new Set(["signal", "noise"]);
const allowedWatchTypes = new Set(["earnings", "regulation", "event", "market"]);

function isIsoDateTime(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value) && !Number.isNaN(Date.parse(value));
}

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function expectNonEmptyString(value, label, errors) {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${label} must be a non-empty string`);
    return "";
  }

  return value.trim();
}

function expectStringArray(value, label, errors, minItems = 0) {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array`);
    return [];
  }

  const normalized = value.map((entry, index) =>
    expectNonEmptyString(entry, `${label}[${index}]`, errors)
  );

  if (normalized.length < minItems) {
    errors.push(`${label} must include at least ${minItems} item(s)`);
  }

  return normalized;
}

function normalizeItem(item, index, errors) {
  const prefix = `items[${index}]`;
  const normalized = {
    id: expectNonEmptyString(item?.id, `${prefix}.id`, errors),
    title: expectNonEmptyString(item?.title, `${prefix}.title`, errors),
    source: expectNonEmptyString(item?.source, `${prefix}.source`, errors),
    url: expectNonEmptyString(item?.url, `${prefix}.url`, errors),
    publishedAt: expectNonEmptyString(item?.publishedAt, `${prefix}.publishedAt`, errors),
    category: expectNonEmptyString(item?.category, `${prefix}.category`, errors),
    section: expectNonEmptyString(item?.section, `${prefix}.section`, errors),
    summary: expectNonEmptyString(item?.summary, `${prefix}.summary`, errors),
    whyItMatters: expectNonEmptyString(item?.whyItMatters, `${prefix}.whyItMatters`, errors),
    impact: expectNonEmptyString(item?.impact, `${prefix}.impact`, errors),
    tags: expectStringArray(item?.tags, `${prefix}.tags`, errors, 2),
    signalVsNoise: expectNonEmptyString(item?.signalVsNoise, `${prefix}.signalVsNoise`, errors),
    priority: expectNonEmptyString(item?.priority, `${prefix}.priority`, errors),
    relevanceScore: item?.relevanceScore,
    dedupeKey: expectNonEmptyString(item?.dedupeKey, `${prefix}.dedupeKey`, errors),
  };

  if (!isHttpUrl(normalized.url)) {
    errors.push(`${prefix}.url must be an absolute HTTP(S) URL`);
  }

  if (!isIsoDateTime(normalized.publishedAt)) {
    errors.push(`${prefix}.publishedAt must use ISO 8601 UTC format`);
  }

  if (!allowedSections.has(normalized.section)) {
    errors.push(`${prefix}.section must be one of: Technology, Crypto & Markets, Macro`);
  }

  if (!allowedSignalValues.has(normalized.signalVsNoise)) {
    errors.push(`${prefix}.signalVsNoise must be "signal" or "noise"`);
  }

  if (!allowedPriorities.has(normalized.priority)) {
    errors.push(`${prefix}.priority must be P1, P2 or P3`);
  }

  if (!Number.isInteger(normalized.relevanceScore) || normalized.relevanceScore < 0 || normalized.relevanceScore > 100) {
    errors.push(`${prefix}.relevanceScore must be an integer between 0 and 100`);
  }

  if (typeof item?.featured !== "undefined" && typeof item.featured !== "boolean") {
    errors.push(`${prefix}.featured must be a boolean when present`);
  }

  return {
    ...normalized,
    ...(typeof item?.featured === "boolean" ? { featured: item.featured } : {}),
  };
}

function normalizeWatchItem(item, index, errors) {
  const prefix = `watchItems[${index}]`;
  const normalized = {
    id: expectNonEmptyString(item?.id, `${prefix}.id`, errors),
    title: expectNonEmptyString(item?.title, `${prefix}.title`, errors),
    date: expectNonEmptyString(item?.date, `${prefix}.date`, errors),
    type: expectNonEmptyString(item?.type, `${prefix}.type`, errors),
    description: expectNonEmptyString(item?.description, `${prefix}.description`, errors),
  };

  if (!isIsoDate(normalized.date)) {
    errors.push(`${prefix}.date must use ISO YYYY-MM-DD format`);
  }

  if (!allowedWatchTypes.has(normalized.type)) {
    errors.push(`${prefix}.type must be earnings, regulation, event or market`);
  }

  return normalized;
}

export function normalizePulseBundle(bundle) {
  const errors = [];

  const version = bundle?.version;
  if (!Number.isInteger(version) || version <= 0) {
    errors.push("version must be a positive integer");
  }

  const updatedAt = expectNonEmptyString(bundle?.updatedAt, "updatedAt", errors);
  if (!isIsoDateTime(updatedAt)) {
    errors.push("updatedAt must use ISO 8601 UTC format");
  }

  const items = Array.isArray(bundle?.items)
    ? bundle.items.map((item, index) => normalizeItem(item, index, errors))
    : (errors.push("items must be an array"), []);

  const executiveBrief = expectStringArray(bundle?.executiveBrief, "executiveBrief", errors, 1);

  const watchItems = Array.isArray(bundle?.watchItems)
    ? bundle.watchItems.map((item, index) => normalizeWatchItem(item, index, errors))
    : (errors.push("watchItems must be an array"), []);

  const itemIds = new Set();
  const dedupeKeys = new Set();

  for (const item of items) {
    if (itemIds.has(item.id)) {
      errors.push(`Duplicate item id: ${item.id}`);
    }
    itemIds.add(item.id);

    if (dedupeKeys.has(item.dedupeKey)) {
      errors.push(`Duplicate dedupeKey: ${item.dedupeKey}`);
    }
    dedupeKeys.add(item.dedupeKey);
  }

  const watchIds = new Set();
  for (const watchItem of watchItems) {
    if (watchIds.has(watchItem.id)) {
      errors.push(`Duplicate watch item id: ${watchItem.id}`);
    }
    watchIds.add(watchItem.id);
  }

  return {
    errors,
    bundle: {
      version: Number.isInteger(version) ? version : 0,
      updatedAt,
      items,
      executiveBrief,
      watchItems,
    },
  };
}

export function readSourceBundle() {
  return readJson(sourcePath);
}

export function serializePulseBundle(bundle) {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}
