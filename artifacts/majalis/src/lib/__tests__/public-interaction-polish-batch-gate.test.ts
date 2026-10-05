/**
 * BATCH B — public interaction polish (OpenMushaf Button + critical a11y).
 * node --import tsx src/lib/__tests__/public-interaction-polish-batch-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const openMushaf = read("src/components/quran/QuranOpenMushafCard.tsx");
assert.doesNotMatch(openMushaf, /<button\b/, "QuranOpenMushafCard: no raw <button>");
assert.match(
  openMushaf,
  /from ["']@\/components\/ui\/button["']/,
  "QuranOpenMushafCard: official Button import",
);
assert.match(openMushaf, /className="quran-open-mushaf__cta"/);
assert.match(openMushaf, /data-hero-action="1"/);

const budget = JSON.parse(read("reports/interaction-system-debt-budget.json"));
assert.equal(budget.policy, "decreasing-ceilings");
assert.ok(
  budget.ceilings.rawButtonFiles <= 48,
  `rawButtonFiles ≤48 (got ${budget.ceilings.rawButtonFiles})`,
);
assert.ok(
  budget.ceilings.rawButtonElements <= 180,
  `rawButtonElements ≤180 (got ${budget.ceilings.rawButtonElements})`,
);
assert.ok(
  budget.floors.officialButtonImportFiles >= 314,
  `Button import floor ≥314 (got ${budget.floors.officialButtonImportFiles})`,
);

const check = spawnSync(process.execPath, ["scripts/interaction-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

console.log(
  `public-interaction-polish-batch-gate: ok (ceilings=${budget.ceilings.rawButtonFiles}/${budget.ceilings.rawButtonElements})`,
);
