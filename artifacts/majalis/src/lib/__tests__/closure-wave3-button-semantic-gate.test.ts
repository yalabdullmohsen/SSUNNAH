/**
 * WAVE3 — public button / semantic interaction closure gate.
 * node --import tsx src/lib/__tests__/closure-wave3-button-semantic-gate.test.ts
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
  "src/components/quiz-game/IslamicQuizGame.tsx",
  "src/views/VaultPage.tsx",
  "src/views/MyCitationsPage.tsx",
  "src/views/ProphetStoriesPage.tsx",
  "src/pages/library/ui/ScholarlyResearchView.tsx",
  "src/pages/library/ui/ReadingPlansView.tsx",
  "src/views/FamilyModePage.tsx",
  "src/views/MindMapPage.tsx",
  "src/views/CalendarPage.tsx",
  "src/views/CardsPage.tsx",
  "src/views/UniversitiesPage.tsx",
  "src/views/ArkanIslamPage.tsx",
  "src/views/CitationPublicPage.tsx",
  "src/views/DiscoverIslamQuestionsPage.tsx",
  "src/views/PropheticMedicinePage.tsx",
  "src/views/NationDetailPage.tsx",
  "src/views/AdabTalabIlmPage.tsx",
  "src/views/WasayaNabawiyyaPage.tsx",
  "src/views/RaqaiqPage.tsx",
] as const;

for (const rel of migrated) {
  const text = read(rel);
  assert.doesNotMatch(text, /<button\b/, `${rel}: لا raw <button>`);
  assert.match(
    text,
    /from ["']@\/components\/ui\/button["']/,
    `${rel}: يستورد Button الرسمي`,
  );
  assert.doesNotMatch(text, /\bwindow\.confirm\s*\(/, `${rel}: لا window.confirm`);
  assert.doesNotMatch(text, /\bwindow\.alert\s*\(/, `${rel}: لا window.alert`);
}

const vault = read("src/views/VaultPage.tsx");
assert.match(vault, /role="alertdialog"/, "Vault: تأكيد حذف");
assert.match(vault, /variant="destructive"/, "Vault: destructive منفصل");
assert.match(vault, /<Link\b/, "Vault: روابط التنقل تبقى Link");

const quiz = read("src/components/quiz-game/IslamicQuizGame.tsx");
assert.match(quiz, /type="button"/, "Quiz: type=button صريح");
assert.doesNotMatch(quiz, /type="submit"/, "Quiz: لا submit زائف");

const univ = read("src/views/UniversitiesPage.tsx");
assert.match(univ, /type="submit"/, "Universities: submit محفوظ");

const research = read("src/pages/library/ui/ScholarlyResearchView.tsx");
assert.match(research, /type="submit"/, "ScholarlyResearch: submit محفوظ");
assert.match(research, /disabled=\{loading/, "ScholarlyResearch: منع تكرار أثناء التحميل");

const budget = JSON.parse(read("reports/interaction-system-debt-budget.json"));
assert.equal(budget.policy, "decreasing-ceilings");
assert.ok(budget.ceilings.rawButtonFiles <= 192, `rawButtonFiles ceiling ≤192 (got ${budget.ceilings.rawButtonFiles})`);
assert.ok(budget.ceilings.rawButtonElements <= 774, `rawButtonElements ceiling ≤774 (got ${budget.ceilings.rawButtonElements})`);
assert.ok(budget.floors.officialButtonImportFiles >= 172, "Button import floor ≥172");
assert.equal(budget.ceilings.formButtonsMissingType, 0);

const visualBudget = JSON.parse(read("reports/visual-system-debt-budget.json"));
assert.ok(visualBudget.ceilings.rawButtonFiles <= 192, "visual rawButtonFiles ceiling lowered");
assert.ok(visualBudget.floors.officialButtonImportFiles >= 172, "visual Button floor raised");

const check = spawnSync(process.execPath, ["scripts/interaction-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

const baseline = readRepo("docs/audit/WAVE3_BUTTON_INTERACTION_BASELINE.md");
assert.match(baseline, /WAVE2_MERGED_AND_DEPLOYED|4c8acff6a/);
assert.match(baseline, /IMPLEMENTATION_FROZEN|Scope Manifest/);

const matrix = readRepo("docs/design/WAVE3_INTERACTION_MIGRATION_MATRIX.md");
assert.match(matrix, /USE_BUTTON/);
assert.match(matrix, /IslamicQuizGame/);
assert.match(matrix, /EVENT_DELEGATION/);

const report = readRepo("docs/audit/SUNNAH_WAVE3_BUTTON_SEMANTIC_CLOSURE_REPORT.md");
assert.match(report, /## STATUS/);
assert.match(report, /WAVE3_/);
assert.match(report, /rawButtonFiles/);
assert.match(report, /BEFORE VS AFTER|## BEFORE VS AFTER/);

console.log(
  `closure-wave3-button-semantic-gate.test.ts: ok (migrated=${migrated.length}, ceilings=${budget.ceilings.rawButtonFiles}/${budget.ceilings.rawButtonElements})`,
);
