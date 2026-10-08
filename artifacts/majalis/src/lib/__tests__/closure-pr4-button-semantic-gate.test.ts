/**
 * Final Internal Closure PR4 — button & semantic interaction wave.
 * node --import tsx src/lib/__tests__/closure-pr4-button-semantic-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const migrated = [
  "src/components/ErrorBoundary.tsx",
  "src/components/ShareFaida.tsx",
  "src/components/CrossDeviceResumeToast.tsx",
  "src/components/filters/UnifiedPrimaryFilters.tsx",
  "src/components/reading/ContentActionBar.tsx",
  "src/components/citation/CitationActionBar.tsx",
  "src/components/citation/CitationModal.tsx",
  "src/components/fawaid/FaidaImageCardModal.tsx",
  "src/components/onboarding/FirstVisitIntro.tsx",
  "src/components/majlis/SmartSearchPanel.tsx",
  "src/components/reading/HighlightedContentCard.tsx",
  "src/components/rulings/RulingCategoryGrid.tsx",
  "src/components/prophets/ProphetStoryTabs.tsx",
] as const;

for (const rel of migrated) {
  const text = read(rel);
  assert.doesNotMatch(text, /<button\b/, `${rel}: لا raw <button>`);
  /* Wave 4: ProphetStoryTabs composes ContentTabs (Button owned by TabSystem) */
  if (rel.endsWith("ProphetStoryTabs.tsx")) {
    continue;
  }
  assert.match(
    text,
    /from ["']@\/components\/ui\/button["']|from ["']@\/components\/design-system\/Buttons["']|from ["']@\/design-system["']/,
    `${rel}: Button أو IconButton`,
  );
}

const errorBoundary = read("src/components/ErrorBoundary.tsx");
assert.match(errorBoundary, /ERROR_ESCAPE_LINKS/);
assert.match(errorBoundary, /<a\s+href=/, "مسارات الهروب تبقى روابط");
assert.doesNotMatch(
  errorBoundary,
  /ERROR_ESCAPE_LINKS[\s\S]{0,400}<Button/,
  "لا Button للتنقل في قائمة الهروب",
);

const share = read("src/components/ShareFaida.tsx");
assert.match(share, /IconButton/);
assert.match(share, /loading=\{busy\}/);

const modal = read("src/components/citation/CitationModal.tsx");
assert.match(modal, /loading=\{loading\}/);
assert.match(modal, /IconButton/);

const budget = JSON.parse(read("reports/interaction-system-debt-budget.json"));
assert.equal(budget.policy, "decreasing-ceilings");
assert.ok(budget.ceilings.rawButtonFiles <= 212, `rawButtonFiles ceiling ≤212 (got ${budget.ceilings.rawButtonFiles})`);
assert.ok(budget.ceilings.rawButtonElements <= 917, `rawButtonElements ceiling ≤917 (got ${budget.ceilings.rawButtonElements})`);
assert.ok(budget.floors.officialButtonImportFiles >= 151, "Button import floor ≥151");

const check = spawnSync(process.execPath, ["scripts/interaction-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

const report = readRepo("docs/design/PR4_BUTTON_SEMANTIC_CLOSURE_REPORT.md");
assert.match(report, /## Metrics/);
assert.match(report, /rawButtonFiles/);
assert.match(report, /## Migrated files/);
assert.match(report, /USE_BUTTON/);
assert.match(report, /Post-PR4|\*\*212\*\*/);

const baseline = readRepo("docs/audit/SUNNAH_PR4_PR8_LIVE_BASELINE.md");
assert.match(baseline, /PR4/);
assert.match(baseline, /723d27f62|origin\/main/);

console.log(
  `closure-pr4-button-semantic-gate.test.ts: ok (migrated=${migrated.length}, ceilings=${budget.ceilings.rawButtonFiles}/${budget.ceilings.rawButtonElements})`,
);
