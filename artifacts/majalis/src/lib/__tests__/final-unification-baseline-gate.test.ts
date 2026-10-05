/**
 * Governing tip baseline presence for FINAL UNIFICATION program.
 * node --import tsx src/lib/__tests__/final-unification-baseline-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const baseline = resolve(repoRoot, "docs/audit/SUNNAH_FINAL_UNIFICATION_BASELINE_2e72ddd7b.md");
assert.equal(existsSync(baseline), true, "tip baseline file present");
const text = readFileSync(baseline, "utf8");
assert.match(text, /LIVE_BASELINE_LOCKED/);
assert.match(text, /UNKNOWN_BASELINE_ITEMS = 0/);
assert.match(text, /NO_CEILING_RAISE/);
assert.match(text, /hexInCss/);
const budget = JSON.parse(readFileSync(resolve(majalisRoot, "reports/visual-system-debt-budget.json"), "utf8"));
assert.equal(budget.policy, "decreasing-ceilings");
assert.ok(budget.ceilings.hexInCss <= 5553);
console.log("final-unification-baseline-gate: ok");
