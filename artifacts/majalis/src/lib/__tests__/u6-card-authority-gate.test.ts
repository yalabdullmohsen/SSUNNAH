/**
 * T-043 U6 — Card Authority exit gate.
 * Run: node --import tsx src/lib/__tests__/u6-card-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const reportPath = "docs/audit/U6_CARD_AUTHORITY_REPORT.md";
assert.ok(existsSync(resolve(repoRoot, reportPath)), `missing ${reportPath}`);
const report = readRepo(reportPath);
assert.match(report, /CARD_AUTHORITY_ONLY/);
assert.match(report, /Final Decision/);
assert.match(report, /KEEP_JUSTIFIED/);
assert.match(report, /borderRadiusPxDecls/);

assert.ok(existsSync(resolve(repoRoot, "docs/audit/U5_BUTTON_AUTHORITY_REPORT.md")));
assert.match(readRepo("docs/audit/U5_BUTTON_AUTHORITY_REPORT.md"), /BUTTON_AUTHORITY_ONLY/);

const evidenceDir = resolve(repoRoot, "docs/audit/evidence/t043-u6-card-authority");
assert.ok(existsSync(resolve(evidenceDir, "summary.json")));
assert.ok(existsSync(resolve(evidenceDir, "inventory-after.json")));

const summary = JSON.parse(readFileSync(resolve(evidenceDir, "summary.json"), "utf8"));
assert.equal(summary.tsxSoftCardConsumers, 0);
assert.equal(summary.exit, "CARD_AUTHORITY_ONLY");
assert.ok(summary.visualAfter.borderRadiusPxDecls <= 1222);
assert.ok(summary.visualAfter.boxShadowDecls <= 1108);

// Product TSX must not emit soft-card className
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith(".tsx")) out.push(p);
  }
  return out;
}
const softTsx: string[] = [];
for (const file of walk(resolve(majalisRoot, "src"))) {
  const text = readFileSync(file, "utf8");
  if (/\bsoft-card\b/.test(text)) softTsx.push(relative(resolve(majalisRoot, "src"), file));
}
assert.deepEqual(softTsx, [], `soft-card in TSX: ${softTsx.join(", ")}`);

// Migrated façades route through authority
assert.match(readMaj("src/components/content/RelatedContentCard.tsx"), /InteractiveCard/);
assert.match(readMaj("src/components/sections/SectionCard.tsx"), /InteractiveCard/);
assert.match(readMaj("src/components/sections/FeaturedSectionCard.tsx"), /InteractiveCard/);
assert.match(readMaj("src/components/content/ReadingSectionCard.tsx"), /AppCard/);
assert.match(readMaj("src/components/lessons/UnifiedLessonCard.tsx"), /AppCard/);

assert.equal(existsSync(resolve(majalisRoot, "src/styles/soft-card-v3.css")), false);
assert.equal(existsSync(resolve(majalisRoot, "src/components/design-system/SoftCardV3.tsx")), false);

const budget = JSON.parse(readMaj("reports/visual-system-debt-budget.json"));
assert.equal(budget.policy, "decreasing-ceilings");
assert.ok(budget.ceilings.borderRadiusPxDecls <= 1222);
assert.ok(budget.ceilings.boxShadowDecls <= 1108);

const check = spawnSync(process.execPath, ["scripts/visual-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

console.log(
  `u6-card-authority-gate: ok (softTsx=0, radius=${summary.visualAfter.borderRadiusPxDecls}, exit=${summary.exit})`,
);
