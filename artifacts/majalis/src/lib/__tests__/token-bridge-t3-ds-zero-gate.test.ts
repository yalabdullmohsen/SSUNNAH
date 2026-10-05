/**
 * T3 — zero-consumer deferred --ds-* spacing/gradient aliases.
 * node --import tsx src/lib/__tests__/token-bridge-t3-ds-zero-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const removed = [
  "--ds-1",
  "--ds-2",
  "--ds-3",
  "--ds-4",
  "--ds-5",
  "--ds-6",
  "--ds-8",
  "--ds-10",
  "--ds-12",
  "--ds-16",
  "--ds-r-xl",
  "--ds-r-2xl",
  "--ds-gold-grad",
  "--ds-hero-grad",
] as const;

const deferred = read("src/styles/index-deferred-pages.css");
for (const tok of removed) {
  assert.doesNotMatch(
    deferred,
    new RegExp(`${tok.replace(/-/g, "\\-")}\\s*:`),
    `${tok} removed from deferred pages`,
  );
}

/* Gate-required foundation token must remain. */
assert.match(read("src/styles/design-system.css"), /--ds-base:\s*16px/);

const budget = JSON.parse(read("reports/visual-system-debt-budget.json"));
assert.equal(budget.policy, "decreasing-ceilings");
assert.ok(budget.ceilings.hexInCss <= 5553, `hexInCss ≤5553 (got ${budget.ceilings.hexInCss})`);

const check = spawnSync(process.execPath, ["scripts/visual-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

console.log("token-bridge-t3-ds-zero-gate: ok");
