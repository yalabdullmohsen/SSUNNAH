// يولّد مواقيت مرجعية من adhan-js (المكتبة نفسها التي يستخدمها الويب في
// src/lib/prayer-times.ts) لمقارنة الحساب الأصلي بها ±1 دقيقة.
// التشغيل من artifacts/majalis: node ios/App/SunnahPrayer/scripts/make-parity-fixtures.mjs
import * as adhan from "adhan";
import { writeFileSync } from "node:fs";

const cities = [
  { name: "Kuwait", lat: 29.3759, lon: 47.9774, tz: "Asia/Kuwait", method: "Kuwait" },
  { name: "Riyadh", lat: 24.7136, lon: 46.6753, tz: "Asia/Riyadh", method: "UmmAlQura" },
  { name: "Cairo", lat: 30.0444, lon: 31.2357, tz: "Africa/Cairo", method: "Egyptian" },
  { name: "Istanbul", lat: 41.0082, lon: 28.9784, tz: "Europe/Istanbul", method: "Turkey" },
  { name: "London", lat: 51.5074, lon: -0.1278, tz: "Europe/London", method: "MuslimWorldLeague" },
];
const days = ["2026-01-15", "2026-03-20", "2026-06-21", "2026-10-08", "2026-12-21"];
const keys = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];

const out = [];
for (const c of cities) {
  for (const day of days) {
    const [y, m, d] = day.split("-").map(Number);
    const params = adhan.CalculationMethod[c.method]();
    params.madhab = adhan.Madhab.Shafi;
    params.highLatitudeRule = adhan.HighLatitudeRule.recommended(new adhan.Coordinates(c.lat, c.lon));
    const pt = new adhan.PrayerTimes(new adhan.Coordinates(c.lat, c.lon), new Date(y, m - 1, d, 12), params);
    out.push({ ...c, day, times: Object.fromEntries(keys.map((k) => [k, pt[k].getTime() / 1000])) });
  }
}
writeFileSync(new URL("../Tests/SunnahPrayerTests/Resources/web-parity.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
console.log(`fixtures: ${out.length}`);
