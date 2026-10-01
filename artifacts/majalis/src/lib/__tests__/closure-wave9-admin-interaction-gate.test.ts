/**
 * WAVE9 — Admin interaction / form authority closure gate.
 * node --import tsx src/lib/__tests__/closure-wave9-admin-interaction-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

assert.ok(existsSync(resolve(repoRoot, "docs/admin/WAVE9_ADMIN_INTERACTION_CLOSURE_REPORT.md")));
const report = readRepo("docs/admin/WAVE9_ADMIN_INTERACTION_CLOSURE_REPORT.md");
assert.match(report, /WAVE9|AdminConfirmDialog|USE_BUTTON|NATIVE_JUSTIFIED/);
assert.match(report, /admin-v3/);
assert.match(report, /LEGACY_ADMIN|DEVICE_REQUIRED|OWNER_ACTION/);

const confirmComp = read("src/components/admin/AdminConfirmDialog.tsx");
assert.match(confirmComp, /from "@\/components\/ui\/button"/);
assert.match(confirmComp, /useAdminConfirm/);
assert.doesNotMatch(confirmComp, /window\.confirm\s*\(/);

const modal = read("src/views/admin/AdminModal.tsx");
assert.match(modal, /from "@\/components\/ui\/button"/);
assert.match(modal, /IconButton/);
assert.doesNotMatch(modal, /<button\b/);

const targets = [
  "src/views/admin/UniversitiesAdminPage.tsx",
  "src/views/admin/SmartCmsSection.tsx",
  "src/views/admin/CategoriesSection.tsx",
  "src/views/admin/learning-paths/LearningPathTreeEditor.tsx",
] as const;

for (const rel of targets) {
  const src = read(rel);
  assert.match(src, /from "@\/components\/ui\/button"/, rel);
  assert.doesNotMatch(src, /<button\b/, `raw button remains in ${rel}`);
  if (rel.includes("Categories") || rel.includes("LearningPath")) {
    assert.match(src, /useAdminConfirm/, rel);
    assert.doesNotMatch(src, /window\.confirm/, rel);
    assert.doesNotMatch(src, /(?<!await )(?<!\{)\bconfirm\(`/, rel);
  }
}

const review = read("src/admin-v3/domains/reviews/ReviewInboxPage.tsx");
// FINAL-2: status select replaced by official queue tablist
assert.match(review, /aria-label="طوابير المراجعة"/);
assert.match(review, /aria-label="النوع"/);
assert.match(review, /QUEUES|assigned_to_me/);

function collectTsx(dir: string, out: string[] = []): string[] {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) collectTsx(p, out);
    else if (ent.name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const adminV3 = collectTsx(resolve(majalisRoot, "src/admin-v3"));
for (const file of adminV3) {
  const src = readFileSync(file, "utf8");
  assert.doesNotMatch(src, /<button\b/, file);
  assert.doesNotMatch(src, /window\.confirm/, file);
}

const budget = JSON.parse(read("reports/interaction-system-debt-budget.json"));
assert.equal(budget.policy, "decreasing-ceilings");
assert.ok(budget.ceilings.rawButtonElements <= 700, `rawButtonElements ceiling ≤700 (got ${budget.ceilings.rawButtonElements})`);
assert.ok(budget.ceilings.rawButtonFiles <= 188, `rawButtonFiles ceiling ≤188 (got ${budget.ceilings.rawButtonFiles})`);

const main = read("src/main.tsx");
assert.doesNotMatch(main, /admin\.css|admin-v3-shell\.css|admin-shell\.css|admin-categories\.css/);

console.log(
  `closure-wave9-admin-interaction-gate.test.ts: ok (targets=${targets.length}, adminV3=${adminV3.length})`,
);
