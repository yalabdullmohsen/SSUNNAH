// ن8 دفعة 1 — الأذكار (قراءة فقط)
import fs from "node:fs";
import { ROOT, langIssues, findQuran, matchHadith, collectionsCited, sk1, sk2, writeJSON } from "./lib.mjs";
import { ADHKAR_CATEGORIES, getAllAdhkarItemsIncludingWeak, getAllAdhkarItems } from "../audit-main/artifacts/majalis/src/lib/adhkar-seed";

const N8 = "/tmp/claude-0/-home-user-SSUNNAH/be268c8a-5f28-5d55-9d4c-aeebe0d59c4c/scratchpad/n8";
const seedSrc = fs.readFileSync(`${ROOT}/src/lib/adhkar-seed.ts`, "utf8").split("\n");
const lineOf = (id: string) => seedSrc.findIndex((l) => l.includes(`id: "${id}"`)) + 1;

const issues: any[] = [];
const add = (o: any) => issues.push({ section: "الأذكار", ...o });
const all = getAllAdhkarItemsIncludingWeak();
const pub = new Set(getAllAdhkarItems().map((i) => i.id));
const cats = new Set(ADHKAR_CATEGORIES.map((c) => c.id));

// بنية: معرّفات مكررة في المصدر (قبل الدمج)
const rawIds = seedSrc.map((l) => l.match(/^\s+id: "(adh-[^"]+)"/)?.[1]).filter(Boolean) as string[];
const seen = new Map<string, number>();
rawIds.forEach((id) => seen.set(id, (seen.get(id) || 0) + 1));
for (const [id, n] of seen) if (n > 1) add({ file: "src/lib/adhkar-seed.ts", ref: `${id} (س${lineOf(id)})`, type: "معرّف مكرر", sev: "متوسط", fix: `المعرّف يتكرر ${n} مرات؛ إعادة ترقيم` });
// مفاتيح مكررة داخل الكائن (keywords مرتين…)
let cur = "";
const keysSeen = new Set<string>();
seedSrc.forEach((l, i) => {
  const idm = l.match(/^\s+id: "([^"]+)"/);
  if (idm) { cur = idm[1]; keysSeen.clear(); }
  const km = l.match(/^\s{4}(\w+):/);
  if (km && cur) { if (keysSeen.has(km[1])) add({ file: "src/lib/adhkar-seed.ts", ref: `${cur} (س${i + 1})`, type: `مفتاح مكرر في الكائن (${km[1]})`, sev: "تحسين", fix: "حذف التكرار؛ القيمة الأخيرة هي المعمول بها" }); keysSeen.add(km[1]); }
});

// نصوص مكررة
const byText = new Map<string, string[]>();
for (const it of all) { const k = sk1(it.text) + "|" + it.categoryId; byText.set(k, [...(byText.get(k) || []), it.id]); }
for (const [, ids] of byText) if (ids.length > 1) add({ file: "src/lib/adhkar-seed.ts", ref: ids.join("، "), type: "نص مكرر في نفس التصنيف", sev: "متوسط", fix: "إبقاء واحد" });

