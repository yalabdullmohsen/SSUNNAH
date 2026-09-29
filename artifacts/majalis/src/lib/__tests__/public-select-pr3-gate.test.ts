/**
 * Final Internal Closure PR3 — public select MIGRATE_NOW wave.
 * node --import tsx src/lib/__tests__/public-select-pr3-gate.test.ts
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const src = resolve(root, "src");
const repoRoot = resolve(root, "../..");

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (p.endsWith(".tsx")) acc.push(p);
  }
  return acc;
}

const migrated = [
  "src/pages/quran/ui/QuranCirclesView.tsx",
  "src/pages/quran/ui/MushafBookmarksView.tsx",
];

for (const rel of migrated) {
  const text = readFileSync(resolve(root, rel), "utf8");
  assert.doesNotMatch(text, /<select[\s>]/, `${rel}: لا native select`);
  assert.match(text, /from ["']@\/components\/ui\/select["']/, `${rel}: Select`);
  assert.match(text, /FieldLabel/, `${rel}: FieldLabel`);
  assert.match(text, /min-h-11 text-base/, `${rel}: min-h-11 text-base`);
}

let publicNative = 0;
for (const file of walk(src)) {
  const rel = relative(src, file).replace(/\\/g, "/");
  if (/(^|\/)admin(-v3)?(\/|$)/.test(rel)) continue;
  if (/<select[\s>]/.test(readFileSync(file, "utf8"))) publicNative += 1;
}

assert.ok(publicNative <= 14, `public native ≤ post-PR1 14 (got ${publicNative})`);
assert.ok(publicNative <= 12, `public native ≤ post-PR3 12 (got ${publicNative})`);

const report = readFileSync(resolve(repoRoot, "docs/design/PUBLIC_SELECT_CLOSURE_REPORT.md"), "utf8");
assert.match(report, /## CLASSIFICATION/);
assert.match(report, /MIGRATE_NOW → done \(PR3\)/);
assert.match(report, /Post-PR3 measured/);

console.log(`public-select-pr3-gate.test.ts: ok (publicNative=${publicNative})`);
