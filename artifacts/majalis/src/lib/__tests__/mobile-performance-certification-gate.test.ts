/**
 * T-041 honesty gate: mobile performance stays NOT CERTIFIED without device numeric tables.
 * Run: node --import tsx src/lib/__tests__/mobile-performance-certification-gate.test.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../../../../");
const reportPath = resolve(root, "docs/audit/MOBILE_PERFORMANCE_CERTIFICATION_REPORT.md");
const matrixPath = resolve(root, "docs/audit/evidence/t041-mobile-performance/matrix-results.json");
const deviceMatrixPath = resolve(root, "docs/audit/IOS_DEVICE_MATRIX_CERTIFICATION_REPORT.md");

function fail(msg: string): never {
  console.error(`mobile-performance-certification-gate: ${msg}`);
  process.exit(1);
}

if (!existsSync(reportPath)) fail(`missing report ${reportPath}`);
if (!existsSync(matrixPath)) fail(`missing matrix ${matrixPath}`);
if (!existsSync(deviceMatrixPath)) fail(`missing device matrix tip ${deviceMatrixPath}`);

const report = readFileSync(reportPath, "utf8");
const device = readFileSync(deviceMatrixPath, "utf8");
const matrix = JSON.parse(readFileSync(matrixPath, "utf8")) as {
  verdict?: string;
  exit?: string;
  blockingFailures?: string[];
  requiredBoard?: Record<string, string>;
  budgetRaised?: boolean;
};

if (!device.includes("IOS_DEVICE_MATRIX_INCOMPLETE")) {
  fail("device matrix tip must remain INCOMPLETE");
}
if (!report.includes("MOBILE_PERFORMANCE_NOT_CERTIFIED")) {
  fail("report must declare MOBILE_PERFORMANCE_NOT_CERTIFIED");
}
if (!report.includes("Verdict: FAIL")) fail("report must declare FAIL");
if (matrix.verdict !== "FAIL") fail(`matrix.verdict expected FAIL`);
if (matrix.exit !== "MOBILE_PERFORMANCE_NOT_CERTIFIED") fail(`matrix.exit mismatch`);
if (matrix.budgetRaised === true) fail("must not raise budgets");
if (!Array.isArray(matrix.blockingFailures) || matrix.blockingFailures.length < 1) {
  fail("matrix must list blockingFailures");
}
for (const key of ["Startup", "Navigation", "Mushaf", "Prayer", "Crash-Free"] as const) {
  if (matrix.requiredBoard?.[key] !== "FAIL") {
    fail(`requiredBoard.${key} must be FAIL until measured`);
  }
}
if (!report.includes("NOT MEASURED") && !report.includes("NOT_MEASURED")) {
  fail("report must disclose NOT MEASURED metrics");
}
if (/\b(FAST|SMOOTH|OPTIMIZED)\b/.test(report) && !report.includes("no FAST")) {
  // allow mentioning forbidden words only in prohibition context
  const banned = report.match(/\b(FAST|SMOOTH|OPTIMIZED)\b/g) || [];
  if (banned.length > 3) fail("report must not claim FAST/SMOOTH/OPTIMIZED as results");
}

console.log("mobile-performance-certification-gate.test.ts: ok", {
  verdict: matrix.verdict,
  exit: matrix.exit,
  blockers: matrix.blockingFailures.length,
});