const gradeVals: Record<string, number> = {};
for (const it of all) {
  const ref = `${it.id} (س${lineOf(it.id)})`;
  const f = "src/lib/adhkar-seed.ts";
  gradeVals[it.grade || "(فارغ)"] = (gradeVals[it.grade || "(فارغ)"] || 0) + 1;
  if (!cats.has(it.categoryId)) add({ file: f, ref, type: "تصنيف غير موجود", sev: "متوسط", fix: `categoryId=${it.categoryId}` });
  if (!it.count || it.count < 1 || !Number.isInteger(it.count)) add({ file: f, ref, type: "عدد التكرار غير صالح", sev: "متوسط", fix: String(it.count) });
  if (!it.keywords?.length) add({ file: f, ref, type: "حقل ناقص (keywords)", sev: "تحسين", fix: "" });
  const isQuran = /^قرآن/.test(it.grade || "") || /سورة|البقرة|آل عمران|الإخلاص|الفلق|الناس|\[\d+:\d+\]|﴿/.test(it.source || "");
  if (!it.source?.trim()) add({ file: f, ref, type: "مصدر ناقص", sev: pub.has(it.id) ? "حرج" : "متوسط", fix: "إضافة التخريج (الكتاب + الرقم)" });
  else if (!isQuran && !/\d/.test((it.source || "") + (it.reference || ""))) add({ file: f, ref, type: "مصدر بلا رقم حديث", sev: "متوسط", fix: `«${it.source}» — إضافة رقم الحديث` });
  if (!it.grade?.trim()) add({ file: f, ref, type: "درجة ناقصة", sev: pub.has(it.id) ? "حرج" : "متوسط", fix: "إضافة الدرجة مع المحكِّم" });
  if (/حصن المسلم/.test(it.reference || "") && !/\d/.test(it.source || "")) add({ file: f, ref, type: "إسناد لكتاب جامع بدل الحديث", sev: "تحسين", fix: "المهارة: يُنسب الذكر لحديثه لا لحصن المسلم" });
  if (!it.narrator && !isQuran) add({ file: f, ref, type: "راوٍ ناقص", sev: "تحسين", fix: "" });
  for (const fld of ["text", "source", "grade", "reference", "narrator"] as const) {
    for (const li of langIssues((it as any)[fld], { allowIndicDigits: false })) add({ file: f, ref: `${ref} [${fld}]`, type: li.type, sev: li.type.startsWith("تشكيل") || li.type === "رمز غير مرئي" ? "متوسط" : "تحسين", fix: li.detail });
  }
  // مطابقة
  if (isQuran) {
    const segs = (it.text.match(/﴿([^﴾]+)﴾/g) || [it.text]).map((s) => s.replace(/[﴿﴾]/g, ""))
      .map((s) => s.replace(/^(أَ?عُوذُ بِاللَّهِ[^،:]*?الرَّجِيمِ[،:]?\s*)/, "").replace(/^(بِسْمِ اللَّهِ الرَّحْمَٰ?نِ الرَّحِيمِ[،:]?\s*)/, ""));
    for (const sgm of segs) {
      const r = findQuran(sgm);
      if (!r.found && !r.tooShort) add({ file: f, ref, type: "مطابقة آية: اختلاف حرفي محتمل", sev: "حرج", fix: `أقرب موضع ${r.near ? r.near.s + ":" + r.near.a : "؟"} — تطابق ${Math.round((r.prefixRatio || 0) * 100)}% من البداية؛ يُعرض من بيانات المصحف المحمية`, review: true });
    }
  } else {
    const cols = collectionsCited(it.source);
    const bare = it.text.replace(/^[^:،]{0,20}:\s*/, "").replace(/[{}]/g, "");
    const qx = findQuran(bare.replace(/^أَ?عُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ[،,]?\s*/, ""));
    const quranBody = qx.found || /آية الكرسي/.test(it.text);
    const otherBooks = /أبو داود|أبي داود|الترمذي|النسائي|ابن ماجه|أحمد|الحاكم|الطبراني|ابن السني|البيهقي|الأدب المفرد|ابن حبان|مالك|الدارمي/.test(it.source || "");
    if (cols.length && !quranBody) {
      const m = matchHadith(it.text, cols);
      const STOP = /^(اللهم|اني|فان|ان|و|يا|رب|ربي|ربنا)$/;
      if (m.status === "partial" && m.missing.length && m.missing.every((w: string) => STOP.test(w))) add({ file: f, ref, type: "مطابقة حديث: زيادة لفظ نداء/توكيد", sev: "تحسين", fix: `${m.col} ${m.n}: ${m.missing.join("، ")}` });
      else if (m.status === "partial" && m.missing.length) {
        if (otherBooks) add({ file: f, ref, type: "مطابقة جزئية مع الصحيحين (بقية اللفظ من مصدر آخر مذكور)", sev: "تحسين", fix: `${m.col} ${m.n} (${Math.round(m.ratio * 100)}%) — تفصيل أي لفظ لأي مصدر` });
        else add({ file: f, ref, type: "مطابقة حديث: اللفظ غير موجود في المصدر المذكور", sev: "حرج", fix: `المصدر «${it.source}»؛ أقرب ${m.col === "bukhari" ? "البخاري" : "مسلم"} ${m.n} (${Math.round(m.ratio * 100)}%)؛ غير موجود: ${m.missing.join("، ")}`, review: true });
      } else if (m.status === "rasm") add({ file: f, ref, type: "مطابقة حديث: فرق إملائي (همز/مد)", sev: "تحسين", fix: `${m.col} ${m.n}` });
    }
    // ذكر يتضمن آية بلا إشارة؟
    const r = qx;
    if (r.found && sk2(bare).length > 25 && !/آية|سورة|﴿/.test(it.text + (it.source||""))) add({ file: f, ref, type: "نص قرآني مصنَّف حديثًا", sev: "تحسين", fix: `يطابق ${r.ref}؛ توضيح أنه آية` });
  }
  // عرض الضعيف
  if (/ضعيف|موضوع|غير مسندة/.test(it.grade || "") && pub.has(it.id)) add({ file: f, ref, type: "غير مسند يظهر للعامة", sev: "متوسط", review: true, fix: `الدرجة «${it.grade}» لا يلتقطها مرشّح isWeakAdhkarGrade` });
}

