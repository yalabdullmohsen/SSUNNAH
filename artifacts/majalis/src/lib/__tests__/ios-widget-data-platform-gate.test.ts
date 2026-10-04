/**
 * IOS_WIDGET_DATA_PLATFORM_GATE
 * تشغيل: node --import tsx src/lib/__tests__/ios-widget-data-platform-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildSunnahWidgetEnvelope,
  SUNNAH_WIDGET_ENVELOPE_SCHEMA_VERSION,
} from "../plugins/sunnah-widget-envelope-publish";
import { buildSharedPrayerSnapshotPayload } from "../plugins/sunnah-shared-prayer-publish";
import { derivePrayerWindow } from "../widget-data/prayer-window";
import { WIDGET_VALIDATION_STATUS, WIDGET_FUTURE_BINARY_REQUIRED } from "../widget-data/types";
import { WIDGET_PROGRESS_TYPES } from "../widget-data/progress-contract";
import { WIDGET_CENTER_CATALOG } from "../widget-data/catalog";
import { WIDGET_CENTER_UX_STATES } from "../widget-data/center-state";
import { assertPublicSafeWidgetJson } from "../widget-data/privacy";
import { WIDGET_CUSTOM_CONTENT_TYPES } from "../widget-data/selections";
import type { PrayerTimesPayload } from "../prayer-times";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "../../..");
const repo = resolve(appRoot, "../..");
const iosApp = resolve(appRoot, "ios/App");

function read(rel: string) {
  return readFileSync(resolve(appRoot, rel), "utf8");
}
function readIos(rel: string) {
  return readFileSync(resolve(iosApp, rel), "utf8");
}

assert.equal(SUNNAH_WIDGET_ENVELOPE_SCHEMA_VERSION, 1);
assert.equal(WIDGET_FUTURE_BINARY_REQUIRED, true);
assert.equal(WIDGET_VALIDATION_STATUS.includes("VALID"), true);
assert.equal(WIDGET_VALIDATION_STATUS.includes("AUTHORITY_REVIEW_REQUIRED"), true);
assert.equal(WIDGET_PROGRESS_TYPES.length, 10);
assert.equal(WIDGET_CENTER_UX_STATES.length, 12);
assert.ok(!WIDGET_CUSTOM_CONTENT_TYPES.includes("FREE_TEXT" as never));

const pbx = readIos("App.xcodeproj/project.pbxproj");
assert.match(pbx, /CURRENT_PROJECT_VERSION = 55/);
assert.doesNotMatch(pbx, /CURRENT_PROJECT_VERSION = 56/);

assert.ok(existsSync(resolve(appRoot, "src/pages/account/ui/WidgetCenterView.tsx")));
assert.ok(existsSync(resolve(repo, "docs/audit/WIDGET_DATA_PLATFORM.md")));

const center = read("src/pages/account/ui/WidgetCenterView.tsx");
assert.match(center, /مركز الويدجت/);
assert.match(center, /SUNNAH_WIDGET_CENTER|widget-center|مركز الويدجت/);
assert.match(center, /الويدجت المتاحة/);
assert.match(center, /مواقيت الصلاة/);
assert.match(center, /التاريخ والمناسبات/);
assert.match(center, /الأذكار/);
assert.match(center, /القرآن والمصحف/);
assert.match(center, /المحتوى المخصص/);
assert.match(center, /التقدم والأهداف/);
assert.match(center, /الخصوصية/);
assert.match(center, /حالة البيانات/);
assert.match(center, /المساعدة/);
assert.doesNotMatch(center, /JSON\.stringify\(envelope/);
assert.match(center, /السطح الحالي/);

const routes = read("src/AppRoutes.tsx");
assert.match(routes, /path="\/widget-center"/);
assert.match(read("src/pages/account/ui/SettingsView.tsx"), /\/widget-center/);
assert.match(read("src/pages/worship/ui/AdhkarView.tsx"), /setTaskProgress\("morning-adhkar"/);
assert.match(read("src/pages/worship/ui/AdhkarView.tsx"), /setTaskProgress\("evening-adhkar"/);
assert.match(read("src/views/admin/ReligiousCalendarReviewSection.tsx"), /widgetEligible/);
assert.match(read("src/views/admin/ReligiousCalendarReviewSection.tsx"), /OFFICIALLY_CONFIRMED/);

const plugin = readIos("App/SunnahSharedDataPlugin.swift");
assert.match(plugin, /readWidgetDiagnostics/);
assert.match(plugin, /futureBinaryRequired/);
const diagFn = plugin.slice(plugin.indexOf("func readWidgetDiagnostics"));
assert.doesNotMatch(diagFn, /envelopeJson/);
assert.doesNotMatch(diagFn, /JSONSerialization/);
const envelopeSwift = readIos("Shared/SunnahWidgetEnvelope.swift");
assert.match(envelopeSwift, /islamicEventsPayload/);
assert.match(envelopeSwift, /diagnosticsPayload/);
assert.match(envelopeSwift, /decodeIsolated/);
assert.match(read("src/lib/plugins/sunnah-shared-data.ts"), /readWidgetDiagnostics/);

const kinds = new Set(WIDGET_CENTER_CATALOG.map((item) => item.kind));
assert.equal(kinds.size, WIDGET_CENTER_CATALOG.length);
assert.ok(WIDGET_CENTER_CATALOG.length >= 26);

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

const beforeFajr = buildSharedPrayerSnapshotPayload(fixturePayload(), kuwaitEpoch(2026, 6, 15, 3, 0));
assert.equal(beforeFajr.currentPrayerKey, undefined);
assert.equal(beforeFajr.nextPrayerKey, "fajr");

const atFajr = buildSharedPrayerSnapshotPayload(fixturePayload(), kuwaitEpoch(2026, 6, 15, 4, 0));
assert.equal(atFajr.currentPrayerKey, "fajr");
assert.equal(atFajr.nextPrayerKey, "dhuhr");

const afterDhuhr = buildSharedPrayerSnapshotPayload(fixturePayload(), kuwaitEpoch(2026, 6, 15, 14, 0));
assert.equal(afterDhuhr.currentPrayerKey, "dhuhr");
assert.equal(afterDhuhr.previousPrayerKey, "fajr");
assert.equal(afterDhuhr.nextPrayerKey, "asr");

const afterIsha = buildSharedPrayerSnapshotPayload(fixturePayload(), kuwaitEpoch(2026, 6, 15, 21, 0));
assert.equal(afterIsha.currentPrayerKey, "isha");
assert.equal(afterIsha.nextPrayerKey, "fajr");
assert.ok((afterIsha.nextPrayerEpochMs ?? 0) > kuwaitEpoch(2026, 6, 15, 21, 0));

const window = derivePrayerWindow(afterDhuhr.timesEpochMs, kuwaitEpoch(2026, 6, 15, 14, 0), {
  key: "asr",
  epochMs: afterDhuhr.nextPrayerEpochMs ?? 0,
});
assert.equal(window.currentPrayer?.key, "dhuhr");
assert.equal(window.previousPrayer?.key, "fajr");
assert.equal(window.nextPrayer?.key, "asr");

const env = buildSunnahWidgetEnvelope(new Date("2026-06-15T11:00:00+03:00"), afterDhuhr);
assert.equal(env.schemaVersion, 1);
assert.ok(env.payloadId);
assert.ok(env.calendarPayload);
assert.ok(env.islamicEventsPayload);
assert.ok(env.hadithPayload);
assert.ok(env.duaPayload);
assert.ok(env.diagnosticsPayload);
assert.ok((env.calendarPayload as { gregorianDate?: string }).gregorianDate);
assert.ok((env.calendarPayload as { hijriDate?: string }).hijriDate);
assert.ok(assertPublicSafeWidgetJson(JSON.stringify(env)));

const isolated = JSON.parse(JSON.stringify(env)) as Record<string, unknown>;
isolated.calendarPayload = "broken";
assert.ok((isolated.prayerPayload as { nextPrayerKey?: string }).nextPrayerKey === "asr");
assert.ok((isolated.quranPayload as { ayahText?: string })?.ayahText);

const events = read("src/lib/widget-data/islamic-events.ts");
assert.match(events, /MOON_SIGHTING_IDS/);
assert.match(events, /PROVISIONAL/);
assert.match(events, /DISPUTED_DO_NOT_FEATURE/);
assert.match(events, /enrichOccasionForPublish/);

const report = readFileSync(resolve(repo, "docs/audit/WIDGET_DATA_PLATFORM.md"), "utf8");
assert.match(report, /WIDGET_DATA_LIVE_INVENTORY/);
assert.match(report, /PRODUCTION_DATABASE_MIGRATION_APPLIED = false/);
assert.match(report, /FUTURE_IOS_UPDATE_REQUIRED/);

console.log("IOS_WIDGET_DATA_PLATFORM_GATE: PASS", {
  catalog: WIDGET_CENTER_CATALOG.length,
  progressTypes: WIDGET_PROGRESS_TYPES.length,
});
