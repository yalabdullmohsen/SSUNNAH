/**
 * WIDGETS_INTEGRITY_GATE — تكامل الويدجيتات من الطرف إلى الطرف (JS ↔ Swift).
 * تشغيل: node --import tsx src/lib/__tests__/widgets-integrity-gate.test.ts
 *
 * يكمّل بوابات ios-*widget* القائمة (لا يكررها) ويفشل عند:
 * - انجراف مخطط الظرف: حقل Swift إلزامي غائب عن ناشر JS، أو نوع JSON مخالف، أو رقم إصدار مختلف
 * - انجراف App Group بين pbxproj/entitlements/Swift/JS أو ظهور مجموعة ثانية في كود Swift
 * - غياب منطق الالتفاف: بعد العشاء → فجر الغد، منتصف الليل + التاريخ الهجري، نوافذ الأذكار
 * - رابط عميق في الويدجت لا يطابق مسارًا حقيقيًا في AppRoutes أو بمضيف غير موثوق
 * - kind معرّف بلا Widget مسجّل في الحزمة (أو العكس)
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildSharedPrayerSnapshotPayload,
} from "../plugins/sunnah-shared-prayer-publish";
import { SUNNAH_APP_GROUP_ID, type SharedPrayerDay } from "../plugins/sunnah-shared-data";
import {
  buildSunnahWidgetEnvelope,
  SUNNAH_WIDGET_ENVELOPE_KEY,
  SUNNAH_WIDGET_ENVELOPE_SCHEMA_VERSION,
  WIDGET_ADHKAR_BY_TIME,
} from "../plugins/sunnah-widget-envelope-publish";
import { resolveTimeOfDay } from "../daily-context";
import type { PrayerTimesPayload } from "../prayer-times";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "../../..");
const iosApp = resolve(appRoot, "ios/App");
const read = (rel: string) => readFileSync(resolve(iosApp, rel), "utf8");
const readApp = (rel: string) => readFileSync(resolve(appRoot, rel), "utf8");
const swiftFiles = (dir: string) =>
  readdirSync(resolve(iosApp, dir))
    .filter((f) => f.endsWith(".swift"))
    .map((f) => `${dir}/${f}`);

const allSwift = [...swiftFiles("Shared"), ...swiftFiles("PrayerWidget"), ...swiftFiles("App")]
  .map((f) => ({ f, src: read(f) }));
const envelopeSwift = read("Shared/SunnahWidgetEnvelope.swift");
const sharedSwift = read("Shared/SunnahSharedData.swift");
const swiftAll = allSwift.map((x) => x.src).join("\n");

// ── Swift Codable model parsing ─────────────────────────────────
type SwiftField = { name: string; type: string; optional: boolean; hasDefault: boolean };

function swiftStruct(name: string): SwiftField[] {
  const m = swiftAll.match(new RegExp(`struct ${name}: [^{]*\\{([\\s\\S]*?)\\n\\}`));
  assert.ok(m, `Swift struct ${name} not found`);
  const fields: SwiftField[] = [];
  for (const line of m![1].split("\n")) {
    const f = line.match(/^\s{4}var (\w+): ([^=\n]+?)(\s*=\s*.+)?$/);
    if (!f) continue;
    const type = f[2].trim();
    fields.push({ name: f[1], type: type.replace(/\?$/, ""), optional: type.endsWith("?"), hasDefault: Boolean(f[3]) });
  }
  assert.ok(fields.length > 0, `Swift struct ${name} has no fields`);
  return fields;
}

function jsonTypeMatches(swiftType: string, value: unknown): boolean {
  if (swiftType === "String") return typeof value === "string";
  if (swiftType === "Int" || swiftType === "Int64") return typeof value === "number" && Number.isInteger(value);
  if (swiftType === "Bool") return typeof value === "boolean";
  if (swiftType === "[String]") return Array.isArray(value) && value.every((v) => typeof v === "string");
  if (swiftType === "[String: Int64]") {
    return (
      typeof value === "object" && value != null && !Array.isArray(value) &&
      Object.values(value).every((v) => typeof v === "number" && Number.isInteger(v))
    );
  }
  if (swiftType.startsWith("[")) return Array.isArray(value);
  return typeof value === "object" && value != null; // nested Codable struct
}

function assertDomainParity(label: string, structName: string, obj: Record<string, unknown>) {
  for (const field of swiftStruct(structName)) {
    const value = obj[field.name];
    if (!field.optional && !field.hasDefault) {
      assert.ok(value !== undefined && value !== null, `${label}.${field.name} (${structName}, non-optional) missing from JS`);
    }
    if (value !== undefined && value !== null) {
      assert.ok(
        jsonTypeMatches(field.type, value),
        `${label}.${field.name}: JS ${JSON.stringify(value)?.slice(0, 40)} ≠ Swift ${field.type}`,
      );
    }
  }
}

// ── 1) Schema parity JS envelope ↔ Swift Codable ────────────────
const KW = "Asia/Kuwait";
const kuwaitEpoch = (y: number, mo: number, d: number, h: number, mi = 0) =>
  Date.UTC(y, mo - 1, d, h - 3, mi);
const engine: PrayerTimesPayload = {
  ok: true,
  city: "الكويت · العاصمة",
  timezone: KW,
  method: "Kuwait",
  source: "gate",
  date: { gregorian: "15-06-2026", hijri: null, readable: null },
  fetchedAt: new Date(kuwaitEpoch(2026, 6, 15, 1)).toISOString(),
  prayers: [
    { key: "Fajr", name: "الفجر", obligatory: true, time24: "03:15", time: "3:15", minutes: 195 },
    { key: "Sunrise", name: "الشروق", obligatory: false, time24: "04:48", time: "4:48", minutes: 288 },
    { key: "Dhuhr", name: "الظهر", obligatory: true, time24: "11:50", time: "11:50", minutes: 710 },
    { key: "Asr", name: "العصر", obligatory: true, time24: "15:20", time: "3:20", minutes: 920 },
    { key: "Maghrib", name: "المغرب", obligatory: true, time24: "18:50", time: "6:50", minutes: 1130 },
    { key: "Isha", name: "العشاء", obligatory: true, time24: "20:20", time: "8:20", minutes: 1220 },
  ],
};
const tomorrow: SharedPrayerDay = {
  dayKey: "2026-06-16",
  timesEpochMs: {
    fajr: kuwaitEpoch(2026, 6, 16, 3, 14),
    sunrise: kuwaitEpoch(2026, 6, 16, 4, 48),
    dhuhr: kuwaitEpoch(2026, 6, 16, 11, 50),
    asr: kuwaitEpoch(2026, 6, 16, 15, 20),
    maghrib: kuwaitEpoch(2026, 6, 16, 18, 51),
    isha: kuwaitEpoch(2026, 6, 16, 20, 21),
  },
};

const noon = kuwaitEpoch(2026, 6, 15, 12, 30);
const prayer = buildSharedPrayerSnapshotPayload(engine, noon, [tomorrow]);
const env = buildSunnahWidgetEnvelope(new Date(noon), prayer) as Record<string, unknown>;

assert.equal(SUNNAH_WIDGET_ENVELOPE_KEY, sharedSwift.match(/static let envelope = "([^"]+)"/)?.[1]);
assert.equal(
  SUNNAH_WIDGET_ENVELOPE_SCHEMA_VERSION,
  Number(envelopeSwift.match(/struct SunnahWidgetEnvelope[\s\S]*?static let currentSchema = (\d+)/)?.[1]),
);
assertDomainParity("envelope", "SunnahWidgetEnvelope", env);

const envelopeDomains = swiftStruct("SunnahWidgetEnvelope").filter((f) => f.name.endsWith("Payload"));
assert.ok(envelopeDomains.length >= 10, "envelope domains parsed");
for (const domain of envelopeDomains) {
  const value = env[domain.name] as Record<string, unknown> | undefined;
  assert.ok(value && typeof value === "object", `JS envelope missing domain ${domain.name}`);
  assertDomainParity(domain.name, domain.type, value);
  // Domain schema must be decodable (decodeIsolated drops sv > maxSchema).
  const decodeLine = envelopeSwift.match(new RegExp(`decodeDomain\\("${domain.name}", as: \\w+\\.self, maxSchema: ([\\w.]+)\\)`));
  assert.ok(decodeLine, `decodeIsolated does not decode ${domain.name}`);
  const maxSchema = /^\d+$/.test(decodeLine![1])
    ? Number(decodeLine![1])
    : Number(swiftAll.match(new RegExp(`struct ${domain.type}:[\\s\\S]*?static let currentSchema = (\\d+)`))?.[1]);
  assert.ok(Number(value.schemaVersion) >= 1 && Number(value.schemaVersion) <= maxSchema, `${domain.name} schemaVersion`);
}
for (const item of (env.customContentPayload as { items: Record<string, unknown>[] }).items) {
  assertDomainParity("customContentPayload.items[]", "SharedCustomContentItem", item);
}
for (const day of (env.prayerPayload as { upcomingDays?: Record<string, unknown>[] }).upcomingDays ?? []) {
  assertDomainParity("prayerPayload.upcomingDays[]", "SharedPrayerDay", day);
}

// Capacitor bridge: every TS prayer field is read by the native plugin.
const pluginSwift = read("App/SunnahSharedDataPlugin.swift");
const pluginTs = readApp("src/lib/plugins/sunnah-shared-data.ts");
const tsPrayerType = pluginTs.match(/export type SharedPrayerSnapshotPayload = \{([\s\S]*?)\n\};/)?.[1] ?? "";
const tsPrayerKeys = [...tsPrayerType.matchAll(/^\s{2}(\w+)\??:/gm)].map((m) => m[1]);
assert.ok(tsPrayerKeys.length >= 15, "TS prayer payload keys parsed");
const swiftPrayerFields = new Set(swiftStruct("SharedPrayerSnapshot").map((f) => f.name));
for (const key of tsPrayerKeys) {
  assert.ok(swiftPrayerFields.has(key), `SharedPrayerSnapshot missing JS field ${key}`);
  assert.match(pluginSwift, new RegExp(`"${key}"`), `SunnahSharedDataPlugin never reads ${key}`);
}

// ── 2) App Group consistency ────────────────────────────────────
const APP_GROUP = "group.com.yousef.majlisilm";
assert.equal(SUNNAH_APP_GROUP_ID, APP_GROUP);
assert.match(sharedSwift, /static let identifier = "group\.com\.yousef\.majlisilm"/);
for (const { f, src } of allSwift) {
  for (const g of src.match(/"group\.[\w.]+"/g) ?? []) {
    assert.equal(g, `"${APP_GROUP}"`, `${f} hard-codes a foreign App Group ${g}`);
  }
}
const pbx = read("App.xcodeproj/project.pbxproj");
const entitlementRefs = [...new Set([...pbx.matchAll(/CODE_SIGN_ENTITLEMENTS = ([^;]+);/g)].map((m) => m[1].trim()))];
assert.ok(entitlementRefs.some((r) => r.startsWith("PrayerWidget/")), "widget target entitlements not referenced");
for (const ref of entitlementRefs) {
  assert.ok(existsSync(resolve(iosApp, ref)), `pbxproj references missing ${ref}`);
  assert.match(read(ref), /group\.com\.yousef\.majlisilm/, `${ref} lacks App Group`);
}
assert.match(read("PrayerWidget/Info.plist"), /com\.apple\.widgetkit-extension/);
// Shared/ sources must compile into the widget extension too (one App Group owner).
for (const shared of ["SunnahSharedData.swift", "SunnahWidgetEnvelope.swift", "SunnahPrayerDeepLink.swift"]) {
  const refs = pbx.match(new RegExp(`${shared.replace(".", "\\.")} in Sources`, "g")) ?? [];
  assert.ok(refs.length >= 2, `${shared} not compiled into app + widget`);
}

// ── 3) Rollover logic present + behavioural ─────────────────────
// After Isha → engine next-day Fajr (not an approximation of today's minutes).
const afterIsha = kuwaitEpoch(2026, 6, 15, 21, 30);
const wrapped = buildSharedPrayerSnapshotPayload(engine, afterIsha, [tomorrow]);
assert.equal(wrapped.nextPrayerKey, "fajr");
assert.equal(wrapped.nextPrayerEpochMs, tomorrow.timesEpochMs.fajr, "after Isha must use engine tomorrow Fajr");
assert.deepEqual(wrapped.upcomingDays, [tomorrow]);
const noUpcoming = buildSharedPrayerSnapshotPayload(engine, afterIsha);
assert.equal(noUpcoming.nextPrayerKey, "fajr", "fallback still wraps to Fajr");
assert.equal(noUpcoming.upcomingDays, undefined);

const publishTs = readApp("src/lib/plugins/sunnah-shared-prayer-publish.ts");
assert.match(publishTs, /buildUpcomingPrayerDays\(payload\)/);
assert.match(publishTs, /getPrayerTimes\(/, "upcoming days must come from the app prayer engine");
assert.match(publishTs, /prayerTimes: payload/, "envelope prayer domain must be published with the engine payload");
assert.match(pluginSwift, /getArray\("upcomingDays"/);
assert.match(sharedSwift, /var upcomingDays: \[SharedPrayerDay\]\? = nil/);

const entrySwift = read("PrayerWidget/PrayerWidgetEntry.swift");
assert.match(entrySwift, /upcomingDays\?\.first\(where: \{ \$0\.dayKey == todayKey \}\)/, "midnight day rollover");
assert.match(entrySwift, /for day in snapshot\?\.upcomingDays/, "next-day boundaries in next/current derivation");
assert.match(entrySwift, /enum PrayerWidgetTimelinePolicy/);
assert.match(entrySwift, /DateComponents\(hour: 0, minute: 0\)/, "timeline entry at local midnight");
assert.match(entrySwift, /PrayerWidgetTimelinePolicy\.entryDates/);
assert.match(entrySwift, /\.islamicUmmAlQura/, "Hijri text re-derived per entry date");

const platformSwift = read("PrayerWidget/SunnahWidgetPlatform.swift");
assert.match(platformSwift, /enum SunnahWidgetDayRollover/);
assert.match(platformSwift, /Calendar\(identifier: \.islamicUmmAlQura\)/, "Hijri rollover uses Umm al-Qura like JS");
assert.match(platformSwift, /SunnahWidgetDayRollover\.calendar\(\$0, at: now\)/);
assert.match(platformSwift, /SunnahWidgetDayRollover\.progress\(/);
assert.match(platformSwift, /nextMidnight\(after: now/);
assert.match(platformSwift, /adhkarWindowBoundaries\(after: now/);
assert.match(platformSwift, /SunnahSharedStore\.loadCanonicalPrayer\(\)/);

// Adhkar window parity: Swift ranges ≡ JS resolveTimeOfDay → WIDGET_ADHKAR_BY_TIME.
const ranges = [...platformSwift.matchAll(/case ([\d.]+)\.\.<([\d.]+): return \("([\w-]+)", "([^"]+)"\)/g)].map((m) => ({
  from: Number(m[1]),
  to: Number(m[2]),
  collection: m[3],
  title: m[4],
}));
const fallback = platformSwift.match(/default: return \("([\w-]+)", "([^"]+)"\)/);
assert.ok(ranges.length >= 3 && fallback, "Swift adhkar windows parsed");
for (let h = 0; h < 24; h += 0.25) {
  const js = WIDGET_ADHKAR_BY_TIME[resolveTimeOfDay(h)];
  const sw = ranges.find((r) => h >= r.from && h < r.to) ?? { collection: fallback![1], title: fallback![2] };
  assert.equal(sw.collection, js.collection, `adhkar window drift at ${h}h`);
  assert.equal(sw.title, js.title, `adhkar title drift at ${h}h`);
}

// Single refresh owner reloads per-kind after commit; non-prayer publishes keep prayer.
const coordinator = read("Shared/SunnahWidgetRefreshCoordinator.swift");
assert.match(coordinator, /WidgetCenter\.shared\.reloadTimelines\(ofKind: kind\)/);
assert.match(coordinator, /envelope\.prayerPayload = SunnahSharedStore\.loadCanonicalPrayer\(\)/);

// ── 4) Deep links → real routes on a trusted host ───────────────
const routesSrc = readApp("src/AppRoutes.tsx") + readApp("src/App.tsx");
const routeRegex = (pattern: string) =>
  new RegExp(
    `^${pattern
      .split("/")
      .map((seg) =>
        seg === "*" || /^:\w+\*$/.test(seg)
          ? ".*"
          : /^:\w+\??$/.test(seg)
            ? "[^/]+"
            : seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      )
      .join("/")}$`,
  );
const routePatterns = [...routesSrc.matchAll(/<Route path="([^"]+)"/g)].map((m) => routeRegex(m[1]));
const routeExists = (path: string) => routePatterns.some((re) => re.test(path.split(/[?#]/)[0] || "/"));

const deepLinkSwift = read("Shared/SunnahPrayerDeepLink.swift");
const origin = deepLinkSwift.match(/static let origin = "https:\/\/([^"]+)"/)?.[1];
assert.ok(origin, "deep link origin");
assert.match(readApp("src/lib/native-deep-link.ts"), new RegExp(`"${origin!.replace(/\./g, "\\.")}"`), "origin trusted by appUrlOpen");

const swiftPaths = new Set<string>();
for (const { src } of allSwift.filter((x) => !x.f.startsWith("App/"))) {
  for (const m of src.matchAll(/\\\(origin\)(\/[^"]*)"/g)) swiftPaths.add(m[1]);
  for (const m of src.matchAll(/url\(path: "([^"]+)"\)/g)) swiftPaths.add(m[1]);
  for (const m of src.matchAll(/(?:deepLinkPath|\w+Path): "([^"]+)"/g)) swiftPaths.add(m[1]);
}
const mushafFactory = deepLinkSwift.match(/var path = "([^"\\]+)/)?.[1];
assert.equal(mushafFactory, "/mushaf?page=", "mushaf deep link uses the canonical reader query (legacy redirect drops ?ayah=)");
swiftPaths.add("/mushaf");

const jsPaths = new Set<string>();
const walk = (v: unknown) => {
  if (Array.isArray(v)) v.forEach(walk);
  else if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v)) {
      if (typeof val === "string" && /(Path|deepLinkPath)$/.test(k)) jsPaths.add(val);
      else walk(val);
    }
  }
};
walk(env);
assert.ok(swiftPaths.size >= 8 && jsPaths.size >= 5, "deep links collected");
for (const path of [...swiftPaths, ...jsPaths]) {
  assert.ok(path.startsWith("/") && !path.startsWith("//"), `deep link not same-origin path: ${path}`);
  assert.ok(routeExists(path), `widget deep link has no route: ${path}`);
}
const adhkarSlugs = readApp("src/lib/adhkar-seed.ts");
for (const slug of ["morning", "evening", "sleep", "after-salah"]) {
  assert.match(adhkarSlugs, new RegExp(`slug: "${slug}"`), `/adhkar/${slug} has no category`);
}

// ── 5) Kind registry ↔ bundle ───────────────────────────────────
const kinds = [...sharedSwift.matchAll(/static let (\w+) = "(PrayerTimesWidget|sunnah\.widget\.[\w.-]+)"/g)].map((m) => m[1]);
const bundle = read("PrayerWidget/PrayerWidgetBundle.swift");
const registered = [...bundle.matchAll(/^\s+(\w+)\(\)$/gm)].map((m) => m[1]);
const kindOwner = new Map<string, string>();
for (const { src } of allSwift) {
  for (const m of src.matchAll(/struct (\w+): Widget \{\s*\n\s*let kind = SunnahWidgetKind\.(\w+)/g)) kindOwner.set(m[2], m[1]);
}
for (const kind of kinds) {
  const owner = kindOwner.get(kind);
  assert.ok(owner, `kind ${kind} has no Widget`);
  assert.ok(registered.includes(owner!), `${owner} not in PrayerWidgetBundle`);
}
assert.equal(new Set(registered).size, registered.length, "duplicate widget in bundle");

console.log(
  `WIDGETS_INTEGRITY_GATE ok — ${envelopeDomains.length} domains, ${kinds.length} kinds, ${swiftPaths.size + jsPaths.size} deep links`,
);
