import {
  normalizePulseBundle,
  readSourceBundle,
} from "./pulse-feed.mjs";
import { persistArchiveEdition } from "./archive-store.mjs";

const forceMode = process.argv.includes("--force");
const { bundle, errors } = normalizePulseBundle(readSourceBundle());

if (errors.length > 0) {
  console.error("Cannot snapshot invalid feed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const snapshot = persistArchiveEdition(bundle, { force: forceMode });

if (snapshot.alreadyExists) {
  console.error(`Archive snapshot already exists: ${snapshot.filePath}`);
  console.error("Use --force to overwrite it.");
  process.exit(1);
}

console.log(`Archive snapshot written: ${snapshot.filePath}`);
