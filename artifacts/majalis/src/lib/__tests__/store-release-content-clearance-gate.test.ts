/**
 * T-047 — Store Release Content Clearance exit gate.
 * Run: node --import tsx src/lib/__tests__/store-release-content-clearance-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const reportPath = "docs/audit/STORE_RELEASE_CONTENT_CLEARANCE_REPORT.md";
assert.ok(existsSync(resolve(repoRoot, reportPath)));
const report = readRepo(reportPath);
for (const section of [
  "Binary Inventory",
  "Approved Assets",
  "Removed Assets",
  "Stream Only Assets",
  "Audio Allowlist",
  "Font Audit",
  "Image Audit",
  "Notices & Attributions",
  "Final Release Boundary",
  "Exit Decision",
  "STORE_RELEASE_CONTENT_CLEARED",
  "RELEASE_BINARY_HAS_ZERO_UNKNOWN_ASSETS",
  "THIRD_PARTY_NOTICES_COMPLETE",
  "ATTRIBUTIONS_COMPLETE",
  "AUDIO_RELEASE_ALLOWLIST_LOCKED",
]) {
  assert.match(report, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

assert.ok(existsSync(resolve(repoRoot, "docs/audit/U9_ROUTE_MATRIX_CERTIFICATION_REPORT.md")));
assert.match(readRepo("docs/audit/U9_ROUTE_MATRIX_CERTIFICATION_REPORT.md"), /ROUTES_CLASSIFIED_AND_CLOSED/);

assert.ok(existsSync(resolve(repoRoot, "docs/store-release/THIRD_PARTY_NOTICES.md")));
assert.ok(existsSync(resolve(repoRoot, "docs/store-release/ATTRIBUTIONS.md")));
assert.match(readRepo("docs/store-release/THIRD_PARTY_NOTICES.md"), /THIRD_PARTY_NOTICES_COMPLETE/);
assert.match(readRepo("docs/store-release/ATTRIBUTIONS.md"), /ATTRIBUTIONS_COMPLETE/);
assert.match(readRepo("CREDITS.md"), /Store Release Candidate \(T-047\)/);

const allowlist = JSON.parse(readRepo("docs/store-release/STORE_RELEASE_ALLOWLIST.json"));
assert.equal(allowlist.audioAllowlist?.locked, true);
assert.equal(allowlist.claims?.AUDIO_RELEASE_ALLOWLIST_LOCKED, true);
assert.equal(allowlist.claims?.RELEASE_BINARY_HAS_ZERO_UNKNOWN_ASSETS, true);
assert.equal(allowlist.claims?.STORE_RELEASE_CONTENT_CLEARED, true);
assert.equal(allowlist.claims?.THIRD_PARTY_NOTICES_COMPLETE, true);
assert.equal(allowlist.claims?.ATTRIBUTIONS_COMPLETE, true);
assert.equal(allowlist.qpc?.class, "OWNER_DECISION_REQUIRED");
assert.equal(allowlist.recitations?.class, "STREAM_ONLY");

const istanbul = (allowlist.audioAllowlist.candidatesNotInBinary || []).find(
  (r: { id: string }) => r.id === "istanbul",
);
assert.ok(istanbul);
assert.equal(istanbul.inBinary, false);
assert.equal(istanbul.class, "CC0_ADHAN_REJECTED_QUALITY");
assert.ok(
  !(allowlist.audioAllowlist.inReleaseBinary || []).some((r: { id: string }) => r.id === "istanbul"),
);

const audioAllow = JSON.parse(readRepo("docs/store-release/AUDIO_RELEASE_ALLOWLIST.json"));
assert.equal(audioAllow.AUDIO_RELEASE_ALLOWLIST_LOCKED, true);
assert.equal(audioAllow.locked, true);
assert.equal(audioAllow.istanbulDecision, "CC0_ADHAN_REJECTED_QUALITY");

const inv = spawnSync(process.execPath, ["scripts/build-store-asset-inventory.mjs", "--check-release"], {
  cwd: repoRoot,
  encoding: "utf8",
});
assert.equal(inv.status, 0, inv.stderr || inv.stdout);

const inventory = JSON.parse(readRepo("reports/store-asset-inventory.json"));
assert.equal(inventory.summary.releaseFlavorUnknownCount, 0);
assert.equal(inventory.summary.RELEASE_BINARY_HAS_ZERO_UNKNOWN_ASSETS, true);
assert.equal(inventory.summary.AUDIO_RELEASE_ALLOWLIST_LOCKED, true);
assert.equal(inventory.summary.STORE_RELEASE_CONTENT_CLEARED, true);
assert.equal(inventory.summary.THIRD_PARTY_NOTICES_COMPLETE, true);
assert.equal(inventory.summary.ATTRIBUTIONS_COMPLETE, true);

const evidenceDir = resolve(repoRoot, "docs/audit/evidence/t047-store-release-content");
assert.ok(existsSync(resolve(evidenceDir, "summary.json")));
const summary = JSON.parse(readFileSync(resolve(evidenceDir, "summary.json"), "utf8"));
assert.equal(summary.exit, "STORE_RELEASE_CONTENT_CLEARED");
assert.equal(summary.RELEASE_BINARY_HAS_ZERO_UNKNOWN_ASSETS, true);
assert.equal(summary.THIRD_PARTY_NOTICES_COMPLETE, true);
assert.equal(summary.ATTRIBUTIONS_COMPLETE, true);
assert.equal(summary.AUDIO_RELEASE_ALLOWLIST_LOCKED, true);
assert.deepEqual(summary.blocking, []);

const storeAssets = spawnSync(process.execPath, ["scripts/verify-store-assets.mjs"], {
  cwd: repoRoot,
  encoding: "utf8",
});
assert.equal(storeAssets.status, 0, storeAssets.stderr || storeAssets.stdout);

console.log(
  `store-release-content-clearance-gate: ok (releaseUnknown=0, flavor=${inventory.summary.releaseFlavorCount}, exit=${summary.exit})`,
);
