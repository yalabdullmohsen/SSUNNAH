// ن8 دفعة 3 — الفقه (قراءة فقط)
import fs from "node:fs";
import { ROOT, langIssues, findQuran, matchHadith, collectionsCited, sk1, writeJSON, quran } from "./lib.mjs";

const F = "artifacts/majalis/content/fiqh/books.json";
const raw = fs.readFileSync(`${ROOT}/content/fiqh/books.json`, "utf8");
const lines = raw.split("\n");
const lineOfId = (id) => { const i = lines.findIndex((l) => l.includes(`"id": "${id}"`)); return i + 1; };
const J = JSON.parse(raw);
const issues = [];
const add = (o) => issues.push({ section: "الفقه", file: F, ...o });

// أسماء السور ← رقم
const Q = quran();
const SURA = {};
for (const a of Q.ayahs) SURA[sk1(a.name.replace(/^سُورَةُ\s*/, ""))] = a.s;
const suraNo = (name) => SURA[sk1(name.replace(/^سورة\s*/, ""))] ?? null;

// معرّفات
const ids = new Map();
const reg = (id, where) => ids.set(id, [...(ids.get(id) || []), where]);
const sentenceFreq = new Map();
const countSent = (t) => String(t || "").split(/[.!؟]\s+/).map((s) => s.trim()).filter((s) => s.length > 40).forEach((s) => sentenceFreq.set(s, (sentenceFreq.get(s) || 0) + 1));
let nLessons = 0, nQ = 0, nAyah = 0, nHad = 0;

const TEXT_FIELDS = ["title", "summary", "evidence", "preferred", "definition", "ruling", "practicalSummary", "notes", "madhhabNotes", "scholarlyNotes"];

