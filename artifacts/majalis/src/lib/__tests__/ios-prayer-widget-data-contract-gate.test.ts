/**
 * IOS_PRAYER_WIDGET_DATA_CONTRACT_GATE
 * تشغيل: node --import tsx src/lib/__tests__/ios-prayer-widget-data-contract-gate.test.ts
 *
 * يفشل عند:
 * - انجراف مفاتيح الكاتب/القارئ
 * - انجراف App Group
 * - انجراف مخطط اللقطة
 * - انجراف kind إعادة التحميل
 * - فيكشر صالح → نموذج شرطة فقط
 * - تكرار محرك حساب الصلاة داخل ويدجت
 * - غياب App Group من entitlements الـ Release
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildSharedPrayerSnapshotPayload,
  SUNNAH_PRAYER_SNAPSHOT_KEY,
  SUNNAH_PRAYER_SNAPSHOT_SCHEMA_VERSION,
  SUNNAH_PRAYER_WIDGET_KIND,
} from "../plugins/sunnah-shared-prayer-publish";
import { SUNNAH_APP_GROUP_ID } from "../plugins/sunnah-shared-data";
import type { PrayerTimesPayload } from "../prayer-times";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "../../..");
const iosApp = resolve(appRoot, "ios/App");
const APP_GROUP = "group.com.yousef.majlisilm";
const WIDGET_KIND = "PrayerTimesWidget";
const SNAPSHOT_KEY = "sunnah.shared.prayer.v1";

function read(rel: string): string {
  return readFileSync(resolve(iosApp, rel), "utf8");
}

// ── App Group identity ──────────────────────────────────────────
assert.equal(SUNNAH_APP_GROUP_ID, APP_GROUP);
assert.equal(SUNNAH_PRAYER_WIDGET_KIND, WIDGET_KIND);
assert.equal(SUNNAH_PRAYER_SNAPSHOT_KEY, SNAPSHOT_KEY);
assert.equal(SUNNAH_PRAYER_SNAPSHOT_SCHEMA_VERSION, 1);

const sharedSwift = read("Shared/SunnahSharedData.swift");
assert.match(sharedSwift, new RegExp(APP_GROUP.replace(/\./g, "\\.")));
assert.match(sharedSwift, /static let prayerSnapshot = "sunnah\.shared\.prayer\.v1"/);
assert.match(sharedSwift, /static let currentSchema = 1/);
assert.match(sharedSwift, /static let prayerTimes = "PrayerTimesWidget"/);
assert.match(sharedSwift, /defaults\.synchronize\(\)/);

for (const ent of [
  "App/App.debug.entitlements",
  "App/App.release.entitlements",
  "App/App.entitlements",
  "PrayerWidget/PrayerWidget.entitlements",
  "PrayerLiveActivity/PrayerLiveActivity.entitlements",
]) {
  const xml = read(ent);
  const groups = [...xml.matchAll(/group\.[a-z0-9.]+/gi)].map((m) => m[0]);
  assert.ok(groups.includes(APP_GROUP), `${ent} missing canonical App Group`);
  assert.equal(
    groups.filter((g) => g !== APP_GROUP).length,
    0,
    `${ent} has unexpected App Group`,
  );
}

// ── Shared payload field contract (writer ↔ reader) ─────────────
const requiredFields = [
  "schemaVersion",
  "locationLabel",
  "timeZoneIdentifier",
  "dayKey",
  "timesEpochMs",
  "nextPrayerKey",
  "nextPrayerNameAr",
  "nextPrayerEpochMs",
  "nextHasStarted",
  "updatedAtEpochMs",
];
for (const field of requiredFields) {
  assert.match(sharedSwift, new RegExp(`\\b${field}\\b`));
}

const pluginSwift = read("App/SunnahSharedDataPlugin.swift");
assert.match(pluginSwift, /publishPrayerSnapshot/);
assert.match(
  pluginSwift,
  /WidgetCenter\.shared\.reloadTimelines\(ofKind:\s*SunnahWidgetKind\.prayerTimes\)/,
);
assert.doesNotMatch(pluginSwift, /reloadAllTimelines/);
assert.match(pluginSwift, /suiteAvailable/);

const pluginTs = readFileSync(resolve(appRoot, "src/lib/plugins/sunnah-shared-data.ts"), "utf8");
for (const field of [
  "locationLabel",
  "timeZoneIdentifier",
  "dayKey",
  "timesEpochMs",
  "nextPrayerKey",
  "nextPrayerNameAr",
  "nextPrayerEpochMs",
  "nextHasStarted",
]) {
  assert.match(pluginTs, new RegExp(field));
}

// ── Publication reliability ─────────────────────────────────────
const scheduler = readFileSync(resolve(appRoot, "src/lib/prayer-alert-scheduler.ts"), "utf8");
assert.match(scheduler, /publishPrayerSnapshotForWidgets/);
// Must publish before alert-enabled early return / notification throw path.
const publishIdx = scheduler.indexOf("publishPrayerSnapshotForWidgets");
const enabledEarlyReturn = scheduler.indexOf("const enabledSlots");
assert.ok(publishIdx > 0, "publish helper called from scheduler");
assert.ok(publishIdx < enabledEarlyReturn, "publish must run before enabledSlots gate");

const publishHelper = readFileSync(
  resolve(appRoot, "src/lib/plugins/sunnah-shared-prayer-publish.ts"),
  "utf8",
);
assert.doesNotMatch(publishHelper, /prayerEnabled|loadPrayerAlertPrefs/);
assert.match(publishHelper, /SUNNAH_PRAYER_WIDGET_KIND/);

// ── Widget reads shared store only — no prayer engine ───────────
const entry = read("PrayerWidget/PrayerWidgetEntry.swift");
const views = read("PrayerWidget/PrayerWidgetViews.swift");
const widget = read("PrayerWidget/PrayerTimesWidget.swift");
assert.match(entry, /SunnahSharedStore\.loadPrayer/);
assert.match(entry, /context\.isPreview/);
assert.match(entry, /PrayerWidgetDataState/);
assert.match(entry, /needsAppOpenAction/);
assert.match(widget, /SunnahWidgetKind\.prayerTimes/);
assert.doesNotMatch(
  entry + views + widget,
  /AdhanCalculation|CalculationMethod|Coordinates\(|PrayerTimes\(/,
);
assert.doesNotMatch(entry + views + widget, /URLSession|URLRequest/);

// Actionable empty states (no permanent unexplained dash-only for NO_DATA)
assert.match(views, /افتح سُنّة|افتح تطبيق سُنّة/);
assert.match(views, /needsAppOpenAction/);

// Placeholder must include representative times (not empty map implying live dash)
assert.match(entry, /"fajr":\s*at\(/);
assert.match(entry, /locationLabel:\s*"معاينة"/);

// ── Pure payload builder: valid / transitions / no dash model ───
function fixturePayload(overrides?: Partial<PrayerTimesPayload>): PrayerTimesPayload {
  return {
    ok: true,
    city: "الكويت",
    timezone: "Asia/Kuwait",
    method: "test",
    source: "test",
    date: { gregorian: "2026-06-15", hijri: null, readable: null },
    prayers: [
      { key: "Fajr", name: "الفجر", obligatory: true, time24: "04:00", time: "4:00", minutes: 240 },
      { key: "Sunrise", name: "الشروق", obligatory: false, time24: "05:20", time: "5:20", minutes: 320 },
      { key: "Dhuhr", name: "الظهر", obligatory: true, time24: "11:50", time: "11:50", minutes: 710 },
      { key: "Asr", name: "العصر", obligatory: true, time24: "15:20", time: "15:20", minutes: 920 },
      { key: "Maghrib", name: "المغرب", obligatory: true, time24: "18:40", time: "18:40", minutes: 1120 },
      { key: "Isha", name: "العشاء", obligatory: true, time24: "20:00", time: "20:00", minutes: 1200 },
    ],
    fetchedAt: new Date().toISOString(),
    ...overrides,
  };
}

/** Fixed noon Kuwait on a known day — before Asr. */
function kuwaitEpoch(y: number, m: number, d: number, hour: number, minute: number): number {
  // Asia/Kuwait = UTC+3
  return Date.UTC(y, m - 1, d, hour - 3, minute, 0);
}

