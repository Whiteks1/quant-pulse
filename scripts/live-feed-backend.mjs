import {
  buildArchiveArtifacts,
  normalizePulseBundle,
  readSourceBundle,
} from "./pulse-feed.mjs";
import { readPersistedArchiveEdition } from "./archive-store.mjs";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function successResult(body) {
  return {
    ok: true,
    status: 200,
    body,
  };
}

function errorResult(status, code, message, details) {
  const body = {
    error: {
      code,
      message,
    },
  };

  if (details !== undefined) {
    body.error.details = details;
  }

  return {
    ok: false,
    status,
    body,
  };
}

function loadCurrentPulseBundle() {
  const normalized = normalizePulseBundle(readSourceBundle());

  if (normalized.errors.length > 0) {
    return errorResult(
      500,
      "bundle_unavailable",
      "The live feed backend could not build a valid bundle.",
      { errors: normalized.errors }
    );
  }

  return successResult(normalized.bundle);
}

export function getLivePulseCurrent() {
  return loadCurrentPulseBundle();
}

export function getLiveArchiveIndex() {
  const current = loadCurrentPulseBundle();

  if (!current.ok) {
    return current;
  }

  const archiveArtifacts = buildArchiveArtifacts(current.body);
  if (archiveArtifacts.errors.length > 0) {
    return errorResult(
      500,
      "bundle_unavailable",
      "The live feed backend could not build a valid bundle.",
      { errors: archiveArtifacts.errors }
    );
  }

  return successResult(readJsonFromContent(archiveArtifacts.indexContent));
}

function readJsonFromContent(content) {
  return JSON.parse(content);
}

export function getLiveArchiveEdition(slug) {
  if (slug === "current") {
    return loadCurrentPulseBundle();
  }

  const edition = readPersistedArchiveEdition(slug);
  if (!edition.found) {
    return errorResult(404, "edition_not_found", `Archive edition "${slug}" was not found.`);
  }

  const normalized = normalizePulseBundle(edition.bundle);
  if (normalized.errors.length > 0) {
    return errorResult(
      500,
      "bundle_unavailable",
      "The live feed backend could not build a valid bundle.",
      { errors: normalized.errors.map((error) => `Archive edition ${slug}: ${error}`) }
    );
  }

  return successResult(normalized.bundle);
}

export function resolveLiveFeedRequest(pathname) {
  if (pathname === "/v1/pulse/current") {
    return getLivePulseCurrent();
  }

  if (pathname === "/v1/archive/index") {
    return getLiveArchiveIndex();
  }

  const editionMatch = pathname.match(/^\/v1\/archive\/editions\/([^/]+)$/);
  if (editionMatch) {
    return getLiveArchiveEdition(decodeURIComponent(editionMatch[1]));
  }

  return errorResult(404, "not_found", "The requested endpoint does not exist.");
}
