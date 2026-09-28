/**
 * Visual System PR-1 — authority docs + debt budget wiring (no visual CSS mutation).
 * Run: node --import tsx src/lib/__tests__/visual-system-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");

function read(relFromMajalis: string) {
  return readFileSync(resolve(majalisRoot, relFromMajalis), "utf8");
}

function readRepo(rel: string) {
  return readFileSync(resolve(repoRoot, rel), "utf8");
}

/* Docs present */
for (const rel of [
  "docs/design/DESIGN_TOKEN_AUTHORITY.md",
  "docs/design/SUNNAH_VISUAL_SYSTEM_BASELINE.md",
  "docs/design/LEGACY_CSS_RETIREMENT_MATRIX.md",
]) {
  assert.ok(existsSync(resolve(repoRoot, rel)), `missing ${rel}`);
}

const authority = readRepo("docs/design/DESIGN_TOKEN_AUTHORITY.md");
assert.match(authority, /--sf-\*/);
assert.match(authority, /--sf2-/);
assert.match(authority, /--z-/);
assert.match(authority, /CANONICAL/);
assert.match(authority, /decreasing|Ceilings|ceilings|Debt budget/);
assert.match(authority, /no visual/i);
assert.match(authority, /z-index-layers\.css/);

const baselineDoc = readRepo("docs/design/SUNNAH_VISUAL_SYSTEM_BASELINE.md");
assert.match(baselineDoc, /4799|4\s*799/);
assert.match(baselineDoc, /visual-system-inventory\.mjs/);

/* Machine artifacts */
assert.ok(existsSync(resolve(majalisRoot, "reports/visual-system-debt-budget.json")));
assert.ok(existsSync(resolve(majalisRoot, "reports/visual-system-baseline.json")));
assert.ok(existsSync(resolve(majalisRoot, "scripts/visual-system-inventory.mjs")));

const budget = JSON.parse(read("reports/visual-system-debt-budget.json"));
assert.equal(budget.policy, "decreasing-ceilings");
assert.ok(budget.ceilings.important >= 1);
assert.ok(budget.ceilings.hexInCss >= 1);
assert.ok(budget.ceilings.rawButtonFiles >= 1);
assert.ok(budget.floors.officialButtonImportFiles >= 1);
assert.ok(budget.floors.sfTokenRefs >= 1);

/* Foundation remains sole --sf-* SoT claim */
const foundation = read("src/styles/sunnah-foundation-tokens.css");
assert.match(foundation, /مصدر الحقيقة|--sf-surface-canvas/);

/* Package wiring */
const pkg = JSON.parse(read("package.json"));
assert.match(pkg.scripts["test:visual-system-debt-budget"] || "", /visual-system-inventory/);
assert.match(pkg.scripts["test:visual-system-authority"] || "", /visual-system-authority-gate/);
assert.match(
  pkg.scripts["test:sunnah-foundation-reset-pr1"] || "",
  /test:visual-system-debt-budget/,
);

/* Live budget check */
const check = spawnSync(process.execPath, ["scripts/visual-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

console.log("visual-system-authority-gate.test.ts: ok");
