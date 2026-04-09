import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  archiveSourceDir,
  buildArchiveArtifacts,
  normalizePulseBundle,
  readSourceBundle,
} from "./pulse-feed.mjs";

function jsonResponse(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function errorPayload(code, message, details) {
  const payload = {
    error: {
      code,
      message,
    },
  };

  if (details !== undefined) {
    payload.error.details = details;
  }

  return payload;
}

function loadCurrentBundle() {
  const normalized = normalizePulseBundle(readSourceBundle());

  if (normalized.errors.length > 0) {
    return {
      errors: normalized.errors,
    };
  }

  return {
    bundle: normalized.bundle,
    errors: [],
  };
}

function loadArchiveIndex(currentBundle) {
  const archiveArtifacts = buildArchiveArtifacts(currentBundle);

  if (archiveArtifacts.errors.length > 0) {
    return {
      errors: archiveArtifacts.errors,
    };
  }

  return {
    index: JSON.parse(archiveArtifacts.indexContent),
    errors: [],
  };
}

function loadArchiveEdition(slug) {
  if (slug === "current") {
    return loadCurrentBundle();
  }

  const editionPath = path.join(archiveSourceDir, `${slug}.json`);
  if (!fs.existsSync(editionPath)) {
    return {
      notFound: true,
      errors: [],
    };
  }

  const rawBundle = JSON.parse(fs.readFileSync(editionPath, "utf8"));
  const normalized = normalizePulseBundle(rawBundle);

  if (normalized.errors.length > 0) {
    return {
      errors: normalized.errors.map((error) => `Archive edition ${slug}: ${error}`),
    };
  }

  return {
    bundle: normalized.bundle,
    errors: [],
  };
}

function handleReadFailure(res, errors) {
  return jsonResponse(
    res,
    500,
    errorPayload("bundle_unavailable", "The live feed backend could not build a valid bundle.", { errors })
  );
}

export function createLiveFeedServer() {
  return http.createServer((req, res) => {
    if (req.method !== "GET") {
      res.writeHead(405, {
        Allow: "GET",
        "Content-Type": "application/json; charset=utf-8",
      });
      res.end(`${JSON.stringify(errorPayload("method_not_allowed", "Only GET is supported."), null, 2)}\n`);
      return;
    }

    const requestUrl = new URL(req.url ?? "/", "http://localhost");

    if (requestUrl.pathname === "/v1/pulse/current") {
      const { bundle, errors } = loadCurrentBundle();
      if (errors.length > 0) {
        handleReadFailure(res, errors);
        return;
      }

      jsonResponse(res, 200, bundle);
      return;
    }

    if (requestUrl.pathname === "/v1/archive/index") {
      const current = loadCurrentBundle();
      if (current.errors.length > 0) {
        handleReadFailure(res, current.errors);
        return;
      }

      const { index, errors } = loadArchiveIndex(current.bundle);
      if (errors.length > 0) {
        handleReadFailure(res, errors);
        return;
      }

      jsonResponse(res, 200, index);
      return;
    }

    const editionMatch = requestUrl.pathname.match(/^\/v1\/archive\/editions\/([^/]+)$/);
    if (editionMatch) {
      const editionSlug = decodeURIComponent(editionMatch[1]);
      const edition = loadArchiveEdition(editionSlug);

      if (edition.notFound) {
        jsonResponse(
          res,
          404,
          errorPayload("edition_not_found", `Archive edition "${editionSlug}" was not found.`)
        );
        return;
      }

      if (edition.errors.length > 0) {
        handleReadFailure(res, edition.errors);
        return;
      }

      jsonResponse(res, 200, edition.bundle);
      return;
    }

    jsonResponse(res, 404, errorPayload("not_found", "The requested endpoint does not exist."));
  });
}

export function startLiveFeedServer({ port = 8787, host = "127.0.0.1" } = {}) {
  const server = createLiveFeedServer();
  server.listen(port, host, () => {
    console.log(`Quant Pulse live feed server listening on http://${host}:${port}`);
  });
  return server;
}

const currentFilePath = fileURLToPath(import.meta.url);
const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;

if (invokedPath && currentFilePath === invokedPath) {
  const port = Number.parseInt(process.env.PORT ?? "8787", 10);
  const host = process.env.HOST ?? "127.0.0.1";
  startLiveFeedServer({
    port: Number.isFinite(port) ? port : 8787,
    host,
  });
}
