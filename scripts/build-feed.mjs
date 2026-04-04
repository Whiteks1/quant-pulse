import fs from "node:fs";
import { normalizePulseBundle, outputPath, readSourceBundle, serializePulseBundle } from "./pulse-feed.mjs";

const checkMode = process.argv.includes("--check");
const { bundle, errors } = normalizePulseBundle(readSourceBundle());

if (errors.length > 0) {
  console.error("Feed build failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const serialized = serializePulseBundle(bundle);

if (checkMode) {
  const current = fs.readFileSync(outputPath, "utf8");
  if (current !== serialized) {
    console.error("Feed check failed:\n");
    console.error("- public/data/pulse.json is out of sync with content/pulse.source.json");
    console.error("- Run: npm run build:feed");
    process.exit(1);
  }

  console.log("Feed check passed.");
  process.exit(0);
}

fs.writeFileSync(outputPath, serialized, "utf8");
console.log("Feed build completed.");
