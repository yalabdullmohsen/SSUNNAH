/* يولّد Tests/SunnahNativeTests/Fixtures/daily/golden.json باستدعاء getDailyAyah/getDailyHadith من الموقع. تشغيل: tsx scripts/native/gen-daily-golden.mjs */
import fs from "node:fs";
import path from "node:path";
const app = path.resolve(import.meta.dirname, "../..");
const { getDailyAyah, getDailyHadith, DAILY_AYAH_POOL } = await import(`${app}/src/lib/daily-content.ts`);
const day = 86_400_000;
const L = DAILY_AYAH_POOL.length;
/* أول يوم يكون فهرسه 0 (التفاف) ويومٌ قبل الالتفاف (نهاية المجموعة) */
const idx = (t) => Math.floor(t / day);
let wrap = Date.UTC(2026, 9, 13);
while (idx(wrap) % L !== 0) wrap += day;
const isos = [
  "2026-10-13T12:00:00Z", "2026-10-13T20:59:59Z", "2026-10-13T21:00:00Z", "2026-10-14T20:59:59Z", "2026-10-14T21:00:00Z",
  "2026-12-31T20:59:59Z", "2026-12-31T21:00:00Z", "2027-02-28T21:00:00Z", "2028-02-28T21:00:00Z", "2028-02-29T12:00:00Z",
  new Date(wrap - 1000).toISOString().replace(/\.\d+Z$/, "Z"),
  new Date(wrap - day + 3 * 3600_000).toISOString().replace(/\.\d+Z$/, "Z"),
  new Date(wrap + 3 * 3600_000).toISOString().replace(/\.\d+Z$/, "Z"),
  new Date(wrap + day).toISOString().replace(/\.\d+Z$/, "Z"),
];
const rows = isos.map((iso) => ({ iso, ayahId: getDailyAyah(new Date(iso)).id, hadithId: getDailyHadith(new Date(iso)).id }));
const dir = path.join(app, "ios/App/SunnahNative/Tests/SunnahNativeTests/Fixtures/daily");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "golden.json"), JSON.stringify(rows, null, 2) + "\n");
console.log(rows.length, "dates; ayah pool", L);
