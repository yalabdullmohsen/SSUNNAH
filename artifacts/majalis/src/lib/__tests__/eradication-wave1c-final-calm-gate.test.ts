/**
 * Wave 1C — final-release + sections-calm-polish absorption gate.
 * Run: node --import tsx src/lib/__tests__/eradication-wave1c-final-calm-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const fr = readMaj("src/styles/final-release.css");
const calm = readMaj("src/styles/sections-calm-polish.css");
const doc = readRepo("docs/design/eradication/WAVE1C_FINAL_CALM_ABSORPTION.md");

assert.match(doc, /TASK_CLASSIFICATION:\s*SHARED_PLATFORM/);
assert.match(doc, /ABSORB_NOW_RESIDUAL_CLASSIFIED_WITH_EVIDENCE/);
assert.match(doc, /HEX_AND_FALLBACK_COUNTS_REDUCED/);
assert.match(doc, /WEB_IMPACT/);
assert.match(doc, /IOS_APPLICATION_IMPACT/);
assert.match(doc, /APP_STORE_PRODUCT_IMPACT/);

assert.match(fr, /WAVE7 CASCADE SEAL/);
assert.doesNotMatch(fr, /var\(--mj-[\w-]+\s*,\s*#[0-9a-fA-F]{3,8}/);
assert.doesNotMatch(fr, /var\(--sf-[\w-]+\s*,\s*#[0-9a-fA-F]{3,8}/);

assert.match(calm, /--radius-control:\s*var\(--sf-radius-control/);
assert.doesNotMatch(calm, /--radius-control:\s*14px/);
assert.doesNotMatch(calm, /var\(--mj-[\w-]+\s*,\s*#[0-9a-fA-F]{3,8}/);

const budget = JSON.parse(readMaj("reports/visual-system-debt-budget.json")) as {
  ceilings: { hexInCss: number };
};
assert.ok(budget.ceilings.hexInCss <= 5619);

const qb = JSON.parse(readRepo("docs/governance/QUALITY_BASELINE_V1.json")) as {
  design: { visualCeilings: { hexInCss: number } };
};
assert.ok(qb.design.visualCeilings.hexInCss <= 5619);

console.log("eradication-wave1c-final-calm-gate.test.ts: ok");
console.log("HEX_AND_FALLBACK_COUNTS_REDUCED");
console.log("ABSORB_NOW_RESIDUAL_CLASSIFIED_WITH_EVIDENCE");
