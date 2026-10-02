/**
 * T-036 honesty gate: Mushaf iOS device cert stays FAIL until measured 25/50/100 board passes.
 * Run: node --import tsx src/lib/__tests__/mushaf-ios-device-certification-gate.test.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../../../../");
const reportPath = resolve(root, "docs/audit/MUSHAF_IOS_DEVICE_CERTIFICATION_REPORT.md");
const matrixPath = resolve(root, "docs/audit/evidence/t036-mushaf-ios/matrix-results.json");

function fail(msg: string): never {
  console.error(`mushaf-ios-device-certification-gate: ${msg}`);
  process.exit(1);
}

if (!existsSync(reportPath)) fail(`missing report ${reportPath}`);
if (!existsSync(matrixPath)) fail(`missing matrix ${matrixPath}`);

const report = readFileSync(reportPath, "utf8");
const matrix = JSON.parse(readFileSync(matrixPath, "utf8")) as {
  verdict?: string;
  exit?: string;
  blockingFailures?: string[];
  requiredBoard?: Record<string, string>;
  sacredBoundary?: string;
};

if (!report.includes("MUSHAF_IOS_NOT_CERTIFIED")) {
  fail("report must declare MUSHAF_IOS_NOT_CERTIFIED");
}
if (!report.includes("Verdict: FAIL")) fail("report must declare FAIL verdict");
if (matrix.verdict !== "FAIL") fail(`matrix.verdict expected FAIL, got ${matrix.verdict}`);
if (matrix.exit !== "MUSHAF_IOS_NOT_CERTIFIED") fail(`matrix.exit mismatch: ${matrix.exit}`);
if (!Array.isArray(matrix.blockingFailures) || matrix.blockingFailures.length < 1) {
  fail("matrix must list blockingFailures");
}
for (const key of ["25", "50", "100", "Search", "Bookmarks", "Tafsir"] as const) {
  if (matrix.requiredBoard?.[key] !== "FAIL") {
    fail(`requiredBoard.${key} must be FAIL until device-certified`);
  }
}
if (!report.includes("NOT_MEASURED") && !report.includes("NOT MEASURED")) {
  fail("report must disclose NOT_MEASURED device metrics");
}
if (!report.includes("NO EDITS") && !report.includes("NO_EDITS")) {
  fail("report must affirm sacred boundary NO EDITS");
}
if (!report.includes("HEAVINESS") && !report.includes("MISSING")) {
  fail("report must note heaviness SoT gap");
}

console.log("mushaf-ios-device-certification-gate.test.ts: ok", {
  verdict: matrix.verdict,
  exit: matrix.exit,
  blockers: matrix.blockingFailures.length,
});
