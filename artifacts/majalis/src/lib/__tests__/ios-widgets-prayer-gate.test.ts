/**
 * T-029 — IOS_WIDGETS_PRAYER_CERTIFIED
 * تشغيل: node --import tsx src/lib/__tests__/ios-widgets-prayer-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "../../..");
const repo = resolve(appRoot, "../..");
const iosApp = resolve(appRoot, "ios/App");
const APP_GROUP = "group.com.yousef.majlisilm";
const WIDGET_ID = "com.yousef.majlisilm.PrayerWidget";

const widgetDir = resolve(iosApp, "PrayerWidget");
assert.ok(existsSync(widgetDir), "PrayerWidget folder exists");

const files = {
  bundle: "PrayerWidgetBundle.swift",
  entry: "PrayerWidgetEntry.swift",
  views: "PrayerWidgetViews.swift",
  widget: "PrayerTimesWidget.swift",
  ent: "PrayerWidget.entitlements",
  info: "Info.plist",
};
for (const [k, name] of Object.entries(files)) {
  assert.ok(existsSync(resolve(widgetDir, name)), `${k}: ${name}`);
}

const widget = readFileSync(resolve(widgetDir, files.widget), "utf8");
const entry = readFileSync(resolve(widgetDir, files.entry), "utf8");
const views = readFileSync(resolve(widgetDir, files.views), "utf8");
const ent = readFileSync(resolve(widgetDir, files.ent), "utf8");
const pbx = readFileSync(resolve(iosApp, "App.xcodeproj/project.pbxproj"), "utf8");

assert.match(ent, new RegExp(APP_GROUP.replace(/\./g, "\\.")));
assert.match(pbx, new RegExp(WIDGET_ID.replace(/\./g, "\\.")));
assert.match(pbx, /PrayerWidgetExtension/);
assert.match(pbx, /PrayerWidgetExtension\.appex in Embed Foundation Extensions/);

const families = [
  ["Small", "systemSmall"],
  ["Medium", "systemMedium"],
  ["Large", "systemLarge"],
  ["Inline", "accessoryInline"],
  ["Circular", "accessoryCircular"],
  ["Rectangular", "accessoryRectangular"],
] as const;
for (const [, kind] of families) {
  assert.match(widget, new RegExp(kind));
}

assert.match(entry, /SunnahSharedStore\.loadPrayer/);
assert.doesNotMatch(entry, /URLSession|URLRequest/);
assert.match(entry, /www\.ssunnah\.com\/prayer-times/);
assert.match(views, /widgetURL/);
assert.match(views, /accessibilityLabel/);
assert.match(views, /layoutDirection/);
assert.match(views, /rightToLeft/);
assert.match(views, /SunnahBrandColors/);
assert.doesNotMatch(views + widget + entry, /Quran|QPC|Hisn|Fatwa|recitation|wird/i);

const report = readFileSync(resolve(repo, "docs/audit/IOS_WIDGETS_PRAYER_CERTIFICATION_REPORT.md"), "utf8");
assert.match(report, /IOS_WIDGETS_PRAYER_CERTIFIED/);
for (const [label] of families) {
  assert.match(report, new RegExp(`${label}.*PASS|PASS.*${label}`, "i"));
}

assert.ok(!existsSync(resolve(iosApp, "SunnahWatch")), "Watch not started in T-029");

console.log("ios-widgets-prayer-gate.test.ts: ok", {
  appGroup: APP_GROUP,
  widgetId: WIDGET_ID,
  families: families.map(([l]) => l),
});
