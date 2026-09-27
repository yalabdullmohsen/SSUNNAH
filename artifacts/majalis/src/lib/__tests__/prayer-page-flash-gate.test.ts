/**
 * بوابة: لا إطار أبيض/كريمي عند فتح مواقيت الصلاة.
 * تشغيل: node --import tsx src/lib/__tests__/prayer-page-flash-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const app = read("src/App.tsx");
const shell = read("src/styles/prayer-route-shell.css");
const lrf = read("src/components/LazyRouteFallback.tsx");
const page = read("src/pages/worship/ui/PrayerTimesView.tsx");
const prefetch = read("src/lib/prefetch-route.ts");
const bottom = read("src/components/BottomNavBar.tsx");
const top = read("src/components/TopSectionBar.tsx");

assert.match(app, /prayer-route-shell\.css/, "صدفة الصلاة تُحمَّل مع App");
assert.match(
  app,
  /useLayoutEffect\(\(\) => \{\s*document\.documentElement\.classList\.toggle\("pts-immersive"/,
  "pts-immersive عبر useLayoutEffect قبل الطلاء",
);
assert.doesNotMatch(
  app,
  /useEffect\(\(\) => \{\s*document\.documentElement\.classList\.toggle\("pts-immersive"/,
  "ممنوع تأخير pts-immersive إلى useEffect",
);

assert.match(shell, /html\.pts-immersive/, "سطح زيتوني فوري");
assert.match(shell, /\.lrf-wrap--prayer/, "هيكل Suspense على سطح الصلاة");
assert.match(shell, /\.pts-screen--boot/, "حجز مساحة قبل البيانات");
assert.match(shell, /background-color:\s*var\(--pts-shell-bg0/, "خلفية صدفة غير بيضاء");

assert.match(lrf, /lrf-wrap--prayer/);
assert.match(lrf, /lrf-skel--prayer/);
assert.match(lrf, /lrf-skel__hero/);

assert.match(page, /pts-screen--boot/);
assert.match(page, /pts-boot-hero/);
assert.doesNotMatch(
  page,
  /pts-hint--skeleton/,
  "لا hint كريمي أثناء تحميل المواقيت",
);

assert.match(prefetch, /prayer-times\.css/, "تسخين CSS الصلاة مع المسار");
assert.match(bottom, /classList\.add\("pts-immersive"\)/, "نية الشريط السفلي تطلي السطح فورًا");
assert.match(bottom, /prayer-times\.css/);
assert.match(top, /classList\.add\("pts-immersive"\)/, "نية الشريط العلوي تطلي السطح فورًا");
assert.match(top, /prayer-times\.css/);

console.log("prayer-page-flash-gate.test.ts: ok");
