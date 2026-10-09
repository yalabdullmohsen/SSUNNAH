import assert from "node:assert/strict";
import {
  WIDGET_CENTER_CATALOG,
  WIDGET_CHOOSE_PLACEHOLDER_AR,
  resolveWidgetCatalogItem,
  widgetKindLabelAr,
} from "../widget-data/catalog";

assert.equal(WIDGET_CENTER_CATALOG.length, 9, "الكتالوج = 9 ودجات");
assert.equal(new Set(WIDGET_CENTER_CATALOG.map((i) => i.kind)).size, 9, "أنواع فريدة");

for (const item of WIDGET_CENTER_CATALOG) assert.equal(widgetKindLabelAr(item.kind), item.nameAr);

// ودجات محذوفة / مجهولة / قيم تالفة: «اختر ودجة» دون رمي
for (const bad of ["sunnah.widget.removed.old", "", "PrayerTimesWidget ", null, undefined, 0, {}, [], NaN]) {
  assert.doesNotThrow(() => widgetKindLabelAr(bad));
  assert.equal(resolveWidgetCatalogItem(bad), null);
  assert.equal(widgetKindLabelAr(bad), WIDGET_CHOOSE_PLACEHOLDER_AR);
}
assert.equal(WIDGET_CHOOSE_PLACEHOLDER_AR, "اختر ودجة");
console.log("ios-widget-unknown-kind-fallback OK");
