/**
 * قسم «الدروس والتعلم» → Data/learn|lessons|graph/*.json (انظر docs/native/requests/learn.md).
 * تمرير كما هو من مصدر الويب؛ المحجوز (content-hold) يُستبعد بالمعرّف.
 * ما مصدره الشبكة (Supabase) أو يشترط مراجعة شرعية/قرار المالك يُصدَّر قائمة فارغة بالشكل الصحيح («فارغ عمدًا»)، لا نصًّا بلا مصدر.
 */
import fs from "node:fs";

export default async function exportLearn({ json, held, reject, counts, appRoot }) {
  const src = `${appRoot}/src`;
  const S = "learn";
  const idOf = (x) => x?.id ?? x?.slug;
  const keep = (area) => (x) => (held(String(idOf(x))) ? (reject(`${S}-${area}`, "محجوز"), false) : true);
  const out = (file, rows) => { json(file, rows); (counts.learn ??= {})[file] = Array.isArray(rows) ? rows.length : Object.keys(rows).length; };
  const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
  const empty = (file, why) => { out(file, []); reject(`${S}-${file}`, `فارغ عمدًا: ${why}`); };

  /* الدروس: جدول الدروس بالشكل نفسه (يُحدَّث مع كل إصدار) */
  out("lessons/chunk-000.json", read(`${appRoot}/public/data/lessons/chunk-000.json`).filter(keep("lessons")));

  /* الجامعات: المتحقَّق منها فقط */
  out("learn/universities.json", read(`${src}/data/universities-catalog.json`).filter((u) => (u.is_verified === true ? true : (reject(`${S}-universities`, "غير متحقَّق"), false))).filter(keep("universities")));

  /* مشايخ الكويت: ثابت TS حرفي */
  {
    const { KUWAIT_SHEIKHS } = await import(`${src}/lib/kuwait-sheikhs.ts`);
    out("learn/kuwait-sheikhs.json", KUWAIT_SHEIKHS.filter(keep("kuwait-sheikhs")));
  }

  /* شبكة الروابط: كما هي */
  out("graph/links.json", read(`${appRoot}/public/data/graph/links.json`));

  /* فارغ عمدًا */
  empty("learn/institutions.json", "قرار المالك 2026-10-12: المراجَع فقط والـ44 كلها needs_review (LEARN_INSTITUTIONS_DECISION.md)");
  empty("learn/competitions.json", "المنشور في الإنتاج 0 والعيّنة demo");
  empty("learn/durus-imaniyya.json", "ملخصات بنسبة أحاديث ودرجات بلا توثيق: تنتظر مراجعة sharia-content");
  empty("learn/durus-mutanawwia.json", "نصوص مولَّدة من قالب بلا مصادر: تنتظر مراجعة sharia-content");
  empty("learn/fawaid.json", "مصدره Supabase (approved) بلا لقطة محقَّقة؛ ما بلا مصدر/قائل لا يُعرض");
  empty("learn/annual-courses.json", "مصدره Supabase (approved)؛ البذرة تجريبية");
}
