/**
 * UI1 — QuranViewer + Memorization Button Authority.
 * node --import tsx src/lib/__tests__/ui1-quran-button-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const migrated = [
  "src/components/QuranViewer.tsx",
  "src/pages/quran/ui/QuranMemorizationView.tsx",
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

const viewer = read("src/components/QuranViewer.tsx");
assert.match(viewer, /IconButton/, "QuranViewer: IconButton for play/share/font");
assert.match(viewer, /from ["']@\/components\/design-system\/Buttons["']/);

const budget = JSON.parse(read("reports/interaction-system-debt-budget.json"));
assert.equal(budget.policy, "decreasing-ceilings");
assert.ok(budget.ceilings.rawButtonFiles <= 72, `rawButtonFiles ≤72 (got ${budget.ceilings.rawButtonFiles})`);
assert.ok(budget.ceilings.rawButtonElements <= 274, `rawButtonElements ≤274 (got ${budget.ceilings.rawButtonElements})`);
assert.ok(budget.floors.officialButtonImportFiles >= 291, "Button import floor ≥291");

const check = spawnSync(process.execPath, ["scripts/interaction-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

console.log(
  `ui1-quran-button-authority-gate: ok (files=${migrated.length}, ceilings=${budget.ceilings.rawButtonFiles}/${budget.ceilings.rawButtonElements})`,
);
