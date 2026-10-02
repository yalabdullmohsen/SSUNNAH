/**
 * T-042 U5 — Button Authority exit gate.
 * Run: node --import tsx src/lib/__tests__/u5-button-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const reportPath = "docs/audit/U5_BUTTON_AUTHORITY_REPORT.md";
assert.ok(existsSync(resolve(repoRoot, reportPath)), `missing ${reportPath}`);
const report = readRepo(reportPath);
assert.match(report, /BUTTON_AUTHORITY_ONLY/);
assert.match(report, /DIV_SPAN_INTERACTIONS_CLOSED_OR_JUSTIFIED/);
assert.match(report, /Final Decision/);
assert.match(report, /KEEP_JUSTIFIED/);

const evidenceDir = resolve(repoRoot, "docs/audit/evidence/t042-u5-button-authority");
assert.ok(existsSync(resolve(evidenceDir, "summary.json")));
assert.ok(existsSync(resolve(evidenceDir, "raw-button-inventory.json")));
assert.ok(existsSync(resolve(evidenceDir, "div-span-onclick-inventory.json")));

const summary = JSON.parse(readFileSync(resolve(evidenceDir, "summary.json"), "utf8"));
assert.equal(summary.productRawRemaining, 0, "product raw buttons must be 0");
assert.equal(summary.convertDivRemaining, 0, "unjustified divSpan must be 0");
assert.equal(summary.exit, "BUTTON_AUTHORITY_ONLY");

const divInv = JSON.parse(readFileSync(resolve(evidenceDir, "div-span-onclick-inventory.json"), "utf8"));
assert.ok(!divInv.byDecision.CONVERT_TO_BUTTON, "no CONVERT_TO_BUTTON remaining");
assert.equal(divInv.byDecision.KEEP_JUSTIFIED, divInv.total);

const rawInv = JSON.parse(readFileSync(resolve(evidenceDir, "raw-button-inventory.json"), "utf8"));
assert.ok(!rawInv.byDecision.INVALID_PRODUCT, "no INVALID_PRODUCT raw buttons");
for (const key of Object.keys(rawInv.byDecision)) {
  assert.ok(
    ["ADMIN_ONLY", "MUSHAF_SPECIAL", "PRAYER_SPECIAL", "THIRD_PARTY", "DEAD_PROVEN", "KEEP_JUSTIFIED"].includes(key),
    `unexpected raw decision bucket: ${key}`,
  );
}

const budget = JSON.parse(readMaj("reports/interaction-system-debt-budget.json"));
assert.equal(budget.policy, "decreasing-ceilings");
assert.ok(budget.ceilings.rawButtonFiles <= 112);
assert.ok(budget.ceilings.rawButtonElements <= 485);
assert.ok(budget.ceilings.divSpanOnClick <= 46);
// T-043: SectionCard/HeroActionCard → InteractiveCard (Link); floor may be 253.
assert.ok(budget.floors.officialButtonImportFiles >= 253);

const check = spawnSync(process.execPath, ["scripts/interaction-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

// Forbidden: new button family files in product src (not prose negation in the report).
assert.equal(existsSync(resolve(majalisRoot, "src/components/ui/button-v2.tsx")), false);
assert.equal(existsSync(resolve(majalisRoot, "src/components/design-system/ButtonV2.tsx")), false);
assert.equal(existsSync(resolve(majalisRoot, "src/components/ui/LegacyButton.tsx")), false);

console.log(
  `u5-button-authority-gate: ok (raw=${rawInv.totalElements}, divSpan=${divInv.total}, exit=${summary.exit})`,
);
