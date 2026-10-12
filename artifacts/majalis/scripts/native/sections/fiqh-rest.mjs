/**
 * الملفات الـ21 المتبقية من Data/fiqh (docs/native/requests/n1-missing-data-60.md) كـ ContentItem[].
 * المشتق: من books.json المنشور نفسه (كل ما فيه published) ومن بطاقات بوابة الفقه/الأصول — لا نص مولَّد.
 * الفارغ عمدًا بالشكل نفسه: صفحات نصها JSX مضمَّن بلا مصدر بيانات مراجَع، والحاسبات، ومواقيت الصلاة (محمية).
 */
import fs from "node:fs";

/* صفحة الويب → كتاب books.json الذي يغطي موضوعها (تقدير؛ تُغيَّر هنا إن قرّر المالك غير ذلك) */
const BOOK_OF = { tahara: "taharah", "salah-guide": "salah", zakat: "zakat", sawm: "sawm", hajj: "hajj", janaza: "janaza", mawarith: "wasaya-faraid", family: "nikah" };
/* الصفحات الستة المضمَّنة (arkan، arkan-iman، fadail-aamal، sujood-sahw، tawba، fiqh-qawaid) يكتبها fiqh-jsx.mjs ببيانات حقيقية؛ لا تُدرَج هنا وإلا كُتبت فارغة فوقها */
const EMPTY = {
  worship: "شاشة مواقيت/تفضيلات لا محتوى",
  "mawarith-calculator": "حاسبة محلية",
  "prayer-times": "حساب المواقيت محمي — لا يُصدَّر",
};

export default async function exportFiqhRest({ json, held, reject, counts, appRoot }) {
  const F = "fiqh";
  const idOf = (x) => x?.id ?? x?.slug;
  const cnt = (name, n) => { (counts.fiqh ??= {})[name] = n; };
  const out = (name, v) => { json(`fiqh/${name}.json`, v); cnt(name, v.length); };
  const item = (id, title, subtitle, route, tags = []) => ({ id, title, ...(subtitle ? { subtitle } : {}), tags, ...(route ? { route } : {}) });
  const keep = (area) => (x) => (held(idOf(x)) ? (reject(`${F}-${area}`, "محجوز"), false) : true);

  const raw = JSON.parse(fs.readFileSync(`${appRoot}/content/fiqh/books.json`, "utf8"));
  const books = raw.books.filter((b) => b.status === "published").filter(keep("books-rest"));
  const chaptersOf = (b) => (b.chapters || []).filter((c) => c.status === "published").filter(keep("chapters-rest"));

  out("fiqh-books", books.map((b) => item(b.id, b.title, b.description, `/fiqh/books/${b.id}`, b.category ? [b.category] : [])));

  const hub = (await import(`${appRoot}/src/lib/fiqh-hub-topics.ts`)).FIQH_HUB_TOPICS.filter(keep("hub"));
  const hubItems = hub.map((t) => item(t.id, t.title, t.desc, t.href));
  out("fiqh-topics", hubItems);
  out("fiqh", hubItems);

  const usul = (await import(`${appRoot}/src/lib/fiqh/fiqh-usul-topics.ts`)).USUL_HUB_TOPICS.filter(keep("usul-rest"));
  out("fiqh-usul", usul.map((t) => item(t.id, t.title, t.summary, `/fiqh/usul/${t.id}`, t.kind ? [t.kind] : [])));

  for (const [page, bookId] of Object.entries(BOOK_OF)) {
    const b = books.find((x) => x.id === bookId);
    if (!b) { out(page, []); reject(`${F}-${page}`, `كتاب ${bookId} غير منشور`); continue; }
    out(page, chaptersOf(b).map((c) => item(c.id, c.title, c.summary, `/fiqh/books/${b.id}/chapters/${c.id}`, [b.title])));
  }
  for (const [page, why] of Object.entries(EMPTY)) { out(page, []); reject(`${F}-${page}`, `فارغ عمدًا: ${why}`); }
}
