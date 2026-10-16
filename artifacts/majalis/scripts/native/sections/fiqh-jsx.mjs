/**
 * صفحات الفقه/العبادات التي نصها ثوابت داخل ملف الصفحة نفسه (كما يعرضها الموقع) → Data/fiqh/<page>.json.
 * لا نص مُضاف: العنوان/النص/الدليل/المصدر/الدرجة كما في الثوابت؛ التبويب أو الدرجة في tags.
 * worship (شاشة مواقيت) وmawarith-calculator وprayer-times تبقى فارغة في fiqh-rest.mjs.
 */
import { loadConsts } from "../lib/ts-literal.mjs";

const GRADE = { sahih: "صحيح", hasan: "حسن" };
/* أحاديث درجتها مختلف فيها بين المصادر المقروءة: لا شارة «صحيح» ولا جزم، والنص يبقى منسوبًا لقائله (docs/native/review/hadith8-conflicts.md) */
const GRADE_DISPUTED = { f63: { source: "سنن الترمذي 747 — الحكم مختلف فيه: حسن (دار السلام)، صحيح (الألباني)", tag: "الحكم مختلف فيه" } };
const join = (...p) => p.filter(Boolean).join("\n\n");

export default async function exportFiqhJsx({ json, held, reject, counts, appRoot }) {
  const rows = (name, list) => {
    const kept = list.filter((r) => (held(r.id) ? (reject(`fiqh-${name}`, "محجوز"), false) : true));
    json(`fiqh/${name}.json`, kept);
    (counts.fiqh ??= {})[name] = kept.length;
  };
  const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ""));

  /* سجود السهو */
  const sj = loadConsts(`${appRoot}/src/views/SujoodSahwPage.tsx`)("RULINGS");
  rows("sujood-sahw", sj.map((r) => clean({
    id: `sujood-sahw-${r.id}`, title: r.title, subtitle: r.timing,
    body: join(r.description, r.detail, r.evidence && `الدليل: ${r.evidence}`, r.khilaf && `الخلاف: ${r.khilaf}`), tags: [],
  })));

  /* أركان الإسلام والإيمان */
  const rukn = (prefix, list) => list.map((r, i) => clean({
    id: `${prefix}-${r.num ?? i + 1}`, title: r.title, subtitle: r.subtitle, tags: [],
    body: join(
      r.summary,
      r.dalilQuran?.length && `من القرآن:\n${r.dalilQuran.map((d) => `${d.text} — ${d.ref}`).join("\n")}`,
      r.dalilHadith?.length && `من السنة:\n${r.dalilHadith.map((d) => `${d.text} — ${d.source}`).join("\n")}`,
      ...(r.details || []).map((d) => `${d.label}: ${d.body}`),
      r.scholarQuote && `${r.scholarQuote.text} — ${r.scholarQuote.scholar}`,
    ),
  }));
  rows("arkan", rukn("arkan", loadConsts(`${appRoot}/src/views/ArkanIslamPage.tsx`)("ARKAN")));
  rows("arkan-iman", rukn("arkan-iman", loadConsts(`${appRoot}/src/views/ArkanImanPage.tsx`)("ARKAN_IMAN")));

  /* فضائل الأعمال: الدرجة في tags والمصدر في body */
  const fd = loadConsts(`${appRoot}/src/views/FadailAamalPage.tsx`)("FADAIL");
  rows("fadail-aamal", fd.map((f) => clean({
    id: `fadail-${f.id}`, title: f.title, body: join(f.text, (GRADE_DISPUTED[f.id]?.source ?? f.source) && `المصدر: ${GRADE_DISPUTED[f.id]?.source ?? f.source}`),
    tags: [f.category, GRADE_DISPUTED[f.id]?.tag ?? GRADE[f.grade] ?? f.grade].filter(Boolean),
  })));

  /* التوبة */
  const tg = loadConsts(`${appRoot}/src/views/TawbaPage.tsx`);
  const tw = [];
  tg("SHURUT").forEach((x, i) => tw.push(clean({ id: `tawba-shart-${i + 1}`, title: x.title, body: join(x.desc, x.dalil && `الدليل: ${x.dalil}`), tags: ["شروط التوبة"] })));
  tg("ANWAA").forEach((x, i) => tw.push(clean({ id: `tawba-nawaa-${i + 1}`, title: x.title, subtitle: x.hukm, body: x.desc, tags: ["أنواع التوبة"] })));
  tg("ADHKAR").forEach((x, i) => tw.push(clean({
    id: `tawba-dhikr-${i + 1}`, title: x.arabic, subtitle: x.times, tags: ["أذكار التوبة"],
    body: join(x.reward, x.source && `المصدر: ${x.source}`),
  })));
  tg("MAWANI").forEach((x, i) => tw.push(clean({ id: `tawba-mani-${i + 1}`, title: x.title, body: x.desc, tags: ["موانع التوبة"] })));
  tg("ATHAAR").forEach((x, i) => tw.push(clean({ id: `tawba-athar-${i + 1}`, title: x.title, body: join(x.desc, x.dalil && `الدليل: ${x.dalil}`), tags: ["آثار التوبة"] })));
  rows("tawba", tw);

  /* القواعد الفقهية */
  const qg = loadConsts(`${appRoot}/src/pages/fiqh/ui/FiqhQawaidView.tsx`);
  const q = [];
  qg("QAWAID_KUBRA").forEach((x) => q.push(clean({
    id: `qawaid-kubra-${x.id}`, title: x.text, tags: ["القواعد الخمس الكبرى"],
    body: join(x.meaning, x.origin && `أصلها: ${x.origin}`,
      x.conditions?.length && `شروطها:\n${x.conditions.join("\n")}`,
      x.faraa?.length && `فروعها:\n${x.faraa.join("\n")}`,
      x.examples?.length && `أمثلة:\n${x.examples.map((e) => `${e.situation} — ${e.hukm}`).join("\n")}`,
      x.exceptions?.length && `مستثنيات:\n${x.exceptions.join("\n")}`,
      x.scholars && `العلماء: ${x.scholars}`),
  })));
  qg("QAWAID_FARAA").forEach((x, i) => q.push(clean({ id: `qawaid-faraa-${i + 1}`, title: x.text, body: join(x.explanation, x.example && `مثال: ${x.example}`), tags: ["القواعد الفرعية"] })));
  qg("DHAWAABIT").forEach((x) => (x.rules || []).forEach((r, i) => q.push(clean({ id: `dhabit-${x.id}-${i + 1}`, title: r.text, subtitle: x.science, body: r.example && `مثال: ${r.example}`, tags: ["الضوابط الفقهية"] }))));
  qg("TATBIQAT").forEach((x, i) => q.push(clean({ id: `tatbiq-${i + 1}`, title: x.title, subtitle: x.qaaida, body: join(x.question, x.answer, x.source && `المصدر: ${x.source}`), tags: ["التطبيقات المعاصرة"] })));
  rows("fiqh-qawaid", q);
}
