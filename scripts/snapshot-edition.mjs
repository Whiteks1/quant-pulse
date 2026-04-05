import fs from "node:fs";
import path from "node:path";
import {
  archiveSourceDir,
  normalizePulseBundle,
  readSourceBundle,
  serializePulseBundle,
} from "./pulse-feed.mjs";

const forceMode = process.argv.includes("--force");
const { bundle, errors } = normalizePulseBundle(readSourceBundle());

if (errors.length > 0) {
  console.error("Cannot snapshot invalid feed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const datePart = bundle.updatedAt.slice(0, 10);
const slug = `${datePart}_v${bundle.version}`;
const outputPath = path.join(archiveSourceDir, `${slug}.json`);

fs.mkdirSync(archiveSourceDir, { recursive: true });

if (fs.existsSync(outputPath) && !forceMode) {
  console.error(`Archive snapshot already exists: ${outputPath}`);
  console.error("Use --force to overwrite it.");
  process.exit(1);
}

fs.writeFileSync(outputPath, serializePulseBundle(bundle), "utf8");
console.log(`Archive snapshot written: ${outputPath}`);
