/**
 * Wave 1A — design-system + visual-identity-unify absorption gate.
 * Run: node --import tsx src/lib/__tests__/eradication-wave1a-ds-viu-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const unify = readMaj("src/styles/visual-identity-unify.css");
const ds = readMaj("src/styles/design-system.css");
const aliases = readMaj("src/styles/theme-aliases.css");
const doc = readRepo("docs/design/eradication/WAVE1A_DS_VIU_ABSORPTION.md");

assert.match(doc, /TASK_CLASSIFICATION:\s*SHARED_PLATFORM/);
assert.match(doc, /ABSORB_NOW_RESIDUAL_CLASSIFIED_WITH_EVIDENCE/);
assert.match(doc, /HEX_AND_FALLBACK_COUNTS_REDUCED/);
assert.match(doc, /WEB_IMPACT/);
assert.match(doc, /IOS_APPLICATION_IMPACT/);
assert.match(doc, /APP_STORE_PRODUCT_IMPACT/);

assert.match(unify, /LEGACY_NON_SOT/);
assert.doesNotMatch(unify, /:root\s*\{[\s\S]*?--radius-card:/);
assert.doesNotMatch(unify, /var\(--[\w-]+\s*,\s*#[0-9a-fA-F]{3,8}/);
assert.doesNotMatch(unify, /#[0-9a-fA-F]{3,8}/);

assert.doesNotMatch(ds, /\.fiqh-adopted-opinion\s*\{/);
assert.doesNotMatch(ds, /\.tawheed-breadcrumb\s*\{/);
assert.doesNotMatch(ds, /var\(--[\w-]+\s*,\s*#[0-9a-fA-F]{3,8}/);

assert.match(aliases, /--ss-primary-green:\s*var\(--mj-brand\)/);
assert.match(aliases, /--radius-control:\s*var\(--sf-radius-control/);
assert.match(aliases, /--radius-card:\s*var\(--sf-radius-card/);
assert.doesNotMatch(aliases, /var\(--sf-radius-card,\s*1\.5rem\)\)/);

const budget = JSON.parse(readMaj("reports/visual-system-debt-budget.json")) as {
  ceilings: { hexInCss: number; rgbHslInCss: number };
};
assert.ok(budget.ceilings.hexInCss <= 5657, "hex ceiling must be ≤ measured 5657");
assert.ok(budget.ceilings.rgbHslInCss <= 2006, "rgb ceiling must be ≤ measured 2006");

const qb = JSON.parse(readRepo("docs/governance/QUALITY_BASELINE_V1.json")) as {
  design: { visualCeilings: { hexInCss: number } };
};
assert.ok(qb.design.visualCeilings.hexInCss <= 5657);

const main = readMaj("src/main.tsx");
assert.equal(
  [...main.split("function loadNonCriticalCss")[0].matchAll(/^\s*import\s+"\.\/[^"]+\.css"/gm)].length,
  14,
  "sync critical CSS held at 14",
);

console.log("eradication-wave1a-ds-viu-gate.test.ts: ok");
console.log("HEX_AND_FALLBACK_COUNTS_REDUCED");
console.log("ABSORB_NOW_RESIDUAL_CLASSIFIED_WITH_EVIDENCE");
