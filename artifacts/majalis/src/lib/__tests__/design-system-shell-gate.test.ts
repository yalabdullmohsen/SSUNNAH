/**
 * بوابة نظام التصميم الموحّد والهيكل الجديد:
 *  1) خمسة تبويبات فقط، بلا قائمة جانبية/تيكر/زر «أعلى» عائم، و/more صفحة حقيقية.
 *  2) tokens.css مصدر القيم البصرية: سلّم iOS، شبكة 4، زوايا، ثلاثة ظلال، حركة 150/250/350.
 *  3) تباين WCAG AA للأزواج الأساسية في الفاتح والداكن.
 *  4) لا قيم ألوان/أحجام خطوط حرفية داخل ds.css والمكوّنات.
 * تشغيل: node --import tsx src/lib/__tests__/design-system-shell-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

/* 1) الهيكل */
const tabs = read("src/design-system/shell/tabs.ts");
const ids = [...tabs.matchAll(/\{\s*id:\s*"([a-z]+)"/g)].map((m) => m[1]);
assert.deepEqual(ids, ["home", "quran", "lessons", "worship", "more"], "خمسة تبويبات: الرئيسية/القرآن/الدروس/العبادات/المزيد");

const app = read("src/App.tsx");
assert.match(app, /AppTabBar/, "App يستعمل AppTabBar");
assert.match(app, /AppTopBar/, "App يستعمل AppTopBar");
for (const legacy of ["components/NavBar", "components/BottomNavBar", "components/SideNavDrawer", "components/TopSectionBar", "components/ScrollToTop", "components/HeaderTicker"]) {
  assert.doesNotMatch(app, new RegExp(legacy.replace("/", "\\/")), `${legacy} أُزيل من الهيكل`);
}
const routes = read("src/AppRoutes.tsx");
assert.match(routes, /path="\/more"><SafeLazyRoute component=\{MorePage\}/, "/more صفحة «المزيد» لا توجيه");
assert.match(routes, /path="\/worship"><SafeLazyRoute component=\{WorshipPage\}/, "/worship تبويب العبادات");

/* 2) الرموز */
const dsCss = read("src/design-system/design-system.css");
const MARK = "TOKENS-END";
const tokens = dsCss.slice(0, dsCss.indexOf(MARK));
const components = dsCss.slice(dsCss.indexOf(MARK));
const need = [
  "--sn-bg", "--sn-surface", "--sn-surface-2", "--sn-surface-elevated", "--sn-primary", "--sn-primary-strong", "--sn-primary-soft", "--sn-accent",
  "--sn-text-primary", "--sn-text-secondary", "--sn-text-tertiary", "--sn-text-on-primary", "--sn-separator", "--sn-success", "--sn-warning", "--sn-danger",
  "--sn-e1", "--sn-e2", "--sn-e3", "--sn-dur-fast", "--sn-dur-base", "--sn-dur-slow", "--sn-ease",
];
for (const t of need) assert.match(tokens, new RegExp(`${t}:`), `رمز ${t}`);
const darkBlock = tokens.slice(tokens.indexOf('html[data-theme="dark"]'));
for (const t of ["--sn-bg", "--sn-surface", "--sn-primary", "--sn-text-primary", "--sn-text-secondary", "--sn-separator", "--sn-e1"]) {
  assert.match(darkBlock, new RegExp(`${t}:`), `داكن: ${t}`);
}
const scale: Record<string, string> = { "large-title": "2.125rem", title1: "1.75rem", title2: "1.375rem", title3: "1.25rem", headline: "1.0625rem", body: "1rem", callout: "1rem", subhead: "0.875rem", footnote: "0.8125rem", caption: "0.75rem", hadith: "1.1875rem", "hadith-featured": "1.5rem", ayah: "1.375rem" };
for (const [k, v] of Object.entries(scale)) assert.match(tokens, new RegExp(`--sn-fs-${k}:\\s*${v.replace(".", "\\.")}`), `سلّم الطباعة ${k}=${v}`);
for (const [k, v] of Object.entries({ s1: 4, s2: 8, s3: 12, s4: 16, s5: 20, s6: 24, s7: 32, s8: 40 })) assert.match(tokens, new RegExp(`--sn-${k}:\\s*${v}px`), `شبكة 4: ${k}`);
assert.match(tokens, /--sn-page-x:\s*20px/, "هامش الصفحة 20");
for (const [k, v] of Object.entries({ sm: 10, md: 16, lg: 22, xl: 28 })) assert.match(tokens, new RegExp(`--sn-r-${k}:\\s*${v}px`), `زاوية ${k}`);
for (const [k, v] of Object.entries({ fast: 150, base: 250, slow: 350 })) assert.match(tokens, new RegExp(`--sn-dur-${k}:\\s*${v}ms`), `مدة ${k}`);
assert.match(tokens, /--sn-press-scale:\s*0\.97/, "ضغط 0.97");
assert.match(tokens, /prefers-reduced-motion/, "تقليل الحركة");

/* 3) التباين */
function lum(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
function block(css: string, startMarker: string) {
  const i = css.indexOf(startMarker);
  const j = css.indexOf("}", i);
  const out: Record<string, string> = {};
  for (const m of css.slice(i, j).matchAll(/--sn-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) out[m[1]] = m[2];
  return out;
}
const light = block(tokens, ":root {");
const dark = block(tokens, 'html[data-theme="dark"]');
for (const [mode, c] of [["فاتح", light], ["داكن", dark]] as const) {
  for (const bg of ["bg", "surface", "surface-2", "primary-soft"]) {
    assert.ok(ratio(c["text-primary"], c[bg]) >= 4.5, `${mode}: text-primary على ${bg}`);
    assert.ok(ratio(c["text-secondary"], c[bg]) >= 4.5, `${mode}: text-secondary على ${bg}`);
    assert.ok(ratio(c["primary"], c[bg]) >= 4.5, `${mode}: primary على ${bg}`);
  }
  assert.ok(ratio(c["text-tertiary"], c["bg"]) >= 4.5, `${mode}: text-tertiary على bg`);
  assert.ok(ratio(c["text-on-primary"], c["primary-strong"]) >= 4.5, `${mode}: text-on-primary على primary-strong`);
}

/* 4) لا قيم حرفية */
const files: string[] = [];
const walk = (d: string) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx|ts)$/.test(n)) files.push(p);
  }
};
walk(resolve(root, "src/design-system"));
const targets: Array<[string, string]> = [["design-system.css (المكوّنات)", components], ...files.map((f) => [f.slice(root.length + 1), readFileSync(f, "utf8")] as [string, string])];
for (const [rel, text] of targets) {
  assert.doesNotMatch(text, /#[0-9a-fA-F]{3,8}\b/, `${rel}: لون hex حرفي`);
  assert.doesNotMatch(text, /\brgba?\(/, `${rel}: rgb حرفي`);
  assert.doesNotMatch(text, /font-family\s*:(?!\s*var\(--font-)/, `${rel}: font-family خارج الرموز`);
  if (rel.endsWith("(المكوّنات)")) assert.doesNotMatch(text, /font-size\s*:\s*[\d.]+(px|rem)/, `${rel}: font-size حرفي`);
}
console.log("design-system-shell-gate: ok");
