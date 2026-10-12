// ن8 — أدوات تدقيق مشتركة (قراءة فقط)
import fs from "node:fs";
import path from "node:path";

import { fileURLToPath } from "node:url";
// جذر تطبيق الويب (فيه public/data/quran وpublic/data/hadith). يُغيَّر بـ QURAN_CHECK_ROOT.
export const ROOT = process.env.QURAN_CHECK_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../artifacts/majalis");

const DIAC = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
export const INVISIBLE = /[­؜​-‏‪-‮⁠-⁤⁦-⁩﻿�]/g;
export const INDIC_DIGITS = /[٠-٩۰-۹]/;

/** tier1: حروف فقط بلا تشكيل ولا فراغات، توحيد الهمزات والتاء المربوطة. */
export function sk1(s) {
  return String(s || "")
    .replace(INVISIBLE, "")
    .replace(/وٰ/g, "ا") // صلوٰة → صلاة
    .replace(/ىٰ/g, "ا")
    .replace(/ۦ/g, "ي")
    .replace(/ۥ/g, "و")
    .replace(DIAC, "")
    .replace(/[آأإٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ت")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^ء-ي]/g, "")
    .replace(/الليل/g, "اليل")
    .replace(/انلا/g, "الا").replace(/انلم/g, "الم").replace(/انلن/g, "الن").replace(/انلو/g, "الو").replace(/منما/g, "مما")
    .replace(/ه(?=$)/g, "ه")
    .replace(/اللاتي/g, "التي").replace(/اللايي/g, "الي").replace(/بصط/g, "بسط").replace(/صيطر/g, "سيطر");
}
/** tier2: رسم بلا حروف مد/همز — يتجاوز فروق الرسم العثماني والإملائي. */
export function sk2(s) {
  return sk1(s).replace(/[اويء]/g, "");
}
export function words(s) {
  return String(s || "").replace(INVISIBLE, "").split(/[\s،,.؛;:!؟?«»"()\[\]{}﴿﴾\-–—]+/).map(sk1).filter(Boolean);
}

/** فحوص لغوية على نص واحد؛ تعيد قائمة {type, detail}. */
export function langIssues(text, { allowIndicDigits = false } = {}) {
  const out = [];
  const s = String(text || "");
  const inv = [...s.matchAll(INVISIBLE)].map((m) => "U+" + m[0].codePointAt(0).toString(16).toUpperCase().padStart(4, "0"));
  if (inv.length) out.push({ type: "رمز غير مرئي", detail: [...new Set(inv)].join(" ") + ` ×${inv.length}` });
  if (!allowIndicDigits && INDIC_DIGITS.test(s)) out.push({ type: "أرقام هندية", detail: (s.match(/[٠-٩۰-۹]+/g) || []).slice(0, 3).join(" ") });
  if (/ {2,}/.test(s)) out.push({ type: "فراغ مزدوج", detail: "" });
  if (/^\s|\s$/.test(s)) out.push({ type: "فراغ طرفي", detail: "" });
  if (/\s[،؛:.!؟,]/.test(s)) out.push({ type: "فراغ قبل علامة ترقيم", detail: (s.match(/.{0,8}\s[،؛:.!؟,]/) || [""])[0] });
  if (/[ً-ْ]{3,}/.test(s.replace(/ّ[ً-ِ]/g, "")))
    out.push({ type: "تشكيل مكسور (حركات متتالية)", detail: (s.match(/\S{0,6}[ً-ْ]{3,}\S{0,3}/) || [""])[0] });
  const dup = s.match(/([ً-ْ])\1/);
  if (dup) out.push({ type: "تشكيل مكسور (حركة مكررة)", detail: (s.match(/\S{0,6}([ً-ْ])\1\S{0,3}/) || [""])[0] });
  if (/(^|\s)[ً-ْ]/.test(s)) out.push({ type: "تشكيل مكسور (حركة بلا حرف)", detail: (s.match(/.{0,6}(^|\s)[ً-ْ].{0,4}/) || [""])[0] });
  if (/[A-Za-z]/.test(s.replace(/https?:\S+/g, "")) && /[؀-ۿ]/.test(s)) {
    const lat = s.replace(/https?:\S+/g, "").match(/[A-Za-z][A-Za-z\-_]*/g) || [];
    if (lat.some((w) => w.length > 2)) out.push({ type: "لاتيني داخل نص عربي", detail: lat.slice(0, 3).join(" ") });
  }
  if (/\(\s|\s\)|«\s|\s»/.test(s)) out.push({ type: "فراغ داخل أقواس", detail: "" });
  if (/[؟?!.،]{2,}/.test(s.replace(/\.\.\./g, ""))) out.push({ type: "ترقيم مكرر", detail: (s.match(/.{0,6}[؟?!.،]{2,}/) || [""])[0] });
  const rep = s.replace(DIAC, "").match(/(^|\s)(\S{2,})\s+\2(\s|$)/);
  if (rep && !/^(لا|لبيك|سبحان|يا|الله|اللهم|حق|سبوح|قدوس)$/.test(rep[2])) out.push({ type: "كلمة مكررة متتالية", detail: rep[2] });
  return out;
}
function sk1Spaces(s) { return String(s).replace(DIAC, ""); }

/* ---------- مرجع القرآن (Tanzil العثماني المحلي) ---------- */
let QURAN = null;
export function quran() {
  if (QURAN) return QURAN;
  const dir = path.join(ROOT, "public/data/quran");
  const ayahs = [];
  for (let s = 1; s <= 114; s++) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, `surah-${String(s).padStart(3, "0")}.json`), "utf8"));
    for (const a of j.ayahs) ayahs.push({ s, a: a.numberInSurah, text: a.text, name: j.name });
  }
  // نص مسلسل tier2 مع خريطة موضع → آية
  let big = "";
  const starts = [];
  for (const ay of ayahs) { starts.push(big.length); big += sk2(ay.text); }
  QURAN = { ayahs, big, starts };
  return QURAN;
}
function ayahAt(pos) {
  const { starts, ayahs } = quran();
  let lo = 0, hi = starts.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (starts[m] <= pos) lo = m; else hi = m - 1; }
  return ayahs[lo];
}
/** يبحث عن نص قرآني: {found, ref} أو أطول تطابق جزئي. */
export function findQuran(text) {
  const q = quran();
  const k = sk2(text);
  if (k.length < 6) return { found: false, tooShort: true };
  const i = q.big.indexOf(k);
  if (i >= 0) {
    const a = ayahAt(i), b = ayahAt(i + k.length - 1);
    return { found: true, ref: a.s === b.s ? `${a.s}:${a.a}${b.a !== a.a ? "-" + b.a : ""}` : `${a.s}:${a.a}–${b.s}:${b.a}` };
  }
  // أطول بادئة موجودة
  let lo = 0, hi = k.length;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (q.big.includes(k.slice(0, m))) lo = m; else hi = m - 1; }
  const pre = lo;
  const at = pre >= 6 ? q.big.indexOf(k.slice(0, pre)) : -1;
  return { found: false, prefixRatio: pre / k.length, near: at >= 0 ? ayahAt(at) : null };
}
export function ayahText(s, a) { return quran().ayahs.find((x) => x.s === s && x.a === a)?.text; }

