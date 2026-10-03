/**
 * Debt-zero / full UI unification — regression contract.
 * node --import tsx src/lib/__tests__/debt-zero-unification-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const baselinePath = "docs/audit/debt-zero/LIVE_BASELINE.json";
const kjPath = "docs/audit/debt-zero/KEEP_JUSTIFIED_WITH_EVIDENCE_INVENTORY.json";
assert.ok(existsSync(resolve(repoRoot, baselinePath)), baselinePath);
assert.ok(existsSync(resolve(repoRoot, kjPath)), kjPath);

const budgetV = JSON.parse(readMaj("reports/visual-system-debt-budget.json"));
const budgetI = JSON.parse(readMaj("reports/interaction-system-debt-budget.json"));
assert.equal(budgetV.policy, "decreasing-ceilings");
assert.equal(budgetI.policy, "decreasing-ceilings");

/* Ceilings must stay at or below post-#2516 program floors of ambition */
assert.ok(budgetV.ceilings.hexInCss <= 6956, "hex ceiling must not exceed post-2516");
assert.ok(budgetV.ceilings.inlineColorStyleMatches <= 39);
assert.ok(budgetV.ceilings.borderRadiusPxDecls <= 392);
assert.ok(budgetI.ceilings.rawButtonElements <= 360);
assert.ok(budgetI.ceilings.divSpanOnClick <= 41);
assert.equal(budgetI.ceilings.formButtonsMissingType, 0);

const kj = JSON.parse(readRepo(kjPath));
assert.ok(Array.isArray(kj.items) && kj.items.length >= 1);
const required = [
  "id",
  "class",
  "file",
  "selector_or_component",
  "consumer",
  "technical_reason",
  "why_not_replace",
  "risk",
  "regression_gate",
  "review_trigger",
] as const;
for (const it of kj.items) {
  for (const k of required) {
    assert.ok(it[k] && String(it[k]).trim().length > 0, `${it.id || "?"} missing ${k}`);
  }
}

const matrix = JSON.parse(readRepo("docs/audit/ROUTE_QUALITY_MATRIX.json"));
let unsetStale = 0;
let unknownPhase = 0;
for (const row of matrix.routes as Array<Record<string, string>>) {
  if (row.stale == null || row.stale === "" || row.stale === "PENDING" || row.stale === "UNSET") {
    unsetStale += 1;
  }
  if (!row.publicFeedbackPhase) unknownPhase += 1;
}
assert.equal(unsetStale, 0, "stale unset must be 0");
assert.equal(unknownPhase, 0, "publicFeedbackPhase unset must be 0");

const pager = readMaj("src/features/mushaf-reader/MushafPager.tsx");
assert.match(pager, /\binert\b/);
assert.match(pager, /data-settled/);
const css = readMaj("src/features/mushaf-reader/mushaf-reader.css");
assert.match(css, /content-visibility:\s*auto/);

const offline = readRepo("docs/mobile/CAPACITOR_OFFLINE_FOUNDATION_REPORT.md");
assert.match(offline, /STREAM_ONLY/);
assert.match(offline, /LICENSE_BOUNDARY|LICENSE_BLOCKED/);
assert.match(offline, /logout|Logout|تسجيل الخروج/i);
assert.doesNotMatch(offline, /MMKV plaintext tokens as approved/);

const pkg = JSON.parse(readMaj("package.json"));
assert.match(pkg.scripts["test:debt-zero-unification"] || "", /debt-zero-unification-gate/);

console.log(
  `debt-zero-unification-gate: ok (hexCeiling=${budgetV.ceilings.hexInCss}, rawBtnEls=${budgetI.ceilings.rawButtonElements}, kj=${kj.items.length})`,
);
