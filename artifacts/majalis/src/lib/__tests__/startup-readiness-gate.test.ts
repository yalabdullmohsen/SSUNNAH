/**
 * بوابة عقد جاهزية الإقلاع المختصر.
 * تشغيل: node --import tsx src/lib/__tests__/startup-readiness-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const indexHtml = read("index.html");
assert.match(indexHtml, /MutationObserver/, "index يراقب commit لـ #root");
assert.match(indexHtml, /getElementById\("root"\)/, "جاهزية عبر #root");
assert.match(indexHtml, /__mjShellStableFired/, "shell-stable مرة واحدة");
assert.doesNotMatch(indexHtml, /mj:startup-ready|mj:app-shell-ready/, "لا جسر أحداث جاهزية موسّع");
assert.doesNotMatch(
  indexHtml,
  /addEventListener\(\s*["']mj:boot-ready["'][\s\S]{0,260}clearBooting/,
  "لا إخفاء على boot-ready وحدها",
);
assert.match(indexHtml, /setTimeout\(clearBooting,\s*1400\)/, "سقف أمان موجود");

const app = read("src/App.tsx");
assert.doesNotMatch(app, /startup-readiness|armSu|suNav|suBottom|app-shell-ready/, "لا جسر من App");

const splash = read("src/lib/splash-screen.ts");
assert.match(splash, /mj:shell-stable/, "إخفاء الدخولية بعد shell-stable");
assert.doesNotMatch(
  splash,
  /addEventListener\(\s*["']mj:boot-ready["']/,
  "لا إخفاء مبكر على boot-ready",
);

assert.doesNotMatch(read("src/lib/boot-readiness.ts"), /startup-readiness|armSu/, "boot بلا جسر");
assert.doesNotMatch(read("src/components/NavBar.tsx"), /suNav/, "Nav بلا dataset جاهزية");
assert.doesNotMatch(read("src/components/BottomNavBar.tsx"), /suBottom/, "Bottom بلا dataset جاهزية");

const native = read("public/native-load-error.html");
assert.match(native, /جاري تجهيز الصفحة/, "النص محفوظ");
assert.match(native, /\.is-loading \.soft-status/, "إخفاء بصري أثناء الاستعادة");

assert.equal(existsSync(resolve(root, "android")), false, "android/ retired");

assert.match(
  read("src/styles/critical-first-paint.css"),
  /--nav-h/,
  "ارتفاع التذييل محجوز أثناء app-booting",
);

console.log("startup-readiness-gate.test.ts: ok");
