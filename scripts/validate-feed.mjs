import { normalizePulseBundle, readSourceBundle } from "./pulse-feed.mjs";

const { errors } = normalizePulseBundle(readSourceBundle());

if (errors.length > 0) {
  console.error("Feed validation failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Feed validation passed.");
