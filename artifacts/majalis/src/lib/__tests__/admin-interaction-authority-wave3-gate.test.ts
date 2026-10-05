/**
 * ADMIN interaction wave 3 — lesson import / dawah / dashboard → Button.
 * node --import tsx src/lib/__tests__/admin-interaction-authority-wave3-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const migrated = [
  "src/views/admin/LessonImportShared.tsx",
  "src/views/admin/DawahSection.tsx",
  "src/views/admin/DashboardSection.tsx",
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

assert.match(read("src/views/admin/LessonImportShared.tsx"), /variant="destructive"/);
assert.match(read("src/views/admin/LessonImportShared.tsx"), /variant="primary"/);
assert.match(read("src/views/admin/DawahSection.tsx"), /variant="primary"/);
assert.match(read("src/views/admin/DashboardSection.tsx"), /role="tab"/);

const budget = JSON.parse(read("reports/interaction-system-debt-budget.json"));
assert.equal(budget.policy, "decreasing-ceilings");
assert.ok(
  budget.ceilings.rawButtonFiles <= 45,
  `rawButtonFiles ≤45 (got ${budget.ceilings.rawButtonFiles})`,
);
assert.ok(
  budget.ceilings.rawButtonElements <= 167,
  `rawButtonElements ≤167 (got ${budget.ceilings.rawButtonElements})`,
);
assert.ok(
  budget.floors.officialButtonImportFiles >= 317,
  `Button import floor ≥317 (got ${budget.floors.officialButtonImportFiles})`,
);

const check = spawnSync(process.execPath, ["scripts/interaction-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

console.log(
  `admin-interaction-authority-wave3-gate: ok (files=${migrated.length}, ceilings=${budget.ceilings.rawButtonFiles}/${budget.ceilings.rawButtonElements})`,
);
