/**
 * Wave 1B — premium-dark-refine + modern-ui-refresh absorption gate.
 * Run: node --import tsx src/lib/__tests__/eradication-wave1b-dark-mur-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const pd = readMaj("src/styles/premium-dark-refine.css");
const mur = readMaj("src/styles/modern-ui-refresh.css");
const doc = readRepo("docs/design/eradication/WAVE1B_DARK_MUR_ABSORPTION.md");

assert.match(doc, /TASK_CLASSIFICATION:\s*SHARED_PLATFORM/);
assert.match(doc, /ABSORB_NOW_RESIDUAL_CLASSIFIED_WITH_EVIDENCE/);
assert.match(doc, /HEX_AND_FALLBACK_COUNTS_REDUCED/);
assert.match(doc, /WEB_IMPACT/);
assert.match(doc, /IOS_APPLICATION_IMPACT/);
assert.match(doc, /APP_STORE_PRODUCT_IMPACT/);

assert.match(pd, /--pd-bg-1:\s*#0f1613/i);
assert.match(pd, /--pd-card:\s*#24302b/);
assert.match(pd, /--surface-app:\s*var\(--pd-bg-1\)/);
assert.doesNotMatch(pd, /--pd-bg-1:\s*var\(--surface-app\)/, "no pd↔surface-app cycle");
assert.doesNotMatch(pd, /var\(--[\w-]+\s*,\s*#[0-9a-fA-F]{3,8}/);
assert.doesNotMatch(pd, /--mj-[\w-]+\s*:/);

assert.match(mur, /--mur-radius:\s*var\(--sf-radius-md/);
assert.match(mur, /--radius-button:\s*var\(--sf-radius-sm/);
assert.doesNotMatch(mur, /var\((--[\w-]+),\s*var\(\1\)\)/);
assert.doesNotMatch(mur, /var\(--[\w-]+\s*,\s*#[0-9a-fA-F]{3,8}/);

const budget = JSON.parse(readMaj("reports/visual-system-debt-budget.json")) as {
  ceilings: { hexInCss: number };
};
assert.ok(budget.ceilings.hexInCss <= 5630);

const qb = JSON.parse(readRepo("docs/governance/QUALITY_BASELINE_V1.json")) as {
  design: { visualCeilings: { hexInCss: number } };
};
assert.ok(qb.design.visualCeilings.hexInCss <= 5630);

console.log("eradication-wave1b-dark-mur-gate.test.ts: ok");
console.log("HEX_AND_FALLBACK_COUNTS_REDUCED");
console.log("ABSORB_NOW_RESIDUAL_CLASSIFIED_WITH_EVIDENCE");
