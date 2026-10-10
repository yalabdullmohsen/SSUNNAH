#!/usr/bin/env node
/**
 * بوابة «لا زيادة» (ratchet) للنظام البصري.
 * تعدّ المخالفات في src/ وتقارنها بـ scripts/ui-ratchet-baseline.json:
 *  - زاد أي عدد  → فشل (exit 1)
 *  - نقص أي عدد  → يُحدَّث الـbaseline تلقائيًا
 * تشغيل: node scripts/ui-ratchet.mjs   |   --init لإنشاء/إعادة ضبط الـbaseline
 */
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { OLD_IMPORT } from "./ui-legacy-list.mjs";
import { TOKEN_DEFINITION_FILES } from "./ui-token-definition-files.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");
const baselinePath = join(root, "scripts/ui-ratchet-baseline.json");

const walk = (dir, out = []) => {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) {
      if (n === "__tests__" || n === "node_modules") continue;
      walk(p, out);
    } else out.push(p);
  }
  return out;
};
const rel = (f) => relative(root, f).split("\\").join("/");

/* ملفات تعريف الرموز مستثناة من عدّ الألوان/القيم */
const TOKEN_FILES = /(^|\/)(design-system\/design-system\.css|styles\/(brand-v4|design-tokens|card-system-tokens|breakpoints|font-system|font-faces-deferred|fonts-quran)\.css|lib\/theme\.ts)$/;
const NEW_SYSTEM = /^src\/design-system\//;
/* ملفات تعريف رموز صِرفة (حارسها اختبار يمنع أي لون خام خارج تصريح متغيّر) */
const DEFINITION_ONLY = new Set(TOKEN_DEFINITION_FILES);
const NAV_BAR = /^src\/design-system\/(navigation\.tsx|shell\/)/;

const files = walk(src).map((f) => ({ rel: rel(f), text: readFileSync(f, "utf8") }));
const code = files.filter((f) => /\.(tsx|ts)$/.test(f.rel));
const css = files.filter((f) => f.rel.endsWith(".css"));

const stripComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const count = (re, t) => (t.match(re) || []).length;

const SCALE = new Set([0, 1, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 9999]);
/* تطبيقات رجوع محلية فقط: نص «رجوع» حرفي داخل زر، أو history.back()/go(-1) يدويًا.
   استخدام المكوّن الموحَّد (AppBackButton/FloatingBackButton) هو الحلّ لا الدين، فلا يُعدّ. */
const BACK_BTN = />\s*(?:←\s*)?رجوع\s*<|history\.back\(\)|history\.go\(\s*-1\s*\)/g;
const BACK_AUTHORITY = /^src\/(components\/common\/AppBackButton|components\/FloatingBackButton|lib\/navigation-back|lib\/immersive-chrome)\.tsx?$/;

const m = {
  hexOutsideTokens: 0,
  outOfScaleValues: 0,
  localButtonsAndCards: 0,
  oldSystemImports: 0,
  backButtonsOutsideNavBar: 0,
};

for (const f of [...code, ...css]) {
  if (TOKEN_FILES.test(f.rel) || NEW_SYSTEM.test(f.rel)) continue;
  if (DEFINITION_ONLY.has(f.rel)) continue;
  const t = stripComments(f.text);
  m.hexOutsideTokens += count(/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b(?![\w-])/g, t);
  for (const d of t.matchAll(/(?:padding|margin|gap|border-radius)[\w-]*\s*:\s*([^;}"'`]+)/g)) {
    for (const px of d[1].matchAll(/(-?\d*\.?\d+)px/g)) {
      if (!SCALE.has(Math.abs(Number(px[1])))) m.outOfScaleValues++;
    }
  }
}

for (const f of code) {
  if (NEW_SYSTEM.test(f.rel)) continue;
  const t = stripComments(f.text);
  m.localButtonsAndCards += count(/<button\b/g, t);
  m.oldSystemImports += count(OLD_IMPORT, t);
  if (!NAV_BAR.test(f.rel) && !BACK_AUTHORITY.test(f.rel)) m.backButtonsOutsideNavBar += count(BACK_BTN, t);
}
for (const f of css) {
  if (TOKEN_FILES.test(f.rel) || NEW_SYSTEM.test(f.rel)) continue;
  m.localButtonsAndCards += count(/^\s*\.(?!sn-)[\w-]*-(?:card|btn|button)\s*[{,]/gm, stripComments(f.text));
}

const init = process.argv.includes("--init");
if (init || !existsSync(baselinePath)) {
  writeFileSync(baselinePath, JSON.stringify(m, null, 2) + "\n");
  console.log("ui-ratchet: baseline مكتوب", JSON.stringify(m));
  process.exit(0);
}

const base = JSON.parse(readFileSync(baselinePath, "utf8"));
const up = [];
const down = [];
for (const k of Object.keys(m)) {
  if (m[k] > base[k]) up.push(`${k}: ${base[k]} → ${m[k]}`);
  else if (m[k] < base[k]) down.push(`${k}: ${base[k]} → ${m[k]}`);
}
if (up.length) {
  console.error("ui-ratchet: زيادة مخالفات (ممنوع):\n  " + up.join("\n  "));
  process.exit(1);
}
if (down.length) {
  writeFileSync(baselinePath, JSON.stringify({ ...base, ...m }, null, 2) + "\n");
  console.log("ui-ratchet: انخفاض — حُدِّث الـbaseline:\n  " + down.join("\n  "));
} else console.log("ui-ratchet: ok", JSON.stringify(m));
