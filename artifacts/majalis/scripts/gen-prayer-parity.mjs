// يولّد لقطات مواقيت الصلاة من كود الموقع الفعلي (src/lib/prayer-times.ts → computePrayerTimesForDate)
// دون تعديله، لمقارنتها بـ Swift على مستوى الدقيقة HH:mm.
// التشغيل: TZ=UTC node scripts/gen-prayer-parity.mjs
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import Module from "node:module";

const root = resolve(import.meta.dirname, "..");
const out = join(root, "ios/App/SunnahPrayer/Tests/SunnahPrayerTests/Resources/web-minute-parity.json");
const tmp = mkdtempSync(join(tmpdir(), "prayer-parity-"));
const js = join(tmp, "js");
writeFileSync(join(tmp, "tsconfig.json"), JSON.stringify({
  compilerOptions: {
    target: "ES2020", module: "commonjs", moduleResolution: "node", skipLibCheck: true, outDir: js,
    rootDir: join(root, "src"), baseUrl: root, paths: { "@/*": ["src/*"] }, esModuleInterop: true, resolveJsonModule: true,
  },
  files: [join(root, "src/lib/prayer-times.ts")],
}));
// أخطاء الأنواع لا تمنع الإخراج؛ نتحقق من وجود الملفات الناتجة بدل ذلك.
try {
  execFileSync(join(root, "../../node_modules/.bin/tsc"), ["-p", join(tmp, "tsconfig.json")], { cwd: root, stdio: "pipe" });
} catch (e) {
  console.warn("tsc أبلغ عن أخطاء أنواع (تُتجاهل، الإخراج يُتحقق منه لاحقًا)");
}

// localStorage وهمي (الويب يقرأ التفضيلات منه)
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => void store.set(k, String(v)),
  removeItem: (k) => void store.delete(k),
};
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (req, ...rest) {
  if (req.startsWith("@/")) req = join(js, req.slice(2));
  // الحزمة "type":"module" لكن main يشير إلى cjs؛ نوجّه إلى نسخة ESM (require(esm) مدعوم في Node 22+)
  if (req === "adhan") req = join(root, "node_modules/adhan/lib/esm/Adhan.js");
  return origResolve.call(this, req, ...rest);
};
process.env.NODE_PATH = join(root, "node_modules");
Module._initPaths();
const require = createRequire(import.meta.url);
const prefs = require(join(js, "lib/prayer-calc-prefs.js"));
const times = require(join(js, "lib/prayer-times.js"));

