import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const publishedIntentsPath = path.join(repoRoot, "public", "data", "intents.json");
const intentSchemaPath = path.join(repoRoot, "config", "research-intent.schema.json");
const intentsDocumentSchemaPath = path.join(
  repoRoot,
  "config",
  "research-intents-document.schema.json"
);

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function createPublishedIntentsValidator() {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
  });

  addFormats(ajv);
  ajv.addSchema(readJson(intentSchemaPath));
  return ajv.compile(readJson(intentsDocumentSchemaPath));
}

describe("published intents artifact contract", () => {
  it("keeps public/data/intents.json aligned with the wrapper and item schemas", () => {
    const validator = createPublishedIntentsValidator();
    const publishedIntents = readJson(publishedIntentsPath);

    const valid = validator(publishedIntents);

    expect(valid, JSON.stringify(validator.errors, null, 2)).toBe(true);
  });

  it("keeps repository-level invariants on the published intents artifact", () => {
    const publishedIntents = readJson(publishedIntentsPath);
    const intentIds = publishedIntents.intents.map((intent: { intent_id: string }) => intent.intent_id);

    expect(publishedIntents.intentCount).toBe(publishedIntents.intents.length);
    expect(new Set(intentIds).size).toBe(intentIds.length);

    for (const intent of publishedIntents.intents) {
      expect(intent.edition_id).toBe(publishedIntents.editionId);
      expect(intent.created_at).toBe(publishedIntents.sourceUpdatedAt);
    }
  });
});
