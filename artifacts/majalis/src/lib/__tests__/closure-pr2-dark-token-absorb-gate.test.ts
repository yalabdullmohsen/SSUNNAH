/**
 * Final Internal Closure PR2 — Dark Token Absorb + bridge classification.
 * node --import tsx src/lib/__tests__/closure-pr2-dark-token-absorb-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const bridges = [
  "src/styles/premium-dark-refine.css",
  "src/styles/dark-design-system.css",
  "src/styles/dark-mode-recovery.css",
];

for (const rel of bridges) {
  assert.doesNotMatch(read(rel), /--mj-[\w-]+\s*:/, `${rel}: no --mj-* declarations (absorbed)`);
}

const aliases = read("src/styles/theme-aliases.css");
assert.match(aliases, /Final Internal Closure PR2/, "aliases documents PR2 absorb");
assert.match(aliases, /--mj-bg:\s*var\(--surface-app/, "canvas live-binds surface-app");
assert.match(aliases, /--mj-ink:\s*#EDE8DF/, "warm night ink contract");
assert.match(aliases, /--mj-brand-deep:\s*#8FD4B0/, "brand-deep night");
assert.match(aliases, /dynamic-range:\s*high/, "HDR deepen in allowlisted aliases");

const theme = read("src/app/styles/theme.css");
assert.match(theme, /--surface-app:\s*#0F1613/, "product night canvas");
assert.match(theme, /--mj-bg:\s*var\(--surface-app\)/, "theme mj-bg ← surface-app");

const report = readRepo("docs/audit/SUNNAH_FINAL_INTERNAL_CLOSURE_PR2.md");
assert.match(report, /## BEFORE/);
assert.match(report, /## AFTER/);
assert.match(report, /## MJ_OUTSIDE/);
assert.match(report, /## DARK_BRIDGES/);
assert.match(report, /## ACTIVE_COMPATIBILITY/);
assert.match(report, /## REMOVED/);
assert.match(report, /## TESTS/);
assert.match(report, /## REGRESSIONS/);
assert.match(report, /## REMAINING_DEBT/);

assert.ok(existsSync(resolve(repoRoot, "docs/audit/DARK_BRIDGE_REDUCTION_REPORT.md")));

const inv = spawnSync(process.execPath, ["scripts/visual-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(inv.status, 0, inv.stderr || inv.stdout);

const budget = JSON.parse(read("reports/visual-system-debt-budget.json"));
assert.ok(budget.ceilings.mjDeclOutsideAllowlist < 30, "mj-outside ceiling below baseline 30");
assert.ok(budget.ceilings.mjDeclOutsideAllowlist >= 0);

console.log(
  `closure-pr2-dark-token-absorb-gate.test.ts: ok (mjOutsideCeiling=${budget.ceilings.mjDeclOutsideAllowlist})`,
);
