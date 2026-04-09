import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { listPersistedArchiveEditions } from "./archive-store.mjs";
import { expectedRecencyScore, expectedSourceQualityScore, hasEditorialOverride } from "./scoring-model.mjs";

export const rootDir = process.cwd();
export const sourcePath = path.join(rootDir, "content", "pulse.source.json");
export const outputPath = path.join(rootDir, "public", "data", "pulse.json");
export const archiveSourceDir = path.join(rootDir, "content", "archive", "editions");
export const archiveOutputDir = path.join(rootDir, "public", "data", "archive");
export const archiveCurrentOutputPath = path.join(archiveOutputDir, "current.json");
export const archiveIndexOutputPath = path.join(archiveOutputDir, "index.json");
export const archiveEditionOutputDir = path.join(archiveOutputDir, "editions");
export const newsItemSchemaPath = path.join(rootDir, "config", "news.schema.json");

const watchDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const allowedSections = new Set(["Technology", "Crypto & Markets", "Macro"]);
const allowedWatchTypes = new Set(["earnings", "regulation", "event", "market"]);
const allowedCategoriesBySection = new Map([
  [
    "Technology",
    new Set(["AI", "Software", "Cybersecurity", "Big Tech", "Startups", "Cloud", "Chips", "Developer Tools", "Infrastructure"]),
  ],
  [
    "Crypto & Markets",
    new Set(["BTC", "ETH", "Altcoins", "ETFs", "Regulation", "Exchanges", "DeFi", "Stablecoins", "Security", "Flows", "Market Structure", "Custody"]),
  ],
  ["Macro", new Set(["Monetary Policy", "Inflation", "Rates", "Liquidity", "Global Markets", "Risk Sentiment"])],
]);
const sourceQualityCapsByTier = new Map([
  ["primary", 15],
  ["tier_1", 12],
  ["tier_2", 8],
  ["tier_3", 3],
  ["unlisted", 15],
]);
const approvedSourcesPath = path.join(rootDir, "config", "approved-sources.yaml");
const itemSchemaValidator = createItemSchemaValidator();
const approvedSourcesByTier = loadApprovedSourcesByTier();

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function formatOverrideHint(field) {
  return `Fix: align the value or declare editorialOverride.field=${field}.`;
}

function formatDeterministicDriftMessage({
  itemId,
  metric,
  actual,
  expected,
  basis,
  overrideField,
}) {
  return `Item ${itemId} ${metric} drift: expected ${expected}, found ${actual} (${basis}). ${formatOverrideHint(overrideField)}`;
}

function formatBandMismatchMessage({
  itemId,
  actualPriority,
  expectedPriority,
  score,
}) {
  return `Item ${itemId} priority drift: expected ${expectedPriority}, found ${actualPriority} (score band from relevanceScore=${score}). ${formatOverrideHint("priority")}`;
}

