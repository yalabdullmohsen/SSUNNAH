/**
 * Interaction System PR-1 — Button authority + debt budget.
 * Run: node --import tsx src/lib/__tests__/interaction-system-authority-gate.test.ts
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

for (const doc of [
  "docs/design/INTERACTION_COMPONENT_AUTHORITY.md",
  "docs/design/SUNNAH_INTERACTION_SYSTEM_BASELINE.md",
]) {
  assert.ok(existsSync(resolve(repoRoot, doc)), `missing ${doc}`);
}

const authority = readRepo("docs/design/INTERACTION_COMPONENT_AUTHORITY.md");
assert.match(authority, /Canonical button/);
assert.match(authority, /variant="primary \| secondary/);
assert.match(authority, /AppBackButton/);
assert.match(authority, /MUSHAF_SPECIAL/);
assert.match(authority, /decreasing-ceilings|Ceilings must not rise/);

const baseline = readRepo("docs/design/SUNNAH_INTERACTION_SYSTEM_BASELINE.md");
assert.match(baseline, /interaction-system-inventory\.mjs/);
assert.match(baseline, /352|rawButtonFiles/);

const button = read("src/components/ui/button.tsx");
assert.match(button, /loading\?:/);
assert.match(button, /iconStart\?:/);
assert.match(button, /fullWidth\?:/);
assert.match(button, /"primary"/);
assert.match(button, /type = "button"/);
assert.match(button, /aria-busy/);
assert.match(button, /data-ss-button/);
assert.match(button, /--sf-radius-control/);
assert.doesNotMatch(button, /framer-motion/i);

const action = read("src/components/design-system/ActionButton.tsx");
assert.match(action, /from "@\/components\/ui\/button"/);
assert.match(action, /<Link href=/);
assert.match(action, /<Button/);

const icon = read("src/components/design-system/Buttons.tsx");
assert.match(icon, /size="icon"/);
assert.match(icon, /label:/);

assert.match(read("src/components/filters/FilterResetButton.tsx"), /from "@\/components\/ui\/button"/);
assert.match(read("src/components/ShareButton.tsx"), /from "@\/components\/ui\/button"/);

assert.ok(existsSync(resolve(majalisRoot, "reports/interaction-system-debt-budget.json")));
assert.ok(existsSync(resolve(majalisRoot, "scripts/interaction-system-inventory.mjs")));

const budget = JSON.parse(read("reports/interaction-system-debt-budget.json"));
assert.equal(budget.policy, "decreasing-ceilings");
assert.ok(budget.ceilings.rawButtonFiles >= 1);
assert.ok(budget.floors.officialButtonImportFiles >= 1);

const pkg = JSON.parse(read("package.json"));
assert.match(pkg.scripts["test:interaction-system-debt-budget"] || "", /interaction-system-inventory/);
assert.match(pkg.scripts["test:interaction-system-authority"] || "", /interaction-system-authority-gate/);

const check = spawnSync(process.execPath, ["scripts/interaction-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

console.log("interaction-system-authority-gate.test.ts: ok");
