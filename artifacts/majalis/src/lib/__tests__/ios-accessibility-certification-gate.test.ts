/**
 * T-039 honesty gate: Accessibility cert stays FAIL until device VoiceOver board passes.
 * Run: node --import tsx src/lib/__tests__/ios-accessibility-certification-gate.test.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../../../../");
const reportPath = resolve(root, "docs/audit/IOS_ACCESSIBILITY_CERTIFICATION_REPORT.md");
const matrixPath = resolve(root, "docs/audit/evidence/t039-ios-a11y/matrix-results.json");
const pushPath = resolve(root, "docs/audit/IOS_PUSH_CERTIFICATION_REPORT.md");

function fail(msg: string): never {
  console.error(`ios-accessibility-certification-gate: ${msg}`);
  process.exit(1);
}

if (!existsSync(reportPath)) fail(`missing report ${reportPath}`);
if (!existsSync(matrixPath)) fail(`missing matrix ${matrixPath}`);
if (!existsSync(pushPath)) fail(`missing push tip dependency ${pushPath}`);

const report = readFileSync(reportPath, "utf8");
const push = readFileSync(pushPath, "utf8");
const matrix = JSON.parse(readFileSync(matrixPath, "utf8")) as {
  verdict?: string;
  exit?: string;
  blockingFailures?: string[];
  requiredBoard?: Record<string, string>;
};

if (!push.includes("IOS_PUSH_NOT_CERTIFIED")) {
  fail("push tip must remain NOT_CERTIFIED (honest prereq)");
}
if (!report.includes("IOS_ACCESSIBILITY_NOT_CERTIFIED")) {
  fail("report must declare IOS_ACCESSIBILITY_NOT_CERTIFIED");
}
if (!report.includes("Verdict: FAIL")) fail("report must declare FAIL verdict");
if (matrix.verdict !== "FAIL") fail(`matrix.verdict expected FAIL, got ${matrix.verdict}`);
if (matrix.exit !== "IOS_ACCESSIBILITY_NOT_CERTIFIED") fail(`matrix.exit mismatch`);
if (!Array.isArray(matrix.blockingFailures) || matrix.blockingFailures.length < 1) {
  fail("matrix must list blockingFailures");
}
for (const key of ["VoiceOver", "Dynamic Type", "Reduce Motion", "Contrast", "RTL"] as const) {
  if (matrix.requiredBoard?.[key] !== "FAIL") {
    fail(`requiredBoard.${key} must be FAIL until device-certified`);
  }
}
if (!report.includes("no Mushaf edits") && !report.includes("MUSHAF_EDITS=NONE")) {
  fail("report must affirm no mushaf edits");
}
if (!report.includes("no U5") && !report.includes("U5_EDITS=NONE")) {
  fail("report must affirm no U5 edits");
}

console.log("ios-accessibility-certification-gate.test.ts: ok", {
  verdict: matrix.verdict,
  exit: matrix.exit,
  blockers: matrix.blockingFailures.length,
});
