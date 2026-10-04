/**
 * IOS_SUNNAH_WIDGET_PLATFORM_CONTRACT_GATE
 * تشغيل: node --import tsx src/lib/__tests__/ios-sunnah-widget-platform-contract-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildSharedPrayerSnapshotPayload,
  SUNNAH_PRAYER_WIDGET_KIND,
} from "../plugins/sunnah-shared-prayer-publish";
import {
  buildSunnahWidgetEnvelope,
  SUNNAH_WIDGET_ENVELOPE_KEY,
  SUNNAH_WIDGET_ENVELOPE_SCHEMA_VERSION,
} from "../plugins/sunnah-widget-envelope-publish";
import { SUNNAH_APP_GROUP_ID } from "../plugins/sunnah-shared-data";
import type { PrayerTimesPayload } from "../prayer-times";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "../../..");
const repo = resolve(appRoot, "../..");
const iosApp = resolve(appRoot, "ios/App");

function readIos(rel: string): string {
  return readFileSync(resolve(iosApp, rel), "utf8");
}

const APP_GROUP = "group.com.yousef.majlisilm";
assert.equal(SUNNAH_APP_GROUP_ID, APP_GROUP);
assert.equal(SUNNAH_WIDGET_ENVELOPE_SCHEMA_VERSION, 1);
assert.equal(SUNNAH_WIDGET_ENVELOPE_KEY, "sunnah.shared.envelope.v1");
assert.equal(SUNNAH_PRAYER_WIDGET_KIND, "PrayerTimesWidget");

const shared = readIos("Shared/SunnahSharedData.swift");
const envelope = readIos("Shared/SunnahWidgetEnvelope.swift");
const refresh = readIos("Shared/SunnahWidgetRefreshCoordinator.swift");
const deep = readIos("Shared/SunnahPrayerDeepLink.swift");
const theme = readIos("Shared/SunnahBrandColors.swift");
const entry = readIos("PrayerWidget/PrayerWidgetEntry.swift");
const views = readIos("PrayerWidget/PrayerWidgetViews.swift");
const widget = readIos("PrayerWidget/PrayerTimesWidget.swift");
const bundle = readIos("PrayerWidget/PrayerWidgetBundle.swift");
const platform = readIos("PrayerWidget/SunnahWidgetPlatform.swift");
const previews = readIos("PrayerWidget/SunnahWidgetPreviewFixtures.swift");
const prayerCat = readIos("PrayerWidget/SunnahPrayerWidgetCatalog.swift");
const calCat = readIos("PrayerWidget/SunnahCalendarWidgetCatalog.swift");
const adhCat = readIos("PrayerWidget/SunnahAdhkarWidgetCatalog.swift");
const customCat = readIos("PrayerWidget/SunnahCustomWidgetCatalog.swift");
const quranCat = readIos("PrayerWidget/SunnahQuranMushafWidgetCatalog.swift");
const intents = readIos("PrayerWidget/SunnahWidgetIntents.swift");
const plugin = readIos("App/SunnahSharedDataPlugin.swift");
const pbx = readIos("App.xcodeproj/project.pbxproj");

assert.doesNotMatch(pbx, /CURRENT_PROJECT_VERSION = 56/);
assert.match(pbx, /CURRENT_PROJECT_VERSION = 55/);
assert.ok(!existsSync(resolve(iosApp, "SunnahWidget")), "no parallel Widget target folder");
assert.ok(!existsSync(resolve(iosApp, "SunnahWatch")));
assert.match(pbx, /PRODUCT_BUNDLE_IDENTIFIER = com\.yousef\.majlisilm\.PrayerWidget/);
assert.match(bundle, /@main/);
assert.match(bundle, /PrayerTimesWidget\(\)/);
assert.match(bundle, /NextPrayerWidget\(\)/);

const kinds = [
  "PrayerTimesWidget",
  "sunnah.widget.prayer.next",
  "sunnah.widget.prayer.previous",
  "sunnah.widget.prayer.previous-next",
  "sunnah.widget.prayer.morning",
  "sunnah.widget.prayer.evening",
  "sunnah.widget.prayer.all",
  "sunnah.widget.prayer.hijri",
  "sunnah.widget.calendar.hijri",
  "sunnah.widget.calendar.dual",
  "sunnah.widget.calendar.today",
  "sunnah.widget.calendar.ramadan",
  "sunnah.widget.adhkar.morning",
  "sunnah.widget.adhkar.evening",
  "sunnah.widget.adhkar.time-aware",
  "sunnah.widget.adhkar.rotating",
  "sunnah.widget.custom",
  "sunnah.widget.quran.ayah",
  "sunnah.widget.mushaf.continue",
  "sunnah.widget.mushaf.bookmark",
];
assert.equal(new Set(kinds).size, kinds.length, "kinds unique");
for (const kind of kinds) {
  assert.match(shared, new RegExp(kind.replace(/\./g, "\\.")));
}

assert.match(shared, /static let prayerTimes = "PrayerTimesWidget"/);
assert.match(shared, /static let envelope = "sunnah\.shared\.envelope\.v1"/);
assert.match(envelope, /prayerPayload/);
assert.match(envelope, /calendarPayload/);
assert.match(envelope, /adhkarPayload/);
assert.match(envelope, /quranPayload/);
assert.match(envelope, /mushafPayload/);
assert.match(envelope, /customContentPayload/);
assert.match(envelope, /preferencesPayload/);
assert.match(envelope, /decodeIsolated/);
assert.match(refresh, /commitPrayer|commitEnvelope/);
assert.doesNotMatch(refresh, /reloadAllTimelines/);
assert.doesNotMatch(plugin, /reloadAllTimelines/);
assert.match(plugin, /WidgetCenter\.shared\.reloadTimelines\(ofKind:\s*SunnahWidgetKind\.prayerTimes\)/);
assert.match(plugin, /SunnahWidgetRefreshCoordinator\.commitPrayer/);
assert.match(refresh, /reloadTimelines\(ofKind:/);

for (const token of ["token", "password", "refreshToken", "email", "private_key"]) {
  assert.doesNotMatch(envelope, new RegExp(`\\b${token}\\b`, "i"));
}

assert.match(theme, /SunnahWidgetTheme/);
assert.match(theme, /emeraldIdentity|emerald/);
assert.match(theme, /goldAccent|gold/);
assert.match(deep, /SunnahWidgetDeepLinkFactory/);
assert.match(deep, /www\.ssunnah\.com\/prayer-times/);
assert.match(deep, /adhkar\/morning/);
assert.match(deep, /mushaf\/page/);

assert.match(entry, /galleryPreview/);
assert.match(entry, /context\.isPreview/);
assert.match(entry, /allowsLiveCountdown/);
assert.match(entry, /"fajr":\s*at\(/);
assert.match(entry, /locationLabel:\s*"معاينة"/);
assert.match(entry, /SunnahSharedStore\.loadPrayer/);
assert.doesNotMatch(entry + views + widget, /AdhanCalculation|CalculationMethod|URLSession|URLRequest/);
assert.doesNotMatch(entry + views + widget, /Quran|QPC|Hisn|Fatwa|recitation|wird/i);
assert.doesNotMatch(views, /Text\("—"\)/);
assert.doesNotMatch(views, /\?\? "—"/);
assert.match(views, /افتح سُنّة لإكمال إعداد مواقيت الصلاة/);
assert.match(views, /PrayerCountdownText/);
assert.match(views, /staticRemaining/);
assert.match(views, /rightToLeft/);
assert.match(views, /accessibilityLabel/);

assert.match(previews, /معاينة|preview/);
assert.doesNotMatch(previews, /publishEnvelope|publishPrayer/);
assert.match(platform, /SunnahWidgetFamilySupport/);
assert.match(platform, /SunnahWidgetEmptyState/);
assert.match(platform, /SunnahWidgetErrorState/);

assert.match(prayerCat, /NextPrayerWidget|prayerNext/);
assert.match(calCat, /RamadanCountdownWidget|calendarRamadan/);
assert.match(adhCat, /أذكار الصباح/);
assert.match(customCat, /اختر المحتوى من إعدادات الويدجت/);
assert.match(quranCat, /ابدأ القراءة/);
assert.match(intents, /SelectCustomContentIntent/);
assert.match(intents, /SelectPrayerWidgetStyleIntent/);
assert.match(intents, /SelectPrayerGroupIntent/);
assert.match(intents, /SelectCalendarStyleIntent/);
assert.match(intents, /SelectAdhkarTypeIntent/);
assert.match(intents, /SelectMushafBookmarkIntent/);
assert.match(intents, /SelectWidgetAppearanceIntent/);

for (const name of [
  "SunnahWidgetEnvelope.swift",
  "SunnahWidgetRefreshCoordinator.swift",
  "SunnahWidgetPlatform.swift",
  "SunnahPrayerWidgetCatalog.swift",
  "SunnahCalendarWidgetCatalog.swift",
  "SunnahAdhkarWidgetCatalog.swift",
  "SunnahCustomWidgetCatalog.swift",
  "SunnahQuranMushafWidgetCatalog.swift",
]) {
  assert.match(pbx, new RegExp(name.replace(/\./g, "\\.")));
}

const widgetSwift = [
  entry, views, widget, bundle, platform, previews, prayerCat, calCat, adhCat, customCat, quranCat,
].join("\n");
assert.doesNotMatch(widgetSwift, /islamicUmmAlQura[\s\S]{0,80}toHijri|Jean Meeus/);
assert.doesNotMatch(prayerCat + calCat, /AdhanCalculation|Coordinates\(/);

function fixturePayload(): PrayerTimesPayload {
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
  };
}

function kuwaitEpoch(y: number, m: number, d: number, hour: number, minute: number): number {
  return Date.UTC(y, m - 1, d, hour - 3, minute, 0);
}

const valid = buildSharedPrayerSnapshotPayload(fixturePayload(), kuwaitEpoch(2026, 6, 15, 14, 0));
assert.equal(valid.nextPrayerKey, "asr");
assert.notEqual(valid.nextPrayerNameAr, "—");
assert.ok(valid.timesEpochMs.sunrise);

const env = buildSunnahWidgetEnvelope(new Date("2026-06-15T11:00:00+03:00"), valid);
assert.equal(env.schemaVersion, 1);
assert.ok(env.calendarPayload);
assert.ok((env.calendarPayload as { hijriMonth: number }).hijriMonth >= 1);
assert.ok(env.adhkarPayload);
assert.ok(env.quranPayload);
assert.equal(typeof (env.quranPayload as { ayahText: string }).ayahText, "string");
assert.ok(((env.quranPayload as { ayahText: string }).ayahText.length) > 0);
assert.doesNotMatch(JSON.stringify(env), /accessToken|refreshToken|password|email@/);

const encoded = JSON.stringify(env);
const decoded = JSON.parse(encoded) as { quranPayload?: { ayahText: string }; prayerPayload?: { nextPrayerNameAr?: string } };
assert.equal(decoded.quranPayload?.ayahText, (env.quranPayload as { ayahText: string }).ayahText);
assert.equal(decoded.prayerPayload?.nextPrayerNameAr, "العصر");

const malicious = JSON.parse(encoded) as Record<string, unknown>;
malicious.quranPayload = "not-an-object";
const isolated = JSON.stringify(malicious);
assert.match(isolated, /"prayerPayload"/);
assert.ok(JSON.parse(isolated).prayerPayload.nextPrayerKey === "asr");

const publishHelper = readFileSync(resolve(appRoot, "src/lib/plugins/sunnah-shared-prayer-publish.ts"), "utf8");
assert.match(publishHelper, /publishSunnahWidgetEnvelope/);
assert.match(refresh, /write|publish/);
assert.match(refresh, /reload\(kinds/);

const report = readFileSync(resolve(repo, "docs/audit/IOS_SUNNAH_WIDGET_PLATFORM_CONTRACT.md"), "utf8");
assert.match(report, /IOS_SUNNAH_WIDGET_PLATFORM_CONTRACT_GATE/);
assert.match(report, /FUTURE_IOS_UPDATE_REQUIRED/);
assert.match(report, /CURRENT_WIDGET_ROOT_CAUSE_PROVEN/);

console.log("IOS_SUNNAH_WIDGET_PLATFORM_CONTRACT_GATE: PASS", {
  appGroup: APP_GROUP,
  kinds: kinds.length,
  envelopeKey: SUNNAH_WIDGET_ENVELOPE_KEY,
});
