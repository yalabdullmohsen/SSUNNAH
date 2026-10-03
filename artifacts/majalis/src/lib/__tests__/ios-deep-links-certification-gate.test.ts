/**
 * T-033 honesty gate: report + matrix must stay FAIL until in-app UL/scheme proof exists.
 * Run: node --import tsx src/lib/__tests__/ios-deep-links-certification-gate.test.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../../../../");
const reportPath = resolve(root, "docs/audit/IOS_DEEP_LINKS_CERTIFICATION_REPORT.md");
const matrixPath = resolve(root, "docs/audit/evidence/t033-ios-deep-links/matrix-results.json");

function fail(msg: string): never {
  console.error(`ios-deep-links-certification-gate: ${msg}`);
  process.exit(1);
}

if (!existsSync(reportPath)) fail(`missing report ${reportPath}`);
if (!existsSync(matrixPath)) fail(`missing matrix ${matrixPath}`);

const report = readFileSync(reportPath, "utf8");
const matrix = JSON.parse(readFileSync(matrixPath, "utf8")) as {
  verdict?: string;
  exit?: string;
  blockingFailures?: string[];
};

if (!report.includes("IOS_DEEP_LINKS_NOT_CERTIFIED")) {
  fail("report must declare IOS_DEEP_LINKS_NOT_CERTIFIED while device UL proof is missing");
}
if (!report.includes("**Verdict: FAIL**") && !report.includes("Verdict: FAIL")) {
  fail("report must declare FAIL verdict");
}
if (matrix.verdict !== "FAIL") fail(`matrix.verdict expected FAIL, got ${matrix.verdict}`);
if (matrix.exit !== "IOS_DEEP_LINKS_NOT_CERTIFIED") {
  fail(`matrix.exit expected IOS_DEEP_LINKS_NOT_CERTIFIED, got ${matrix.exit}`);
}
if (!Array.isArray(matrix.blockingFailures) || matrix.blockingFailures.length < 1) {
  fail("matrix must list blockingFailures");
}
if (/\bIOS_DEEP_LINKS_CERTIFIED\b/.test(report) && !report.includes("IOS_DEEP_LINKS_NOT_CERTIFIED")) {
  fail("must not claim IOS_DEEP_LINKS_CERTIFIED without NOT_CERTIFIED exit");
}

console.log("ios-deep-links-certification-gate.test.ts: ok", {
  verdict: matrix.verdict,
  exit: matrix.exit,
  blockers: matrix.blockingFailures.length,
});
