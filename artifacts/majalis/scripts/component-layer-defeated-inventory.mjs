#!/usr/bin/env node
/**
 * component-layer-defeated-inventory — مخزون التصريحات المهزومة لطبقات البطاقات/الأزرار/رموز الألوان.
 *
 * التصريح D «مهزوم إثباتًا» إذا وُجد لكل محدِّد (selector) في قائمته تصريحٌ E لنفس الخاصية
 * وبنفس المحدِّد حرفيًا وبشرط at-rule مساوٍ أو أعم، ويفوز E دائمًا بلا اعتماد على ترتيب تحميل كسول:
 *   - نفس الملف: E لاحق وأهميته ≥ أهمية D، أو E ‎!important‎ وD عادي (أيًا كان الترتيب).
 *   - ملفان: E في ورقة حرجة متزامنة (main.tsx) و(E ‎!important‎ وD عادي) أو (D حرج أيضًا وE بعده بنفس الأهمية).
 * تُستثنى قيم E الحديثة (dvh/color-mix/env…) لأنها قد تكون بديلًا احتياطيًا (fallback) في متصفح أقدم،
 * وتُستثنى ملفات/محدِّدات المصحف والقرآن والإدارة.
 *
 *   node scripts/component-layer-defeated-inventory.mjs           # ملخّص
 *   node scripts/component-layer-defeated-inventory.mjs --json    # القائمة كاملة
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** ترتيب الأوراق الحرجة المتزامنة في main.tsx (ترتيب الشلال مضمون في حزمة الدخول). */
export const CRITICAL_SHEETS = [
  "styles/fonts-ui.css",
  "app/styles/theme.css",
  "styles/sunnah-foundation-tokens.css",
  "styles/sunnah-foundation-v2.css",
  "styles/ssunnah-theme-api.css",
  "styles/brand-v4.css",
  "styles/design-tokens.css",
  "styles/breakpoints.css",
  "styles/typography-scale.css",
  "styles/typography-app.css",
  "index.css",
  "styles/theme-aliases.css",
  "styles/semantic-layer-tokens.css",
  "styles/interaction-states.css",
];

