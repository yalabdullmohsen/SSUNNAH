/**
 * STARTUP_SMOOTHNESS — يقفل الأسباب الجذرية لقفزات الدخولية (docs/performance/STARTUP_SMOOTHNESS.md):
 * 1) @font-face لنظام الخطوط (Sunnah UI/Text/Quran): مصدر وحيد font-system.css (الحرجة inline) + font-faces-deferred.css.
 *    أي إعادة تعريف في CSS يصل بعد أول رسم تُنشئ FontFace جديدًا يُحمَّل من الكاش → تبديل خط مرئي.
 * 2) لا وجه يُعرَّف مرتين.
 * 3) ارتفاع الشريط السفلي ثابت منذ أول رسم = القيمة النهائية (64px + safe-area)، بلا padding مؤقت.
 * 4) هيدر الإقلاع (ChromeNavFallback) بتخطيط NavBar النهائي (شبكة 3 أعمدة) — لا نزول __end لسطر ثانٍ.
 * 5) خلفية v2 قبل وصول رموزها = --mj-bg (لا #f9f8f4 مؤقت).
 * 6) الثيم: مصدر وحيد في سكربت mj-theme-boot قبل أول رسم.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fontSystemCss, renderedIndexHtml } from "./font-system-test-helper";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(root, "../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const html = read("index.html");
const lcp = html.match(/<style id="mj-lcp-critical">([\s\S]*?)<\/style>/)?.[1] ?? "";
assert.ok(lcp.length > 0, "mj-lcp-critical موجود");

// 1) مصدر وحيد لتعريفات الخطوط: font-system.css (الأوجه الحرجة تُحقن inline) + font-faces-deferred.css (الباقي)
const rendered = renderedIndexHtml();
const fontSystemInline = rendered.match(/<style id="mj-font-system">([\s\S]*?)<\/style>/)?.[1] ?? "";
assert.ok(fontSystemInline.length > 0, "mj-font-system مُحقن في index.html");
const criticalFaces = fontSystemInline.match(/@font-face\{[^}]*\}/g) ?? [];
assert.equal(criticalFaces.length, 5, "5 أوجه حرجة مضمّنة: Sunnah UI 400/600 (عربي+لاتيني) وSunnah Text 400 عربي");
for (const f of criticalFaces) {
  assert.match(f, /font-display:swap/, "swap — نص مرئي دائمًا");
  assert.match(f, /unicode-range:/);
}
assert.match(rendered, /rel="preload"[^>]+plex-sans-arabic-400-ar\.woff2/);
assert.match(rendered, /rel="preload"[^>]+plex-sans-arabic-600-ar\.woff2/);
assert.match(rendered, /rel="preload"[^>]+amiri-400-ar\.woff2/);
assert.doesNotMatch(rendered, /Majlis(Amiri)?Fallback/, "لا خطوط بديلة معايَرة قديمة");

const cssFiles: string[] = [];
const walk = (dir: string) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = resolve(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".css")) cssFiles.push(p);
  }
};
walk(resolve(root, "src"));
for (const file of cssFiles) {
  const css = readFileSync(file, "utf8");
  const rel = file.slice(root.length + 1);
  if (rel.endsWith("styles/font-system.css") || rel.endsWith("styles/font-faces-deferred.css")) continue;
  assert.doesNotMatch(css, /fonts\/sunnah\//, `${rel}: لا إعادة تعريف لأوجه الخطوط خارج font-system.css/font-faces-deferred.css`);
  assert.doesNotMatch(css, /@font-face/, `${rel}: لا @font-face خارج ملفي نظام الخطوط`);
}

// 2) لا وجه يُعرَّف مرتين (كان يسبب FontFace ثانيًا وتبديلًا مرئيًا)
const allFaces = fontSystemCss().match(/src:\s*url\("([^"]+)"\)/g) ?? [];
assert.equal(new Set(allFaces).size, allFaces.length, "كل ملف خط مُعرَّف مرة واحدة");
assert.equal(allFaces.length, 13, "13 وجهًا: UI×8 + Text×4 + Quran×1");
/* الواجهة Sunnah UI من أول رسم عبر --font-ui */
assert.match(lcp, /font-family:var\(--font-ui\)/);
assert.match(fontSystemInline, /--font-ui:"Sunnah UI",-apple-system/);

// 3) الشريط السفلي: ارتفاع ثابت منذ أول رسم ولا padding مؤقت يغيّره
const critical = read("src/styles/critical-first-paint.css");
assert.match(
  critical,
  /\.bottom-nav,\.bottom-nav--v2\{[^}]*padding-top:\.2rem;padding-bottom:var\(--inset-bottom,0px\);height:calc\(var\(--bottom-nav-height,64px\) \+ var\(--inset-bottom,0px\)\)/,
);
const finalRelease = read("src/styles/final-release.css");
assert.match(finalRelease, /height:\s*calc\(var\(--bottom-nav-height,\s*64px\)\s*\+\s*var\(--inset-bottom,\s*0px\)\)\s*!important/);
assert.match(finalRelease, /padding-top:\s*0\.2rem\s*!important/);
const a11y = read("src/styles/sunnah-identity-responsive-a11y.css");
assert.doesNotMatch(a11y, /padding-bottom:\s*max\(0\.35rem/, "لا padding مؤقت للشريط السفلي");

// 4) هيدر الإقلاع بتخطيط NavBar النهائي
const bootPh = read("src/styles/components/chrome-boot-ph.css");
assert.match(bootPh, /\.chrome-boot-ph \.navbar-v3__inner\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*auto minmax\(0, 1fr\) auto;/);
assert.match(bootPh, /\.chrome-boot-ph \.navbar-v3__end\s*\{[^}]*display:\s*flex;/);
assert.match(read("src/App.tsx"), /import "@\/styles\/components\/chrome-boot-ph\.css";/, "يُحمَّل متزامنًا مع App");

// 5) خلفية v2 قبل وصول الرموز
for (const f of readdirSync(resolve(root, "src/styles/pages")).filter((n) => n.endsWith("-v2.css"))) {
  const css = read(`src/styles/pages/${f}`);
  assert.doesNotMatch(css, /var\(--v2-color-ivory,\s*#f9f8f4\)/i, `${f}: fallback = --mj-bg`);
}

// 6) الثيم: سكربت إقلاع واحد يحسم data-theme قبل أول رسم + لون شاشة الدخول
const themeBoot = html.match(/<script id="mj-theme-boot">([\s\S]*?)<\/script>/)?.[1] ?? "";
assert.match(themeBoot, /html\.dataset\.theme = resolved/);
assert.ok(html.indexOf('id="mj-theme-boot"') < html.indexOf('id="mj-lcp-critical"'), "الثيم قبل CSS الحرج");
const cap = JSON.parse(read("capacitor.config.json"));
assert.equal(cap.plugins.SplashScreen.launchAutoHide, false, "Capacitor splash يُخفى بعد الجاهزية");
assert.match(read("src/lib/splash-screen.ts"), /SplashScreen\.hide\(\{\s*fadeOutDuration:/);

// التوثيق
const doc = readFileSync(resolve(repoRoot, "docs/performance/STARTUP_SMOOTHNESS.md"), "utf8");
assert.match(doc, /STARTUP_SMOOTHNESS/);
assert.match(doc, /قبل/);

console.log("startup-smoothness gate: OK");
