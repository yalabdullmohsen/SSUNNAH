/**
 * تكافؤ مواقيت الصلاة والقبلة مع adhan-js مباشرةً — اختبار فقط، لا تغيير في الحساب.
 *
 * مسارنا: getPrayerTimes(dateISO, {lat,lon,timeZone}, methodId)
 *   → resolveAdhanParams + calendarNoonInZone + toZoneTime (prayer-times.ts).
 * المرجع: adhan.PrayerTimes(Coordinates, new Date(y, m-1, d), params) بالاستخدام
 *   القياسي للمكتبة، ثم تنسيق الوقت في منطقة المدينة.
 *
 * ربط الإعدادات (افتراضات المستخدم: مذهب Shafi، قاعدة العرض العالي "auto"، تعديلات 0):
 *   PrayerCalcMethodId X        → CalculationMethod.X()
 *   FranceUOIF                  → new CalculationParameters("Other", 12, 12)
 *   madhab Shafi                → Madhab.Shafi
 *   highLatitude "auto"         → HighLatitudeRule.recommended(coords)
 *   adjustments                 → صفر لكل الصلوات
 * كل طرقنا الـ13 مُعلَنة مطابقةً لـ adhan ⇒ أي فرق > 2 دقيقة يُفشل الاختبار.
 *
 * ملحق تشخيصي (لا يُفشل): نفس المقارنة مع منطقة جهاز بعيدة عن المدينة (process.env.TZ)،
 * لأن adhan يقرأ مكوّنات التاريخ بتوقيت الجهاز.
 *
 * تشغيل: node --import tsx src/lib/__tests__/prayer-adhan-parity.test.ts
 */
import assert from "node:assert/strict";
import * as adhan from "adhan";
import { getPrayerTimes } from "@/lib/prayer-times";
import { qiblaBearing } from "@/lib/qibla-math";
import type { PrayerCalcMethodId } from "@/lib/prayer-calc-prefs";

const CITIES = [
  { name: "Kuwait City", lat: 29.3759, lon: 47.9774, tz: "Asia/Kuwait" },
  { name: "Riyadh", lat: 24.7136, lon: 46.6753, tz: "Asia/Riyadh" },
  { name: "Makkah", lat: 21.3891, lon: 39.8579, tz: "Asia/Riyadh" },
  { name: "Cairo", lat: 30.0444, lon: 31.2357, tz: "Africa/Cairo" },
  { name: "Jakarta", lat: -6.2088, lon: 106.8456, tz: "Asia/Jakarta" },
  { name: "Istanbul", lat: 41.0082, lon: 28.9784, tz: "Europe/Istanbul" },
  { name: "London", lat: 51.5074, lon: -0.1278, tz: "Europe/London" },
  { name: "New York", lat: 40.7128, lon: -74.006, tz: "America/New_York" },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, tz: "Australia/Sydney" },
] as const;

// ربيع/خريف (اعتدالان)، انقلابان، وأيام من رمضان 1447/1448/1451.
const DATES = ["2026-02-18", "2026-03-20", "2026-06-21", "2026-09-23", "2026-12-21", "2027-02-20", "2030-01-10"];

const METHODS: PrayerCalcMethodId[] = [
  "Kuwait", "UmmAlQura", "MuslimWorldLeague", "Egyptian", "NorthAmerica", "Karachi", "Dubai",
  "Turkey", "Qatar", "Singapore", "Tehran", "FranceUOIF", "MoonsightingCommittee",
];

const KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
const ADHAN_FIELD = { Fajr: "fajr", Sunrise: "sunrise", Dhuhr: "dhuhr", Asr: "asr", Maghrib: "maghrib", Isha: "isha" } as const;

function refParams(method: PrayerCalcMethodId, coords: adhan.Coordinates): adhan.CalculationParameters {
  const p = method === "FranceUOIF"
    ? new adhan.CalculationParameters("Other", 12, 12)
    : (adhan.CalculationMethod as unknown as Record<string, () => adhan.CalculationParameters>)[method]();
  p.madhab = adhan.Madhab.Shafi;
  p.highLatitudeRule = adhan.HighLatitudeRule.recommended(coords);
  return p;
}

