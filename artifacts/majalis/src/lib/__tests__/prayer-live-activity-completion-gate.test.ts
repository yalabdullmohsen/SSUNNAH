/**
 * T-031 — PRAYER_LIVE_ACTIVITY_CERTIFIED
 * تشغيل: node --import tsx src/lib/__tests__/prayer-live-activity-completion-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "../../..");
const repo = resolve(appRoot, "../..");
const iosApp = resolve(appRoot, "ios/App");

const attrs = readFileSync(resolve(iosApp, "App/PrayerActivityAttributes.swift"), "utf8");
assert.match(attrs, /enum PrayerLivePhase/);
assert.match(attrs, /case upcoming/);
assert.match(attrs, /case active/);
assert.match(attrs, /case completed/);
assert.match(attrs, /case appLaunch/);

const ui = readFileSync(resolve(iosApp, "PrayerLiveActivity/PrayerLiveActivityLiveActivity.swift"), "utf8");
assert.match(ui, /compactLeading/);
assert.match(ui, /compactTrailing/);
assert.match(ui, /minimal:/);
assert.match(ui, /DynamicIslandExpandedRegion/);
assert.match(ui, /SunnahPrayerDeepLink\.prayerTimes/);
assert.match(ui, /widgetURL/);
assert.match(ui, /accessibilityLabel/);
assert.match(ui, /rightToLeft/);
assert.match(ui, /SunnahBrandColors|typealias Brand = SunnahBrandColors/);
assert.match(ui, /\.upcoming|\.active|\.completed|\.appLaunch/);
assert.doesNotMatch(ui, /Quran|QPC|Hisn|Fatwa|recitation/i);

const plugin = readFileSync(resolve(iosApp, "App/PrayerLiveActivityPlugin.swift"), "utf8");
assert.match(plugin, /syncFromSharedSnapshot/);
assert.match(plugin, /SunnahSharedStore/);
assert.match(plugin, /PrayerLivePhase/);
assert.doesNotMatch(plugin, /URLSession/);

const js = readFileSync(resolve(appRoot, "src/lib/plugins/prayer-live-activity.ts"), "utf8");
assert.match(js, /markPrayerLiveActivityCompleted/);
assert.match(js, /presentPrayerLiveActivityAppLaunch/);
assert.match(js, /syncPrayerLiveActivityFromAppGroup/);

const scheduler = readFileSync(resolve(appRoot, "src/lib/prayer-alert-scheduler.ts"), "utf8");
assert.match(scheduler, /markPrayerLiveActivityCompleted/);
assert.match(scheduler, /presentPrayerLiveActivityAppLaunch/);
assert.match(scheduler, /phase:\s*"upcoming"/);

const deep = readFileSync(resolve(iosApp, "Shared/SunnahPrayerDeepLink.swift"), "utf8");
assert.match(deep, /www\.ssunnah\.com\/prayer-times/);

const pbx = readFileSync(resolve(iosApp, "App.xcodeproj/project.pbxproj"), "utf8");
assert.match(pbx, /SunnahPrayerDeepLink\.swift in Sources/);

const report = readFileSync(resolve(repo, "docs/audit/PRAYER_LIVE_ACTIVITY_CERTIFICATION_REPORT.md"), "utf8");
assert.match(report, /PRAYER_LIVE_ACTIVITY_CERTIFIED/);
for (const label of ["Upcoming PASS", "Active PASS", "Completed PASS", "Dynamic Island PASS", "Deep Link PASS"]) {
  assert.match(report, new RegExp(label.replace(/ /g, "\\s+")));
}

assert.ok(existsSync(resolve(iosApp, "PrayerLiveActivity")), "LA extension present");
assert.ok(!existsSync(resolve(iosApp, "SunnahWatch")), "Watch not started by T-031");

console.log("prayer-live-activity-completion-gate.test.ts: ok");
