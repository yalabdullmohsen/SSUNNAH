/**
 * يبني content/native/adhkar-verified.json من بذرة الأذكار الأصلية (src/lib/adhkar-seed.ts) بصفوف بشكل verified_adhkar_items.
 * لا يُنشئ نصًّا ولا مرجعًا: النص/المصدر/الدرجة كما في البذرة حرفيًا؛ التصنيف قاعدة فقط:
 *   sahihayn  : درجة «صحيح» ومصدرها صريح في البخاري/مسلم/متفق عليه.
 *   named_grader : درجة «صحيح» وفي المصدر مصحِّح مسمّى (صححه فلان) ومرجع الباب.
 *   quran_tanzil : نص قرآني يطابق Tanzil حرفيًا في الآية المحال إليها.
 * ما درجته ضعيفة ← content-hold.json. حسن/صحيح بلا مصحِّح مسمّى/صيغة/صلاة على النبي ← مُرجأ (لا يُصدَّر ولا يُحجز).
 * التشغيل: node --import tsx scripts/native/build-adhkar-verified.mjs   (من artifacts/majalis)
 */
import fs from "node:fs";
import { makeQuranVerifier } from "./lib/quran-ref.mjs";
import { ADHKAR_ITEMS } from "../../src/lib/adhkar-seed.ts";

const SINCE = "2026-10-11";
const SH = /رواه (?:البخاري|مسلم)|متفق عليه|صحيح (?:البخاري|مسلم)|البخاري ومسلم|رواه الشيخان|أخرجه (?:البخاري|مسلم)/;
const strip = (s) => String(s || "").replace(/[ً-ٰٟ]/g, "");
const NAMED = /صح+ح(?:ه|ها)\s+\S+/;
const PRIORITY = ["adh-morning", "adh-evening", "adh-sleep"];

const verify = makeQuranVerifier("public/data");
const rows = [], holds = [], deferred = [], stat = {};
const bump = (k) => { stat[k] = (stat[k] || 0) + 1; };

for (const i of ADHKAR_ITEMS) {
  const grade = String(i.grade || "").trim(), src = String(i.source || "").trim(), ref = String(i.reference || "").trim();
  const row = (basis, extra = {}) => ({
    id: i.id, category_id: i.categoryId, text: i.text, repeat_count: i.count ?? 1, narrator: i.narrator ?? null,
    source_name: src, source_url: null, grade, reference: ref, explanation: null, keywords: i.keywords ?? [],
    global_ref_id: null, verification_status: "verified", quality_score: null, trust_level: null,
    metadata: { basis, origin: "adhkar-seed", ...extra }, deleted_at: null, version_number: 1, created_at: SINCE, updated_at: SINCE,
  });
  if (!src) { holds.push({ id: i.id, reason: "ذكر بلا مصدر: لا يُصدَّر للتطبيق الأصلي", since: SINCE }); bump("hold:بلا مصدر"); continue; }
  if (/^ضعيف|غير مسندة|لم يثبت/.test(grade) || /^ضعيف/.test(strip(grade))) { holds.push({ id: i.id, reason: `درجة ضعيفة في البذرة («${grade.slice(0, 40)}»): لا يُصدَّر للتطبيق الأصلي`, since: SINCE }); bump("hold:ضعيف"); continue; }
  if (/^قرآن/.test(grade)) {
    const m = src.match(/^سورة\s+(.+?)،\s*([\d]+(?:-[\d]+)?)$/);
    const qref = m ? `${m[1]}: ${m[2]}` : "";
    const v = qref ? verify(qref, i.text) : "مرجع غير مفهوم";
    if (v === true) { rows.push(row("quran_tanzil", { quran_ref: qref })); bump("export:quran_tanzil"); }
    else { deferred.push({ id: i.id, why: `قرآن لم يتحقق: ${v}` }); bump("defer:قرآن"); }
    continue;
  }
  if (grade === "صحيح" && SH.test(src)) { rows.push(row("sahihayn")); bump("export:sahihayn"); continue; }
  if (grade === "صحيح" && NAMED.test(strip(`${src} ${ref}`)) && ref) { rows.push(row("named_grader")); bump("export:named_grader"); continue; }
  deferred.push({ id: i.id, why: grade === "صحيح" ? "صحيح بلا مصحِّح مسمّى" : `درجة «${grade.slice(0, 20)}» لا تكفي` }); bump(`defer:${grade.slice(0, 12)}`);
}

rows.sort((a, b) => (PRIORITY.indexOf(a.category_id) + 1 || 9) - (PRIORITY.indexOf(b.category_id) + 1 || 9) || 0);
fs.mkdirSync("content/native", { recursive: true });
fs.writeFileSync("content/native/adhkar-verified.json", JSON.stringify(rows, null, 2) + "\n");

const holdFile = "content/content-hold.json";
const hold = JSON.parse(fs.readFileSync(holdFile, "utf8"));
const have = new Set(hold.holds.map((h) => h.id));
let added = 0;
for (const h of holds) if (!have.has(h.id)) { hold.holds.push(h); added++; }
if (added) fs.writeFileSync(holdFile, JSON.stringify(hold, null, 1) + "\n");

const byCat = {};
for (const r of rows) byCat[r.category_id] = (byCat[r.category_id] || 0) + 1;
console.log(JSON.stringify({ total: ADHKAR_ITEMS.length, exported: rows.length, heldNew: added, heldTotalThisRun: holds.length, deferred: deferred.length, stat, priority: PRIORITY.map((c) => [c, byCat[c] || 0]) }, null, 1));
fs.writeFileSync(process.env.ADHKAR_DEFER_LOG || "/dev/null", JSON.stringify(deferred, null, 1));
