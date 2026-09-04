#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { loadWebsiteConstants, getProjectRoot } from "./lib/load-constants.mjs";
import { transformConstantsToRecords } from "./lib/constants-to-records.mjs";

const outputFlagIndex = process.argv.indexOf("--output");
const outputPath = outputFlagIndex >= 0 ? process.argv[outputFlagIndex + 1] : null;

if (outputFlagIndex >= 0 && !outputPath) {
  throw new Error("Provide a path after --output.");
}

const constants = await loadWebsiteConstants();
const records = transformConstantsToRecords(constants);
const serializedRecords = `${JSON.stringify(records, null, 2)}\n`;

if (!outputPath) {
  process.stdout.write(serializedRecords);
  process.exit(0);
}

const absoluteOutputPath = resolve(getProjectRoot(), outputPath);
await mkdir(dirname(absoluteOutputPath), { recursive: true });
await writeFile(absoluteOutputPath, serializedRecords, "utf8");
console.log(`Wrote draft-only seed-compatible records to ${outputPath}`);