function minutesInZone(d: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d);
  return Number(parts.find((p) => p.type === "hour")?.value) * 60 + Number(parts.find((p) => p.type === "minute")?.value);
}

function refMinutes(city: (typeof CITIES)[number], iso: string, method: PrayerCalcMethodId): Record<string, number> {
  const [y, m, d] = iso.split("-").map(Number);
  const coords = new adhan.Coordinates(city.lat, city.lon);
  const pt = new adhan.PrayerTimes(coords, new Date(y, m - 1, d), refParams(method, coords));
  return Object.fromEntries(KEYS.map((k) => [k, minutesInZone(pt[ADHAN_FIELD[k]], city.tz)]));
}

const circDiff = (a: number, b: number) => { const x = Math.abs(a - b) % 1440; return Math.min(x, 1440 - x); };

type Diff = { city: string; date: string; method: string; prayer: string; ours: number; ref: number; diff: number };
const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

async function compare(): Promise<{ checked: number; maxDiff: number; over: Diff[] }> {
  let checked = 0, maxDiff = 0;
  const over: Diff[] = [];
  for (const city of CITIES) {
    for (const date of DATES) {
      for (const method of METHODS) {
        const ours = await getPrayerTimes(date, { lat: city.lat, lon: city.lon, label: city.name, timeZone: city.tz }, method);
        const ref = refMinutes(city, date, method);
        for (const k of KEYS) {
          const slot = ours.prayers.find((p) => p.key === k);
          assert.ok(slot?.minutes != null, `${city.name} ${date} ${method} ${k}: missing`);
          const diff = circDiff(slot.minutes, ref[k]);
          checked++;
          maxDiff = Math.max(maxDiff, diff);
          if (diff > 2) over.push({ city: city.name, date, method, prayer: k, ours: slot.minutes, ref: ref[k], diff });
        }
      }
    }
  }
  return { checked, maxDiff, over };
}

const show = (o: Diff) => `${o.city} ${o.date} ${o.method} ${o.prayer}: ours ${fmt(o.ours)} vs adhan ${fmt(o.ref)} (${o.diff}m)`;

// ─── 1) المواقيت بمنطقة جهاز قياسية (TZ من البيئة، عادة UTC في CI) ───
const main = await compare();
console.log(`prayer-adhan parity (device TZ=${process.env.TZ ?? Intl.DateTimeFormat().resolvedOptions().timeZone}): ${main.checked} times, max diff ${main.maxDiff}m, >2m: ${main.over.length}`);
for (const o of main.over.slice(0, 20)) console.log(`  ✗ ${show(o)}`);
assert.equal(main.over.length, 0, "prayer times differ from adhan by > 2 minutes");

// ─── 2) القبلة: qibla-math مقابل adhan.Qibla (سماحية 0.5°) ───
let maxQ = 0;
for (const c of CITIES) {
  const ours = qiblaBearing(c.lat, c.lon);
  const ref = adhan.Qibla(new adhan.Coordinates(c.lat, c.lon));
  const d = Math.min(Math.abs(ours - ref), 360 - Math.abs(ours - ref));
  maxQ = Math.max(maxQ, d);
  assert.ok(d <= 0.5, `${c.name} qibla ${ours.toFixed(3)}° vs adhan ${ref.toFixed(3)}° (Δ${d.toFixed(3)}°)`);
}
console.log(`qibla parity: ${CITIES.length} cities, max Δ ${maxQ.toFixed(4)}°`);

// ─── 3) ملحق تشخيصي: منطقة الجهاز بعيدة عن منطقة المدينة (لا يُفشل) ───
const savedTz = process.env.TZ;
for (const tz of ["America/Los_Angeles", "Pacific/Kiritimati"]) {
  process.env.TZ = tz;
  const r = await compare();
  console.log(`  [diagnostic] device TZ=${tz}: max diff ${r.maxDiff}m, >2m: ${r.over.length}`);
  for (const o of r.over.slice(0, 5)) console.log(`      ${show(o)}`);
}
if (savedTz === undefined) delete process.env.TZ; else process.env.TZ = savedTz;

console.log("✓ prayer-adhan-parity");
