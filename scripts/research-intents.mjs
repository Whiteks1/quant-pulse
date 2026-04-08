import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { rootDir } from "./pulse-feed.mjs";

export const intentsOutputPath = path.join(rootDir, "public", "data", "intents.json");
const researchIntentSchemaPath = path.join(rootDir, "config", "research-intent.schema.json");
const researchIntentsDocumentSchemaPath = path.join(
  rootDir,
  "config",
  "research-intents-document.schema.json"
);

const riskCategorySet = new Set([
  "Regulation",
  "Security",
  "Custody",
  "Exchanges",
  "Market Structure",
  "Rates",
  "Inflation",
  "Liquidity",
]);

const riskKeywordMatchers = [
  /\bregulation\b/i,
  /\bregulatory\b/i,
  /\bcompliance\b/i,
  /\bmarket structure\b/i,
  /\bvenue\b/i,
  /\bbroker\b/i,
  /\bcustody\b/i,
  /\bexchange\b/i,
  /\bsecurity disclosure\b/i,
  /\bcritical infrastructure\b/i,
  /\bsupply[- ]chain\b/i,
  /\bbreach\b/i,
  /\bexploit\b/i,
  /\battack\b/i,
  /\bcampaign targeting\b/i,
  /\binflation\b/i,
  /\brates\b/i,
  /\bliquidity\b/i,
  /\bfederal reserve\b/i,
  /\bfed\b/i,
];

const positiveSignalMatchers = [
  /\binflow/i,
  /\breversal/i,
  /\bimprov/i,
  /\brecord/i,
  /\bstrength/i,
  /\bconstructive/i,
  /\bdemand/i,
  /\bcompetitive/i,
  /\bupgrade/i,
  /\blaunch/i,
];

const negativeSignalMatchers = [
  /\bdelay/i,
  /\bheadwind/i,
  /\bpressure/i,
  /\bslower easing/i,
  /\bhigher[- ]for[- ]longer/i,
  /\bthreat/i,
  /\btargeting/i,
  /\bcompromise/i,
  /\brisk\b/i,
];

const validateResearchIntentsDocument = createResearchIntentsDocumentValidator();

function createResearchIntentsDocumentValidator() {
  const intentSchema = JSON.parse(fs.readFileSync(researchIntentSchemaPath, "utf8"));
  const documentSchema = JSON.parse(fs.readFileSync(researchIntentsDocumentSchemaPath, "utf8"));
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
  });
  addFormats(ajv);
  ajv.addSchema(intentSchema);
  return ajv.compile(documentSchema);
}

function serializeJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function formatSchemaError(error) {
  const pathLabel = error.instancePath || "/";
  return `${pathLabel} ${error.message}`.trim();
}

function buildEditionId(bundle) {
  const datePart = String(bundle.updatedAt).slice(0, 10);
  return `${datePart}_v${bundle.version}`;
}

function isIntentEligible(item) {
  return item.signalVsNoise === "signal" && (item.priority === "P1" || item.priority === "P2");
}

function isRiskFilterItem(item) {
  if (item.section === "Macro") {
    return true;
  }

  if (riskCategorySet.has(item.category)) {
    return true;
  }

  const text = [item.title, item.summary, item.whyItMatters, item.impact]
    .map(normalizeText)
    .join(" ");

  if (
    item.section === "Technology" &&
    /\blaunch/i.test(text) &&
    /\bproduct\b|\bcompetitive signal\b|\bcompetitive\b/i.test(text)
  ) {
    return false;
  }

  return riskKeywordMatchers.some((matcher) => matcher.test(text));
}

function classifyRoute(item) {
  if (isRiskFilterItem(item)) {
    return "risk_filter";
  }

  if (item.section === "Technology") {
    return "product_priority";
  }

  return "research_hypothesis";
}

function classifyHypothesisType(route) {
  if (route === "risk_filter") return "risk_filter";
  if (route === "product_priority") return "product_priority";
  return "event_driven";
}

function classifyBias(item, route) {
  if (route === "risk_filter") {
    return "regime-risk";
  }

  const text = [item.title, item.summary, item.whyItMatters, item.impact]
    .map(normalizeText)
    .join(" ");

  if (positiveSignalMatchers.some((matcher) => matcher.test(text))) {
    return "bullish";
  }

  if (negativeSignalMatchers.some((matcher) => matcher.test(text))) {
    return "bearish";
  }

  return "neutral";
}

function classifyHorizon(item) {
  return item.priority === "P1" ? "days to weeks" : "weeks to months";
}

