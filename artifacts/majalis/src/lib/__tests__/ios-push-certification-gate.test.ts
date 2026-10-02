/**
 * T-038 honesty gate: Push cert stays FAIL until device APNs delivery board passes.
 * Run: node --import tsx src/lib/__tests__/ios-push-certification-gate.test.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../../../../");
const reportPath = resolve(root, "docs/audit/IOS_PUSH_CERTIFICATION_REPORT.md");
const matrixPath = resolve(root, "docs/audit/evidence/t038-ios-push/matrix-results.json");
const prayerTip = resolve(root, "docs/audit/IOS_PRAYER_ADHAN_CERTIFICATION_REPORT.md");

function fail(msg: string): never {
  console.error(`ios-push-certification-gate: ${msg}`);
  process.exit(1);
}

if (!existsSync(reportPath)) fail(`missing report ${reportPath}`);
if (!existsSync(matrixPath)) fail(`missing matrix ${matrixPath}`);
if (!existsSync(prayerTip)) fail(`missing prayer/adhan tip dependency ${prayerTip}`);

const report = readFileSync(reportPath, "utf8");
const prayer = readFileSync(prayerTip, "utf8");
const matrix = JSON.parse(readFileSync(matrixPath, "utf8")) as {
  verdict?: string;
  exit?: string;
  blockingFailures?: string[];
  requiredBoard?: Record<string, string>;
};

if (!prayer.includes("IOS_PRAYER_ADHAN_NOT_CERTIFIED")) {
  fail("prayer tip must remain NOT_CERTIFIED (honest prereq)");
}
if (!report.includes("IOS_PUSH_NOT_CERTIFIED")) {
  fail("report must declare IOS_PUSH_NOT_CERTIFIED");
}
if (!report.includes("Verdict: FAIL")) fail("report must declare FAIL verdict");
if (matrix.verdict !== "FAIL") fail(`matrix.verdict expected FAIL, got ${matrix.verdict}`);
if (matrix.exit !== "IOS_PUSH_NOT_CERTIFIED") fail(`matrix.exit mismatch: ${matrix.exit}`);
if (!Array.isArray(matrix.blockingFailures) || matrix.blockingFailures.length < 1) {
  fail("matrix must list blockingFailures");
}
for (const key of [
  "Foreground",
  "Background",
  "Terminated",
  "Deep Link",
  "Token Refresh",
  "Duplicate Prevention",
] as const) {
  if (matrix.requiredBoard?.[key] !== "FAIL") {
    fail(`requiredBoard.${key} must be FAIL until device-certified`);
  }
}

console.log("ios-push-certification-gate.test.ts: ok", {
  verdict: matrix.verdict,
  exit: matrix.exit,
  blockers: matrix.blockingFailures.length,
});
