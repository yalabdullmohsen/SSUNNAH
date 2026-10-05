/**
 * WAVE10 — Mushaf special controls semantic closure (UI only; no WAVE6 reopen).
 * node --import tsx src/lib/__tests__/closure-wave10-mushaf-controls-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

assert.ok(existsSync(resolve(repoRoot, "docs/mushaf/WAVE10_MUSHAF_CONTROL_SEMANTIC_CLOSURE_REPORT.md")));
const report = readRepo("docs/mushaf/WAVE10_MUSHAF_CONTROL_SEMANTIC_CLOSURE_REPORT.md");
assert.match(report, /MUSHAF_SPECIAL_KEEP|LEGACY_NOT_LIVE|USE_BUTTON/);
assert.match(report, /WAVE6/);
assert.match(report, /NewMushafReader|MushafControlsLayer/);

const live = [
  "src/features/mushaf-reader/MushafControlsLayer.tsx",
  "src/components/quran/QuranMiniPlayerBar.tsx",
  "src/features/mushaf-bookmarks/MushafPageBookmarkSheet.tsx",
  "src/features/mushaf-bookmarks/MushafBookmarkComposer.tsx",
  "src/features/mushaf-bookmarks/MushafBookmarkMarkers.tsx",
] as const;

for (const rel of live) {
  const src = read(rel);
  const buttons = [...src.matchAll(/<(?:button|Button)\b([^>]*)>([\s\S]*?)<\/(?:button|Button)>/g)];
  assert.ok(buttons.length >= 1, `expected controls in ${rel}`);
  for (const m of buttons) {
    const attrs = m[1];
    const body = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    assert.match(attrs, /\btype\s*=/, `missing type in ${rel}: ${attrs.slice(0, 60)}`);
    const named = /\baria-label\s*=/.test(attrs) || body.length >= 2;
    assert.ok(named, `unnamed control in ${rel}: ${attrs.slice(0, 80)}`);
  }
}

const mini = read("src/components/quran/QuranMiniPlayerBar.tsx");
assert.match(mini, /from "@\/components\/ui\/button"/);
assert.doesNotMatch(mini, /<button\b/);

const sheet = read("src/features/mushaf-bookmarks/MushafPageBookmarkSheet.tsx");
assert.match(sheet, /from "@\/components\/ui\/button"/);
assert.doesNotMatch(sheet, /<button\b/);

const composer = read("src/features/mushaf-bookmarks/MushafBookmarkComposer.tsx");
assert.match(composer, /from "@\/components\/ui\/button"/);
assert.doesNotMatch(composer, /<button\b/);

const controls = read("src/features/mushaf-reader/MushafControlsLayer.tsx");
assert.match(controls, /type="button"/);
assert.match(controls, /aria-label/);
// Chrome كان MUSHAF_SPECIAL_KEEP (raw مسموح). منذ mushaf-button-authority: Button رسمي + تكافؤ computed-style مُقاس
// (docs/audit/MUSHAF_BUTTON_AUTHORITY.md) — نفس العقد: أزرار مكتوبة النوع ومسمّاة، وCSS المصحف يملك المظهر.
assert.match(controls, /from "@\/components\/ui\/button"/);
assert.match(controls, /mushafButtonClass\(/);

const boundary = readRepo("docs/design/MUSHAF_CSS_BOUNDARY.md");
assert.match(boundary, /LIVE|مُباشر|NewMushafReader/);
assert.match(boundary, /ARCHIVED|مؤرشف|mushaf-madinah/);

// Do not reopen WAVE6 contracts
assert.doesNotMatch(controls, /pageTurnDeadlock|WAVE6_FLUIDITY/);
const reader = read("src/features/mushaf-reader/NewMushafReader.tsx");
assert.doesNotMatch(reader, /604\s*=\s*603|pageCount\s*=\s*600/);

console.log(`closure-wave10-mushaf-controls-gate.test.ts: ok (liveFiles=${live.length})`);