const CITIES = {
  Kuwait: [29.3759, 47.9774, "Asia/Kuwait"], Riyadh: [24.7136, 46.6753, "Asia/Riyadh"],
  Makkah: [21.3891, 39.8579, "Asia/Riyadh"], Cairo: [30.0444, 31.2357, "Africa/Cairo"],
  Istanbul: [41.0082, 28.9784, "Europe/Istanbul"], London: [51.5074, -0.1278, "Europe/London"],
  NewYork: [40.7128, -74.006, "America/New_York"], Karachi: [24.8607, 67.0011, "Asia/Karachi"],
  Jakarta: [-6.2088, 106.8456, "Asia/Jakarta"], Singapore: [1.3521, 103.8198, "Asia/Singapore"],
  Tehran: [35.6892, 51.389, "Asia/Tehran"], Dubai: [25.2048, 55.2708, "Asia/Dubai"],
  Doha: [25.2854, 51.531, "Asia/Qatar"], Paris: [48.8566, 2.3522, "Europe/Paris"],
  Toronto: [43.6532, -79.3832, "America/Toronto"], Casablanca: [33.5731, -7.5898, "Africa/Casablanca"],
  Oslo: [59.9139, 10.7522, "Europe/Oslo"], Sydney: [-33.8688, 151.2093, "Australia/Sydney"],
};
// [مدينة، طريقة، يوم، مذهب، خط عرض عالٍ، تعديلات]
const M = "Shafi", H = "Hanafi", A = "auto";
const CASES = [
  ["Kuwait", "Kuwait", "2026-01-15"], ["Kuwait", "Kuwait", "2026-06-21"], ["Kuwait", "Kuwait", "2026-10-12"], ["Kuwait", "Kuwait", "2026-10-19"],
  ["Riyadh", "UmmAlQura", "2026-03-20"], ["Riyadh", "UmmAlQura", "2026-12-21"],
  ["Makkah", "UmmAlQura", "2026-09-23"], ["Makkah", "MuslimWorldLeague", "2026-07-01"],
  ["Cairo", "Egyptian", "2026-01-15"], ["Cairo", "Egyptian", "2026-06-21"], ["Cairo", "Egyptian", "2026-04-24"],
  ["Istanbul", "Turkey", "2026-03-29"], ["Istanbul", "Turkey", "2026-12-21"],
  ["London", "MuslimWorldLeague", "2026-03-29"], ["London", "MuslimWorldLeague", "2026-06-21"],
  ["London", "MoonsightingCommittee", "2026-06-21"], ["London", "MoonsightingCommittee", "2026-12-21"],
  ["NewYork", "NorthAmerica", "2026-03-08"], ["NewYork", "NorthAmerica", "2026-11-01"], ["NewYork", "NorthAmerica", "2026-07-04"],
  ["Toronto", "NorthAmerica", "2026-06-21"],
  ["Karachi", "Karachi", "2026-05-01"], ["Karachi", "Karachi", "2026-12-21", H],
  ["Jakarta", "Singapore", "2026-02-10"], ["Singapore", "Singapore", "2026-08-09"],
  ["Tehran", "Tehran", "2026-03-21"], ["Tehran", "Tehran", "2026-09-22"],
  ["Dubai", "Dubai", "2026-06-21"], ["Dubai", "Dubai", "2026-01-15"],
  ["Doha", "Qatar", "2026-04-10"], ["Doha", "Qatar", "2026-11-20"],
  ["Paris", "FranceUOIF", "2026-03-29"], ["Paris", "FranceUOIF", "2026-06-21"], ["Paris", "FranceUOIF", "2026-12-21"],
  ["Casablanca", "MuslimWorldLeague", "2026-10-25"],
  ["Sydney", "MuslimWorldLeague", "2026-04-05"], ["Sydney", "MuslimWorldLeague", "2026-10-04"],
  // مذهب حنفي
  ["Cairo", "Egyptian", "2026-06-21", H], ["London", "MuslimWorldLeague", "2026-06-21", H], ["Kuwait", "Kuwait", "2026-01-15", H],
  // خطوط عرض عالية
  ["Oslo", "MuslimWorldLeague", "2026-06-21", M, A], ["Oslo", "MuslimWorldLeague", "2026-06-21", M, "MiddleOfTheNight"],
  ["Oslo", "MuslimWorldLeague", "2026-06-21", M, "SeventhOfTheNight"], ["Oslo", "MuslimWorldLeague", "2026-06-21", M, "TwilightAngle"],
  ["Oslo", "MuslimWorldLeague", "2026-12-21", M, A], ["London", "MuslimWorldLeague", "2026-06-21", M, "SeventhOfTheNight"],
  // تعديلات يدوية
  ["Kuwait", "Kuwait", "2026-10-12", M, A, { fajr: -2, sunrise: 1, dhuhr: 3, asr: -1, maghrib: 2, isha: 5 }],
  ["Riyadh", "UmmAlQura", "2026-10-12", M, A, { isha: 10, maghrib: 3 }],
];

const pad = (n) => String(n).padStart(2, "0");
const results = [];
for (const [city, method, day, madhab = M, hl = A, adj = {}] of CASES) {
  const [lat, lon, tz] = CITIES[city];
  store.clear();
  prefs.setPrayerMadhab(madhab);
  prefs.setHighLatitudeRule(hl);
  prefs.setPrayerAdjustments({ fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, ...adj });
  const [y, m, d] = day.split("-").map(Number);
  let payload;
  // لحظة داخل اليوم المطلوب في منطقة المدينة (ظهر UTC قد يقع في يوم آخر لمناطق بعيدة)
  for (const hour of [12, 6, 18, 0, 23]) {
    const p = await times.computePrayerTimesForDate(lat, lon, city, tz, new Date(Date.UTC(y, m - 1, d, hour)), method);
    const g = p.date.gregorian; // DD-MM-YYYY
    if (g === `${pad(d)}-${pad(m)}-${y}`) { payload = p; break; }
  }
  if (!payload) throw new Error(`تعذّر تثبيت اليوم ${day} لـ ${city}`);
  const t = Object.fromEntries(payload.prayers.map((p) => [p.key, p.time24]));
  results.push({
    name: city, lat, lon, tz, method, madhab, highLatitude: hl,
    adjustments: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, ...adj },
    day, times: t,
  });
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(results, null, 1) + "\n");
console.log(results.length, "حالة →", out);
