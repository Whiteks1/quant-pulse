import fs from "node:fs";
import path from "node:path";

export const archiveStorageDir = path.join(process.cwd(), "content", "archive", "editions");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function buildArchiveEditionSlug(bundle) {
  const datePart = bundle.updatedAt.slice(0, 10);
  return `${datePart}_v${bundle.version}`;
}

function serializeJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function archiveEditionPath(slug, { storageDir = archiveStorageDir } = {}) {
  return path.join(storageDir, `${slug}.json`);
}

export function listPersistedArchiveEditions({ storageDir = archiveStorageDir } = {}) {
  if (!fs.existsSync(storageDir)) {
    return [];
  }

  return fs
    .readdirSync(storageDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name.replace(/\.json$/, ""))
    .sort()
    .map((slug) => readPersistedArchiveEdition(slug, { storageDir }));
}

export function readPersistedArchiveEdition(slug, { storageDir = archiveStorageDir } = {}) {
  const filePath = archiveEditionPath(slug, { storageDir });

  if (!fs.existsSync(filePath)) {
    return {
      found: false,
      slug,
      filePath,
    };
  }

  return {
    found: true,
    slug,
    filePath,
    bundle: readJson(filePath),
  };
}

export function persistArchiveEdition(bundle, { storageDir = archiveStorageDir, force = false } = {}) {
  const slug = buildArchiveEditionSlug(bundle);
  const filePath = archiveEditionPath(slug, { storageDir });

  fs.mkdirSync(storageDir, { recursive: true });

  if (fs.existsSync(filePath) && !force) {
    return {
      created: false,
      slug,
      filePath,
      alreadyExists: true,
    };
  }

  fs.writeFileSync(filePath, serializeJson(bundle), "utf8");

  return {
    created: true,
    slug,
    filePath,
    alreadyExists: false,
  };
}
