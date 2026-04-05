import fs from "node:fs";
import path from "node:path";
import {
  archiveCurrentOutputPath,
  archiveEditionOutputDir,
  archiveIndexOutputPath,
  buildArchiveArtifacts,
  normalizePulseBundle,
  outputPath,
  readSourceBundle,
  serializePulseBundle,
} from "./pulse-feed.mjs";

const checkMode = process.argv.includes("--check");
const { bundle, errors } = normalizePulseBundle(readSourceBundle());
const archiveArtifacts = buildArchiveArtifacts(bundle);

if (errors.length > 0 || archiveArtifacts.errors.length > 0) {
  console.error("Feed build failed:\n");
  for (const error of [...errors, ...archiveArtifacts.errors]) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const serialized = serializePulseBundle(bundle);

if (checkMode) {
  const mismatches = [];

  const expectedSingleFiles = [
    { outputPath, content: serialized },
    { outputPath: archiveCurrentOutputPath, content: archiveArtifacts.currentContent },
    { outputPath: archiveIndexOutputPath, content: archiveArtifacts.indexContent },
  ];

  for (const file of expectedSingleFiles) {
    if (!fs.existsSync(file.outputPath) || fs.readFileSync(file.outputPath, "utf8") !== file.content) {
      mismatches.push(path.relative(process.cwd(), file.outputPath));
    }
  }

  const existingEditionFiles = fs.existsSync(archiveEditionOutputDir)
    ? fs
        .readdirSync(archiveEditionOutputDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map((entry) => entry.name)
        .sort()
    : [];

  const expectedEditionFiles = archiveArtifacts.archiveEditionFiles
    .map((entry) => path.basename(entry.outputPath))
    .sort();

  if (existingEditionFiles.join("|") !== expectedEditionFiles.join("|")) {
    mismatches.push(path.relative(process.cwd(), archiveEditionOutputDir));
  } else {
    for (const editionFile of archiveArtifacts.archiveEditionFiles) {
      if (
        !fs.existsSync(editionFile.outputPath) ||
        fs.readFileSync(editionFile.outputPath, "utf8") !== editionFile.content
      ) {
        mismatches.push(path.relative(process.cwd(), editionFile.outputPath));
      }
    }
  }

  if (mismatches.length > 0) {
    console.error("Feed check failed:\n");
    for (const mismatch of mismatches) {
      console.error(`- ${mismatch} is out of sync with source content`);
    }
    console.error("- Run: npm run build:feed");
    process.exit(1);
  }

  console.log("Feed check passed.");
  process.exit(0);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, serialized, "utf8");
fs.mkdirSync(path.dirname(archiveCurrentOutputPath), { recursive: true });
fs.mkdirSync(archiveEditionOutputDir, { recursive: true });
fs.writeFileSync(archiveCurrentOutputPath, archiveArtifacts.currentContent, "utf8");
fs.writeFileSync(archiveIndexOutputPath, archiveArtifacts.indexContent, "utf8");

const existingOutputFiles = fs
  .readdirSync(archiveEditionOutputDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".json"));

for (const file of existingOutputFiles) {
  const currentPath = path.join(archiveEditionOutputDir, file.name);
  const shouldKeep = archiveArtifacts.archiveEditionFiles.some((entry) => entry.outputPath === currentPath);
  if (!shouldKeep) {
    fs.rmSync(currentPath);
  }
}

for (const editionFile of archiveArtifacts.archiveEditionFiles) {
  fs.writeFileSync(editionFile.outputPath, editionFile.content, "utf8");
}

console.log("Feed build completed.");
