/**
 * Phase 6 — Buttons residual absorb: migrated public surfaces must use Button/IconButton, no raw <button>.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const migrated = [
  "src/views/PrivacyCenterPage.tsx",
  "src/pages/account/ui/ProgressCenterView.tsx",
  "src/pages/quran/ui/QuranCirclesView.tsx",
  "src/pages/account/ui/IslamicGlossaryView.tsx",
  "src/views/UpdatesPage.tsx",
  "src/views/UploadPage.tsx",
  "src/views/ContactPage.tsx",
  "src/views/SupportPage.tsx",
  "src/views/SubmitContentPage.tsx",
  "src/views/UserStatsPage.tsx",
  "src/views/AlamatSaahPage.tsx",
  "src/views/InstitutionsPage.tsx",
  "src/views/NewMuslimDayDetailPage.tsx",
  "src/views/IslamicSectsDetailPage.tsx",
  "src/views/UniversitiesComparePage.tsx",
  /* Wave 3 / PR F */
  "src/pages/quran/ui/QuranNumbersView.tsx",
  "src/pages/quran/QuranMemorizationPlansPage.tsx",
  "src/pages/quran/QuranEnginePage.tsx",
] as const;

for (const rel of migrated) {
  const text = read(rel);
  assert.doesNotMatch(text, /<button\b/, `${rel}: no raw <button>`);
  assert.match(
    text,
    /from ["']@\/components\/ui\/button["']|IconButton/,
    `${rel}: Button or IconButton`,
  );
}

const budget = JSON.parse(read("reports/interaction-system-debt-budget.json"));
assert.ok(budget.ceilings.rawButtonFiles <= 168, `rawButtonFiles ceiling ≤168 (got ${budget.ceilings.rawButtonFiles})`);
assert.ok(budget.ceilings.rawButtonElements <= 650, `rawButtonElements ceiling ≤650 (got ${budget.ceilings.rawButtonElements})`);
assert.equal(budget.policy, "decreasing-ceilings");

console.log(
  `buttons-residual-absorb-p6-gate: ok (migrated=${migrated.length}, ceilings=${budget.ceilings.rawButtonFiles}/${budget.ceilings.rawButtonElements})`,
);