// ===== قاعدة البيانات verified_adhkar_items =====
const db = JSON.parse(fs.readFileSync(`${N8}/db-adhkar.json`, "utf8"));
const dbN = db.reduce((a: number, r: any) => a + r.ids.length, 0);
const seedByK = new Map(all.map((i) => [sk1(i.text), i.id]));
for (const r of db) {
  const ref = r.ids.map((x: string) => `adh-import-${x}…`).join("، ");
  const f = "Supabase: verified_adhkar_items";
  if (r.quran) {
    const t = r.text.replace(/^(بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ،\s*)/, "");
    const q = findQuran(t);
    if (!q.found) add({ file: f, ref, type: "مطابقة آية: اختلاف حرفي محتمل", sev: "حرج", fix: `أقرب ${q.near?.s}:${q.near?.a} (${Math.round((q.prefixRatio || 0) * 100)}%)`, review: true });
    else add({ file: f, ref, type: "آية منسوخة يدويًا بالرسم الإملائي", sev: "تحسين", fix: `يطابق ${q.ref} رسمًا؛ المهارة: الآيات من بيانات المصحف المحمية فقط` });
  } else {
    const m = sk1(r.text).length < 25 ? { status: "short" } as any : matchHadith(r.text, ["bukhari", "muslim"]);
    if (m.status === "exact" || m.status === "rasm") add({ file: f, ref, type: "مصدر ناقص — موجود في الصحيحين", sev: "حرج", fix: `يطابق ${m.col === "bukhari" ? "البخاري" : "مسلم"} ${m.n} (طبعة fawazahmed0، يُراجَع الترقيم)` });
  }
  const dup = seedByK.get(sk1(r.text));
  if (dup) add({ file: f, ref, type: "مكرر مع ملف الأذكار (يظهر مرتين)", sev: "متوسط", fix: `نفس نص ${dup}؛ الدمج بالمعرّف فقط في mergeAdhkarSources` });
  if (r.cat.includes("adh-misc") && r.ref === "أذكار النوم") add({ file: f, ref, type: "تصنيف خاطئ", sev: "متوسط", fix: "مرجعه «أذكار النوم» وتصنيفه adh-misc ← adh-sleep" });
  for (const li of langIssues(r.text)) add({ file: f, ref, type: li.type, sev: "تحسين", fix: li.detail });
}
add({ file: "Supabase: verified_adhkar_items", ref: `كل الصفوف (${dbN})`, type: "مصدر ودرجة وراوٍ ناقصة", sev: "حرج", fix: "source_name = كتاب «أذكار الصباح والمساء» (الألوكة)، grade/narrator = null، والحالة verified وتُعرض للعامة؛ المهارة تمنع النسبة لكتاب جامع" });

// ===== الفضل adhkar-fadl.json =====
const fadl = JSON.parse(fs.readFileSync(`${ROOT}/src/data/adhkar-fadl.json`, "utf8"));
for (const it of fadl.items) {
  const f = "src/data/adhkar-fadl.json";
  if (!it.source || !it.grade) add({ file: f, ref: it.id, type: "مصدر/درجة ناقصة", sev: "حرج", fix: "" });
  const col = it.repoFile?.includes("bukhari") ? "bukhari" : it.repoFile?.includes("muslim") ? "muslim" : null;
  if (col && it.repoN) {
    const m = matchHadith(it.fadl, [col]);
    if (m.status === "partial") add({ file: f, ref: it.id, type: "مطابقة نص الفضل: اختلاف", sev: "حرج", fix: `${col} ${it.repoN}: أقرب ${m.n} (${Math.round(m.ratio * 100)}%) ناقص: ${m.missing.join("، ")}`, review: true });
    else if ((m.status === "exact" || m.status === "rasm") && m.n !== it.repoN) add({ file: f, ref: it.id, type: "رقم الحديث لا يطابق", sev: "متوسط", fix: `repoN=${it.repoN} والنص في ${m.n}` });
  }
  for (const fld of ["dhikr", "fadl", "source"]) for (const li of langIssues(it[fld])) add({ file: f, ref: `${it.id} [${fld}]`, type: li.type, sev: "تحسين", fix: li.detail });
}

writeJSON("b1-issues.json", issues);
const bySev: any = {}; const byType: any = {};
for (const i of issues) { bySev[i.sev] = (bySev[i.sev] || 0) + 1; byType[i.type] = (byType[i.type] || 0) + 1; }
console.log("items seed:", all.length, "public:", pub.size, "db:", dbN, "fadl:", fadl.items.length);
console.log(bySev); console.log(byType); console.log(gradeVals);
