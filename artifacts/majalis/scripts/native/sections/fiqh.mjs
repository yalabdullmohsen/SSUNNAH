/**
 * قسم «الفقه والعبادات» → Data/fiqh/*.json (انظر docs/native/requests/fiqh.md).
 * تمرير كما هو من مصدر الويب (content/fiqh وsrc/lib وsrc/data)؛ لا إعادة صياغة. المحجوز (content-hold) يُستبعد بالمعرّف أو slug.
 */
import fs from "node:fs";

export default async function exportFiqh({ json, held, reject, counts, appRoot }) {
  const src = `${appRoot}/src`;
  const F = "fiqh";
  const idOf = (x) => x?.id ?? x?.slug;
  const keep = (area) => (x) => (held(idOf(x)) ? (reject(`${F}-${area}`, "محجوز"), false) : true);
  const cnt = (name, n) => { (counts.fiqh ??= {})[name] = n; };
  const out = (name, v, n) => { json(`fiqh/${name}.json`, v); cnt(name, n); };
  const list = (name, rows, area = name) => { const r = rows.filter(keep(area)); out(name, r, r.length); };
  const mod = (p) => import(`${src}/${p}.ts`);

  /* الكتب: الدرس المحجوز يُحذف (ويُنهي التباس needsReview المكرّر)، والباب/الكتاب المحجوز بكامله */
  {
    const raw = JSON.parse(fs.readFileSync(`${appRoot}/content/fiqh/books.json`, "utf8"));
    let lessons = 0;
    const books = raw.books.filter(keep("books")).map((b) => ({
      ...b,
      chapters: (b.chapters || []).filter(keep("chapters")).map((c) => {
        const ls = (c.lessons || []).filter(keep("lessons"));
        lessons += ls.length;
        return { ...c, lessons: ls };
      }),
    }));
    out("books", { ...raw, books }, books.length);
    cnt("books-lessons", lessons);
    const al = JSON.parse(fs.readFileSync(`${appRoot}/content/fiqh/book-aliases.json`, "utf8"));
    const ids = new Set(books.flatMap((b) => [b.id, ...b.chapters.map((c) => c.id)]));
    const aliases = (al.aliases || []).filter((a) => ids.has(a.targetBookId) && ids.has(a.targetChapterId));
    out("book-aliases", { ...al, aliases }, aliases.length);
  }

  /* الأدلة الفقهية الثمانية */
  {
    const guides = { jumuah: "JUMUAH_GUIDE", nikah: "NIKAH_GUIDE", riba: "RIBA_GUIDE", ruqya: "RUQYA_GUIDE", sadaqa: "SADAQA_GUIDE", talaq: "TALAQ_GUIDE", udhiya: "UDHIYA_GUIDE", waqf: "WAQF_GUIDE" };
    let cards = 0;
    for (const [slug, key] of Object.entries(guides)) {
      const g = (await mod(`lib/fiqh-guides/${slug}`))[key];
      if (held(g.slug)) { reject(`${F}-guides`, "محجوز"); continue; }
      const tabs = g.tabs.map((t) => ({ ...t, cards: t.cards.filter(keep("guide-cards")) }));
      cards += tabs.reduce((n, t) => n + t.cards.length, 0);
      json(`fiqh/guides/${slug}.json`, { ...g, tabs });
    }
    cnt("guides-cards", cards);
  }

  list("madhahib", (await mod("data/madhahib")).MADHAHIB);
  list("maqasid-sharia", (await mod("lib/maqasid-sharia-data")).MAQASID_SHARIA);
  list("prayer-ranks", (await mod("lib/prayer-ranks-data")).RANKS);
  list("usul-topics", (await mod("lib/fiqh/fiqh-usul-topics")).USUL_HUB_TOPICS);
  list("prophetic-medicine", (await mod("lib/prophetic-medicine-seed")).PROPHETIC_MEDICINE_ITEMS);

  {
    const m = await mod("lib/sins-rights-data");
    const topics = m.SINS_TOPICS.filter(keep("sins"));
    out("sins-and-rights", { topics, categories: m.SINS_CATEGORIES }, topics.length);
  }
  {
    const m = await mod("lib/amr-bil-maruf-seed");
    const munkaraat = m.MAJOR_MUNKARAAT.filter(keep("amr-munkar"));
    const maaruf = m.MAJOR_MAARUF.filter(keep("amr-maruf"));
    out("amr-bil-maruf", { levels: m.AMR_BIL_MARUF_LEVELS, conditions: m.AMR_BIL_MARUF_CONDITIONS, munkaraat, maaruf }, munkaraat.length + maaruf.length);
  }
}
