#!/usr/bin/env node
/**
 * بوابة نظام الخطوط (font-system.css) — تفشل عند أي انحراف عن التركيبة المعتمدة:
 *   "Almarai" (300/400/700/800) — الخط الوحيد للتطبيق؛ --font-ui/--font-text/--font-quran كلها تشير إليه
 * القواعد:
 *   1) تعريفات @font-face في src/styles/font-system.css فقط (+ صفحات HTML المستقلة خارج التطبيق).
 *   2) ملفات woff2 (ar + lat لكل وزن) + رخصة OFL في public/fonts/almarai/.
 *   3) لا Google Fonts/CDN، ولا اسم خط قديم في أي مكان.
 *   4) كل font-family في CSS يستهلك var(--font-ui|text|quran|mono) فقط (أو inherit)،
 *      باستثناء خطوط جليفات المصحف (qpc-v2 / --mm-qpc-family / --nm-qpc-family / --qe-reader-font).
 *   5) letter-spacing صفر للنص العربي (لا تباعد يكسر اتصال الحروف).
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fail = [];
const rel = (p) => path.relative(ROOT, p);

function walk(dir, exts, out = []) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (["node_modules", "dist", "__tests__", "qpc-v2"].includes(name)) continue;
      walk(p, exts, out);
    } else if (exts.some((e) => name.endsWith(e))) out.push(p);
  }
  return out;
}

/* ── 1+2) font-system.css والملفات ── */
const fontSystemPath = path.join(ROOT, "src/styles/font-system.css");
const deferredPath = path.join(ROOT, "src/styles/font-faces-deferred.css");
const fontSystem =
  (existsSync(fontSystemPath) ? readFileSync(fontSystemPath, "utf8") : "") +
  (existsSync(deferredPath) ? readFileSync(deferredPath, "utf8") : "");
if (!fontSystem) fail.push("src/styles/font-system.css غير موجود");

const WEIGHTS = [300, 400, 700, 800];
for (const w of WEIGHTS) {
  for (const sub of ["ar", "lat"]) {
    const f = `almarai-${w}-${sub}.woff2`;
    if (!existsSync(path.join(ROOT, "public/fonts/almarai", f))) fail.push(`ملف الخط مفقود: public/fonts/almarai/${f}`);
    if (!fontSystem.includes(`/fonts/almarai/${f}`)) fail.push(`تعريفات الخطوط لا تشير إلى ${f}`);
  }
}
if (!/font-family:\s*"Almarai"/.test(fontSystem)) fail.push('font-system.css بلا @font-face للعائلة "Almarai"');
if (/font-family:\s*"(?!Almarai")/.test(fontSystem)) fail.push("@font-face لعائلة غير Almarai في ملفات نظام الخطوط");
if (/font-display:\s*(?!swap)\w+/.test(fontSystem)) fail.push("font-display يجب أن يكون swap في font-system.css");
if (!existsSync(path.join(ROOT, "public/fonts/almarai/OFL-Almarai.txt"))) fail.push("رخصة OFL مفقودة: public/fonts/almarai/OFL-Almarai.txt");
for (const t of ["--font-ui", "--font-text", "--font-quran"]) {
  if (!new RegExp(`${t}:\\s*("Almarai"|var\\(--font-ui\\))`).test(fontSystem)) fail.push(`font-system.css يجب أن يعرّف ${t} ليشير إلى Almarai`);
}
const faceCount = (fontSystem.match(/@font-face/g) || []).length;
if (faceCount !== 8) fail.push(`عدد @font-face في ملفات نظام الخطوط = ${faceCount} (المتوقع 8: 4 أوزان × ar/lat)`);
if (existsSync(path.join(ROOT, "public/fonts/sunnah"))) fail.push("مجلد الخطوط القديم public/fonts/sunnah يجب أن يُحذف");

/* @font-face خارج font-system.css (التطبيق فقط؛ صفحات HTML المستقلة مستثناة) */
for (const p of walk(path.join(ROOT, "src"), [".css", ".ts", ".tsx"])) {
  if (p === fontSystemPath || p === deferredPath) continue;
  if (/@font-face/.test(readFileSync(p, "utf8"))) fail.push(`@font-face خارج font-system.css: ${rel(p)}`);
}

