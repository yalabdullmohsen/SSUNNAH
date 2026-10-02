/**
 * FINAL Program Phase 5 — Cards residual absorb (radius/shadow → Card Authority tokens).
 * Run: node --import tsx src/lib/__tests__/cards-residual-absorb-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const tokens = read("src/styles/card-system-tokens.css");
assert.match(tokens, /--cs-radius-icon:\s*var\(--sf-radius-xs\)/);
assert.match(tokens, /--cs-radius-control:\s*var\(--sf-radius-control/);

const cardSys = read("src/styles/card-system.css");
assert.match(cardSys, /border-radius:\s*var\(--cs-radius-icon/);
assert.match(cardSys, /border-radius:\s*var\(--cs-radius-control/);
assert.match(cardSys, /border-radius:\s*var\(--sf-radius-pill\)/);
assert.doesNotMatch(cardSys, /border-radius:\s*10px/);
assert.doesNotMatch(cardSys, /border-radius:\s*12px/);
assert.doesNotMatch(cardSys, /border-radius:\s*999px/);

const polish = read("src/styles/ssunnah-ux-polish.css");
assert.doesNotMatch(polish, /border-radius:\s*10px/);
assert.doesNotMatch(polish, /border-radius:\s*999px/);
assert.doesNotMatch(polish, /box-shadow:\s*0 12px 28px rgba\(0,\s*0,\s*0,\s*0\.28\)/);
assert.match(polish, /box-shadow:\s*var\(--sf-shadow-elevated\)/);

const v2 = read("src/styles/card-system-v2.css");
assert.doesNotMatch(v2, /border-radius:\s*999px/);
assert.match(v2, /border-radius:\s*var\(--sf-radius-pill\)/);

const budget = JSON.parse(read("reports/visual-system-debt-budget.json"));
assert.ok(
  budget.ceilings.borderRadiusPxDecls <= 1243,
  `borderRadius ceiling ≤1243 (got ${budget.ceilings.borderRadiusPxDecls})`,
);
assert.ok(budget.ceilings.boxShadowDecls <= 1113);

const report = readFileSync(
  resolve(root, "../../docs/performance/SUNNAH_FINAL_PROGRAM_PHASE5_CARDS_RESIDUAL_ABSORB.md"),
  "utf8",
);
assert.match(report, /Phase 5/);
assert.match(report, /borderRadiusPxDecls/);

console.log("cards-residual-absorb-gate.test.ts: ok");
