// ن8 — فحص شامل لاقتباسات القرآن في كل المحتوى (قراءة فقط)
// يطابق كل نص يُعزى للقرآن حرفيًا (رسمًا) على Tanzil المقفول، ويقارن رقم السورة/الآية المكتوب.
import fs from "node:fs"; import path from "node:path";
import { ROOT, sk1, sk2, words, quran, ayahText, lcsAgainst } from "./lib.mjs";

const REPO = path.resolve(ROOT, "../..");
const Q = quran();
const toLatin = (s) => String(s).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));

// أسماء السور ← رقم
const SN = new Map();
const addName = (n, s) => { const k = sk1(n).replace(/^سوره/, ""); SN.set(k, s); SN.set(k.replace(/^ال/, ""), s); };
for (const a of Q.ayahs) if (a.a === 1) addName(a.name.replace(/^سُورَةُ\s*/, ""), a.s);
[["الإسراء", 17], ["بني إسرائيل", 17], ["التوبة", 9], ["براءة", 9], ["غافر", 40], ["المؤمن", 40], ["فصلت", 41], ["حم السجدة", 41], ["الإنسان", 76], ["الدهر", 76], ["محمد", 47], ["القتال", 47], ["الفاتحة", 1], ["الطلاق", 65], ["النساء", 4], ["البقرة", 2], ["آل عمران", 3], ["الحجرات", 49], ["المجادلة", 58], ["الأحزاب", 33], ["الكهف", 18], ["مريم", 19], ["طه", 20], ["يس", 36], ["ص", 38], ["ق", 50], ["الشورى", 42], ["الزخرف", 43], ["الملك", 67], ["القلم", 68], ["المزمل", 73], ["المدثر", 74], ["الضحى", 93], ["الشرح", 94], ["الانشراح", 94], ["الإخلاص", 112], ["الفلق", 113], ["الناس", 114]].forEach(([n, s]) => addName(n, s));
const surahNo = (name) => SN.get(sk1(name).replace(/^سوره/, "")) ?? SN.get(sk1(name).replace(/^سوره/, "").replace(/^ال/, ""));

// فهرس كلمات للأقرب
const AY = Q.ayahs.map((a, i) => ({ ...a, i, w: new Set(words(a.text).map(sk2).filter(Boolean)) }));
const inv = new Map(); AY.forEach((a) => a.w.forEach((w) => { if (!inv.has(w)) inv.set(w, []); inv.get(w).push(a.i); }));
function nearest(text, cited) {
  const ws = [...new Set(words(text).map(sk2).filter((w) => w.length > 1))];
  const score = new Map();
  for (const w of ws) { const l = inv.get(w) || []; const idf = Math.log(AY.length / (1 + l.length)); for (const i of l) score.set(i, (score.get(i) || 0) + idf); }
  const top = [...score].sort((a, b) => b[1] - a[1]).slice(0, 25);
  let best = null;
  if (cited) for (let k = Math.max(1, cited.a - 2); k <= cited.b + 2; k++) { const t = ayahText(cited.s, k); if (!t) continue; const r = lcsAgainst(text, t); const a0 = AY.find((x) => x.s === cited.s && x.a === k); if (r.ratio >= 0.3 && (!best || r.ratio + 1 > best.sc)) best = { sc: r.ratio + 1, ratio: r.ratio, missing: r.missing, a: a0, b: a0, t }; }
  for (const [i] of top) {
    // جرّب الآية وحدها ومع جارتيها (اقتباس عابر لآيتين)
    for (const span of [[i, i], [i, i + 1], [i - 1, i]]) {
      if (span[0] < 0 || span[1] >= AY.length || AY[span[0]].s !== AY[span[1]].s) continue;
      const t = AY.slice(span[0], span[1] + 1).map((x) => x.text).join(" ");
      const r = lcsAgainst(text, t);
      const sc = r.ratio + (score.get(i) || 0) / 100; if (!best || sc > best.sc) best = { sc, ratio: r.ratio, missing: r.missing, a: AY[span[0]], b: AY[span[1]], t };
    }
  }
  return best;
}
const refStr = (a, b) => `${a.s}:${a.a}${b && b.a !== a.a ? "-" + b.a : ""}`;
function locate(seg) {
  const k = sk2(seg); if (k.length < 6) return { short: true };
  const i = Q.big.indexOf(k);
  if (i < 0) return { found: false };
  const at = (pos) => { let lo = 0, hi = Q.starts.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (Q.starts[m] <= pos) lo = m; else hi = m - 1; } return Q.ayahs[lo]; };
  return { found: true, a: at(i), b: at(i + k.length - 1) };
}