function checkEvidence(text, ref) {
  // آيات
  for (const m of String(text || "").matchAll(/﴿([^﴾]+)﴾\s*\(?\s*([ء-ي ]+?)\s*[:،]\s*(\d+)/g)) {
    nAyah++;
    const r = findQuran(m[1]);
    const sNo = suraNo(m[2]);
    if (!r.found && !r.tooShort) add({ ref, type: "مطابقة آية: اختلاف حرفي", sev: "حرج", fix: `«${m[1].slice(0, 40)}…» ${m[2]}: ${m[3]}؛ أقرب ${r.near ? r.near.s + ":" + r.near.a : "؟"} (${Math.round((r.prefixRatio || 0) * 100)}%)`, review: true });
    else if (r.found && sNo) {
      const [s, a] = r.ref.split(/[:\-–]/).map(Number);
      if (s !== sNo || !r.ref.match(new RegExp(`(^|[:\\-])${m[3]}($|[\\-–])`)) && !(Number(m[3]) >= a && Number(m[3]) <= (Number(r.ref.split("-")[1]) || a)))
        add({ ref, type: "عزو آية خاطئ (سورة/رقم)", sev: "حرج", fix: `مكتوب ${m[2]}: ${m[3]} والنص في ${r.ref}` });
    } else if (r.found && !sNo) add({ ref, type: "اسم سورة غير معروف", sev: "متوسط", fix: m[2] });
  }
  for (const m of String(text || "").matchAll(/﴿([^﴾]+)﴾(?!\s*\(?\s*[ء-ي ]+?\s*[:،]\s*\d)/g)) {
    nAyah++;
    const r = findQuran(m[1]);
    if (!r.found && !r.tooShort) add({ ref, type: "مطابقة آية: اختلاف حرفي", sev: "حرج", fix: `«${m[1].slice(0, 40)}…»؛ أقرب ${r.near ? r.near.s + ":" + r.near.a : "؟"} (${Math.round((r.prefixRatio || 0) * 100)}%)`, review: true });
    else if (r.found) add({ ref, type: "آية بلا عزو (سورة: رقم)", sev: "تحسين", fix: r.ref });
  }
  // أحاديث «…» رواه X
  for (const m of String(text || "").matchAll(/«([^»]{8,})»\s*(?:\(?)(رواه|أخرجه|متفق عليه)([^.؛]{0,60})/g)) {
    nHad++;
    const src = m[2] + m[3];
    if (!/\d/.test(src)) add({ ref, type: "حديث بلا رقم في التخريج", sev: "متوسط", fix: `«${m[1].slice(0, 35)}…» ${src.trim()}` });
    const cols = collectionsCited(src);
    const other = /أبو داود|أبي داود|الترمذي|النسائي|ابن ماجه|أحمد|الحاكم|الدارقطني|البيهقي|مالك|ابن حبان|ابن خزيمة/.test(src);
    if (cols.length && !other && sk1(m[1]).length >= 15) {
      const h = matchHadith(m[1], cols);
      if (h.status === "partial" && h.ratio < 0.8) add({ ref, type: "مطابقة حديث: اللفظ غير موجود في المصدر المذكور", sev: h.ratio < 0.6 ? "حرج" : "متوسط", fix: `«${m[1].slice(0, 40)}…» ${src.trim()}؛ أقرب ${h.col} ${h.n} (${Math.round(h.ratio * 100)}%)؛ غير موجود: ${h.missing.slice(0, 6).join("، ")}`, review: true });
    }
  }
  // «…» بلا تخريج يليه وهو مسبوق بقال ﷺ
  for (const m of String(text || "").matchAll(/(?:قال ﷺ|قوله ﷺ|النبي ﷺ قال)[:،]?\s*«([^»]{8,})»(?!\s*\(?\s*(?:رواه|أخرجه|متفق))/g)) add({ ref, type: "حديث بلا تخريج", sev: "حرج", fix: `«${m[1].slice(0, 40)}…»` });
}

for (const b of J.books) {
  reg(b.id, `book`);
  if (!b.sources?.length) add({ ref: `${b.id} (س${lineOfId(b.id)})`, type: "كتاب بلا مصادر", sev: "متوسط", fix: "" });
  for (const ch of b.chapters || []) {
    reg(ch.id, `chapter@${b.id}`);
    const cref = `${b.id}/${ch.id} (س${lineOfId(ch.id)})`;
    if (!ch.sources?.length) add({ ref: cref, type: "باب بلا مصادر", sev: "متوسط", fix: "" });
    checkEvidence(ch.evidence, cref);
    for (const k of ["definition", "summary", "evidence"]) for (const li of langIssues(ch[k])) add({ ref: `${cref} [${k}]`, type: li.type, sev: li.type === "رمز غير مرئي" || li.type.startsWith("تشكيل") ? "متوسط" : "تحسين", fix: li.detail });
    for (const l of ch.lessons || []) {
      nLessons++;
      reg(l.id, `lesson@${b.id}/${ch.id}`);
      const ref = `${l.id} (س${lineOfId(l.id)})`;
      if (l.bookId !== b.id || l.chapterId !== ch.id) add({ ref, type: "bookId/chapterId لا يطابق الموضع", sev: "متوسط", fix: `${l.bookId}/${l.chapterId} ≠ ${b.id}/${ch.id}` });
      if (l.status === "published" && l.needsReview) add({ ref, type: "منشور وموسوم needsReview", sev: "حرج", fix: "درس حكمي يُعرض للعامة وهو قيد المراجعة؛ المهارة: «قيد المراجعة» لا يُفهرس", review: true });
      if (!l.sources?.length) add({ ref, type: "درس بلا مصادر", sev: l.status === "published" ? "حرج" : "متوسط", fix: "" });
      else for (const s of l.sources) if (!s.book || !s.ref) add({ ref, type: "مصدر ناقص (كتاب/موضع)", sev: "متوسط", fix: JSON.stringify(s) });
      else if (!/\d|باب|كتاب|فصل|مسألة/.test(s.ref)) add({ ref, type: "مصدر بلا موضع محدد", sev: "تحسين", fix: s.ref });
      if (!String(l.ruling || "").trim() && l.status === "published") add({ ref, type: "حقل الحكم فارغ", sev: "متوسط", fix: "" });
      if (!String(l.evidence || "").trim() && l.status === "published") add({ ref, type: "درس حكمي بلا دليل", sev: "متوسط", fix: "" });
      if (l.ruling && l.ruling === l.preferred && l.ruling === l.madhhabNotes) add({ ref, type: "الحكم = الراجح = ملاحظة المذهب (نص منسوخ)", sev: "تحسين", fix: "" });
      checkEvidence(l.evidence, ref);
      checkEvidence(l.summary, ref);
      for (const k of TEXT_FIELDS) { countSent(l[k]); for (const li of langIssues(l[k])) add({ ref: `${ref} [${k}]`, type: li.type, sev: li.type === "رمز غير مرئي" || li.type.startsWith("تشكيل") ? "متوسط" : "تحسين", fix: li.detail }); }
      const qs = l.reviewQuestions || [];
      nQ += qs.length;
      const qk = new Set();
      for (const q of qs) {
        const qt = typeof q === "string" ? q : q.question || q.q || "";
        if (!String(qt).trim()) add({ ref, type: "سؤال مراجعة فارغ", sev: "متوسط", fix: "" });
        if (qk.has(sk1(qt))) add({ ref, type: "سؤال مراجعة مكرر", sev: "تحسين", fix: String(qt).slice(0, 40) });
        qk.add(sk1(qt));
        if (typeof q === "object" && "answer" in q && !String(q.answer || "").trim()) add({ ref, type: "سؤال بلا جواب", sev: "متوسط", fix: String(qt).slice(0, 40) });
      }
    }
  }
}
for (const [id, w] of ids) if (w.length > 1) add({ ref: id, type: w.every((x) => x.startsWith("lesson")) || w.filter((x) => x.startsWith("chapter")).length > 1 ? "معرّف مكرر" : "معرّف كتاب = معرّف باب داخله", sev: w.filter((x) => x.startsWith("chapter")).length > 1 || w.filter((x) => x.startsWith("lesson")).length > 1 ? "متوسط" : "تحسين", fix: w.join(" | ") });
const boiler = [...sentenceFreq].filter(([, n]) => n >= 15).sort((a, b) => b[1] - a[1]);
for (const [s, n] of boiler.slice(0, 15)) add({ ref: `${n} موضعًا`, type: "جملة قالبية متكررة", sev: "تحسين", fix: s.slice(0, 90) });

writeJSON("b3-issues.json", issues);
const bySev = {}, byType = {};
for (const i of issues) { bySev[i.sev] = (bySev[i.sev] || 0) + 1; byType[i.type] = (byType[i.type] || 0) + 1; }
console.log({ books: J.books.length, lessons: nLessons, questions: nQ, ayahQuotes: nAyah, hadithQuotes: nHad, boilerplate: boiler.length });
console.log(bySev); console.log(byType);