const EXCLUDED = /(mushaf|quran|admin)/i;
const MODERN_VALUE =
  /(dvh|svh|lvh|dvw|svw|lvw|color-mix|oklch|oklab|\blab\(|\blch\(|env\(|light-dark|round\(|\bcq[iwhb]|-webkit-|-moz-|:has|text-wrap|fit-content|max-content|min-content|stretch|anchor|@supports|contain|clamp\()/i;

const normSel = (s) =>
  s
    .replace(/\s+/g, " ")
    .replace(/\s*([>+~,])\s*/g, "$1")
    .replace(/::?(before|after)\b/g, "::$1")
    .trim();

function splitSelectors(sel) {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of sel) {
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map(normSel).filter(Boolean);
}

export function familyOf(sel) {
  if (EXCLUDED.test(sel)) return null;
  if (/card/i.test(sel)) return "card";
  if (/btn|button/i.test(sel)) return "button";
  if (/^(:root|html|\.dark|\[data-theme)/.test(sel)) return "token";
  return "other";
}

/** محلّل CSS صغير بلا تبعيات: يعيد التصريحات المسطّحة (يتجاهل القواعد المتداخلة و@keyframes/@font-face). */
export function parseDecls(text) {
  // أزل التعليقات مع حفظ الأسطر
  const src = text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  const lineAt = (() => {
    const starts = [0];
    for (let i = 0; i < src.length; i++) if (src[i] === "\n") starts.push(i + 1);
    return (off) => {
      let lo = 0;
      let hi = starts.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (starts[mid] <= off) lo = mid;
        else hi = mid - 1;
      }
      return lo + 1;
    };
  })();
  const decls = [];
  let i = 0;
  let ruleId = 0;
  /** يقرأ حتى ; أو { أو } على العمق صفر مع احترام النصوص والأقواس */
  function readChunk() {
    const start = i;
    let depth = 0;
    let quote = null;
    for (; i < src.length; i++) {
      const ch = src[i];
      if (quote) {
        if (ch === "\\") i++;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") quote = ch;
      else if (ch === "(" || ch === "[") depth++;
      else if (ch === ")" || ch === "]") depth--;
      else if (depth === 0 && (ch === ";" || ch === "{" || ch === "}")) break;
    }
    return { text: src.slice(start, i), start, end: src[i] };
  }
  function parseBlock(conds, ctx) {
    // ctx: { bad, rule }
    let ord = 0;
    while (i < src.length) {
      const { text: chunk, start, end } = readChunk();
      if (end === undefined) return;
      i++; // تجاوز الفاصل
      if (end === "}") {
        if (ctx.rule && chunk.trim()) pushDecl(chunk, start, conds, ctx, ord++);
        return;
      }
      if (end === ";") {
        if (ctx.rule && chunk.trim() && !chunk.trim().startsWith("@")) pushDecl(chunk, start, conds, ctx, ord++);
        continue;
      }
      // end === "{"
      const prelude = chunk.trim().replace(/\s+/g, " ");
      if (prelude.startsWith("@")) {
        const bad = ctx.bad || ctx.rule || /^@(-[a-z]+-)?(keyframes|font-face|page|property)/i.test(prelude);
        parseBlock([...conds, prelude], { bad, rule: null });
      } else {
        const rule = { id: ruleId++, selector: prelude, sels: splitSelectors(prelude) };
        parseBlock(conds, { bad: ctx.bad || !!ctx.rule, rule });
      }
    }
  }
  function pushDecl(chunk, start, conds, ctx, ord) {
    if (ctx.bad) return;
    const colon = chunk.indexOf(":");
    if (colon < 0) return;
    const rawProp = chunk.slice(0, colon).trim();
    if (!/^-?-?[a-zA-Z_][\w-]*$/.test(rawProp)) return;
    let value = chunk.slice(colon + 1).trim();
    const imp = /!\s*important\s*$/i.test(value);
    if (imp) value = value.replace(/!\s*important\s*$/i, "").trim();
    const lead = chunk.length - chunk.trimStart().length;
    decls.push({
      rule: ctx.rule,
      sels: ctx.rule.sels,
      cond: conds.join(" && "),
      prop: rawProp.startsWith("--") ? rawProp : rawProp.toLowerCase(),
      value,
      imp,
      ord: decls.length,
      line: lineAt(start + lead),
    });
    void ord;
  }
  parseBlock([], { bad: false, rule: null });
  return decls;
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".css")) out.push(p);
  }
  return out;
}

export function scanDefeated(srcDir) {
  const all = [];
  const byKey = new Map();
  for (const f of walk(srcDir)) {
    const file = relative(srcDir, f).split("\\").join("/");
    if (EXCLUDED.test(file)) continue;
    for (const d of parseDecls(readFileSync(f, "utf8"))) {
      d.file = file;
      all.push(d);
      for (const s of d.sels) {
        const k = `${s}|${d.prop}`;
        if (!byKey.has(k)) byKey.set(k, []);
        byKey.get(k).push(d);
      }
    }
  }
  const crit = (f) => CRITICAL_SHEETS.indexOf(f);
  const defeats = (E, D) => {
    if (E === D) return false;
    if (!(E.cond === "" || E.cond === D.cond || D.cond.startsWith(`${E.cond} && `))) return false;
    if (MODERN_VALUE.test(E.value) && E.value !== D.value) return false;
    if (E.file === D.file && E.rule === D.rule) {
      if (MODERN_VALUE.test(D.value)) return false;
      return E.ord > D.ord && E.imp >= D.imp;
    }
    if (E.file === D.file) return (E.ord > D.ord && E.imp >= D.imp) || (E.imp && !D.imp);
    const ce = crit(E.file);
    const cd = crit(D.file);
    if (ce < 0) return false;
    if (E.imp && !D.imp) return true;
    return cd >= 0 && ce > cd && E.imp === D.imp;
  };
  const defeated = [];
  for (const D of all) {
    const fams = D.sels.map(familyOf);
    if (fams.some((x) => x === null)) continue;
    const family = ["card", "button", "token"].find((x) => fams.includes(x));
    if (!family) continue;
    const by = [];
    let ok = true;
    for (const s of D.sels) {
      const E = (byKey.get(`${s}|${D.prop}`) || []).find((e) => defeats(e, D));
      if (!E) {
        ok = false;
        break;
      }
      by.push(`${E.file}:${E.line}`);
    }
    if (ok) defeated.push({ family, file: D.file, line: D.line, selector: D.rule.selector, prop: D.prop, important: D.imp, by });
  }
  return defeated;
}

export function summarize(list) {
  const byFamily = { card: 0, button: 0, token: 0 };
  for (const d of list) byFamily[d.family]++;
  return { total: list.length, important: list.filter((d) => d.important).length, byFamily };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const srcDir = resolve(dirname(fileURLToPath(import.meta.url)), "../src");
  const list = scanDefeated(srcDir);
  if (process.argv.includes("--json")) console.log(JSON.stringify(list, null, 1));
  else console.log(JSON.stringify(summarize(list)));
}