const beforeAsr = kuwaitEpoch(2026, 6, 15, 14, 0);
const valid = buildSharedPrayerSnapshotPayload(fixturePayload(), beforeAsr);
assert.equal(Object.keys(valid.timesEpochMs).sort().join(","), "asr,dhuhr,fajr,isha,maghrib,sunrise");
assert.equal(valid.nextPrayerKey, "asr");
assert.equal(valid.nextPrayerNameAr, "العصر");
assert.ok(typeof valid.nextPrayerEpochMs === "number" && valid.nextPrayerEpochMs > beforeAsr);
assert.equal(valid.nextHasStarted, false);
assert.ok(valid.dayKey.length >= 8);
assert.ok(valid.locationLabel.length > 0);
// Valid fixture must not be dash-only model
assert.ok(valid.nextPrayerNameAr && valid.nextPrayerNameAr !== "—");
assert.ok(valid.nextPrayerEpochMs != null);

const beforeFajr = kuwaitEpoch(2026, 6, 15, 3, 0);
const fajrNext = buildSharedPrayerSnapshotPayload(fixturePayload(), beforeFajr);
assert.equal(fajrNext.nextPrayerKey, "fajr");

const atDhuhr = kuwaitEpoch(2026, 6, 15, 11, 50);
const afterDhuhr = buildSharedPrayerSnapshotPayload(fixturePayload(), atDhuhr + 1);
assert.equal(afterDhuhr.nextPrayerKey, "asr");

