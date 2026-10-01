/**
 * T-032 — App Shell Stability gate (report + evidence honesty).
 * تشغيل: node --import tsx src/lib/__tests__/ios-app-shell-stability-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "../../..");
const repo = resolve(appRoot, "../..");

const report = readFileSync(resolve(repo, "docs/audit/IOS_APP_SHELL_STABILITY_REPORT.md"), "utf8");
assert.match(report, /T-032/);
assert.match(report, /Startup Paths/);
assert.match(report, /Resume Paths/);
assert.match(report, /Navigation Integrity/);
assert.match(report, /Prayer Validation/);
assert.match(report, /Mushaf Validation/);
assert.match(report, /Safe Area Validation/);
assert.match(report, /Performance Summary/);
assert.match(report, /Exit Decision/);

const resultsPath = resolve(repo, "docs/audit/evidence/t032-ios-app-shell/matrix-results.json");
assert.ok(existsSync(resultsPath), "matrix-results.json evidence present");
const results = JSON.parse(readFileSync(resultsPath, "utf8"));

// Honesty: either certified stable with zero blockers, or explicit NOT_STABLE FAIL.
const certified =
  results.verdict === "PASS" &&
  results.exit === "IOS_APP_SHELL_STABLE" &&
  report.includes("IOS_APP_SHELL_STABLE") &&
  !report.includes("IOS_APP_SHELL_NOT_STABLE");

const failedHonestly =
  results.verdict === "FAIL" &&
  results.exit === "IOS_APP_SHELL_NOT_STABLE" &&
  report.includes("IOS_APP_SHELL_NOT_STABLE") &&
  report.includes("FAIL");

assert.ok(certified || failedHonestly, "report/results must be PASS certified or honest FAIL");

if (failedHonestly) {
  assert.ok(Array.isArray(results.blockingFailures) && results.blockingFailures.length > 0);
  assert.match(report, /Deep Link Launch FAIL|Split View FAIL/);
}

assert.ok(existsSync(resolve(repo, "scripts/ios-app-shell-stability-matrix.sh")), "matrix script present");
assert.ok(
  existsSync(resolve(repo, "docs/audit/evidence/t032-ios-app-shell/iphone/01-cold-start.png")),
  "iphone cold-start screenshot present",
);

console.log("ios-app-shell-stability-gate.test.ts: ok", {
  verdict: results.verdict,
  exit: results.exit,
});
