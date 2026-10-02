/**
 * T-049 honesty gate: TestFlight Internal stays NOT CERTIFIED without TF install/smoke.
 * Run: node --import tsx src/lib/__tests__/testflight-internal-certification-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const reportPath = "docs/audit/TESTFLIGHT_INTERNAL_CERTIFICATION_REPORT.md";
assert.ok(existsSync(resolve(repoRoot, reportPath)));
const report = readRepo(reportPath);
assert.match(report, /TESTFLIGHT_INTERNAL_NOT_CERTIFIED/);
assert.match(report, /Verdict\s*\|\s*\*\*FAIL\*\*|Verdict:\s*\*\*FAIL\*\*/);
assert.match(report, /Store Source Commit/);
assert.match(report, /Archive Validation/);
assert.match(report, /Installation Validation/);
assert.match(report, /Smoke Validation/);
assert.match(report, /Device Validation/);
assert.match(report, /Boundary Validation/);
assert.match(report, /Owner Actions/);
assert.match(report, /Exit Decision/);
assert.doesNotMatch(report, /TESTFLIGHT_INTERNAL_CERTIFIED\*\*/);

assert.ok(existsSync(resolve(repoRoot, "docs/audit/APP_STORE_READINESS_REPORT.md")));
assert.match(readRepo("docs/audit/APP_STORE_READINESS_REPORT.md"), /APP_STORE_READINESS_COMPLETE/);

const evidenceDir = resolve(repoRoot, "docs/audit/evidence/t049-testflight-internal");
const summary = JSON.parse(readFileSync(resolve(evidenceDir, "summary.json"), "utf8"));
assert.equal(summary.verdict, "FAIL");
assert.equal(summary.exit, "TESTFLIGHT_INTERNAL_NOT_CERTIFIED");
assert.equal(summary.boards.Archive, "FAIL");
assert.equal(summary.boards.Install, "FAIL");
assert.equal(summary.boards.Smoke, "FAIL");
assert.equal(summary.boards.Boundary, "PASS");
assert.ok(Array.isArray(summary.blockingFailures) && summary.blockingFailures.length >= 3);
assert.ok(summary.blockingFailures.includes("NO_TESTFLIGHT_UPLOAD"));
assert.ok(summary.blockingFailures.includes("EXPORT_FAILED_APP_GROUPS_PROFILES"));

const pin = readRepo("docs/store-release/STORE_SOURCE_COMMIT.txt").trim();
assert.match(pin, /^[0-9a-f]{40}$/i);
assert.equal(summary.storeSourceCommit, pin);
assert.equal(summary.version, "1.0");
assert.equal(String(summary.buildNumber), "54");

assert.ok(existsSync(resolve(evidenceDir, "archive-attempt.log")));
assert.ok(existsSync(resolve(evidenceDir, "export-attempt.log")));
assert.match(readFileSync(resolve(evidenceDir, "archive-attempt.log"), "utf8"), /ARCHIVE SUCCEEDED/);
assert.match(readFileSync(resolve(evidenceDir, "export-attempt.log"), "utf8"), /EXPORT FAILED/);
assert.match(
  readFileSync(resolve(evidenceDir, "export-attempt.log"), "utf8"),
  /App Groups|PrayerWidget/,
);

assert.ok(existsSync(resolve(evidenceDir, "boundary-check.log")));
assert.match(readFileSync(resolve(evidenceDir, "boundary-check.log"), "utf8"), /check-release PASS/);

assert.match(readRepo("docs/mobile/IOS_NATIVE_ARCHITECTURE_CERTIFICATION.md"), /WATCH_TARGET=NOT_STARTED|Watch app target/);
assert.equal(summary.features.WatchSync, "NOT_APPLICABLE");

console.log(
  `testflight-internal-certification-gate: ok (verdict=FAIL, exit=${summary.exit}, pin=${pin.slice(0, 12)}…)`,
);
