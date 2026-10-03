/**
 * T-040 honesty gate: device matrix stays INCOMPLETE until required devices have Artifact+Tester+Date.
 * Run: node --import tsx src/lib/__tests__/ios-device-matrix-certification-gate.test.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../../../../");
const reportPath = resolve(root, "docs/audit/IOS_DEVICE_MATRIX_CERTIFICATION_REPORT.md");
const matrixPath = resolve(root, "docs/audit/evidence/t040-ios-device-matrix/matrix-results.json");
const failPath = resolve(root, "docs/audit/evidence/t040-ios-device-matrix/static/FAIL_RECORDS.json");
const a11yPath = resolve(root, "docs/audit/IOS_ACCESSIBILITY_CERTIFICATION_REPORT.md");

function fail(msg: string): never {
  console.error(`ios-device-matrix-certification-gate: ${msg}`);
  process.exit(1);
}

if (!existsSync(reportPath)) fail(`missing report ${reportPath}`);
if (!existsSync(matrixPath)) fail(`missing matrix ${matrixPath}`);
if (!existsSync(failPath)) fail(`missing FAIL_RECORDS ${failPath}`);
if (!existsSync(a11yPath)) fail(`missing a11y tip ${a11yPath}`);

const report = readFileSync(reportPath, "utf8");
const a11y = readFileSync(a11yPath, "utf8");
const matrix = JSON.parse(readFileSync(matrixPath, "utf8")) as {
  verdict?: string;
  exit?: string;
  blockingFailures?: string[];
  requiredBoard?: Record<string, string>;
  failRecords?: unknown[];
};
const fails = JSON.parse(readFileSync(failPath, "utf8")) as unknown[];

if (!a11y.includes("IOS_ACCESSIBILITY_NOT_CERTIFIED")) {
  fail("a11y tip must remain NOT_CERTIFIED");
}
if (!report.includes("IOS_DEVICE_MATRIX_INCOMPLETE")) {
  fail("report must declare IOS_DEVICE_MATRIX_INCOMPLETE");
}
if (report.includes("IOS_DEVICE_MATRIX_COMPLETE") && !report.includes("IOS_DEVICE_MATRIX_INCOMPLETE")) {
  fail("must not claim COMPLETE without INCOMPLETE exit");
}
if (!report.includes("Verdict: FAIL")) fail("report must declare FAIL verdict");
if (matrix.verdict !== "FAIL") fail(`matrix.verdict expected FAIL`);
if (matrix.exit !== "IOS_DEVICE_MATRIX_INCOMPLETE") fail(`matrix.exit mismatch`);
if (!Array.isArray(matrix.blockingFailures) || matrix.blockingFailures.length < 1) {
  fail("matrix must list blockingFailures");
}
if (!Array.isArray(fails) || fails.length < 4) {
  fail("FAIL_RECORDS must cover 4 required device classes");
}
for (const key of ["Modern iPhone", "Older iPhone", "iPad", "Split View"] as const) {
  if (matrix.requiredBoard?.[key] !== "FAIL") {
    fail(`requiredBoard.${key} must be FAIL until matrix complete`);
  }
}

console.log("ios-device-matrix-certification-gate.test.ts: ok", {
  verdict: matrix.verdict,
  exit: matrix.exit,
  failRecords: fails.length,
});
