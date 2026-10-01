/**
 * T-027 — AUDIO_RELEASE_ALLOWLIST_LOCKED + Istanbul final decision.
 * تشغيل: node --import tsx src/lib/__tests__/audio-release-allowlist-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { listSelectableAdhanVoices } from "../sunnah-audio-platform";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "../../..");
const repo = resolve(appRoot, "../..");

const allowlistPath = resolve(repo, "docs/store-release/AUDIO_RELEASE_ALLOWLIST.json");
const inventoryPath = resolve(repo, "reports/audio-release-allowlist.json");
const qaPath = resolve(
  repo,
  "docs/audio-rights/evidence/cc0-adhan-istanbul-2026-10-01/HUMAN_QA_RECORD.md",
);
const candidatePath = resolve(
  repo,
  "docs/audio-rights/evidence/cc0-adhan-istanbul-2026-10-01/CANDIDATE_REPORT.md",
);
const reportPath = resolve(repo, "docs/audit/AUDIO_RELEASE_ALLOWLIST_REPORT.md");

assert.ok(existsSync(allowlistPath), "AUDIO_RELEASE_ALLOWLIST.json missing");
assert.ok(existsSync(inventoryPath), "reports/audio-release-allowlist.json missing");
assert.ok(existsSync(qaPath), "HUMAN_QA_RECORD.md missing");
assert.ok(existsSync(reportPath), "AUDIO_RELEASE_ALLOWLIST_REPORT.md missing");

const allowlist = JSON.parse(readFileSync(allowlistPath, "utf8"));
assert.equal(allowlist.locked, true, "AUDIO_RELEASE_ALLOWLIST_LOCKED");
assert.equal(allowlist.AUDIO_RELEASE_ALLOWLIST_LOCKED, true);
assert.equal(allowlist.istanbulDecision, "CC0_ADHAN_REJECTED_QUALITY");
assert.equal(allowlist.storeV1PrimaryAlert, "system-default");
assert.ok(Array.isArray(allowlist.APPROVED_AUDIO) && allowlist.APPROVED_AUDIO.length >= 1);
assert.ok(Array.isArray(allowlist.BLOCKED_AUDIO) && allowlist.BLOCKED_AUDIO.length >= 1);
assert.ok(
  allowlist.APPROVED_AUDIO.some((a: { id: string }) => a.id === "system-default"),
  "system-default must be APPROVED_AUDIO",
);
assert.ok(
  allowlist.BLOCKED_AUDIO.some((a: { id: string }) => a.id === "istanbul"),
  "istanbul must be BLOCKED_AUDIO",
);
assert.ok(
  !allowlist.APPROVED_AUDIO.some((a: { id: string }) => a.id === "istanbul"),
  "istanbul must not be APPROVED_AUDIO",
);

const inventory = JSON.parse(readFileSync(inventoryPath, "utf8"));
assert.equal(inventory.locked, true);
assert.equal(inventory.istanbulDecision, "CC0_ADHAN_REJECTED_QUALITY");
assert.ok(Array.isArray(inventory.assets) && inventory.assets.length > 0);
for (const row of inventory.assets) {
  assert.ok(
    row.allowlist === "APPROVED_AUDIO" || row.allowlist === "BLOCKED_AUDIO",
    `unclassified asset: ${row.path || row.id}`,
  );
}
assert.equal(
  inventory.counts.APPROVED_AUDIO + inventory.counts.BLOCKED_AUDIO,
  inventory.counts.total,
);

const qa = readFileSync(qaPath, "utf8");
assert.match(qa, /CC0_ADHAN_REJECTED_QUALITY/);
assert.match(qa, /50\.085/);
assert.match(qa, /\*\*FAIL\*\*/);

const candidate = readFileSync(candidatePath, "utf8");
assert.match(candidate, /CC0_ADHAN_REJECTED_QUALITY/);
assert.doesNotMatch(candidate, /Status \| \*\*`CC0_ADHAN_CANDIDATE`\*\*/);

const selectable = listSelectableAdhanVoices();
assert.equal(selectable.length, 1);
assert.equal(selectable[0]?.id, "system-default");

// Istanbul must not appear as a public media file
assert.equal(
  existsSync(resolve(appRoot, "public/audio/adhan/adhan-istanbul-cc0-candidate.m4a")),
  false,
  "Istanbul extract must not be in public/audio",
);

console.log("audio-release-allowlist-gate.test.ts: ok", {
  approved: inventory.counts.APPROVED_AUDIO,
  blocked: inventory.counts.BLOCKED_AUDIO,
  istanbul: allowlist.istanbulDecision,
});
