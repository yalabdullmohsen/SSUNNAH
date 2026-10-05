/**
 * تكافؤ التطبيع العربي بين SQL (public.ar_normalize) وTS (normalizeArabic).
 * لا قاعدة بيانات محليًا: نقرأ خطوات PARITY-STEPS من أحدث هجرة ونُنفّذها
 * بمحاكٍ صغير (regexp_replace/translate/replace/lower/btrim) ثم نقارن.
 * حدود المحاكاة: \s و lower() في PG تعتمد على locale الخادم؛ هنا تُحاكى بـJS.
 * تشغيل: node --import tsx src/shared/arabic-normalize-sql-parity.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { normalizeArabic } from "@/shared/arabic-normalize";

const MIGRATION = fileURLToPath(
  new URL("../../supabase/migrations/20261003130000_arabic_search_normalize_parity_v5.sql", import.meta.url),
);
const sql = readFileSync(MIGRATION, "utf8");
const block = sql.split("-- PARITY-STEPS-BEGIN")[1]?.split("-- PARITY-STEPS-END")[0];
assert.ok(block, "PARITY-STEPS block missing");

/** يقرأ وسيطًا: s أو '...' أو E'...' — يعيد [القيمة, الباقي]. */
function readArg(src: string): [string | null, string] {
  src = src.trimStart();
  if (src.startsWith("s")) return [null, src.slice(1)];
  const e = src.startsWith("E'");
  let i = e ? 2 : 1;
  let out = "";
  for (;;) {
    const c = src[i];
    if (c === undefined) throw new Error(`unterminated literal: ${src}`);
    if (c === "'") {
      if (src[i + 1] === "'") { out += "'"; i += 2; continue; }
      break;
    }
    if (e && c === "\\") {
      const n = src[i + 1];
      if (n === "u") { out += String.fromCharCode(parseInt(src.slice(i + 2, i + 6), 16)); i += 6; continue; }
      out += n; i += 2; continue;
    }
    out += c; i++;
  }
  return [out, src.slice(i + 1)];
}

type Step = (s: string) => string;
const steps: Step[] = block
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.startsWith("s :="))
  .map((line) => {
    const m = /^s := (\w+)\((.*)\);$/.exec(line);
    assert.ok(m, `unparsable step: ${line}`);
    const [, fn, rest] = m;
    const args: (string | null)[] = [];
    let r = rest;
    while (r.trim()) {
      const [v, tail] = readArg(r);
      args.push(v);
      r = tail.trimStart().replace(/^,/, "");
    }
    const [, a, b, flags] = args as [null, string, string, string];
    switch (fn) {
      case "lower": return (s) => s.toLowerCase();
      case "btrim": return (s) => s.replace(/^ +| +$/g, "");
      case "replace": return (s) => s.split(a).join(b);
      case "translate": {
        const from = [...a], to = [...b];
        return (s) => [...s].map((c) => { const k = from.indexOf(c); return k < 0 ? c : (to[k] ?? ""); }).join("");
      }
      case "regexp_replace": {
        assert.equal(flags, "g", `only global regexp_replace supported: ${line}`);
        const re = new RegExp(a, "g");
        return (s) => s.replace(re, b);
      }
      default: throw new Error(`unsupported fn ${fn}`);
    }
  });
assert.ok(steps.length >= 10, "too few parsed steps");
const sqlNormalize = (s: string) => steps.reduce((acc, f) => f(acc), s);

let passed = 0;
// ─── حالات مسمّاة: SQL ≡ TS، والأزواج المتكافئة متطابقة ───
const groups: string[][] = [
  ["الصلاة", "الصلاه"],
  ["إبراهيم", "ابراهيم", "أبراهيم"],
  ["مُحَمَّد", "محمد"],
  ["القرآن", "القران", "القُرْآن"],
  ["مصطفى", "مصطفي"],
  ["محـــمد", "محمد"],
  ["مسئُول", "مسؤول", "مسئول"],
  ["سورة ٢:٢٥٥", "سوره 2:255"],
  ["ﻻ إله", "لا اله"],
  ["فارسی", "فارسي"],
  ["\u200Bنص\u00A0مخفي\uFEFF", "نص مخفي"],
];
for (const g of groups) {
  const t0 = normalizeArabic(g[0]);
  for (const w of g) {
    assert.equal(sqlNormalize(w), normalizeArabic(w), `SQL≠TS for «${w}»`);
    assert.equal(normalizeArabic(w), t0, `«${w}» not equivalent to «${g[0]}»`);
    passed++;
  }
}
// الصلوة رسم مصحفي مختلف (و بدل ا) — خارج نطاق التطبيع عمدًا في الطرفين.
assert.notEqual(normalizeArabic("الصلوة"), normalizeArabic("الصلاة"));
assert.equal(sqlNormalize("الصلوة"), normalizeArabic("الصلوة"));
passed++;

// ─── fuzz: سلاسل عشوائية من محارف حساسة ───
const alphabet = [..."ابتثجحخدذرسشصضطظعغفقكلمنهوي أإآٱٲٳءؤئىیةکـًٌٍَُِّْٰٕٓٔۖۗۚۛۜ۟ۥۦ٠١٢٣٤٥٦٧٨٩۰۹0123456789:.,،؛؟!«»\"'()[]{}-—…ABCxyz\u200B\u200F\u00A0\uFEFFﻻﻷ\t\n"];
let seed = 42;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
for (let n = 0; n < 20000; n++) {
  const len = 1 + Math.floor(rnd() * 14);
  let w = "";
  for (let k = 0; k < len; k++) w += alphabet[Math.floor(rnd() * alphabet.length)];
  assert.equal(sqlNormalize(w), normalizeArabic(w), `fuzz SQL≠TS for ${JSON.stringify(w)}`);
}
passed++;

console.log(`arabic-normalize SQL↔TS parity: ${passed} checks + 20000 fuzz ✓ (${steps.length} SQL steps)`);