function formatScoreTotalMismatchMessage({
  itemId,
  actualScore,
  expectedScore,
}) {
  return `Item ${itemId} relevanceScore drift: expected ${expectedScore}, found ${actualScore} (sum of scoreJustification blocks). ${formatOverrideHint("relevanceScore")}`;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isIsoDateTime(value) {
  if (typeof value !== "string" || !isoDateTimePattern.test(value)) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

function scoreBand(score) {
  if (score >= 70) return "P1";
  if (score >= 40) return "P2";
  return "P3";
}

function normalizeSourceName(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function loadApprovedSourcesByTier() {
  const emptyResult = new Map([
    ["tier_1", new Set()],
    ["tier_2", new Set()],
    ["tier_3", new Set()],
  ]);

  if (!fs.existsSync(approvedSourcesPath)) {
    return emptyResult;
  }

  const lines = fs.readFileSync(approvedSourcesPath, "utf8").split(/\r?\n/);
  let activeTier = null;
  let inExplicitSourcesBlock = false;
  const result = new Map([
    ["tier_1", new Set()],
    ["tier_2", new Set()],
    ["tier_3", new Set()],
  ]);

  for (const line of lines) {
    const tierMatch = line.match(/^  (tier_[123]):\s*$/);
    if (tierMatch) {
      activeTier = tierMatch[1];
      inExplicitSourcesBlock = false;
      continue;
    }

    if (!activeTier) continue;

    if (line.match(/^    explicit_sources:\s*$/)) {
      inExplicitSourcesBlock = true;
      continue;
    }

    if (inExplicitSourcesBlock) {
      const sourceMatch = line.match(/^      -\s+(.+?)\s*$/);
      if (sourceMatch) {
        result.get(activeTier).add(normalizeSourceName(sourceMatch[1]));
        continue;
      }
      if (line.match(/^    [a-zA-Z]/)) {
        inExplicitSourcesBlock = false;
      }
    }
  }

  return result;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function serializeJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function createItemSchemaValidator() {
  const schema = readJson(newsItemSchemaPath);
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
  });
  addFormats(ajv);
  return ajv.compile(schema);
}

function formatSchemaError(error) {
  const pathLabel = error.instancePath || "/";
  return `${pathLabel} ${error.message}`.trim();
}

export function normalizePulseBundle(bundle) {
  const errors = [];

  assert(typeof bundle.version === "number", "pulse.version must be a number", errors);
  assert(typeof bundle.updatedAt === "string", "pulse.updatedAt must be a string", errors);
  assert(isIsoDateTime(bundle.updatedAt), "pulse.updatedAt must be a valid ISO date-time in UTC", errors);
  assert(Array.isArray(bundle.items), "pulse.items must be an array", errors);
  assert(Array.isArray(bundle.executiveBrief), "pulse.executiveBrief must be an array", errors);
  assert(Array.isArray(bundle.watchItems), "pulse.watchItems must be an array", errors);

  const briefIds = new Set();
  const briefItemIds = new Set();
  const itemIds = new Set();
  const dedupeKeys = new Set();
  const watchItemIds = new Set();

  for (const brief of bundle.executiveBrief ?? []) {
    assert(typeof brief.id === "string" && brief.id.length > 0, "Each executiveBrief item needs id", errors);
    if (typeof brief.id === "string") {
      assert(!briefIds.has(brief.id), `Duplicate executiveBrief id: ${brief.id}`, errors);
      briefIds.add(brief.id);
    }
    assert(typeof brief.itemId === "string" && brief.itemId.length > 0, "Each executiveBrief item needs itemId", errors);
    assert(typeof brief.text === "string" && brief.text.length > 0, "Each executiveBrief item needs text", errors);
    if (typeof brief.itemId === "string") {
      assert(
        !briefItemIds.has(brief.itemId),
        `Duplicate executiveBrief itemId: ${brief.itemId}`,
        errors
      );
      briefItemIds.add(brief.itemId);
    }
  }

  for (const [index, item] of (bundle.items ?? []).entries()) {
    const validItemSchema = itemSchemaValidator(item);
    if (!validItemSchema) {
      const itemName =
        typeof item?.id === "string" && item.id.length > 0 ? item.id : `items[${index}]`;
      for (const schemaError of itemSchemaValidator.errors ?? []) {
        errors.push(`Item ${itemName} schema: ${formatSchemaError(schemaError)}`);
      }
    }

    assert(typeof item.id === "string" && item.id.length > 0, "Each item needs id", errors);
    if (typeof item.id === "string") {
      assert(!itemIds.has(item.id), `Duplicate item id: ${item.id}`, errors);
      itemIds.add(item.id);
    }

    assert(typeof item.dedupeKey === "string" && item.dedupeKey.length > 0, `Item ${item.id} must include dedupeKey`, errors);
    if (typeof item.dedupeKey === "string") {
      assert(!dedupeKeys.has(item.dedupeKey), `Duplicate dedupeKey: ${item.dedupeKey}`, errors);
      dedupeKeys.add(item.dedupeKey);
    }

    assert(typeof item.sourceTier === "string", `Item ${item.id} must include sourceTier`, errors);
    assert(typeof item.linkType === "string", `Item ${item.id} must include linkType`, errors);
    assert(isHttpUrl(item.url), `Item ${item.id} must have a real HTTP URL`, errors);
    assert(!item.url.includes("example.com"), `Item ${item.id} cannot use example.com`, errors);
    assert(item.scoreJustification && typeof item.scoreJustification === "object", `Item ${item.id} must include scoreJustification`, errors);
    if (typeof item.scoredAt === "string") {
      assert(
        isIsoDateTime(item.scoredAt),
        `Item ${item.id} scoredAt must be a valid ISO date-time in UTC`,
        errors
      );

      if (isIsoDateTime(item.scoredAt) && isIsoDateTime(item.publishedAt)) {
        assert(
          Date.parse(item.scoredAt) >= Date.parse(item.publishedAt),
          `Item ${item.id} scoredAt must be the same as or later than publishedAt`,
          errors
        );
      }
    }
    assert(
      typeof item.section === "string" &&
        typeof item.category === "string" &&
        allowedCategoriesBySection.get(item.section)?.has(item.category),
      `Item ${item.id} category (${item.category}) is not valid for section (${item.section})`,
      errors
    );

    if (item.scoreJustification && typeof item.scoreJustification === "object") {
      const expectedRecency = expectedRecencyScore(item);
      if (expectedRecency !== null && !hasEditorialOverride(item, "scoreJustification.recency")) {
        assert(
          item.scoreJustification.recency === expectedRecency,
          formatDeterministicDriftMessage({
            itemId: item.id,
            metric: "recency",
            actual: item.scoreJustification.recency,
            expected: expectedRecency,
            basis: "scoredAt/publishedAt window",
            overrideField: "scoreJustification.recency",
          }),
          errors
        );
      }

      const sourceQualityCap = sourceQualityCapsByTier.get(item.sourceTier);
      if (typeof sourceQualityCap === "number") {
        assert(
          item.scoreJustification.sourceQuality <= sourceQualityCap,
          `Item ${item.id} sourceQuality (${item.scoreJustification.sourceQuality}) exceeds cap for sourceTier (${item.sourceTier})`,
          errors
        );
      }

      const expectedSourceQuality = expectedSourceQualityScore(item);
      if (expectedSourceQuality !== null && !hasEditorialOverride(item, "scoreJustification.sourceQuality")) {
        assert(
          item.scoreJustification.sourceQuality === expectedSourceQuality,
          formatDeterministicDriftMessage({
            itemId: item.id,
            metric: "sourceQuality",
            actual: item.scoreJustification.sourceQuality,
            expected: expectedSourceQuality,
            basis: `sourceTier ${item.sourceTier}`,
            overrideField: "scoreJustification.sourceQuality",
          }),
          errors
        );
      }

      const score =
        item.scoreJustification.recency +
        item.scoreJustification.marketImpact +
        item.scoreJustification.structuralImpact +
        item.scoreJustification.sourceQuality +
        item.scoreJustification.crossValidation +
        item.scoreJustification.thematicRelevance;

      if (!item.editorialOverride || item.editorialOverride.field !== "relevanceScore") {
        assert(
          score === item.relevanceScore,
          formatScoreTotalMismatchMessage({
            itemId: item.id,
            actualScore: item.relevanceScore,
            expectedScore: score,
          }),
          errors
        );
      }
    }

    if (!item.editorialOverride || item.editorialOverride.field !== "priority") {
      const expectedPriority = scoreBand(item.relevanceScore);
      assert(
        expectedPriority === item.priority,
        formatBandMismatchMessage({
          itemId: item.id,
          actualPriority: item.priority,
          expectedPriority,
          score: item.relevanceScore,
        }),
        errors
      );
    }

    if ((!item.editorialOverride || item.editorialOverride.field !== "signalVsNoise") && item.signalVsNoise === "noise") {
      assert(item.priority !== "P1", `Item ${item.id} marked as noise cannot be P1 without editorialOverride`, errors);
      assert(
        item.relevanceScore < 70,
        `Item ${item.id} marked as noise cannot have relevanceScore >= 70 without editorialOverride`,
        errors
      );
    }

    if (typeof item.source === "string" && typeof item.sourceTier === "string") {
      const normalizedSource = normalizeSourceName(item.source);
      const sourceInTier1 = approvedSourcesByTier.get("tier_1")?.has(normalizedSource) ?? false;
      const sourceInTier2 = approvedSourcesByTier.get("tier_2")?.has(normalizedSource) ?? false;
      const sourceInTier3 = approvedSourcesByTier.get("tier_3")?.has(normalizedSource) ?? false;

      if (sourceInTier1) {
        assert(
          item.sourceTier === "tier_1" || item.sourceTier === "primary",
          `Item ${item.id} source (${item.source}) is approved as tier_1 but is marked as ${item.sourceTier}`,
          errors
        );
      } else if (sourceInTier2) {
        assert(
          item.sourceTier === "tier_2",
          `Item ${item.id} source (${item.source}) is approved as tier_2 but is marked as ${item.sourceTier}`,
          errors
        );
      } else if (sourceInTier3) {
        assert(
          item.sourceTier === "tier_3",
          `Item ${item.id} source (${item.source}) is approved as tier_3 but is marked as ${item.sourceTier}`,
          errors
        );
      } else if (item.sourceTier === "tier_1") {
        assert(
          false,
          `Item ${item.id} source (${item.source}) is not approved for explicit tier tier_1`,
          errors
        );
      } else if (item.sourceTier === "tier_2") {
        assert(
          false,
          `Item ${item.id} source (${item.source}) is not approved for explicit tier tier_2`,
          errors
        );
      } else if (item.sourceTier === "tier_3") {
        assert(
          false,
          `Item ${item.id} source (${item.source}) is not approved for explicit tier tier_3`,
          errors
        );
      }
    }
  }

  for (const brief of bundle.executiveBrief ?? []) {
    if (typeof brief.itemId === "string") {
      assert(itemIds.has(brief.itemId), `Executive brief itemId not found in items: ${brief.itemId}`, errors);
    }
  }

  for (const item of bundle.items ?? []) {
    if (item.priority === "P1") {
      assert(briefItemIds.has(item.id), `P1 item ${item.id} must appear in executiveBrief`, errors);
    }
  }

  for (const watchItem of bundle.watchItems ?? []) {
    assert(typeof watchItem.id === "string" && watchItem.id.length > 0, "Each watchItem needs id", errors);
    if (typeof watchItem.id === "string") {
      assert(!watchItemIds.has(watchItem.id), `Duplicate watch item id: ${watchItem.id}`, errors);
      watchItemIds.add(watchItem.id);
    }
    assert(typeof watchItem.title === "string" && watchItem.title.length > 0, `Watch item ${watchItem.id} must include title`, errors);
    assert(typeof watchItem.date === "string" && watchDatePattern.test(watchItem.date), `Watch item ${watchItem.id} must include date in YYYY-MM-DD`, errors);
    assert(
      typeof watchItem.type === "string" && allowedWatchTypes.has(watchItem.type),
      `Watch item ${watchItem.id} must include a valid type`,
      errors
    );
    assert(typeof watchItem.section === "string" && watchItem.section.length > 0, `Watch item ${watchItem.id} must include section`, errors);
    assert(allowedSections.has(watchItem.section), `Watch item ${watchItem.id} must include a valid section`, errors);
    assert(typeof watchItem.category === "string" && watchItem.category.length > 0, `Watch item ${watchItem.id} must include category`, errors);
    assert(
      typeof watchItem.section === "string" &&
        typeof watchItem.category === "string" &&
        allowedCategoriesBySection.get(watchItem.section)?.has(watchItem.category),
      `Watch item ${watchItem.id} category (${watchItem.category}) is not valid for section (${watchItem.section})`,
      errors
    );
    assert(typeof watchItem.source === "string" && watchItem.source.length > 0, `Watch item ${watchItem.id} must include source`, errors);
    assert(typeof watchItem.description === "string" && watchItem.description.length > 0, `Watch item ${watchItem.id} must include description`, errors);
    assert(typeof watchItem.whyWatch === "string" && watchItem.whyWatch.length > 0, `Watch item ${watchItem.id} must include whyWatch`, errors);
    assert(isHttpUrl(watchItem.url), `Watch item ${watchItem.id} must include a real HTTP URL`, errors);
  }

  return { errors, bundle };
}

export function readSourceBundle() {
  return readJson(sourcePath);
}

export function serializePulseBundle(bundle) {
  return serializeJson(bundle);
}

function editionStats(bundle) {
  const totalItems = bundle.items.length;
  const signalCount = bundle.items.filter((item) => item.signalVsNoise === "signal").length;
  const p1Count = bundle.items.filter((item) => item.priority === "P1").length;

  return {
    totalItems,
    signalCount,
    p1Count,
  };
}

function buildEditionIndexItem({
  slug,
  label,
  bundle,
  relativePath,
  isCurrent = false,
}) {
  return {
    slug,
    label,
    updatedAt: bundle.updatedAt,
    version: bundle.version,
    path: relativePath.replaceAll(path.sep, "/"),
    isCurrent,
    ...editionStats(bundle),
  };
}

function formatArchiveEditionLabel(slug) {
  const match = slug.match(/^(\d{4}-\d{2}-\d{2})_v(\d+)$/);
  if (!match) {
    return slug;
  }

  return `${match[1]} · v${match[2]}`;
}

export function buildArchiveArtifacts(currentBundle) {
  const errors = [];
  const archiveEditionFiles = [];
  const archiveIndexItems = [
    buildEditionIndexItem({
      slug: "current",
      label: "Current edition",
      bundle: currentBundle,
      relativePath: path.join("data", "archive", "current.json"),
      isCurrent: true,
    }),
  ];

  for (const entry of listPersistedArchiveEditions()) {
    const { errors: entryErrors, bundle } = normalizePulseBundle(entry.bundle);

    for (const error of entryErrors) {
      errors.push(`Archive edition ${entry.slug}: ${error}`);
    }

    if (entryErrors.length > 0) {
      continue;
    }

    archiveEditionFiles.push({
      slug: entry.slug,
      outputPath: path.join(archiveEditionOutputDir, `${entry.slug}.json`),
      content: serializePulseBundle(bundle),
    });

    archiveIndexItems.push(
      buildEditionIndexItem({
        slug: entry.slug,
        label: formatArchiveEditionLabel(entry.slug),
        bundle,
        relativePath: path.join("data", "archive", "editions", `${entry.slug}.json`),
      })
    );
  }

  archiveIndexItems.sort((a, b) => {
    if (b.updatedAt !== a.updatedAt) {
      return b.updatedAt.localeCompare(a.updatedAt);
    }

    if (a.isCurrent === b.isCurrent) {
      return a.slug.localeCompare(b.slug);
    }

    return a.isCurrent ? -1 : 1;
  });

  return {
    errors,
    currentContent: serializePulseBundle(currentBundle),
    indexContent: serializeJson({
      generatedAt: currentBundle.updatedAt,
      currentEditionSlug: "current",
      editions: archiveIndexItems,
    }),
    archiveEditionFiles,
  };
}
