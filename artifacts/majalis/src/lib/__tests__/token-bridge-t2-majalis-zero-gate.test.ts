/**
 * T2 — zero-consumer --majalis-* alias removal (proven var()/string = 0).
 * node --import tsx src/lib/__tests__/token-bridge-t2-majalis-zero-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const removed = [
  "--majalis-blue",
  "--majalis-blue-deep",
  "--majalis-blue-soft",
  "--majalis-shadow-lg",
  "--majalis-shadow-xl",
  "--majalis-ivory",
  "--majalis-surface-hover",
  "--majalis-surface-muted",
  "--majalis-warning",
] as const;

const cssBundle = [
  "src/index.css",
  "src/styles/dark-mode-recovery.css",
].map(read).join("\n");

for (const tok of removed) {
  assert.doesNotMatch(
    cssBundle,
    new RegExp(`${tok.replace(/-/g, "\\-")}\\s*:`),
    `${tok} declaration removed`,
  );
}

const budget = JSON.parse(read("reports/visual-system-debt-budget.json"));
assert.ok(budget.ceilings.hexInCss <= 5557, `hexInCss ceiling ≤5557 (got ${budget.ceilings.hexInCss})`);
assert.ok(budget.ceilings.rgbHslInCss <= 1961, `rgbHslInCss ceiling ≤1961 (got ${budget.ceilings.rgbHslInCss})`);
assert.equal(budget.policy, "decreasing-ceilings");

const check = spawnSync(process.execPath, ["scripts/visual-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

console.log("token-bridge-t2-majalis-zero-gate: ok");
