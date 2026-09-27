/**
 * بوابة اتجاه تصفح المصحف (ورقي — جهة التقليب يساراً).
 * تشغيل: node --import tsx src/lib/__tests__/mushaf-page-direction-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const pagerHook = read("src/features/mushaf-reader/useMushafPager.ts");
const pager = pagerHook + read("src/features/mushaf-reader/MushafPager.tsx");
const nav = read("src/features/mushaf-reader/mushaf-page-navigation.ts");
const controls = read("src/features/mushaf-madinah/MushafControls.tsx");
const css = read("src/features/mushaf-madinah/mushaf-madinah.css");
const readerCss = read("src/features/mushaf-reader/mushaf-reader.css");
const reader = read("src/features/mushaf-madinah/VerifiedMushafReader.tsx");

assert.match(nav, /goToNextMushafPage/);
assert.match(nav, /goToPreviousMushafPage/);
assert.match(nav, /mushafSwipePageDelta/);
assert.match(nav, /mushafKeyboardPageDelta/);
assert.match(nav, /mushafEdgeTapPageDelta/);
assert.match(nav, /ArrowLeft.*\n.*return 1|ArrowLeft" \|\| key === "PageDown"\) return 1/);
assert.match(nav, /ArrowRight.*\n.*return -1|ArrowRight" \|\| key === "PageUp"\) return -1/);

assert.match(pagerHook, /mushafSwipePageDelta/);
assert.match(pagerHook, /mushafKeyboardPageDelta/);
assert.match(pagerHook, /mushafEdgeTapPageDelta/);
assert.match(pagerHook, /goToMushafPageDelta/);
assert.match(pager, /dx > 0|mushafSwipePageDelta\(dx\)/, "سحب لليمين = التالية");
assert.match(pager, /data-pane="next"/);
assert.match(pager, /data-pane="prev"/);
assert.match(pager, /mm-page-edge--next/);
assert.match(pager, /mm-page-edge--prev/);
assert.match(pager, /goToNextMushafPage/);
assert.match(pager, /goToPreviousMushafPage/);
assert.match(pager, /dir="rtl"|translate3d/, "تقليب عبر translate3d");

assert.match(controls, /onNext/);
assert.match(controls, /onPrev/);
assert.match(controls, /onGoto/);
assert.match(controls, /MUSHAF_NAV_LABEL/);
assert.match(reader, /dir="rtl"/);
assert.match(reader, /goToNextMushafPage/);
assert.match(reader, /goToPreviousMushafPage/);

/* التالية يسار الشاشة (inline-end في RTL) */
assert.match(css, /\.mm-page-edge--next\s*\{[^}]*inset-inline-end:\s*0/s);
assert.match(css, /\.mm-page-edge--prev\s*\{[^}]*inset-inline-start:\s*0/s);
assert.match(readerCss, /\.nm-page-arrow--next[\s\S]*inset-inline-end/);
assert.match(readerCss, /\.nm-page-arrow--prev[\s\S]*inset-inline-start/);
assert.doesNotMatch(pager, /rotateY|perspective\(/);

console.log("mushaf-page-direction-gate.test.ts: ok");
