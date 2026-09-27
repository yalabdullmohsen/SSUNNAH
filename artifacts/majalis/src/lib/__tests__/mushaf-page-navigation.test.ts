/**
 * تنقّل صفحات المصحف — وحدة مركزية (+1 التالية / −1 السابقة).
 * تشغيل: node --import tsx src/lib/__tests__/mushaf-page-navigation.test.ts
 */
import assert from "node:assert/strict";
import {
  canGoToNextMushafPage,
  canGoToPreviousMushafPage,
  goToMushafPageDelta,
  goToNextMushafPage,
  goToPreviousMushafPage,
  MUSHAF_NAV_LABEL,
  mushafEdgeTapPageDelta,
  mushafKeyboardPageDelta,
  mushafSwipePageDelta,
  resolveNextMushafPage,
  resolvePreviousMushafPage,
} from "@/features/mushaf-reader/mushaf-page-navigation";
import { MUSHAF_PAGE_MAX, MUSHAF_PAGE_MIN } from "@/lib/quran-last-page";

assert.equal(MUSHAF_NAV_LABEL.next, "الصفحة التالية");
assert.equal(MUSHAF_NAV_LABEL.previous, "الصفحة السابقة");

/* صفحة 1 */
assert.equal(resolvePreviousMushafPage(1), null);
assert.equal(resolveNextMushafPage(1), 2);
assert.equal(canGoToPreviousMushafPage(1), false);
assert.equal(canGoToNextMushafPage(1), true);

/* صفحة 2 */
assert.equal(resolvePreviousMushafPage(2), 1);
assert.equal(resolveNextMushafPage(2), 3);

/* وسط المصحف */
assert.equal(resolvePreviousMushafPage(300), 299);
assert.equal(resolveNextMushafPage(300), 301);
assert.equal(canGoToPreviousMushafPage(300), true);
assert.equal(canGoToNextMushafPage(300), true);

/* آخر صفحة */
assert.equal(resolveNextMushafPage(MUSHAF_PAGE_MAX), null);
assert.equal(resolvePreviousMushafPage(MUSHAF_PAGE_MAX), MUSHAF_PAGE_MAX - 1);
assert.equal(canGoToNextMushafPage(MUSHAF_PAGE_MAX), false);
assert.equal(canGoToPreviousMushafPage(MUSHAF_PAGE_MAX), true);

/* go helpers + حدود */
{
  const visited: number[] = [];
  const go = (n: number) => {
    visited.push(n);
  };
  assert.equal(goToPreviousMushafPage(MUSHAF_PAGE_MIN, go), false);
  assert.equal(goToNextMushafPage(MUSHAF_PAGE_MIN, go), true);
  assert.equal(goToNextMushafPage(MUSHAF_PAGE_MAX, go), false);
  assert.equal(goToPreviousMushafPage(MUSHAF_PAGE_MAX, go), true);
  assert.deepEqual(visited, [2, MUSHAF_PAGE_MAX - 1]);
  assert.equal(goToMushafPageDelta(50, 1, go), true);
  assert.equal(goToMushafPageDelta(50, -1, go), true);
  assert.equal(goToMushafPageDelta(50, 0, go), false);
  assert.deepEqual(visited.slice(2), [51, 49]);
}

/* سحب: يمين = التالية (يطابق لوحة next) */
assert.equal(mushafSwipePageDelta(40), 1);
assert.equal(mushafSwipePageDelta(-40), -1);
assert.equal(mushafSwipePageDelta(0), 0);

/* حافة الشاشة: يسار = التالية · يمين = السابقة */
assert.equal(mushafEdgeTapPageDelta(0.1), 1);
assert.equal(mushafEdgeTapPageDelta(0.9), -1);
assert.equal(mushafEdgeTapPageDelta(0.5), 0);

/* لوحة مفاتيح: يسار/PageDown = التالية · يمين/PageUp = السابقة */
assert.equal(mushafKeyboardPageDelta("ArrowLeft"), 1);
assert.equal(mushafKeyboardPageDelta("PageDown"), 1);
assert.equal(mushafKeyboardPageDelta("ArrowRight"), -1);
assert.equal(mushafKeyboardPageDelta("PageUp"), -1);
assert.equal(mushafKeyboardPageDelta("Enter"), 0);

console.log("mushaf-page-navigation.test.ts: ok");
