/**
 * بوابة CLS — تمنع عودة صدفة HTML وتحصّن حجز hsh-steps.
 * القياس الفعلي = LHCI (3 جولات). هذه البوابة = حماية من التراجع الهيكلي.
 * تشغيل: node --import tsx src/lib/__tests__/cls-home-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const require = createRequire(import.meta.url);
const { getPreviewThresholds } = require(resolve(root, "scripts/lhci-thresholds.cjs"));
const preview = getPreviewThresholds();

const html = readFileSync(resolve(root, "index.html"), "utf8");
const critical = readFileSync(resolve(root, "src/styles/critical-first-paint.css"), "utf8");
const fontsUi = readFileSync(resolve(root, "src/styles/fonts-ui.css"), "utf8");
const fontsBold = readFileSync(resolve(root, "src/styles/fonts-ui-bold.css"), "utf8");
const lhciRc = require(resolve(root, "lighthouserc.cjs"));

assert.doesNotMatch(html, /mj-home-lcp-static|mj-app-mount/, "لا صدفة نصّية/ mount منفصل");
assert.doesNotMatch(html, /id="mj-boot-skeleton"/, "بلا هيكل تحميل كامل الشاشة");
assert.doesNotMatch(html, /#mj-boot-skeleton/, "بلا أنماط هيكل إقلاع حاجب");
assert.match(html, /id="mj-launch-splash"/, "دخولية MajlisSplash");
const boot = readFileSync(resolve(root, "public/mj-launch-splash-boot.js"), "utf8");
assert.match(html, /src="\/mj-launch-splash-boot\.js"/);
assert.match(boot, /SOFT_MAX_MS\s*=\s*480/, "هدف LCP ليّن");
assert.match(boot, /MAX_MS\s*=\s*1400/, "سقف انتظار خطوط");
assert.match(boot, /MIN_MS\s*=\s*0/, "بلا تأخير اصطناعي");
assert.match(critical, /\.hsh-steps[\s\S]*min-height:\s*14rem/, "حجز ارتفاع hsh-steps بعد ضغط ابدأ من هنا");
assert.match(critical, /\.hsh-step[\s\S]*min-height:\s*3\.5rem/, "حجز ارتفاع hsh-step المضغوط");
assert.match(critical, /\.home-page-hero\.page-hero-mj[\s\S]*min-height:\s*18rem/, "حجز ارتفاع هيرو الرئيسية = النهائي");
assert.match(critical, /\.hus-field[\s\S]*min-height:\s*52px/, "حجز شريط البحث");
assert.match(critical, /\.daily-wird-card[\s\S]*min-height:\s*28rem/, "حجز ورد اليوم يبقى في CSS الحرج للتوافق");
assert.match(critical, /\.navbar-v3__tagline-mark[\s\S]*aspect-ratio/, "حجز وردمارك الهيدر");
{
  const home = readFileSync(resolve(root, "src/pages/account/ui/HomeView.tsx"), "utf8");
  const hero = readFileSync(resolve(root, "src/components/home/HomeHeroLcp.tsx"), "utf8");
  assert.match(hero, /HomePrimaryDiscoveryPlaceholder/, "هيكل الاكتشاف الأساسي يحجز الارتفاع");
  assert.match(home, /HomePrimaryDiscoveryPlaceholder/, "الرئيسية تستخدم هيكل الاكتشاف");
  assert.match(home, /HomePrimaryDiscoveryGate/, "بوابة الاكتشاف موجودة");
}
{
  /* بنية الماركي انتقلت من final-release إلى header-ticker-polish (متزامن مع المكوّن) */
  const finalRelease =
    readFileSync(resolve(root, "src/styles/final-release.css"), "utf8") +
    readFileSync(resolve(root, "src/styles/components/header-ticker-polish.css"), "utf8");
  assert.doesNotMatch(
    finalRelease,
    /\.header-ticker--empty\s*\{\s*display:\s*none/,
    "لا طي شريط الأخبار الفارغ بـ display:none",
  );
  assert.match(finalRelease, /\.header-ticker--empty[\s\S]*visibility:\s*hidden/, "حجز ارتفاع الشريط الفارغ");
}
{
  const polish = readFileSync(resolve(root, "src/styles/ssunnah-ux-polish.css"), "utf8");
  assert.match(polish, /\.home-sacred-day--ph[\s\S]*min-height:\s*6\.25rem/, "min-height لهيكل آية اليوم المضغوط");
}
{
  const boot = readFileSync(resolve(root, "public/mj-launch-splash-boot.js"), "utf8");
  assert.match(
    boot,
    /if\s*\(\s*!shellStable\s*&&\s*elapsed\s*<\s*MAX_MS\s*\)\s*return/,
    "الدخولية تنتظر shell-stable",
  );
}
assert.doesNotMatch(
  readFileSync(resolve(root, "src/styles/components/home-brand-title.css"), "utf8"),
  /min-height:\s*unset/,
  "لا min-height:unset في هيرو الرئيسية",
);
assert.doesNotMatch(fontsUi, /font-display:\s*swap/, "لا font-display:swap لخطوط الواجهة");
assert.match(html, /font-display:optional;src:url\("\/fonts\/ui\/amiri-400-ar/, "Amiri 400 optional — لا يحجب LCP");
assert.match(html, /font-display:optional;src:url\("\/fonts\/ui\/amiri-700-ar/, "Amiri 700 optional من الإقلاع — بلا قفزة وزن");
assert.match(fontsBold, /Aref Ruqaa[\s\S]*font-display:\s*optional/, "Aref Ruqaa 700 optional مؤجّل زخرفيًا");
assert.doesNotMatch(fontsBold, /amiri-700/, "Amiri 700 لم يعد مؤجّلًا في fonts-ui-bold");
assert.equal(
  lhciRc.ci.assert.assertions["cumulative-layout-shift"][1].maxNumericValue,
  preview.cls,
  `LHCI CLS ≤${preview.cls} (main+10%)`,
);


{
  const hero = readFileSync(resolve(root, "src/components/home/HomeHeroLcp.tsx"), "utf8");
  assert.match(hero, /export function HomeRestShell/, "HomeRestShell موجود");
  assert.match(
    hero,
    /HomeRestShell[\s\S]*HomePrimaryDiscoveryPlaceholder[\s\S]*HomeLiveNowPlaceholder[\s\S]*HomeBelowFoldPlaceholder/,
    "HomeRestShell يطابق ما تحت البحث (اكتشاف→بث→تحت الطية)",
  );
  assert.doesNotMatch(
    hero,
    /HomeRestShell[\s\S]*HomeSearchShell/,
    "البحث خارج Suspense فوق الطية — ليس داخل RestShell",
  );
  const appSrc = readFileSync(resolve(root, "src/App.tsx"), "utf8");
  assert.match(
    appSrc,
    /HomeUniversalSearch[\s\S]*HomeHeroLcp[\s\S]*HomeStartHereSection[\s\S]*HomePage/,
    "ترتيب الرئيسية: بحث→هوية→ابدأ→المحتوى",
  );
  assert.match(critical, /\.mj-home-primary-discovery-ph[\s\S]*min-height:\s*22rem/, "حجز الاكتشاف المضغوط في CSS الحرج");
  assert.match(critical, /\.home-live-now-ph[\s\S]*min-height:\s*3\.25rem/, "حجز البث في CSS الحرج");
  assert.match(
    critical,
    /\.home-start-here--compact[\s\S]*min-height:\s*12\.5rem|\.home-start-here,.home-start-here--slim,.home-start-here--compact[\s\S]*min-height:\s*12\.5rem/,
    "حجز ابدأ من هنا = ارتفاع المحتوى الفعلي ≈194px (20rem كان فراغًا ظاهرًا)",
  );
}


console.log("cls-home-gate.test.ts: ok");
