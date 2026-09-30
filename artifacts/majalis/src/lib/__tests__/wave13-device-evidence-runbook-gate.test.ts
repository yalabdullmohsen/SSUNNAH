/**
 * WAVE13 — device evidence runbook present; no invented PASS rows.
 * Run: node --import tsx src/lib/__tests__/wave13-device-evidence-runbook-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");

const runbook = resolve(repoRoot, "docs/audit/WAVE13_FINAL_DEVICE_EVIDENCE_RUNBOOK.md");
assert.ok(existsSync(runbook), "WAVE13 runbook must exist");
const rb = readFileSync(runbook, "utf8");
assert.match(rb, /DEVICE_REQUIRED/);
assert.match(rb, /RUNBOOK_READY/);
assert.match(rb, /STORE GO.*\*\*Forbidden\*\*|Forbidden.*STORE GO|must not[\s\S]{0,80}STORE GO/i);
assert.match(rb, /does \*\*not\*\*[\s\S]{0,200}DEVICE_TESTED|not[\s\S]{0,40}claim[\s\S]{0,40}DEVICE_TESTED/i);
assert.match(rb, /MUSHAF_SILKY/);
assert.match(rb, /capture-build-context\.mjs/);
assert.match(rb, /validate-evidence-rows\.mjs/);
assert.match(rb, /Quran (ayah )?text|no Quran text/i);

const helpers = [
  "scripts/device-evidence/capture-build-context.mjs",
  "scripts/device-evidence/validate-evidence-rows.mjs",
  "scripts/device-evidence/evidence-row.template.json",
  "scripts/device-evidence/README.md",
];
for (const rel of helpers) {
  assert.ok(existsSync(resolve(repoRoot, rel)), `missing ${rel}`);
}

const template = JSON.parse(
  readFileSync(resolve(repoRoot, "scripts/device-evidence/evidence-row.template.json"), "utf8"),
);
assert.equal(template.result, "DEVICE_REQUIRED", "template must default to DEVICE_REQUIRED");

const register = resolve(repoRoot, "docs/audit/DEVICE_QA_REGISTER.md");
assert.ok(existsSync(register), "DEVICE_QA_REGISTER.md must exist");
const reg = readFileSync(register, "utf8");
assert.match(reg, /WAVE13_FINAL_DEVICE_EVIDENCE_RUNBOOK/);

const evidenceRoot = resolve(repoRoot, "docs/audit/device-evidence");
if (existsSync(evidenceRoot)) {
  for (const entry of readdirSync(evidenceRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const rowsDir = resolve(evidenceRoot, entry.name, "rows");
    if (!existsSync(rowsDir)) continue;
    for (const f of readdirSync(rowsDir).filter((n) => n.endsWith(".json"))) {
      const row = JSON.parse(readFileSync(resolve(rowsDir, f), "utf8"));
      if (row.result === "PASS") {
        assert.ok(row.artifactPath, `${f}: PASS requires artifactPath`);
        assert.ok(row.buildCommit, `${f}: PASS requires buildCommit`);
      }
    }
  }
}

console.log("wave13-device-evidence-runbook-gate.test.ts: ok");
