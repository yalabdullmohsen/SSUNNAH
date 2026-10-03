#!/usr/bin/env node
/**
 * Physical-device evidence pack ingestion validator.
 * Empty packs are OK (DEVICE_REQUIRED). PASS is fail-closed without artifacts.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const ALLOWED = new Set([
  "PASS",
  "FAIL",
  "BLOCKED_DEVICE",
  "BLOCKED_BUILD",
  "BLOCKED_PERMISSION",
  "NOT_APPLICABLE",
]);
const FORBIDDEN = new Set([
  "UNKNOWN",
  "PROBABLY_PASS",
  "MANUAL_PASS_WITHOUT_ARTIFACT",
  "DEVICE_REQUIRED",
  "DEVICE_TESTED",
]);
const FORBIDDEN_CLAIMS =
  /\b(DEVICE_TESTED|DEEP_LINKS_CERTIFIED|IOS_AUTH_CERTIFIED|WCAG_CERTIFIED|MUSHAF_SILKY|MOBILE_READY|STORE_GO)\b/;

const packArg = process.argv.indexOf("--pack");
const packDir = resolve(packArg >= 0 ? process.argv[packArg + 1] : "");
const minBuildArg = process.argv.indexOf("--auth-min-build");
const authMinBuild = Number(minBuildArg >= 0 ? process.argv[minBuildArg + 1] : 56);

if (!packDir) {
  console.error(
    "usage: node scripts/device-evidence/validate-physical-evidence-pack.mjs --pack <packDir>",
  );
  process.exit(1);
}

if (!existsSync(packDir)) {
  console.log("physical-evidence: pack missing → NO_PHYSICAL_ROWS (DEVICE_REQUIRED)");
  process.exit(0);
}

const rowsDir = join(packDir, "rows");
const artifactsDir = join(packDir, "artifacts");
const manifestPath = join(packDir, "manifest.json");

if (!existsSync(rowsDir)) {
  console.log("physical-evidence: no rows/ → NO_PHYSICAL_ROWS (DEVICE_REQUIRED)");
  process.exit(0);
}

const rowFiles = readdirSync(rowsDir).filter((f) => f.endsWith(".json"));
if (rowFiles.length === 0) {
  console.log("physical-evidence: empty rows/ → NO_PHYSICAL_ROWS (DEVICE_REQUIRED)");
  process.exit(0);
}

let errors = 0;
function err(msg) {
  console.error(`physical-evidence: ${msg}`);
  errors += 1;
}

let manifest = null;
if (!existsSync(manifestPath)) {
  err("missing manifest.json");
} else {
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (e) {
    err(`manifest JSON invalid (${e.message})`);
  }
}

if (manifest) {
  for (const k of [
    "packId",
    "capturedAt",
    "appVersion",
    "appBuild",
    "buildCommit",
    "installSource",
    "originMainSha",
    "physicalRequired",
  ]) {
    if (manifest[k] === undefined || manifest[k] === null || manifest[k] === "") {
      err(`manifest missing ${k}`);
    }
  }
  if (manifest.physicalRequired !== true) {
    err("manifest.physicalRequired must be true for physical packs");
  }
}

const requiredRow = [
  "caseId",
  "suite",
  "deviceId",
  "deviceModel",
  "osVersion",
  "appVersion",
  "appBuild",
  "installSource",
  "tester",
  "testedAt",
  "result",
  "physicalRequired",
  "requiredBuildClass",
  "runtime",
];

for (const file of rowFiles) {
  const path = join(rowsDir, file);
  let row;
  try {
    row = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    err(`${file}: invalid JSON (${e.message})`);
    continue;
  }

  if (FORBIDDEN.has(row.result) || !ALLOWED.has(row.result)) {
    err(`${file}: invalid/forbidden result ${row.result}`);
  }

  const needsFull = row.result === "PASS" || row.result === "FAIL";
  for (const k of requiredRow) {
    if (!needsFull && (k === "tester" || k === "testedAt")) continue;
    if (row[k] === undefined || row[k] === null || row[k] === "") {
      if (needsFull || ["caseId", "suite", "result", "runtime", "physicalRequired", "requiredBuildClass"].includes(k)) {
        err(`${file}: missing ${k}`);
      }
    }
  }

  if (needsFull) {
    if (!row.artifactPath) err(`${file}: ${row.result} requires artifactPath`);
    if (!row.expected) err(`${file}: ${row.result} requires expected`);
    if (!row.actual) err(`${file}: ${row.result} requires actual`);
    if (!row.reproSteps) err(`${file}: ${row.result} requires reproSteps`);
    if (row.artifactPath) {
      const art = join(packDir, row.artifactPath);
      const art2 = join(artifactsDir, row.artifactPath.replace(/^artifacts\//, ""));
      if (!existsSync(art) && !existsSync(art2)) {
        err(`${file}: artifact missing at ${row.artifactPath}`);
      }
    }
  }

  if (row.runtime === "simulator" && row.physicalRequired === true && row.result === "PASS") {
    err(`${file}: simulator cannot PASS physicalRequired`);
  }

  if (manifest && row.appBuild && String(row.appBuild) !== String(manifest.appBuild)) {
    err(`${file}: appBuild ${row.appBuild} != manifest.appBuild ${manifest.appBuild}`);
  }

  const buildNum = Number(row.appBuild);
  if (
    row.result === "PASS" &&
    row.requiredBuildClass === "REQUIRES_FUTURE_BUILD_GE_56" &&
    Number.isFinite(buildNum) &&
    buildNum < authMinBuild
  ) {
    err(`${file}: PASS requires Build >= ${authMinBuild} for ${row.requiredBuildClass}`);
  }

  if (row.result === "PASS" && row.suite === "AUTH" && Number.isFinite(buildNum) && buildNum < authMinBuild) {
    err(`${file}: AUTH PASS requires Build >= ${authMinBuild}`);
  }

  const blob = `${row.notes || ""}\n${row.failureNotes || ""}\n${row.actual || ""}`;
  if (FORBIDDEN_CLAIMS.test(blob)) {
    err(`${file}: forbidden certification claim in notes/actual`);
  }
}

if (errors) {
  console.error(`physical-evidence: ${errors} error(s)`);
  process.exit(1);
}
console.log(`physical-evidence: ok (${rowFiles.length} row(s))`);
