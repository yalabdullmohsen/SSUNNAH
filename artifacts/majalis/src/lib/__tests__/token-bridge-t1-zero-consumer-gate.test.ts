/**
 * T1 — zero-consumer --ds-/--majalis- alias removal.
 * node --import tsx src/lib/__tests__/token-bridge-t1-zero-consumer-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const removed = [
  "--ds-bg",
  "--ds-danger",
  "--ds-error",
  "--ds-font-bold",
  "--ds-gold",
  "--ds-onPrimary",
  "--majalis-green",
  "--majalis-primary",
  "--majalis-secondary",
  "--majalis-text",
] as const;

const cssBundle = [
  "src/styles/ssunnah-ds-canonical.css",
  "src/styles/brand-v4.css",
  "src/styles/design-tokens.css",
  "src/styles/design-system.css",
].map(read).join("\n");

for (const tok of removed) {
  assert.doesNotMatch(cssBundle, new RegExp(`${tok.replace(/-/g, "\\-")}\\s*:`), `${tok} declaration removed`);
}

const budget = JSON.parse(read("reports/visual-system-debt-budget.json"));
assert.ok(budget.ceilings.hexInCss <= 5569, `hexInCss ceiling ≤5569 (got ${budget.ceilings.hexInCss})`);
assert.equal(budget.policy, "decreasing-ceilings");

const check = spawnSync(process.execPath, ["scripts/visual-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

console.log("token-bridge-t1-zero-consumer-gate: ok");
