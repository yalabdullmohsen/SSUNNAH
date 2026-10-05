/**
 * ADMIN_RAW_BUTTONS_REDUCED — legacy admin CRUD sections → official Button.
 * node --import tsx src/lib/__tests__/admin-interaction-authority-wave1-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const migrated = [
  "src/views/admin/UpdatesSection.tsx",
  "src/views/admin/AnnualCoursesSection.tsx",
  "src/views/admin/MiraclesSection.tsx",
  "src/views/admin/LibrarySection.tsx",
  "src/views/admin/ReportsSection.tsx",
  "src/views/admin/GovernanceSection.tsx",
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

const updates = read("src/views/admin/UpdatesSection.tsx");
assert.match(updates, /useAdminConfirm/);
assert.match(updates, /variant="destructive"/);

const budget = JSON.parse(read("reports/interaction-system-debt-budget.json"));
assert.equal(budget.policy, "decreasing-ceilings");
assert.ok(
  budget.ceilings.rawButtonFiles <= 65,
  `rawButtonFiles ≤65 (got ${budget.ceilings.rawButtonFiles})`,
);
assert.ok(
  budget.ceilings.rawButtonElements <= 258,
  `rawButtonElements ≤258 (got ${budget.ceilings.rawButtonElements})`,
);
assert.ok(
  budget.floors.officialButtonImportFiles >= 298,
  `Button import floor ≥298 (got ${budget.floors.officialButtonImportFiles})`,
);

const check = spawnSync(process.execPath, ["scripts/interaction-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

const pkg = JSON.parse(read("package.json"));
assert.match(
  pkg.scripts["test:admin-interaction-authority-wave1"] || "",
  /admin-interaction-authority-wave1-gate/,
);

console.log(
  `admin-interaction-authority-wave1-gate: ok (files=${migrated.length}, ceilings=${budget.ceilings.rawButtonFiles}/${budget.ceilings.rawButtonElements})`,
);
