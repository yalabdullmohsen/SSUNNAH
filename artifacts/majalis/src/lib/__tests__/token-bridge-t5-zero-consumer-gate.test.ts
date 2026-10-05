/**
 * T5 — retire zero-var() DS surface/state aliases (not quality-campaign).
 * node --import tsx src/lib/__tests__/token-bridge-t5-zero-consumer-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const removed = [
  "--ds-backgroundSubtle",
  "--ds-borderStrong",
  "--ds-disabled",
  "--ds-overlay",
  "--ds-skeletonBase",
  "--ds-skeletonHighlight",
] as const;

assert.equal(removed.length, 6);

const cssBundle = [
  "src/styles/ssunnah-ds-canonical.css",
  "src/styles/design-tokens.css",
  "src/styles/design-system.css",
]
  .map(read)
  .join("\n");

for (const tok of removed) {
  assert.doesNotMatch(
    cssBundle,
    new RegExp(`${tok.replace(/-/g, "\\-")}\\s*:`),
    `${tok} removed`,
  );
  assert.doesNotMatch(
    cssBundle,
    new RegExp(`var\\(\\s*${tok.replace(/-/g, "\\-")}`),
    `${tok} no var() consumers in authority CSS`,
  );
}

/* KEEP — quality-campaign + governance */
const dt = read("src/styles/design-tokens.css");
for (const tok of [
  "--ds-background",
  "--ds-surface",
  "--ds-surfaceElevated",
  "--ds-textPrimary",
  "--ds-textSecondary",
  "--ds-accent",
  "--ds-border",
  "--ds-muted",
  "--ds-danger",
  "--ds-success",
]) {
  assert.match(dt, new RegExp(`${tok.replace(/-/g, "\\-")}\\s*:`), `${tok} QC held`);
}

assert.match(
  read("src/styles/ssunnah-ds-canonical.css"),
  /--ds-durationFast:\s*var\(--motion-fast/,
  "--ds-durationFast keep-compat held",
);

const budget = JSON.parse(read("reports/visual-system-debt-budget.json"));
assert.equal(budget.policy, "decreasing-ceilings");
assert.ok(budget.ceilings.hexInCss <= 5550, `hexInCss ≤5550 (got ${budget.ceilings.hexInCss})`);

const check = spawnSync(process.execPath, ["scripts/visual-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

const qc = spawnSync(process.execPath, ["scripts/test-quality-campaign-gate.mjs"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(qc.status, 0, qc.stderr || qc.stdout);

console.log(`token-bridge-t5-zero-consumer-gate: ok (removed=${removed.length})`);
