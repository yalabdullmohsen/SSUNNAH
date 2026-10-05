/**
 * ADMIN interaction wave 2 — calendar review / stories / file import → Button.
 * node --import tsx src/lib/__tests__/admin-interaction-authority-wave2-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const migrated = [
  "src/views/admin/ReligiousCalendarReviewSection.tsx",
  "src/views/admin/IslamicStoriesSection.tsx",
  "src/views/admin/ContentFileImport.tsx",
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

assert.match(read("src/views/admin/ReligiousCalendarReviewSection.tsx"), /variant="destructive"/);
assert.match(read("src/views/admin/ReligiousCalendarReviewSection.tsx"), /variant="primary"/);

const budget = JSON.parse(read("reports/interaction-system-debt-budget.json"));
assert.equal(budget.policy, "decreasing-ceilings");
assert.ok(
  budget.ceilings.rawButtonFiles <= 49,
  `rawButtonFiles ≤49 (got ${budget.ceilings.rawButtonFiles})`,
);
assert.ok(
  budget.ceilings.rawButtonElements <= 181,
  `rawButtonElements ≤181 (got ${budget.ceilings.rawButtonElements})`,
);
assert.ok(
  budget.floors.officialButtonImportFiles >= 313,
  `Button import floor ≥313 (got ${budget.floors.officialButtonImportFiles})`,
);

const check = spawnSync(process.execPath, ["scripts/interaction-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

console.log(
  `admin-interaction-authority-wave2-gate: ok (files=${migrated.length}, ceilings=${budget.ceilings.rawButtonFiles}/${budget.ceilings.rawButtonElements})`,
);
