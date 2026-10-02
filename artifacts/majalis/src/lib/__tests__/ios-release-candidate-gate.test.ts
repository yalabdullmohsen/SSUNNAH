/**
 * T-050 honesty gate: iOS RC stays NOT READY without TF Binary/Install/Smoke/Device PASS.
 * Run: node --import tsx src/lib/__tests__/ios-release-candidate-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const reportPath = "docs/audit/IOS_RELEASE_CANDIDATE_REPORT.md";
assert.ok(existsSync(resolve(repoRoot, reportPath)));
const report = readRepo(reportPath);
assert.match(report, /IOS_RELEASE_CANDIDATE_NOT_READY/);
assert.match(report, /Verdict\s*\|\s*\*\*FAIL\*\*|Verdict:\s*\*\*FAIL\*\*/);
assert.match(report, /Store Source Commit/);
assert.match(report, /Build Information/);
assert.match(report, /Installation Results/);
assert.match(report, /Smoke Results/);
assert.match(report, /Device Results/);
assert.match(report, /Content Boundary Verification/);
assert.match(report, /Risk Inventory/);
assert.match(report, /Exit Decision/);
assert.doesNotMatch(report, /Exit\s*\|\s*\*\*`IOS_RELEASE_CANDIDATE_READY`\*\*/);
assert.match(report, /TESTFLIGHT_INTERNAL_NOT_CERTIFIED/);
assert.match(report, /IOS_DEVICE_MATRIX_INCOMPLETE/);
assert.match(report, /MOBILE_PERFORMANCE_NOT_CERTIFIED/);

assert.ok(existsSync(resolve(repoRoot, "docs/audit/TESTFLIGHT_INTERNAL_CERTIFICATION_REPORT.md")));
assert.match(
  readRepo("docs/audit/TESTFLIGHT_INTERNAL_CERTIFICATION_REPORT.md"),
  /TESTFLIGHT_INTERNAL_NOT_CERTIFIED/,
);
assert.match(readRepo("docs/audit/APP_STORE_READINESS_REPORT.md"), /APP_STORE_READINESS_COMPLETE/);
assert.match(
  readRepo("docs/audit/STORE_RELEASE_CONTENT_CLEARANCE_REPORT.md"),
  /STORE_RELEASE_CONTENT_CLEARED/,
);
assert.match(
  readRepo("docs/audit/IOS_DEVICE_MATRIX_CERTIFICATION_REPORT.md"),
  /IOS_DEVICE_MATRIX_INCOMPLETE/,
);
assert.match(
  readRepo("docs/audit/MOBILE_PERFORMANCE_CERTIFICATION_REPORT.md"),
  /MOBILE_PERFORMANCE_NOT_CERTIFIED/,
);

const evidenceDir = resolve(repoRoot, "docs/audit/evidence/t050-ios-release-candidate");
const summary = JSON.parse(readFileSync(resolve(evidenceDir, "summary.json"), "utf8"));
assert.equal(summary.verdict, "FAIL");
assert.equal(summary.exit, "IOS_RELEASE_CANDIDATE_NOT_READY");
assert.equal(summary.boards.Binary, "FAIL");
assert.equal(summary.boards.Install, "FAIL");
assert.equal(summary.boards.Smoke, "FAIL");
assert.equal(summary.boards.Boundary, "PASS");
assert.equal(summary.boards.Device, "FAIL");
assert.ok(Array.isArray(summary.blockingFailures) && summary.blockingFailures.length >= 4);
assert.ok(summary.blockingFailures.includes("TESTFLIGHT_PREREQ_NOT_CERTIFIED"));
assert.ok(summary.blockingFailures.includes("DEVICE_MATRIX_INCOMPLETE"));
assert.equal(summary.mushafContentModified, false);

const pin = readRepo("docs/store-release/STORE_SOURCE_COMMIT.txt").trim();
assert.match(pin, /^[0-9a-f]{40}$/i);
assert.equal(summary.storeSourceCommit, pin);
assert.equal(summary.version, "1.0");
assert.equal(String(summary.buildNumber), "54");
assert.ok(summary.archiveIdentifier?.path?.includes("sunnah-t049.xcarchive"));

assert.ok(
  existsSync(resolve(repoRoot, "docs/audit/evidence/t049-testflight-internal/boundary-check.log")),
);
assert.match(
  readFileSync(
    resolve(repoRoot, "docs/audit/evidence/t049-testflight-internal/boundary-check.log"),
    "utf8",
  ),
  /check-release PASS/,
);

console.log(
  `ios-release-candidate-gate: ok (verdict=FAIL, exit=${summary.exit}, pin=${pin.slice(0, 12)}…)`,
);
