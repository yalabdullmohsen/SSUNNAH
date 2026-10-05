/**
 * STARTUP_SMOOTHNESS — يقفل الأسباب الجذرية لقفزات الدخولية (docs/performance/STARTUP_SMOOTHNESS.md):
 * 1) @font-face لـ Amiri العربية + البدائل المعايَرة: مصدر وحيد مضمّن في index.html.
 *    أي إعادة تعريف في CSS يصل بعد أول رسم تُنشئ FontFace جديدًا يُحمَّل من الكاش → تبديل خط مرئي.
 * 2) local() بأسماء PostScript/Full (اسم العائلة "Geeza Pro" لا يطابق local() في Chromium/WebKit).
 * 3) ارتفاع الشريط السفلي ثابت منذ أول رسم = القيمة النهائية (64px + safe-area)، بلا padding مؤقت.
 * 4) هيدر الإقلاع (ChromeNavFallback) بتخطيط NavBar النهائي (شبكة 3 أعمدة) — لا نزول __end لسطر ثانٍ.
 * 5) خلفية v2 قبل وصول رموزها = --mj-bg (لا #f9f8f4 مؤقت).
 * 6) الثيم: مصدر وحيد في سكربت mj-theme-boot قبل أول رسم.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(root, "../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const html = read("index.html");
const lcp = html.match(/<style id="mj-lcp-critical">([\s\S]*?)<\/style>/)?.[1] ?? "";
assert.ok(lcp.length > 0, "mj-lcp-critical موجود");

// 1) مصدر وحيد لأوجه Amiri العربية
const arFaces = lcp.match(/@font-face\{font-family:"Amiri";[^}]*amiri-[47]00-ar\.woff2[^}]*\}/g) ?? [];
assert.equal(arFaces.length, 2, "وجهان عربيان لـ Amiri (400–500 و600–800) مضمّنان");
for (const f of arFaces) {
  assert.match(f, /font-display:optional/, "optional — لا swap");
  assert.match(f, /ascent-override:95%/);
}
assert.match(html, /rel="preload"[^>]+amiri-400-ar\.woff2/);
assert.match(html, /rel="preload"[^>]+amiri-700-ar\.woff2/);

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
  assert.doesNotMatch(css, /amiri-[47]00-ar\.woff2/, `${rel}: لا إعادة تعريف لأوجه Amiri العربية خارج index.html`);
  assert.doesNotMatch(
    css,
    /font-family:\s*"Majlis(Amiri)?Fallback"\s*;[^}]*src:/,
    `${rel}: لا إعادة تعريف لوجه بديل خارج index.html`,
  );
}

// 2) بدائل معايَرة بأسماء local() صحيحة + وزن عريض
assert.match(lcp, /"MajlisAmiriFallback";src:local\("Noto Naskh Arabic Regular"\)[^}]*size-adjust:97%/);
assert.match(lcp, /"MajlisAmiriFallback";font-weight:600 800;src:local\("Noto Naskh Arabic Bold"\)/);
assert.match(lcp, /"MajlisFallback";src:local\("Geeza Pro Regular"\),local\("GeezaPro"\);size-adjust:/);
assert.match(lcp, /"MajlisFallback";font-weight:600 800;src:local\("Geeza Pro Bold"\),local\("GeezaPro-Bold"\)/);
assert.doesNotMatch(lcp, /src:local\("Geeza Pro"\)/, "اسم العائلة وحده لا يطابق local()");
assert.match(lcp, /--font-app:"Amiri","MajlisAmiriFallback","MajlisFallback"/);

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
