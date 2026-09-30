#!/usr/bin/env node
/**
 * WAVE13 — validate device evidence rows.
 * Rejects PASS/FAIL without artifacts; never invents PASS.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const dirArg = process.argv.indexOf("--dir");
const dir = resolve(dirArg >= 0 ? process.argv[dirArg + 1] : "");
if (!dir || !existsSync(dir)) {
  console.error("usage: node scripts/device-evidence/validate-evidence-rows.mjs --dir <rowsDir>");
  process.exit(1);
}

const ALLOWED = new Set(["PASS", "FAIL", "DEVICE_REQUIRED", "BLOCKED"]);
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
if (files.length === 0) {
  console.log("device-evidence validate: no rows (ok — all remain DEVICE_REQUIRED)");
  process.exit(0);
}

let errors = 0;
for (const file of files) {
  const path = join(dir, file);
  let row;
  try {
    row = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    console.error(`${file}: invalid JSON (${e.message})`);
    errors += 1;
    continue;
  }
  const req = ["caseId", "deviceId", "result", "buildCommit", "tester", "testedAt"];
  for (const k of req) {
    if (row.result === "DEVICE_REQUIRED" && (k === "tester" || k === "testedAt" || k === "buildCommit")) {
      continue;
    }
    if (row[k] === undefined || row[k] === null || row[k] === "") {
      if (row.result === "DEVICE_REQUIRED" && k === "buildCommit") continue;
      if (row.result !== "DEVICE_REQUIRED") {
        console.error(`${file}: missing ${k}`);
        errors += 1;
      }
    }
  }
  if (!ALLOWED.has(row.result)) {
    console.error(`${file}: invalid result ${row.result}`);
    errors += 1;
  }
  if (row.result === "PASS" || row.result === "FAIL") {
    if (!row.artifactPath) {
      console.error(`${file}: ${row.result} requires artifactPath`);
      errors += 1;
    }
    if (!row.buildCommit) {
      console.error(`${file}: ${row.result} requires buildCommit`);
      errors += 1;
    }
    if (!row.actual) {
      console.error(`${file}: ${row.result} requires actual`);
      errors += 1;
    }
  }
  if (row.result === "PASS" && String(row.actual).toUpperCase() === "DEVICE_REQUIRED") {
    console.error(`${file}: cannot PASS with actual=DEVICE_REQUIRED`);
    errors += 1;
  }
}

if (errors) {
  console.error(`device-evidence validate: ${errors} error(s)`);
  process.exit(1);
}
console.log(`device-evidence validate: ok (${files.length} row file(s))`);
