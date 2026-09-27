/**
 * بوابة أسهم التقليب + وضع القراءة الكامل.
 * تشغيل: node --import tsx src/lib/__tests__/mushaf-page-arrows-focus-mode-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const reader = read("src/features/mushaf-reader/NewMushafReader.tsx");
const arrows = read("src/features/mushaf-reader/MushafPageArrows.tsx");
const controls = read("src/features/mushaf-reader/MushafControlsLayer.tsx");
const css = read("src/features/mushaf-reader/mushaf-reader.css");
const prefs = read("src/features/mushaf-reader/mushaf-page-arrows-prefs.ts");
const pager = read("src/features/mushaf-reader/MushafPager.tsx");
const nav = read("src/features/mushaf-reader/mushaf-page-navigation.ts");

assert.match(arrows, /nm-page-arrow--next/);
assert.match(arrows, /nm-page-arrow--prev/);
assert.match(arrows, /MUSHAF_NAV_LABEL\.next|aria-label=\{MUSHAF_NAV_LABEL\.next\}/);
assert.match(arrows, /MUSHAF_NAV_LABEL\.previous|aria-label=\{MUSHAF_NAV_LABEL\.previous\}/);
assert.match(arrows, /canGoToPreviousMushafPage|goToPreviousMushafPage/);
assert.match(arrows, /canGoToNextMushafPage|goToNextMushafPage/);
assert.match(arrows, /guardRef|runOnce/);
assert.match(arrows, /nm-page-arrow__label/);
assert.doesNotMatch(arrows, /navigator\.vibrate|Haptics|ImpactFeedback/);

assert.match(nav, /الصفحة التالية/);
assert.match(nav, /الصفحة السابقة/);

/* مصحف: التالية يسار (inline-end) · السابقة يمين (inline-start) */
assert.match(css, /\.nm-page-arrow--next[\s\S]*inset-inline-end/);
assert.match(css, /\.nm-page-arrow--prev[\s\S]*inset-inline-start/);
assert.match(css, /\.nm-page-arrow__label/);
assert.match(css, /\.nm-page-arrows\[data-visible="1"\] \.nm-page-arrow:disabled/);
assert.match(css, /\.nm-controls--compact/);
assert.match(css, /data-focus-reading/);
/* معطّل ظاهر — لا إخفاء عند الحدود */
assert.doesNotMatch(
  css,
  /\.nm-page-arrow:disabled\s*\{\s*opacity:\s*0;\s*visibility:\s*hidden/,
);

assert.match(reader, /MushafPageArrows/);
assert.match(reader, /focusReadingMode/);
assert.match(reader, /pageArrowsEnabled/);
assert.match(reader, /if \(pageTurnLockRef\.current\) return/);
assert.match(reader, /pageTurnLockRef\.current && pendingPageRef\.current != null/);
assert.match(reader, /data-focus-reading=\{focusReadingMode/);
assert.match(reader, /focusReadingModeRef\.current/);
assert.match(reader, /go=\{\(n\) => \{[\s\S]*go\(n\)/);
assert.match(reader, /<MushafPageArrows[\s\S]*?busy=\{edgesDisabled \|\| !pagerSettled\}[\s\S]*?\/>/);
/* الأسهم لا تُخفى بمجرد إخفاء Chrome — التفعيل مستقل */
assert.match(
  reader,
  /<MushafPageArrows[\s\S]*?visible=\{\s*!actionsOpen &&\s*!gotoOpen &&\s*!tafsirOpen &&\s*!searchOpen &&\s*!indexOpen &&\s*!controlsMoreOpen\s*\}/,
);
assert.doesNotMatch(
  reader,
  /<MushafPageArrows[\s\S]*?visible=\{chromeOpen &&/,
);
assert.doesNotMatch(reader, /navigator\.vibrate/);
assert.match(arrows, /\bbusy\b/);
assert.doesNotMatch(arrows, /disabled=\{disabled/);
assert.match(arrows, /if \(!enabled\) return null/);
assert.match(controls, /mushaf-focus-reading-toggle/);
assert.match(controls, /nm-controls--compact/);
assert.match(controls, /إخفاء أدوات المصحف|وضع القراءة|قراءة/);
assert.match(controls, /إظهار أسهم تقليب الصفحات/);
assert.match(controls, /mushaf-page-arrows-toggle/);
assert.match(controls, /MUSHAF_NAV_LABEL/);

assert.match(prefs, /sunnah\.mushaf\.pageArrowsEnabled/);
assert.match(prefs, /loadPageArrowsEnabled/);
assert.match(prefs, /savePageArrowsEnabled/);
assert.match(prefs, /saveFocusReadingModePreference/);

assert.match(reader, /onPageArrowsEnabledChange|savePageArrowsEnabled/);
assert.match(reader, /data-page-arrows=\{pageArrowsEnabled/);
assert.match(pager, /nm-page-arrows/);
assert.match(pager, /goToNextMushafPage/);
assert.match(pager, /goToPreviousMushafPage/);

/* Chrome=0 لا يخفي الأسهم عند data-page-arrows=1 */
assert.match(css, /data-chrome="0"\]:not\(\[data-page-arrows="1"\]\) \.nm-page-arrows/);
const chromeCss = read("src/styles/reader-page-chrome.css");
assert.match(chromeCss, /data-chrome="0"\]:not\(\[data-page-arrows="1"\]\) \.nm-page-arrows/);
assert.match(chromeCss, /\.nm-page-arrow:disabled[\s\S]*visibility:\s*visible/);

assert.doesNotMatch(arrows, /MushafPage\.tsx|nm-line|fontSize|lineHeight/);
assert.doesNotMatch(reader, /--mushaf-font-size:\s*(?!24px)/);

console.log("mushaf-page-arrows-focus-mode-gate.test.ts: ok");
