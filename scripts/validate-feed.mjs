import { buildArchiveArtifacts, normalizePulseBundle, readSourceBundle } from "./pulse-feed.mjs";

const { bundle, errors } = normalizePulseBundle(readSourceBundle());
const archiveArtifacts = buildArchiveArtifacts(bundle);

if (errors.length > 0 || archiveArtifacts.errors.length > 0) {
  console.error("Feed validation failed:\n");
  for (const error of [...errors, ...archiveArtifacts.errors]) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Feed validation passed.");