const findings = []; const stats = { files: 0, quotes: 0, ok: 0, refChecked: 0 };
const REF = /^\s*[)\]}»"”]?\s*[—\-–،,:]?\s*[(\[]?\s*(?:\[)?(?:سورة\s+)?([ء-يً-ْ ]{1,22}?)\s*[:،,]?\s*(?:الآية|آية|الآيات|آيات)?\s*[(]?([0-9٠-٩]{1,3})(?:\s*[-–و]\s*([0-9٠-٩]{1,3}))?/;
function checkQuote(raw, after, loc, how, citedOverride = null) {
  stats.quotes++;
  const text = raw.replace(/\s*\(\s*[0-9٠-٩]+\s*\)\s*/g, " ").replace(/[۝][0-9٠-٩]*/g, " ");
  const segs = text.split(/\.\.\.|…|\s\.\.\s|\s—\s|\s-\s/).map((s) => s.trim()).filter((s) => sk2(s).length >= 6);
  if (!segs.length) return;
  let bad = null, first = null, last = null;
  for (const s of segs) {
    const r = locate(s);
    if (r.short) continue;
    if (!r.found) { bad = s; break; }
    first = first || r.a; last = r.b;
  }
  // المرجع المكتوب
  const m = String(after || "").match(REF);
  let cited = citedOverride;
  if (!cited && m) { const s = surahNo(m[1].trim()); if (s) cited = { s, a: +toLatin(m[2]), b: m[3] ? +toLatin(m[3]) : +toLatin(m[2]), raw: m[0].replace(/^\W+/, "").trim() }; }
  if (bad) {
    const nb = nearest(bad, cited);
    findings.push({ ...loc, how, kind: "نص منسوب للقرآن ليس فيه", sev: "حرج", quote: raw.trim(), badSegment: bad, cited: cited ? `${cited.raw}` : "", nearest: nb && nb.ratio >= 0.45 ? refStr(nb.a, nb.b) : "", similarity: nb ? Math.round(nb.ratio * 100) : 0, proposed: nb && nb.ratio >= 0.45 ? nb.t : "لا آية قريبة — قد يكون حديثًا أو كلامًا نُسب للقرآن خطأً", missing: nb ? nb.missing.slice(0, 8).join("، ") : "" });
    return;
  }
  stats.ok++;
  if (cited && first) {
    stats.refChecked++;
    let ct = ""; for (let k = Math.max(1, cited.a - 1); k <= cited.b + 1; k++) ct += ayahText(cited.s, k) || "";
    const ck = sk2(ct);
    const inRange = ck.length > 0 && segs.every((sg) => sk2(sg).length < 6 || ck.includes(sk2(sg)));
    if (!inRange) findings.push({ ...loc, how, kind: "عزو آية خاطئ (سورة/رقم)", sev: "حرج", quote: raw.trim(), cited: `${cited.raw} (=${cited.s}:${cited.a}${cited.b!==cited.a?"-"+cited.b:""})`, actual: refStr(first, last), proposed: `يُكتب المرجع ${Q.ayahs.find((x) => x.s === first.s && x.a === 1)?.name.replace(/^سُورَةُ\s*/, "")}: ${first.a}${last.a !== first.a ? "-" + last.a : ""}` });
  }
}
const ATTR = /(?:تعالى|تعالي|عزّ وجلّ|عز وجل|جل وعلا|جلّ وعلا|سبحانه)\s*(?:في\s+[^:«"(]{2,25})?[:،]?\s*/;
function scanString(s, loc) {
  if (!/[ء-ي]/.test(s)) return;
  for (const m of s.matchAll(/﴿([^﴾]{2,1500})﴾/g)) checkQuote(m[1], s.slice(m.index + m[0].length, m.index + m[0].length + 60), loc, "﴿﴾");
  // كائنات أدلة مضمّنة: {"type":"quran|ayah","ref":"…","text":"…"} (بذور SQL/TS)
  for (const m of s.matchAll(/\{[^{}]*"type"\s*:\s*"(?:quran|ayah|qur'an|آية|قرآن)"[^{}]*\}/gi)) {
    const ref = (m[0].match(/"(?:ref|reference|source)"\s*:\s*"([^"]+)"/) || [])[1] || "";
    const t = (m[0].match(/"(?:text|arabic|ayah)"\s*:\s*"([^"]+)"/) || [])[1] || "";
    if (!t) continue;
    const nr = ref.match(/^(\d+):(\d+)(?:-(\d+))?$/);
    checkQuote(t, nr ? "" : " " + ref, loc, "دليل JSON", nr ? { s: +nr[1], a: +nr[2], b: +(nr[3] || nr[2]), raw: ref } : null);
  }
  for (const m of s.matchAll(/\{([^{}]{4,1500})\}/g)) { if (!/[ء-ي]/.test(m[1]) || /[;=]|=>|return\s/.test(m[1])) continue; checkQuote(m[1], s.slice(m.index + m[0].length, m.index + m[0].length + 60), loc, "{}"); }
  const re = new RegExp(ATTR.source + `[«"“(\\[]([^»"”)\\]]{6,800})[»"”)\\]]`, "g");
  for (const m of s.matchAll(re)) { if (/﴿|\{/.test(m[0])) continue; checkQuote(m[1], s.slice(m.index + m[0].length, m.index + m[0].length + 60), loc, "قال تعالى"); }
}
function walkJSON(v, loc, keyPath = "") {
  if (typeof v === "string") return scanString(v, { ...loc, field: keyPath });
  if (Array.isArray(v)) return v.forEach((x, i) => walkJSON(x, (x && typeof x === "object" && (x.id || x.slug)) ? { ...loc, id: String(x.id ?? x.slug) } : loc, keyPath));
  if (v && typeof v === "object") {
    if (v.surah && v.ayahs && !Array.isArray(v.ayahs)) { for (const [k, x] of Object.entries(v.ayahs)) walkJSON(x, { ...loc, id: `تفسير ${v.surah}:${k}` }, "ayahs"); return; }
    for (const [k, x] of Object.entries(v)) walkJSON(x, loc, k);
  }
}
const SKIP_DIR = /public\/data\/hadith\/|node_modules|\/quran(-v2)?\/|\/quran-tajweed\/|tafsir-audio|\/search\/|deleted|backup|\/dist\/|\/build\/|test-results|\.lighthouseci|__tests__|\/raw\//;
function scanFile(abs) {
  const rel = path.relative(REPO, abs);
  stats.files++;
  const txt = fs.readFileSync(abs, "utf8");
  if (!/﴿|\{|تعالى/.test(txt) || !/[ء-ي]/.test(txt)) return;
  if (abs.endsWith(".json")) { try { walkJSON(JSON.parse(txt), { file: rel }); } catch { /* ignore */ } return; }
  // TS/SQL/MD/CSV: سطرًا سطرًا، داخل السلاسل النصية فقط لـ{} في ملفات الكود
  const isCode = /\.(ts|tsx|mjs|js|swift)$/.test(abs);
  txt.split("\n").forEach((line, i) => {
    if (!/[ء-ي]/.test(line)) return;
    const loc = { file: rel, line: i + 1, id: (line.match(/\bid:\s*["']([^"']+)["']/) || [])[1] || "" };
    if (isCode) { for (const m of line.matchAll(/"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g)) scanString(m[1] ?? m[2] ?? m[3] ?? "", loc); }
    else scanString(line, loc);
  });
}
function walkDir(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (SKIP_DIR.test(p + (e.isDirectory() ? "/" : ""))) continue;
    if (e.isDirectory()) walkDir(p);
    else if (/\.(json|ts|tsx|sql|md|csv|swift|strings|txt)$/.test(e.name) && !/\.test\.|\.d\.ts$|lock|generated-types/.test(e.name) && fs.statSync(p).size < 30e6) scanFile(p);
  }
}
// الاستخدام: node scripts/quran-check/q-scan.mjs [مجلد أو ملف ...] [--json ملف]
// بلا مسارات: يفحص مجلدات محتوى الويب الافتراضية. لا يعدّل أي ملف؛ الكتابة فقط إلى --json إن طُلب.
const argv = process.argv.slice(2);
const ji = argv.indexOf("--json");
const jsonOut = ji >= 0 ? argv[ji + 1] : null;
const targets = argv.filter((a, i) => ji < 0 || (i !== ji && i !== ji + 1));
const DEFAULT_DIRS = ["artifacts/majalis/public/data", "artifacts/majalis/content", "artifacts/majalis/src/data", "artifacts/majalis/src/lib", "artifacts/majalis/src/pages", "artifacts/majalis/src/features", "artifacts/majalis/src/components", "artifacts/majalis/src/views", "artifacts/majalis/src/content", "artifacts/majalis/data", "artifacts/majalis/supabase", "supabase", "artifacts/majalis/seo-prerender"];
if (targets.length) {
  for (const t of targets) {
    const abs = path.resolve(t);
    if (!fs.existsSync(abs)) { console.error(`غير موجود: ${t}`); process.exit(2); }
    if (fs.statSync(abs).isDirectory()) walkDir(abs); else scanFile(abs);
  }
} else {
  for (const d of DEFAULT_DIRS) if (fs.existsSync(path.join(REPO, d))) walkDir(path.join(REPO, d));
}

// المخرَج: «نص ليس في القرآن» و«عزو خاطئ» فقط
const LABEL = { "نص منسوب للقرآن ليس فيه": "نص ليس في القرآن", "عزو آية خاطئ (سورة/رقم)": "عزو خاطئ" };
const seen = new Set();
// ضجيج الأقواس المعقوفة {} (JSON/كود أو أقل من 3 كلمات) — نفس قاعدة q-report
const isNoise = (f) => f.how === "{}" && (/["'|?$:]|[A-Za-z]/.test(f.quote) || f.quote.trim().split(/\s+/).length < 3);
const out = findings.filter((f) => LABEL[f.kind] && !isNoise(f)).filter((f) => { const k = [f.file, f.line, f.id, f.quote].join("|"); if (seen.has(k)) return false; seen.add(k); return true; })
  .map((f) => ({ type: LABEL[f.kind], file: f.file, line: f.line || "", id: f.id || "", field: f.field || "", quote: f.quote, segment: f.badSegment || "", cited: f.cited || "", nearest: f.nearest || f.actual || "", proposed: f.proposed || "" }));
for (const type of ["نص ليس في القرآن", "عزو خاطئ"]) {
  const rows = out.filter((r) => r.type === type);
  console.log(`\n## ${type} (${rows.length})`);
  for (const r of rows) {
    console.log(`- ${r.file}${r.line ? ":" + r.line : ""}${r.id ? " [" + r.id + "]" : ""}${r.field ? " {" + r.field + "}" : ""}`);
    console.log(`  النص: ${r.quote.replace(/\s+/g, " ").slice(0, 300)}`);
    if (r.cited) console.log(`  المرجع المكتوب: ${r.cited}`);
    if (r.nearest) console.log(`  الموضع ${type === "عزو خاطئ" ? "الفعلي" : "الأقرب"}: ${r.nearest}`);
  }
}
console.log(`\nالملفات: ${stats.files} — الاقتباسات: ${stats.quotes} — سليمة: ${stats.ok} — نص ليس في القرآن: ${out.filter((r) => r.type === "نص ليس في القرآن").length} — عزو خاطئ: ${out.filter((r) => r.type === "عزو خاطئ").length}`);
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(out, null, 1));
