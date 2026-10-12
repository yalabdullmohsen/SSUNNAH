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

  /* ما يعرضه الموقع بدرجاته ومصادره (قرار المالك 2026-10-12): الحالة تُحمل في tags ولا يُخترع نص */
  const clip = (t, n = 180) => { const x = String(t ?? "").replace(/\s+/g, " ").trim(); return x.length > n ? `${x.slice(0, n - 1)}…` : x; };
  const dars = async (file, mod, name) => {
    const rows = (await import(`${src}/lib/${mod}.ts`))[name].flatMap((sec) => sec.lessons.map((l) => ({
      id: l.id, title: l.title, subtitle: l.summary || undefined, body: l.body || l.summary || undefined, tags: [sec.title], route: undefined,
    })));
    out(file, rows.filter(keep(file)));
  };
  out("learn/institutions.json", read(`${src}/data/institutions-catalog.json`).filter(keep("institutions")).map((i) => ({
    id: i.id, title: i.name, subtitle: [i.city, i.country].filter(Boolean).join("، "), body: i.description,
    tags: [i.type, (i.contentStatus ?? "needs_review") === "needs_review" ? "قيد المراجعة" : "معتمد", i.contentStatus ?? "needs_review", i.sourceType].filter(Boolean), route: i.website || i.sourceUrl || undefined,
  })));
  await dars("learn/durus-imaniyya.json", "durus-imaniyya-data", "DURUS_IMANIYYA");
  await dars("learn/durus-mutanawwia.json", "durus-mutanawwia-data", "DURUS_MUTANAWWIA");
  await dars("sirah/fikr-waqia.json", "fikr-waqia-data", "FIKR_WAQIA");
  {
    const { FAWAID_CURATED_SEED, filterCuratedFawaid } = await import(`${src}/lib/fawaid-curated-seed.ts`);
    out("learn/fawaid.json", filterCuratedFawaid(FAWAID_CURATED_SEED).filter(keep("fawaid")).map((f) => ({
      id: f.id, title: clip(f.text, 90), subtitle: f.author_name || undefined, body: [f.text, f.source].filter(Boolean).join("\n\n"),
      tags: [f.category, f.verification_status, f.trust_level].filter(Boolean),
    })));
  }
  {
    const { ANNUAL_COURSES_SEED } = await import(`${src}/lib/annual-courses-seed.ts`);
    out("learn/annual-courses.json", ANNUAL_COURSES_SEED.filter((c) => c.status === "approved").filter(keep("annual-courses")).map((c) => ({
      id: c.id, title: c.title, subtitle: [c.season, ...(c.sheikh_names ?? [])].filter(Boolean).join(" — ") || undefined, body: c.body || c.summary,
      tags: [c.course_type, c.venue_city].filter(Boolean), route: c.registration_url || undefined,
    })));
  }

  /* فارغ عمدًا */
  empty("learn/competitions.json", "المنشور في الإنتاج 0 والعيّنة demo");
}