/* ── 3) CDN وأسماء قديمة ── */
const OLD = /IBM Plex|Plex Sans|\bAmiri|Sunnah (UI|Text|Quran)|fonts\/sunnah|Scheherazade|Noto Naskh|Noto Sans Arabic|Aref Ruqaa|Alexandria|Traditional Arabic|Tajawal|\bCairo\b|MajlisAmiriFallback|MajlisFallback|KFGQPC|Arabic Typesetting|--font-app\b|--font-reading\b|--font-body\b|--font-display\b|--mj-ui\b|--mj-face\b|--v2-font-|--sf-font-|fonts\/ui\/|fonts-ui/;
const CDN = /fonts\.googleapis\.com|fonts\.gstatic\.com|use\.typekit|cdn\.jsdelivr\.net\/npm\/@fontsource/;
const scanTargets = [
  ...walk(path.join(ROOT, "src"), [".css", ".ts", ".tsx"]),
  ...walk(path.join(ROOT, "public"), [".html", ".js", ".svg"]),
  path.join(ROOT, "index.html"),
];
for (const p of scanTargets) {
  const text = readFileSync(p, "utf8");
  if (CDN.test(text)) fail.push(`رابط CDN للخطوط في ${rel(p)}`);
  const m = text.match(OLD);
  if (m && !p.endsWith("verify-font-consistency.mjs")) fail.push(`اسم/متغيّر خط قديم "${m[0]}" في ${rel(p)}`);
}

/* ── 4) font-family في CSS ── */
function declarations(text) {
  const out = [];
  const re = /(?<![-\w])font-family\s*:/gi;
  let m;
  while ((m = re.exec(text))) {
    let i = m.index + m[0].length;
    let depth = 0;
    let quote = null;
    let j = i;
    for (; j < text.length; j++) {
      const c = text[j];
      if (quote) {
        if (c === quote) quote = null;
      } else if (c === '"' || c === "'") quote = c;
      else if (c === "(") depth++;
      else if (c === ")") depth--;
      else if (depth <= 0 && (c === ";" || c === "}")) break;
    }
    out.push(text.slice(i, j).trim().replace(/\s*!important\s*$/i, ""));
  }
  return out;
}
const ALLOWED = /^(inherit|initial|unset|revert|var\(--font-(ui|text|quran|mono)\))$/;
const QPC = /qpc|--qe-reader-font/i;
for (const p of walk(path.join(ROOT, "src"), [".css"])) {
  if (p === fontSystemPath || p === deferredPath) continue;
  const text = readFileSync(p, "utf8");
  for (const v of declarations(text)) {
    const one = v.replace(/\s+/g, " ");
    if (ALLOWED.test(one) || QPC.test(one)) continue;
    fail.push(`font-family غير مسموح في ${rel(p)}: ${one.slice(0, 80)}`);
  }
}

/* ── 5) letter-spacing ── */
for (const p of walk(path.join(ROOT, "src"), [".css"])) {
  if (rel(p).startsWith("src/features/mushaf")) continue; // هندسة QPC
  const text = readFileSync(p, "utf8");
  const re = /letter-spacing\s*:\s*([^;}]+)/gi;
  let m;
  while ((m = re.exec(text))) {
    const v = m[1].trim().replace(/\s*!important$/i, "");
    if (!/^(0|0px|0em|0rem|normal|inherit|initial|unset|var\([^)]*\))$/.test(v)) fail.push(`letter-spacing غير صفري في ${rel(p)}: ${v}`);
  }
}

if (fail.length) {
  console.error("✗ فحص نظام الخطوط فشل:\n" + fail.slice(0, 60).map((f) => "  - " + f).join("\n"));
  if (fail.length > 60) console.error(`  … و${fail.length - 60} أخرى`);
  process.exit(1);
}
console.log("✓ فحص نظام الخطوط: Almarai — 8 أوجه، بلا CDN ولا خط قديم ولا font-family خارج الرموز");
