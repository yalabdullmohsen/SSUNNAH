/**
 * Phase 6 — Release readiness static gate.
 * Run: node --import tsx src/lib/__tests__/phase6-release-readiness-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (p: string) => readFileSync(resolve(majalisRoot, p), "utf8");
const readRepo = (p: string) => readFileSync(resolve(repoRoot, p), "utf8");

console.log("=== Capacitor production config ===");
const cap = JSON.parse(read("capacitor.config.json")) as {
  appId: string;
  appName: string;
  webDir: string;
  server?: { url?: string; cleartext?: boolean; allowNavigation?: string[] };
};
assert.equal(cap.appId, "com.yousef.majlisilm");
assert.equal(cap.appName, "سُنّة");
assert.equal(cap.webDir, "dist");
assert.equal(cap.server?.url, "https://www.ssunnah.com");
assert.equal(cap.server?.cleartext, false);
assert.ok(cap.server?.allowNavigation?.includes("www.ssunnah.com"));

const capTs = read("capacitor.config.ts");
assert.doesNotMatch(capTs, /localhost|127\.0\.0\.1/);
assert.doesNotMatch(capTs, /url:\s*["']http:\/\//);

console.log("=== iOS-only identity (Android retired) ===");
assert.equal(existsSync(resolve(majalisRoot, "android")), false, "android/ must be retired");
const pbx = read("ios/App/App.xcodeproj/project.pbxproj");
assert.match(pbx, /PRODUCT_BUNDLE_IDENTIFIER = com\.yousef\.majlisilm;/);

console.log("=== DEV-only gallery ===");
const routes = read("src/AppRoutes.tsx");
assert.match(routes, /import\.meta\.env\.DEV/);
assert.match(routes, /\/dev\/design-system/);

console.log("=== Phase 6 docs ===");
for (const doc of [
  "docs/release/RELEASE_READINESS_TRUTH.md",
  "docs/remediation/PHASE_6_RELEASE_BASELINE.md",
  "docs/qa/MUSHAF_REAL_DEVICE_RELEASE_MATRIX.md",
  "docs/qa/PRAYER_ADHAN_REAL_DEVICE_MATRIX.md",
  "docs/qa/IOS_RELEASE_CHECKLIST.md",
  "docs/mobile/ANDROID_RETIREMENT_INVENTORY.md",
  "docs/operations/OBSERVABILITY_CONTRACT.md",
  "docs/operations/INCIDENT_RESPONSE_RUNBOOK.md",
  "docs/privacy/PRIVACY_IMPLEMENTATION_GAP_REPORT.md",
  "docs/legal/RELEASE_ASSET_LICENSE_MATRIX.md",
  "docs/security/RELEASE_SUPPLY_CHAIN_REPORT.md",
  "docs/store-release/STORE_METADATA_TECHNICAL_GAP_REPORT.md",
  "docs/release/RELEASE_ROLLOUT_AND_ROLLBACK.md",
  "docs/release/PHASE_6_OWNER_ACTIONS.md",
]) {
  assert.ok(existsSync(resolve(repoRoot, doc)), doc);
}

const truth = readRepo("docs/release/RELEASE_READINESS_TRUTH.md");
assert.match(truth, /STORE STATUS:\s*HOLD/);
assert.match(truth, /DEVICE_REQUIRED/);
assert.match(truth, /OWNER_ACTION/);
assert.match(truth, /BLOCKED_LICENSE/);
assert.doesNotMatch(truth, /^STORE GO\s*$/m);
assert.doesNotMatch(truth, /STORE STATUS:\s*READY_FOR_OWNER_GO/);

console.log("=== License / store policy files ===");
assert.ok(existsSync(resolve(repoRoot, "LICENSE_RISKS.md")));
assert.ok(existsSync(resolve(repoRoot, "docs/store-release/STORE_LICENSE_DECISIONS.md")));
assert.ok(existsSync(resolve(repoRoot, "docs/store-release/excluded-asset-globs.json")));

console.log("=== Observability contract vocabulary ===");
const obs = readRepo("docs/operations/OBSERVABILITY_CONTRACT.md");
for (const ev of [
  "app_started",
  "chunk_recovery_attempted",
  "mushaf_first_usable",
  "prayer_schedule_failed",
  "adhan_schedule_result",
]) {
  assert.match(obs, new RegExp(ev));
}
assert.match(obs, /Forbidden to log/);

console.log("phase6-release-readiness-gate.test.ts: ok");
