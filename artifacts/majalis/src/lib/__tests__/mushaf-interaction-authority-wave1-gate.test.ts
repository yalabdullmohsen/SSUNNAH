/**
 * Mushaf interaction authority wave1 — ControlsLayer text actions.
 * node --import tsx src/lib/__tests__/mushaf-interaction-authority-wave1-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const layer = read("src/features/mushaf-reader/MushafControlsLayer.tsx");
assert.match(layer, /from ["']@\/components\/ui\/button["']/);
assert.match(layer, /<Button[^>]*nm-verse-menu__action/);
assert.match(layer, /data-testid="mushaf-index"/);
assert.doesNotMatch(layer, /<button[^>]*nm-verse-menu__action/);
assert.doesNotMatch(layer, /<button[^>]*data-testid="mushaf-index"/);
assert.doesNotMatch(layer, /<button[^>]*data-testid="mushaf-search"/);
assert.doesNotMatch(layer, /<button[^>]*nm-verse-menu__close/);
assert.doesNotMatch(layer, /<button[^>]*nm-verse-menu__clear/);
// KEEP: focus toggle aria-pressed remains native button (TOGGLE)
assert.match(layer, /aria-pressed=\{focusReadingMode\}/);
const raw = (layer.match(/<button\b/g) || []).length;
assert.ok(raw <= 8, `ControlsLayer raw buttons ≤8 (got ${raw})`);

const budget = JSON.parse(read("reports/interaction-system-debt-budget.json"));
assert.ok(budget.ceilings.rawButtonElements <= 257, `rawButtonElements ≤257 (got ${budget.ceilings.rawButtonElements})`);
assert.ok(budget.ceilings.rawButtonFiles <= 71);

const check = spawnSync(process.execPath, ["scripts/interaction-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);
console.log(`mushaf-interaction-authority-wave1-gate: ok (raw=${raw}, els=${budget.ceilings.rawButtonElements})`);
