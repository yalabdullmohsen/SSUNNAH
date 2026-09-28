/**
 * بوابة هرمية قراءة المصحف — شريط ثلاثي + المزيد + Mini Player.
 * Run: node --import tsx src/lib/__tests__/mushaf-reading-chrome-declutter-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const controls = read("src/features/mushaf-reader/MushafControlsLayer.tsx");
const reader = read("src/features/mushaf-reader/NewMushafReader.tsx");
const css = read("src/features/mushaf-reader/mushaf-reader.css");
const dock = read("src/features/mushaf-madinah/MushafAudioDock.tsx");
const audioChrome = read("src/styles/components/quran-audio-chrome.css");
const prefetch = read("src/lib/prefetch-route.ts");

console.log("=== Top bar triad only ===");
assert.match(controls, /nm-controls__exit/);
assert.match(controls, /mushaf-goto-page-btn/);
assert.match(controls, /mushaf-controls-more/);
assert.match(controls, /aria-hidden="true">\s*⋯\s*</);
assert.doesNotMatch(controls, /nm-controls__actions/);
assert.doesNotMatch(controls, />\s*بحث\s*</);
assert.doesNotMatch(controls, />\s*فهرس\s*</);
assert.doesNotMatch(controls, />\s*تشغيل\s*</);
assert.doesNotMatch(controls, />\s*علامة\s*</);
assert.doesNotMatch(controls, />\s*قراءة\s*</);

console.log("=== More menu a11y ===");
assert.match(controls, /mushaf-controls-more-scrim/);
assert.match(controls, /morePanelId/);
assert.match(controls, /Escape/);
assert.match(css, /nm-controls-more__scrim/);

console.log("=== More menu capabilities ===");
for (const label of [
  "الفهرس",
  "البحث",
  "العلامات",
  "التلاوة",
  "التفسير",
  "الملاحظات",
  "مشاركة الصفحة",
  "نسخ الرابط",
  "إعدادات المصحف",
]) {
  assert.match(controls, new RegExp(label));
}

console.log("=== Reader wiring ===");
assert.match(reader, /onTafsir=\{onControlsTafsir\}/);
assert.match(reader, /onNotes=\{onControlsNotes\}/);
assert.match(reader, /onSharePage=\{onControlsSharePage\}/);
assert.match(reader, /onCopyLink=\{onControlsCopyLink\}/);
assert.match(reader, /onPlayPage=\{onControlsPlayPage\}/);

console.log("=== Manuscript highlight + reading palette ===");
assert.match(css, /--mushaf-reading-bg:\s*#FCFBF7/);
assert.match(css, /--mushaf-reading-surface:\s*#FFFDF9/);
assert.match(css, /--mushaf-reading-gold:\s*#B8942E/);
assert.match(css, /--mushaf-reading-gold-deep:\s*#8F6D17/);
assert.match(css, /--mushaf-reading-gold-soft:\s*#E4DAB6/);
assert.match(css, /\.nm-ayah-sel__band--selected[\s\S]*#E4DAB6/);
assert.match(css, /\.nm-controls--compact \.nm-controls__page[\s\S]*mushaf-reading-gold/);

console.log("=== Reading chrome palette (no brand-green dock) ===");
assert.doesNotMatch(css, /\.nm-root \.mm-audio-dock[\s\S]{0,400}--mj-brand/);
assert.match(css, /mushaf-reading-surface/);

console.log("=== Audio mini + sheet (not route) ===");
assert.match(dock, /data-mini/);
assert.match(dock, /mushaf-dock-sheet-open/);
assert.match(dock, /data-section="progress"/);
assert.match(dock, /data-section="transport"/);
assert.match(dock, /data-section="practice"/);
assert.doesNotMatch(dock, /<details[\s\S]*mm-audio-dock__advanced/);
assert.match(audioChrome, /safe-bottom|inset-bottom/);

console.log("=== No Home mushaf warm ===");
const warmBlock = prefetch.slice(prefetch.indexOf("HOME_WARM_ROUTES"));
assert.doesNotMatch(warmBlock, /^\s*"\/mushaf"\s*,/m);
assert.match(prefetch, /لا تُسخَّن \/mushaf من الرئيسية/);

console.log("mushaf-reading-chrome-declutter-gate.test.ts: ok");
