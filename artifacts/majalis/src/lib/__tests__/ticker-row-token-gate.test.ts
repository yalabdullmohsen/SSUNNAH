/**
 * بوابة: ارتفاع صف الشريط المتحرك (الجوال) من رمز واحد --ticker-row-h متاح من أول رسم،
 * وبلا 0 بلا وحدة في رموز الشريط المستعملة داخل calc() (يُبطل calc فينطوي الصف 52.8→10.6→46.4).
 * تشغيل: node --import tsx src/lib/__tests__/ticker-row-token-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

const files = [
  "index.html",
  "src/styles/critical-first-paint.css",
  "src/styles/final-release.css",
  "src/styles/theme-aliases.css",
  "src/styles/components/top-chrome-layout.css",
  "src/app/styles/theme.css",
];

/* 1) لا 0 بلا وحدة في أي رمز شريط */
for (const rel of files) {
  const css = strip(read(rel));
  for (const m of css.matchAll(/--ticker[\w-]*\s*:\s*([^;}]+)/g)) {
    assert.doesNotMatch(m[1].trim(), /^0$/, `${rel}: ${m[0]} — 0 بلا وحدة يُبطل calc()`);
  }
}

/* 2) مصدر واحد لارتفاع الصف على الجوال: نفس الصيغة في CSS الحرج المضمّن وcritical-first-paint وNavBar */
const ROW = /--ticker-row-h:\s*calc\(var\(--ticker-h(?:,\s*2\.65rem)?\)\s*\+\s*\.?0?\.25rem\)/;
const inline = read("index.html").match(/<style id="mj-lcp-critical">([\s\S]*?)<\/style>/)?.[1] ?? "";
assert.match(inline, ROW, "CSS الحرج المضمّن يعرّف --ticker-row-h النهائي (46.4px)");
assert.match(strip(read("src/styles/critical-first-paint.css")), ROW, "critical-first-paint: نفس الرمز");
const top = strip(read("src/styles/components/top-chrome-layout.css"));
assert.match(top, ROW, "top-chrome-layout: نفس الرمز");
assert.doesNotMatch(top, /--ticker-row-h:\s*calc\([^)]*0\.65rem\)/, "لا صيغة صف ثانية (+0.65rem) على الجوال");
{
  const row = top.match(/\.navbar-ticker-row\s*\{([^}]*)\}/)?.[1] ?? "";
  for (const p of ["height", "min-height", "max-height"]) {
    assert.match(row, new RegExp(`(^|[;\\s])${p}:\\s*var\\(--ticker-row-h\\)`), `NavBar: ${p} من --ticker-row-h`);
  }
}

/* 3) theme-aliases لا يفرض هندسة الصف على الجوال */
{
  const ta = strip(read("src/styles/theme-aliases.css"));
  const base = [...ta.matchAll(/(^|\})\s*\.navbar-ticker-row\s*\{([^}]*)\}/g)].map((m) => m[2]).join("\n");
  assert.doesNotMatch(base, /(min-)?height\s*:/, "theme-aliases: لا height/min-height عامة على .navbar-ticker-row");
}

console.log("ticker-row-token-gate.test.ts: ok");
