/**
 * Final Internal Closure PR1 — public select migrations + ceiling.
 * node --import tsx src/lib/__tests__/public-select-pr1-gate.test.ts
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const src = resolve(root, "src");

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (p.endsWith(".tsx")) acc.push(p);
  }
  return acc;
}

const migrated = [
  "src/components/notifications/SunnahChannelsPanel.tsx",
  "src/pages/quran/ui/QuranPeopleView.tsx",
];

for (const rel of migrated) {
  const text = readFileSync(resolve(root, rel), "utf8");
  assert.doesNotMatch(text, /<select[\s>]/, `${rel}: لا native select`);
  assert.match(text, /from ["']@\/components\/ui\/select["']/, `${rel}: يستورد Select`);
  assert.match(text, /FieldLabel/, `${rel}: FieldLabel`);
  assert.match(text, /min-h-11 text-base/, `${rel}: min-h-11 text-base`);
}

let publicNative = 0;
for (const file of walk(src)) {
  const rel = relative(src, file).replace(/\\/g, "/");
  if (/(^|\/)admin(-v3)?(\/|$)/.test(rel)) continue;
  const text = readFileSync(file, "utf8");
  if (/<select[\s>]/.test(text)) publicNative += 1;
}

assert.ok(publicNative <= 16, `public native select files ${publicNative} ≤ ceiling 16`);
assert.ok(publicNative <= 14, `public native select files ${publicNative} ≤ post-PR1 14`);

const report = readFileSync(
  resolve(root, "../../docs/design/PUBLIC_SELECT_FINALIZATION_REPORT.md"),
  "utf8",
);
assert.match(report, /MIGRATE_NOW → done \(PR1\)/);
assert.match(report, /Post-PR1 measured public native file count/);

console.log(`public-select-pr1-gate.test.ts: ok (publicNative=${publicNative})`);
