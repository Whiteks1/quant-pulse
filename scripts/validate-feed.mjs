import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pulsePath = path.join(root, "public", "data", "pulse.json");
const pulse = JSON.parse(fs.readFileSync(pulsePath, "utf8"));

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function scoreBand(score) {
  if (score >= 70) return "P1";
  if (score >= 40) return "P2";
  return "P3";
}

assert(typeof pulse.version === "number", "pulse.version must be a number");
assert(typeof pulse.updatedAt === "string", "pulse.updatedAt must be a string");
assert(Array.isArray(pulse.items), "pulse.items must be an array");
assert(Array.isArray(pulse.executiveBrief), "pulse.executiveBrief must be an array");
assert(Array.isArray(pulse.watchItems), "pulse.watchItems must be an array");

const briefItemIds = new Set();

for (const brief of pulse.executiveBrief ?? []) {
  assert(typeof brief.id === "string" && brief.id.length > 0, "Each executiveBrief item needs id");
  assert(typeof brief.itemId === "string" && brief.itemId.length > 0, "Each executiveBrief item needs itemId");
  assert(typeof brief.text === "string" && brief.text.length > 0, "Each executiveBrief item needs text");
  if (typeof brief.itemId === "string") briefItemIds.add(brief.itemId);
}

for (const item of pulse.items ?? []) {
  assert(typeof item.id === "string" && item.id.length > 0, "Each item needs id");
  assert(typeof item.sourceTier === "string", `Item ${item.id} must include sourceTier`);
  assert(typeof item.linkType === "string", `Item ${item.id} must include linkType`);
  assert(isHttpUrl(item.url), `Item ${item.id} must have a real HTTP URL`);
  assert(!item.url.includes("example.com"), `Item ${item.id} cannot use example.com`);
  assert(item.scoreJustification && typeof item.scoreJustification === "object", `Item ${item.id} must include scoreJustification`);

  if (item.scoreJustification && typeof item.scoreJustification === "object") {
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
        `Item ${item.id} scoreJustification total (${score}) must match relevanceScore (${item.relevanceScore}) or declare editorialOverride`
      );
    }
  }

  if (!item.editorialOverride || item.editorialOverride.field !== "priority") {
    assert(
      scoreBand(item.relevanceScore) === item.priority,
      `Item ${item.id} priority (${item.priority}) must match score band (${scoreBand(item.relevanceScore)}) or declare editorialOverride`
    );
  }
}

for (const item of pulse.items ?? []) {
  if (item.priority === "P1") {
    assert(briefItemIds.has(item.id), `P1 item ${item.id} must appear in executiveBrief`);
  }
}

for (const watchItem of pulse.watchItems ?? []) {
  assert(typeof watchItem.id === "string" && watchItem.id.length > 0, "Each watchItem needs id");
  assert(typeof watchItem.section === "string" && watchItem.section.length > 0, `Watch item ${watchItem.id} must include section`);
  assert(typeof watchItem.source === "string" && watchItem.source.length > 0, `Watch item ${watchItem.id} must include source`);
  assert(typeof watchItem.whyWatch === "string" && watchItem.whyWatch.length > 0, `Watch item ${watchItem.id} must include whyWatch`);
  assert(isHttpUrl(watchItem.url), `Watch item ${watchItem.id} must include a real HTTP URL`);
}

if (errors.length > 0) {
  console.error("Feed validation failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Feed validation passed.");
