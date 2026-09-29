/**
 * Final Internal Closure PR5 — forms & feedback wave.
 * node --import tsx src/lib/__tests__/closure-pr5-forms-feedback-gate.test.ts
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const src = resolve(majalisRoot, "src");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (p.endsWith(".tsx")) acc.push(p);
  }
  return acc;
}

const settings = read("src/pages/account/ui/SettingsView.tsx");
assert.match(settings, /FieldLabel/);
assert.match(settings, /from ["']@\/components\/ui\/select["']/);
assert.doesNotMatch(settings, /name="interface-font-size"[\s\S]{0,40}<select/);
assert.match(settings, /interface-font-size/);
assert.match(settings, /settings-playback-rate/);
assert.match(settings, /settings-quran-font/);
assert.match(settings, /<select[\s>]/, "reciter/tafsir natives remain justified");

const login = read("src/pages/account/ui/LoginView.tsx");
assert.match(login, /from ["']@\/components\/ui\/input["']/);
assert.match(login, /min-h-11 text-base/);
assert.match(login, /aria-describedby/);
assert.doesNotMatch(login, /window\.confirm/);

const search = read("src/pages/account/ui/SearchView.tsx");
assert.match(search, /STATUS\.loadError/);
assert.doesNotMatch(search, /setError\(msg\)/);
assert.match(search, /تعذّر تحديث النتائج/);

const bookmarks = read("src/pages/quran/ui/MushafBookmarksView.tsx");
assert.match(bookmarks, /FieldError/);
assert.doesNotMatch(bookmarks, /window\.alert/);

for (const rel of [
  "src/pages/worship/ui/TasbihView.tsx",
  "src/components/reading/TasbeehCounter.tsx",
  "src/pages/hadith/ui/ArbaeenNawawiView.tsx",
] as const) {
  const text = read(rel);
  assert.doesNotMatch(text, /window\.confirm/, `${rel}: لا window.confirm`);
  assert.match(text, /alertdialog/, `${rel}: alertdialog`);
}

let publicNative = 0;
for (const file of walk(src)) {
  const rel = relative(src, file).replace(/\\/g, "/");
  if (/(^|\/)admin(-v3)?(\/|$)/.test(rel)) continue;
  if (/<select[\s>]/.test(readFileSync(file, "utf8"))) publicNative += 1;
}
assert.ok(publicNative <= 12, `public native ≤ 12 (got ${publicNative})`);

const report = readRepo("docs/design/PR5_FORMS_FEEDBACK_CLOSURE_REPORT.md");
assert.match(report, /## Native Select CLASSIFICATION/);
assert.match(report, /MIGRATE_NOW → done/);
assert.match(report, /publicNative files = 12/);

const selectReport = readRepo("docs/design/PUBLIC_SELECT_CLOSURE_REPORT.md");
assert.match(selectReport, /PR5 \(forms wave\)/);

console.log(`closure-pr5-forms-feedback-gate.test.ts: ok (publicNative=${publicNative})`);
