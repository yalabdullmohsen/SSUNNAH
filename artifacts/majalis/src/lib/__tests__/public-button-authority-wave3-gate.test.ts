/**
 * Public Quran controls → official Button / IconButton (wave 3).
 * node --import tsx src/lib/__tests__/public-button-authority-wave3-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const migrated = [
  "src/components/quran/SurahList.tsx",
  "src/components/quran/TafsirModalViewer.tsx",
  "src/components/quran/QuranAudioPlayer.tsx",
  "src/components/quran/QuranPlayerView.tsx",
  "src/components/quran/HifzAudioLoopPlayer.tsx",
  "src/components/quran/ImmersiveQuranApp.tsx",
  "src/components/quran/QuranVerseList.tsx",
  "src/components/quran/ImmersiveQuranPage.tsx",
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

assert.match(read("src/components/quran/SurahList.tsx"), /role="tab"/);
assert.match(read("src/components/quran/TafsirModalViewer.tsx"), /IconButton/);
assert.match(read("src/components/quran/HifzAudioLoopPlayer.tsx"), /IconButton/);
assert.match(read("src/components/quran/HifzAudioLoopPlayer.tsx"), /aria-pressed=\{loopUiActive\}/);
assert.match(read("src/components/quran/QuranVerseList.tsx"), /role="option"/);

const budget = JSON.parse(read("reports/interaction-system-debt-budget.json"));
assert.equal(budget.policy, "decreasing-ceilings");
assert.ok(
  budget.ceilings.rawButtonFiles <= 52,
  `rawButtonFiles ≤52 (got ${budget.ceilings.rawButtonFiles})`,
);
assert.ok(
  budget.ceilings.rawButtonElements <= 193,
  `rawButtonElements ≤193 (got ${budget.ceilings.rawButtonElements})`,
);
assert.ok(
  budget.floors.officialButtonImportFiles >= 311,
  `Button import floor ≥311 (got ${budget.floors.officialButtonImportFiles})`,
);

const check = spawnSync(process.execPath, ["scripts/interaction-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

console.log(
  `public-button-authority-wave3-gate: ok (files=${migrated.length}, ceilings=${budget.ceilings.rawButtonFiles}/${budget.ceilings.rawButtonElements})`,
);
