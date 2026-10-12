/**
 * قسم «العقيدة والتزكية» → Data/aqidah/*.json (انظر docs/native/requests/aqidah.md).
 * المحتوى مكتوب في TS للويب: الثوابت المحضة تُقرأ بـAST (lib/ts-literal) والوحدات في src/lib تُستورد (يُشغَّل تحت tsx).
 * إعادة تسمية حقول فقط؛ لا إعادة صياغة. المحجوز (content-hold) يُستبعد، والآيات المساقة في الدعوة تُتحقق من Tanzil.
 */
import fs from "node:fs";
import { loadConsts, objectsWithKeys, jsxText, ts } from "../lib/ts-literal.mjs";
import { makeQuranVerifier } from "../lib/quran-ref.mjs";

export default async function exportAqidah({ json, rd, held, reject, counts, appRoot, data }) {
  const src = `${appRoot}/src`;
  const view = (n) => loadConsts(`${src}/views/${n}.tsx`);
  const verify = makeQuranVerifier(data);
  const out = (name, v) => json(`aqidah/${name}.json`, v);
  const cnt = (name, n) => { (counts.aqidah ??= {})[name] = n; };
  const A = "aqidah";
  const ok = (id, area) => (held(id) ? (reject(`${A}-${area}`, "محجوز"), false) : true);
  const nz = (s) => (s == null || String(s).trim() === "" ? undefined : String(s));
  const entry = (id, title, o = {}) => ({ id, title, ...Object.fromEntries(Object.entries(o).filter(([, v]) => nz(v) !== undefined)) });
  const group = (id, title, items) => ({ id, title, items });
  const numbered = (gid, rows, f) => rows.map((r, i) => f(r, `${gid}-${i + 1}`));
  const writeGroups = (name, groups) => {
    const gs = groups.map((g) => ({ ...g, items: g.items.filter((it) => ok(it.id, name)) })).filter((g) => g.items.length);
    out(name, gs);
    cnt(name, gs.reduce((n, g) => n + g.items.length, 0));
  };
  const byCategory = (rows, catOf, f) => {
    const m = new Map();
    for (const r of rows) { const c = catOf(r); if (!m.has(c)) m.set(c, []); m.get(c).push(f(r)); }
    return [...m].map(([c, items], i) => group(`cat-${i + 1}`, c, items));
  };

  /* آداب طالب العلم */
  {
    const g = view("AdabTalabIlmPage");
    const tx = (id, title, rows) => group(id, title, numbered(id, rows, (r, eid) => entry(eid, r.title, { body: r.text, reference: r.source })));
    writeGroups("adab-talab-ilm", [
      tx("fadl", "فضل العلم", g("FADL_ITEMS")),
      tx("adab-nafs", "آداب مع النفس", g("ADAB_NAFS")),
      tx("adab-sheikh", "آداب مع الشيخ", g("ADAB_SHEIKH")),
      tx("adab-ilm", "آداب في الدرس", g("ADAB_DARS")),
      group("marratib", "مراتب طالب العلم", numbered("marratib", g("MARRATIB"), (r, id) => entry(id, r.stage, { summary: r.years, body: [r.focus, r.sign].filter(nz).join("\n") }))),
      group("kutub", "الكتب المقررة", numbered("kutub", g("KUTUB"), (r, id) => entry(id, r.level, { summary: r.desc, body: r.books.map((b) => [b.name, b.author, b.note].filter(nz).join(" — ")).join("\n") }))),
    ]);
  }

  /* الأخلاق */
  {
    const rows = view("AkhlaqPage")("AKHLAQ");
    writeGroups("akhlaq", byCategory(rows, (r) => r.category, (r) => entry(`akhlaq-${r.id}`, r.title, {
      summary: r.summary,
      body: [r.ayah, r.hadith, nz(r.scholarQuote) && `${r.scholarQuote}${nz(r.scholarName) ? ` — ${r.scholarName}` : ""}`, ...(r.practices || []).map((p) => `• ${p}`)].filter(nz).join("\n"),
      reference: [r.ayahRef, r.hadithSource].filter(nz).join("؛ "),
    })));
  }

  /* علامات الساعة */
  {
    const g = view("AlamatSaahPage");
    writeGroups("alamat-saah", [
      group("sughra", "العلامات الصغرى", numbered("sughra", g("SUGHRA"), (r, id) => entry(id, r.title, { summary: r.status, body: r.desc, reference: r.source }))),
      group("kubra", "العلامات الكبرى العشر", g("KUBRA").map((r) => entry(`kubra-${r.num}`, r.title, { body: r.desc, reference: r.ref }))),
      group("tahdhukat", "الاستعداد", numbered("tahdhukat", g("TAHDHUKAT"), (r, id) => entry(id, r.title, { body: r.desc, reference: r.source }))),
    ]);
  }

  /* الأمراض القلبية */
  {
    const rows = view("AmradQalbiyyaPage")("DISEASES");
    writeGroups("amrad-qalbiyya", [group("amrad", "الأمراض القلبية", rows.map((r) => entry(`mard-${r.id}`, r.name, {
      summary: r.definition,
      body: [...(r.signs || []).map((s) => `• ${s}`), r.remedy].filter(nz).join("\n"),
      reference: r.evidence,
    })))]);
  }

  /* حكم السلف */
  {
    const rows = view("HikamSalafPage")("HIKAM");
    writeGroups("hikam-salaf", byCategory(rows, (r) => r.category, (r) => entry(`hikma-${r.id}`, r.text, {
      summary: [r.scholar, nz(r.died) && `(${r.died})`].filter(nz).join(" "),
      body: r.explanation,
      reference: r.source,
    })));
  }

  /* الجنة والنار */
  {
    const g = view("JannaNaarPage");
    const cards = (id, title, names) => group(id, title, names.flatMap((n) => g(n)).map((r, i) => entry(`${id}-${i + 1}`, r.title, { body: r.text, reference: r.ref })));
    writeGroups("janna-naar", [
      cards("janna", "صفة الجنة", ["JANNA_ABWAB", "JANNA_ANHAR", "JANNA_DARAJAT", "JANNA_NAIM"]),
      cards("naar", "صفة النار", ["NAAR_ABWAB", "NAAR_ATHQAL"]),
      cards("asbab-janna", "أسباب الجنة", ["ASBAB_JANNA"]),
      cards("asbab-naar", "أسباب النار", ["ASBAB_NAAR"]),
      group("duas", "أدعية الآخرة", numbered("duas", g("DUAS_LIST"), (r, id) => entry(id, `دعاء ${id.split("-")[1]}`, { body: r.text, reference: r.source }))),
    ]);
  }

  /* الملائكة */
  {
    const g = view("MalaikaPage");
    writeGroups("malaika", [
      group("aqida", "العقيدة", numbered("aqida", g("AQIDA_POINTS"), (r, id) => entry(id, r.title, { body: r.text }))),
      group("asma", "أسماؤهم ومهامهم", numbered("asma", g("MALAIKA"), (r, id) => entry(id, r.name, { summary: r.arabicTitle, body: [r.role, r.detail].filter(nz).join("\n"), reference: r.ref }))),
      group("awsaf", "صفاتهم", numbered("awsaf", g("AWSAF"), (r, id) => entry(id, r.title, { body: r.text, reference: r.ayah }))),
      group("fadail", "فضائلهم", numbered("fadail", g("FADAIL"), (r, id) => entry(id, r.title, { body: r.text, reference: r.ref }))),
      group("amal", "تعاملهم مع البشر", numbered("amal", g("AMAL_ITEMS"), (r, id) => entry(id, r.title, { body: r.text }))),
    ]);
  }

  /* الرقائق */
  {
    const g = view("RaqaiqPage");
    const tx = (id, title, rows) => group(id, title, numbered(id, rows, (r, eid) => entry(eid, r.title, { body: r.text, reference: r.source })));
    writeGroups("raqaiq", [
      tx("raqaiq", "مواعظ الرقائق", g("RAQAIQ")),
      group("zuhd", "أقوال الزاهدين", numbered("zuhd", g("ZUHD_AQWAL"), (r, id) => entry(id, r.name, { body: r.qawl }))),
      group("muhasaba", "المحاسبة اليومية", numbered("muhasaba", g("MUHASABA_ASILA"), (s, id) => entry(id, `سؤال ${id.split("-")[1]}`, { body: s }))),
      tx("musab", "نماذج زهد الأولياء", g("MUSAB_AWLIYA")),
    ]);
  }

  /* موضوعات الإيمان والتزكية والأسرة والمجتمع: DarsSection كما هي */
  for (const [name, mod, key] of [["iman-topics", "iman-topics-data", "IMAN_TOPICS"], ["tazkiya-topics", "tazkiya-topics-data", "TAZKIYA_TOPICS"], ["usra-mujtama", "usra-mujtama-data", "USRA_MUJTAMA"]]) {
    const secs = (await import(`${src}/lib/${mod}.ts`))[key]
      .filter((s) => ok(s.id, name))
      .map((s) => ({ ...s, lessons: s.lessons.filter((l) => ok(l.id, name)) }))
      .filter((s) => s.lessons.length);
    out(name, secs);
    cnt(name, secs.reduce((n, s) => n + s.lessons.length, 0));
  }

  /* كيف أصبح مسلمًا: كتل JSX ثابتة (تُستثنى دعوة التواصل) */
  {
    const file = `${src}/views/HowToBecomeMuslimPage.tsx`;
    const sf = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const cls = (el) => el.openingElement.attributes.properties.find((p) => p.name?.text === "className")?.initializer?.text ?? "";
    const tag = (el) => el.openingElement.tagName.getText();
    const blocks = [];
    const visit = (n) => {
      if (ts.isJsxElement(n) && tag(n) === "div" && /\bdii-block\b/.test(cls(n)) && !/dii-contact-cta/.test(cls(n))) { blocks.push(n); return; }
      ts.forEachChild(n, visit);
    };
    visit(sf);
    const lines = (n) => n.children.flatMap((c) => {
      if (!ts.isJsxElement(c)) return [];
      if (tag(c) === "span" || tag(c) === "h2") return [];
      if (tag(c) === "ul" || tag(c) === "div") return lines(c);
      return [(tag(c) === "li" ? "• " : "") + jsxText(c).replace(/\s+/g, " ").trim()];
    }).filter(nz);
    const items = blocks.map((b, i) => {
      const t = b.children.find((c) => ts.isJsxElement(c) && tag(c) === "span");
      return entry(`block-${i + 1}`, jsxText(t).replace(/\s+/g, " ").trim(), { body: lines(b).join("\n") });
    });
    writeGroups("discover-islam-how-to-convert", [group("how-to-convert", "كيف أصبح مسلمًا", items)]);
  }

  /* أسماء الله الحسنى: يُستبعد غير الموثّق وما بلا معنى/مرجع */
  {
    const all = (await import(`${src}/lib/asma-husna-data.ts`)).ASMAA;
    const keep = all.filter((a) => {
      if (a.documentation_status === "unsourced") { reject(`${A}-asma-husna`, "unsourced"); return false; }
      if (!nz(a.meaning) || !nz(a.reference)) { reject(`${A}-asma-husna`, "بلا معنى/مرجع"); return false; }
      return ok(`asma-${a.num}`, "asma-husna");
    });
    out("asma-husna", keep);
    cnt("asma-husna", keep.length);
  }

  /* التوحيد: الآيات المساقة تُفحص مقابل Tanzil وتُبلَّغ عدديًا */
  {
    const topics = Object.values((await import(`${src}/lib/tawhid-topics.ts`)).TAWHID_TOPICS).filter((t) => ok(t.id, "tawhid"));
    for (const t of topics) for (const b of t.blocks) if (b.ayah) {
      const r = verify(b.ayah.ref, b.ayah.text);
      if (r !== true) reject(`${A}-tawhid-ayah-unverified`, `${t.id}: ${b.ayah.ref} (${r})`);
    }
    out("tawhid", topics);
    cnt("tawhid", topics.length);
  }

  /* الفرق: لا يُصدَّر إلا PUBLISHED (البنود الموسومة «تحتاج إحالة» خارج التصدير) */
  {
    const meta = rd(`${src}/data/islamic-sects-public-meta.json`).records;
    const pub = new Map(meta.filter((m) => m.publicationStatus === "PUBLISHED").map((m) => [m.id, m]));
    const sects = (await import(`${src}/data/islamic-sects.ts`)).ISLAMIC_SECTS
      .filter((s) => pub.has(s.id) && ok(s.id, "islamic-sects"))
      .map((s) => ({ ...s, publicationStatus: "PUBLISHED" }));
    for (const m of meta) if (m.publicationStatus !== "PUBLISHED") reject(`${A}-islamic-sects`, `حالة ${m.publicationStatus}`);
    out("islamic-sects", sects);
    cnt("islamic-sects", sects.length);
  }

  /* الدعوة: الآية تُفحص مقابل Tanzil؛ ما لا يُتحقق منه يسقط، والسؤال/الشبهة بلا دليل متحقَّق يسقط */
  {
    const dw = await import(`${src}/lib/dawah-static-fallback.ts`);
    const cleanEvidences = (area, evs) => (evs || []).filter((e) => {
      if (e.type !== "quran") { reject(`${A}-${area}`, `دليل ${e.type} غير قابل للتحقق المحلي`); return false; }
      const r = verify(e.ref, e.text);
      if (r !== true) { reject(`${A}-${area}`, `آية ${r}`); return false; }
      return true;
    });
    const qs = [];
    for (const q of dw.STATIC_DAWAH_QUESTIONS) {
      if (!ok(q.id, "questions") || !ok(`dawah-question:${q.slug}`, "questions")) continue;
      const evidences = cleanEvidences("questions", q.evidences);
      if (!evidences.length || !(q.sources || []).length) { reject(`${A}-questions`, "بلا دليل متحقَّق/مصدر"); continue; }
      qs.push({ ...q, evidences });
    }
    out("discover-islam-questions", qs);
    cnt("discover-islam-questions", qs.length);
    const sh = [];
    for (const s of dw.STATIC_DAWAH_SHUBUHAT) {
      if (!ok(s.id, "doubts") || !ok(`dawah-shubha:${s.slug}`, "doubts")) continue;
      const evidences = cleanEvidences("doubts", s.evidences);
      if (!evidences.length || !(s.sources || []).length) { reject(`${A}-doubts`, "بلا دليل متحقَّق/مصدر"); continue; }
      sh.push({ ...s, evidences });
    }
    out("discover-islam-doubts", sh);
    cnt("discover-islam-doubts", sh.length);
    const arts = Object.values(dw.STATIC_DAWAH_ARTICLES).filter((a) => ok(a.id, "articles") && ok(`dawah-article:${a.slug}`, "articles"));
    out("discover-islam-articles", arts);
    cnt("discover-islam-articles", arts.length);
    const nm = dw.STATIC_NEW_MUSLIM_PATH.filter((d) => ok(d.id, "new-muslim")).map(({ id, day_number, audience, title, content_ar }) => ({ id, day_number, audience, title, content_ar }));
    out("discover-islam-new-muslim", nm);
    cnt("discover-islam-new-muslim", nm.length);
  }

  /* مدخل «التعريف بالإسلام»: أزرار التنقل في الصفحة كما هي (ContentItem بلا نص شرعي)؛ نموذج التواصل السري فارغ عمدًا (شبكة/حساب) */
  {
    const t = fs.readFileSync(`${src}/views/DiscoverIslamPage.tsx`, "utf8").split("\n").slice(125, 145).join("\n");
    const seen = new Set();
    const items = [...t.matchAll(/<Link href="(\/discover-islam\/[^"?]+)" className="asp-(?:run|add)-btn">([^<]+)<\/Link>/g)]
      .filter((m) => !seen.has(m[1]) && seen.add(m[1]))
      .map((m) => ({ id: m[1].replace(/^\/discover-islam\//, "").replace(/\//g, "-"), title: m[2], tags: [], route: m[1] }));
    out("discover-islam", items);
    cnt("discover-islam", items.length);
    out("discover-islam-contact", []);
    cnt("discover-islam-contact", 0);
    reject(`${A}-contact`, "فارغ عمدًا: نموذج تواصل (شبكة/حساب)");
  }

  /* مدخل التزكية: روابط تنقل فقط */
  {
    const cards = objectsWithKeys(`${src}/pages/tazkiya/TazkiyaHubPage.tsx`, ["href", "title", "desc"]);
    const links = cards.map((c) => ({ id: c.href.replace(/^\//, "").replace(/\//g, "-"), title: c.title, subtitle: c.desc, route: c.href }));
    out("tazkiya", links);
    cnt("tazkiya", links.length);
  }
}