/* ---------- مرجع البخاري ومسلم (fawazahmed0 المحلي) ---------- */
let HAD = null;
export function hadithCorpus() {
  if (HAD) return HAD;
  HAD = {};
  for (const c of ["bukhari", "muslim"]) {
    const j = JSON.parse(fs.readFileSync(path.join(ROOT, `public/data/hadith/${c}.json`), "utf8"));
    const arr = Array.isArray(j) ? j : Object.values(j).find(Array.isArray);
    HAD[c] = arr.map((h) => ({ n: h.n, t: h.t, k1: sk1(h.t), k2: sk2(h.t), w: new Set(words(h.t).map(sk2)) }));
  }
  return HAD;
}
export function collectionsCited(src) {
  const s = String(src || "");
  const out = [];
  if (/البخاري|متفق عليه|الشيخان|الشيخين/.test(s) && !/الأدب المفرد|خلق أفعال|التاريخ/.test(s.replace(/صحيح البخاري|رواه البخاري|البخاري \(/g, "X"))) out.push("bukhari");
  else if (/البخاري|متفق عليه/.test(s)) out.push("bukhari");
  if (/مسلم|متفق عليه|الشيخان|الشيخين/.test(s)) out.push("muslim");
  return out;
}
/** مطابقة متن مع مجموعة: exact(tier1) | rasm(tier2) | partial مع الكلمات الناقصة. */
export function matchHadith(text, cols) {
  const H = hadithCorpus();
  const k1 = sk1(text), k2 = sk2(text);
  if (k1.length < 8) return { status: "short" };
  for (const c of cols) for (const h of H[c]) if (h.k1.includes(k1)) return { status: "exact", col: c, n: h.n };
  for (const c of cols) for (const h of H[c]) if (h.k2.includes(k2)) return { status: "rasm", col: c, n: h.n };
  const orig = words(text); const ws = orig.map(sk2).filter(Boolean);
  const set = new Set(ws);
  const cand = [];
  for (const c of cols) for (const h of H[c]) {
    let hit = 0; for (const w of set) if (h.w.has(w)) hit++;
    cand.push({ r: hit / set.size, c, h });
  }
  cand.sort((a, b) => b.r - a.r);
  let best = null;
  for (const x of cand.slice(0, 8)) {
    const hw = words(x.h.t).map(sk2);
    // LCS بالترتيب: كلمات الذكر غير الواقعة في أطول تسلسل مشترك
    const m = ws.length, n = hw.length;
    let prev = new Array(n + 1).fill(0);
    const rows = [prev];
    for (let i = 1; i <= m; i++) { const cur = new Array(n + 1).fill(0); for (let j = 1; j <= n; j++) cur[j] = ws[i - 1] === hw[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]); rows.push(cur); prev = cur; }
    const inL = new Array(m).fill(false); let i = m, j = n;
    while (i > 0 && j > 0) { if (ws[i - 1] === hw[j - 1]) { inL[i - 1] = true; i--; j--; } else if (rows[i - 1][j] >= rows[i][j - 1]) i--; else j--; }
    const lcs = rows[m][n] / m;
    if (!best || lcs > best.lcs) best = { lcs, c: x.c, n: x.h.n, missing: orig.filter((_, k) => !inL[k]) };
  }
  if (!best) return { status: "none" };
  return { status: "partial", col: best.c, n: best.n, ratio: +best.lcs.toFixed(2), missing: [...new Set(best.missing)].slice(0, 8) };
}

export function writeJSON(name, data) {
  fs.writeFileSync(path.join(process.env.QURAN_CHECK_OUT || process.cwd(), name), JSON.stringify(data, null, 1));
}

/** نسبة LCS لكلمات النص داخل متن واحد + الكلمات غير الواقعة. */
export function lcsAgainst(text, hadithText) {
  const orig = words(text); const ws = orig.map(sk2); const hw = words(hadithText).map(sk2);
  const m = ws.length, n = hw.length; if (!m) return { ratio: 0, missing: [] };
  let prev = new Array(n + 1).fill(0); const rows = [prev];
  for (let i = 1; i <= m; i++) { const cur = new Array(n + 1).fill(0); for (let j = 1; j <= n; j++) cur[j] = ws[i - 1] === hw[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]); rows.push(cur); prev = cur; }
  const inL = new Array(m).fill(false); let i = m, j = n;
  while (i > 0 && j > 0) { if (ws[i - 1] === hw[j - 1]) { inL[i - 1] = true; i--; j--; } else if (rows[i - 1][j] >= rows[i][j - 1]) i--; else j--; }
  return { ratio: rows[m][n] / m, missing: [...new Set(orig.filter((_, k) => !inL[k]))] };
}