const afterIsha = kuwaitEpoch(2026, 6, 15, 21, 0);
const wrap = buildSharedPrayerSnapshotPayload(fixturePayload(), afterIsha);
assert.equal(wrap.nextPrayerKey, "fajr");
assert.ok((wrap.nextPrayerEpochMs ?? 0) > afterIsha);
// Today's map still has all five — no tomorrow overwrite
assert.ok((wrap.timesEpochMs.fajr ?? 0) < afterIsha);
assert.ok("sunrise" in wrap.timesEpochMs || Object.keys(wrap.timesEpochMs).length >= 5);

const absentTimes = buildSharedPrayerSnapshotPayload(
  fixturePayload({
    prayers: [{ key: "Fajr", name: "الفجر", obligatory: true, time24: "", time: "", minutes: null }],
  }),
  beforeAsr,
);
assert.equal(Object.keys(absentTimes.timesEpochMs).length, 0);
assert.equal(absentTimes.nextPrayerKey, undefined);

// Encode/decode round-trip agreement (JSON, numeric epoch ms — matches Swift Codable defaults)
const encoded = JSON.stringify({
  schemaVersion: SUNNAH_PRAYER_SNAPSHOT_SCHEMA_VERSION,
  ...valid,
  updatedAtEpochMs: beforeAsr,
});
const decoded = JSON.parse(encoded) as Record<string, unknown>;
assert.equal(decoded.schemaVersion, 1);
assert.equal(typeof decoded.timesEpochMs, "object");
assert.equal(typeof decoded.nextPrayerEpochMs, "number");
assert.equal(decoded.timeZoneIdentifier, "Asia/Kuwait");

// Previous schema accepted at schemaVersion literal 1 only in SoT
assert.match(sharedSwift, /static let currentSchema = 1/);
assert.match(sharedSwift, /case staleData/);
assert.match(sharedSwift, /case noDataYet/);
assert.match(sharedSwift, /case malformedData/);
assert.match(sharedSwift, /case validData/);
assert.match(sharedSwift, /case appOpenRequired/);

// pbx: Shared file in Widget target
const pbx = read("App.xcodeproj/project.pbxproj");
assert.match(pbx, /SunnahSharedData\.swift in Sources/);
assert.match(pbx, /PRODUCT_BUNDLE_IDENTIFIER = com\.yousef\.majlisilm\.PrayerWidget/);
assert.match(pbx, /CODE_SIGN_ENTITLEMENTS = PrayerWidget\/PrayerWidget\.entitlements/);

assert.ok(existsSync(resolve(iosApp, "PrayerWidget/PrayerWidget.entitlements")));

console.log("IOS_PRAYER_WIDGET_DATA_CONTRACT_GATE: PASS", {
  appGroup: APP_GROUP,
  widgetKind: WIDGET_KIND,
  snapshotKey: SNAPSHOT_KEY,
  schemaVersion: SUNNAH_PRAYER_SNAPSHOT_SCHEMA_VERSION,
});
