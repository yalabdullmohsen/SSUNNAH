/**
 * Public Quran controls → official Button / IconButton (wave 2).
 * node --import tsx src/lib/__tests__/public-button-authority-wave2-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const migrated = [
  "src/components/quran/QuranSurahJumpSearch.tsx",
  "src/components/quran/BulkDownloadCard.tsx",
  "src/features/mushaf-madinah/TafsirTabPanel.tsx",
  "src/components/quran/ImmersiveVerseOptionsSheet.tsx",
  "src/components/quran/ImmersivePrefsDrawer.tsx",
] as const;

for (const rel of migrated) {
  const text = read(rel);
  assert.doesNotMatch(text, /<button\b/, `${rel}: no raw <button>`);
  assert.match(
    text,
    /from ["']@\/components\/ui\/button["']/,
    `${rel}: official Button import`,
  );
}

assert.match(read("src/components/quran/QuranSurahJumpSearch.tsx"), /IconButton/);
assert.match(read("src/components/quran/BulkDownloadCard.tsx"), /variant="destructive"/);
assert.match(read("src/features/mushaf-madinah/TafsirTabPanel.tsx"), /role="tab"/);

const budget = JSON.parse(read("reports/interaction-system-debt-budget.json"));
assert.equal(budget.policy, "decreasing-ceilings");
assert.ok(
  budget.ceilings.rawButtonFiles <= 60,
  `rawButtonFiles ≤60 (got ${budget.ceilings.rawButtonFiles})`,
);
assert.ok(
  budget.ceilings.rawButtonElements <= 212,
  `rawButtonElements ≤212 (got ${budget.ceilings.rawButtonElements})`,
);
assert.ok(
  budget.floors.officialButtonImportFiles >= 303,
  `Button import floor ≥303 (got ${budget.floors.officialButtonImportFiles})`,
);

const check = spawnSync(process.execPath, ["scripts/interaction-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

console.log(
  `public-button-authority-wave2-gate: ok (files=${migrated.length}, ceilings=${budget.ceilings.rawButtonFiles}/${budget.ceilings.rawButtonElements})`,
);