function buildAffectedUniverse(item) {
  const candidates = [item.category, ...(item.tags ?? []), item.section]
    .map(normalizeText)
    .filter(Boolean);

  return [...new Set(candidates)].slice(0, 3);
}

function buildSignalSummary(item, executiveBriefByItemId) {
  const brief = executiveBriefByItemId.get(item.id);
  if (brief) {
    return brief.text;
  }

  return normalizeText(item.whyItMatters) || normalizeText(item.summary) || normalizeText(item.title);
}

function buildValidationGoal(item, route) {
  if (route === "risk_filter") {
    return `Confirm whether ${item.title} creates a durable policy, regime, or operational constraint that should gate downstream research.`;
  }

  if (route === "product_priority") {
    return `Confirm whether ${item.title} changes what QuantLab should instrument, monitor, or prioritize in coverage.`;
  }

  return `Confirm whether ${item.title} produces follow-through beyond the headline in the affected universe.`;
}

function buildInvalidationCondition(item, route) {
  if (route === "risk_filter") {
    return `Invalidate if follow-up evidence shows ${item.title} does not change operating conditions, constraints, or risk posture.`;
  }

  if (route === "product_priority") {
    return `Invalidate if follow-up evidence shows ${item.title} does not change capabilities, adoption, or competitive positioning.`;
  }

  return `Invalidate if ${item.title} fails to produce confirming evidence, sustained flows, or structural follow-through after the initial event.`;
}

function buildRiskFilterHint(route) {
  if (route === "risk_filter") {
    return "Treat as a candidate gate for exposure, venue, or regime filters until the risk is clarified.";
  }

  return "No direct risk gate from the headline alone; require follow-up evidence before changing downstream constraints.";
}

function buildProductPriorityHint(route) {
  if (route === "product_priority") {
    return "Candidate instrumentation or coverage priority if the signal persists beyond the initial announcement.";
  }

  if (route === "risk_filter") {
    return "Escalate only if the risk requires new monitoring, venue coverage, or operational instrumentation.";
  }

  return "Escalate only if repeated evidence suggests the theme should influence QuantLab coverage or tooling priorities.";
}

function buildIntent(item, bundle, executiveBriefByItemId) {
  const route = classifyRoute(item);
  const editionId = buildEditionId(bundle);

  return {
    schema_version: "1.0",
    intent_id: `ri:${item.dedupeKey}:${route}`,
    edition_id: editionId,
    created_at: bundle.updatedAt,
    source_ref: [item.id],
    signal_summary: buildSignalSummary(item, executiveBriefByItemId),
    priority: item.priority,
    affected_universe: buildAffectedUniverse(item),
    bias: classifyBias(item, route),
    horizon: classifyHorizon(item),
    hypothesis_type: classifyHypothesisType(route),
    validation_goal: buildValidationGoal(item, route),
    invalidation_condition: buildInvalidationCondition(item, route),
    risk_filter_hint: buildRiskFilterHint(route),
    product_priority_hint: buildProductPriorityHint(route),
    route,
  };
}

export function buildResearchIntentsArtifact(bundle) {
  const errors = [];
  const executiveBriefByItemId = new Map(
    (bundle.executiveBrief ?? []).map((brief) => [brief.itemId, brief])
  );

  const intents = (bundle.items ?? [])
    .filter(isIntentEligible)
    .map((item) => buildIntent(item, bundle, executiveBriefByItemId));

  const document = {
    generatedAt: bundle.updatedAt,
    editionId: buildEditionId(bundle),
    sourceVersion: bundle.version,
    sourceUpdatedAt: bundle.updatedAt,
    intentCount: intents.length,
    intents,
  };

  const seenIntentIds = new Set();
  for (const intent of intents) {
    if (seenIntentIds.has(intent.intent_id)) {
      errors.push(`Duplicate intent_id: ${intent.intent_id}`);
      continue;
    }
    seenIntentIds.add(intent.intent_id);
  }

  if (document.intentCount !== document.intents.length) {
    errors.push(
      `intentCount (${document.intentCount}) must match intents.length (${document.intents.length})`
    );
  }

  const validDocument = validateResearchIntentsDocument(document);
  if (!validDocument) {
    for (const schemaError of validateResearchIntentsDocument.errors ?? []) {
      errors.push(`Research intents document schema: ${formatSchemaError(schemaError)}`);
    }
  }

  return {
    errors,
    document,
    content: serializeJson(document),
  };
}
