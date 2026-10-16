/**
 * قسم «اللغة والمكتبة والبحث» → Data/library/*.json (انظر docs/native/requests/library.md على native-app).
 * تمرير كما هو من مصدر الويب بلا إعادة صياغة؛ المحجوز (content-hold) يُستبعد بالمعرّف. لا نص مولَّد.
 */
import fs from "node:fs";
import { loadConsts, objectsWithKeys, ts } from "../lib/ts-literal.mjs";

export default async function exportLibrary({ json, held, reject, counts, appRoot }) {
  const src = `${appRoot}/src`;
  const L = "library";
  const keep = (area) => (x) => (held(x?.id, x?.slug) ? (reject(`${L}-${area}`, "محجوز"), false) : true);
  const cnt = (name, n) => { (counts.library ??= {})[name] = n; };
  const out = (name, v, n) => { json(`library/${name}.json`, v); cnt(name, n); };
  const mod = (p) => import(`${src}/${p}.ts`);

  /* الأبحاث: منشورة وغير demo، مع التصنيفات */
  {
    const m = await mod("lib/researches/demo-seed");
    const { RESEARCH_CATEGORIES } = await mod("lib/researches/catalog");
    const records = m.RESEARCH_PUBLISHED_SEED.filter((r) => {
      if (r.isDemo || r.reviewStatus !== "published") { reject(`${L}-research`, "غير منشور/demo"); return false; }
      return keep("research")(r);
    });
    out("academic-research", { records, categories: RESEARCH_CATEGORIES.map(({ id, label, sortOrder }) => ({ id, label, sortOrder })) }, records.length);
  }

  /* أقسام الدروس بلا مصادر (قرار المالك): تمرير كما هي */
  for (const [name, mp, key] of [["arabic-language", "lib/arabic-language-data", "ARABIC_LANGUAGE"], ["mawsuaat", "lib/mawsuaat-data", "MAWSUAAT"]]) {
    const rows = (await mod(mp))[key].filter(keep(name));
    out(name, rows, rows.length);
  }

  /* المعجم: المصطلح ذو source فقط (يُستبعد ما بلا مصدر) */
  {
    const TERMS = loadConsts(`${src}/pages/account/ui/IslamicGlossaryView.tsx`)("TERMS");
    const rows = TERMS.filter((t) => {
      if (!String(t.source || "").trim()) { reject(`${L}-glossary`, "بلا مصدر"); return false; }
      return keep("glossary")({ id: `glossary-${t.id}` });
    });
    out("islamic-glossary", rows, rows.length);
  }

  /* الخرائط الذهنية (عناوين تنظيمية) — الاسم الأصلي mind-maps ونسخة mind-map لقالب الشاشة المولَّدة */
  {
    const rows = (await mod("lib/mind-maps-data")).MIND_MAPS.filter(keep("mind-maps"));
    out("mind-maps", rows, rows.length);
    json("library/mind-map.json", rows);
  }

  /* الإعلانات العلمية (لا محتوى شرعي) */
  {
    const rows = (await mod("lib/scientific-announcements-seed")).SCIENTIFIC_ANNOUNCEMENTS.filter(keep("announcements"));
    const localIds = new Set(JSON.parse(fs.readFileSync(new URL("../../../../../docs/native/content-origin.json", import.meta.url), "utf8")).local["library/scientific-announcements.json"] ?? []);
    rows.forEach((r, i) => { if (localIds.has(String(r.id))) rows[i] = { ...r, origin: "local", originLabel: "بيانات محلية" }; });
    out("scientific-announcements", rows, rows.length);
  }

  /* فهرس البحث بعد الحجب العام (isBlockedPublicSearchHref) والمحجوز */
  {
    const { isBlockedPublicSearchHref } = await import(`${src}/features/search/public-search-blocklist.ts`);
    const idx = JSON.parse(fs.readFileSync(`${appRoot}/public/data/search/index.json`, "utf8"));
    const docs = idx.docs.filter((d) => {
      if (isBlockedPublicSearchHref(d.href)) { reject(`${L}-search`, "مسار محجوب"); return false; }
      return !held(d.id) || (reject(`${L}-search`, "محجوز"), false);
    }).map(({ id, kind, titleAr, href, norm }) => ({ id, kind, titleAr, href, norm }));
    out("search-index", { docs }, docs.length);
  }

  /* الشروط والمنهجية: نص الصفحة حرفيًا من JSX (فقرات p/li/h3 مرتّبة تحت عنوان كل قسم)، بلا إعادة صياغة */
  {
    const email = JSON.parse(fs.readFileSync(`${appRoot}/site.config.json`, "utf8")).contactEmail;
    const norm = (t) => t.replace(/\s+/g, " ").trim();
    const legalDoc = (file, { sectionTag, titleOf, skip }) => {
      const get = loadConsts(file);
      const lists = {};
      for (const n of ["TRUST_GRADES", "STEPS", "SOURCES", "LIMITS"]) { try { lists[n] = get(n); } catch { /* غير موجود في هذا الملف */ } }
      const fmt = {
        TRUST_GRADES: (g) => `${g.name} — ${g.meaning}`,
        STEPS: (g) => `${g.title}: ${g.desc}`,
        SOURCES: (g) => `${g.name}: ${g.desc}`,
        LIMITS: (g) => g,
      };
      const text = (n) => {
        if (ts.isJsxText(n)) return n.text;
        if (ts.isJsxExpression(n)) {
          const e = n.expression;
          if (!e) return "";
          if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return e.text;
          if (ts.isIdentifier(e) && e.text === "CONTACT_EMAIL") return email;
          return "";
        }
        if (ts.isJsxElement(n)) return n.children.map(text).join("");
        return "";
      };
      const tagOf = (n) => (ts.isJsxElement(n) ? n.openingElement.tagName.getText() : ts.isJsxSelfClosingElement(n) ? n.tagName.getText() : null);
      const sections = []; let cur = null; let title = ""; let updatedAt = "";
      const push = (t) => { t = norm(t); if (t && cur) cur.paragraphs.push(t); };
      const walk = (n) => {
        if (ts.isJsxExpression(n) && n.expression && ts.isCallExpression(n.expression) && ts.isPropertyAccessExpression(n.expression.expression) && n.expression.expression.name.text === "map") {
          const name = n.expression.expression.expression.getText();
          if (lists[name]) { for (const it of lists[name]) push(fmt[name](it)); return; }
        }
        const tag = tagOf(n);
        if (tag && skip.includes(tag)) return;
        if (tag === sectionTag) { cur = { title: titleOf(n), paragraphs: [] }; sections.push(cur); }
        if (tag === "p" || tag === "li" || tag === "h3") { push(text(n)); return; }
        if (tag === "h1") { title = norm(text(n)); }
        if (tag === "time") { updatedAt = norm(text(n)); return; }
        ts.forEachChild(n, walk);
      };
      walk(get.sf);
      return { title, updatedAt, sections: sections.filter((x) => x.paragraphs.length) };
    };
    const attr = (n, name) => n.openingElement.attributes.properties.find((a) => a.name?.text === name)?.initializer?.text ?? "";
    const firstH2 = (n) => { let t = ""; const v = (x) => { if (!t && ts.isJsxElement(x) && x.openingElement.tagName.getText() === "h2") t = norm(x.children.map((c) => (ts.isJsxText(c) ? c.text : "")).join("")); else if (!t) ts.forEachChild(x, v); }; v(n); return t; };

    /* الشروط: LegalPageLayout(title, updatedAt) + LegalSection(title) */
    {
      const file = `${src}/views/TermsPage.tsx`;
      const d = legalDoc(file, { sectionTag: "LegalSection", titleOf: (n) => attr(n, "title"), skip: ["ShareButtons"] });
      let t = "", u = "";
      const v = (x) => { if (ts.isJsxElement(x) && x.openingElement.tagName.getText() === "LegalPageLayout") { t = attr(x, "title"); u = attr(x, "updatedAt"); } else ts.forEachChild(x, v); };
      v(loadConsts(file).sf);
      out("terms", { title: t, updatedAt: u, sections: d.sections }, d.sections.length);
    }
    /* المنهجية: عنوان الصفحة + مقدمتها ثم أقسام <section> بعناوين h2 */
    {
      const file = `${src}/views/MethodologyPage.tsx`;
      const d = legalDoc(file, { sectionTag: "section", titleOf: firstH2, skip: ["SectionQuiz"] });
      const head = (() => { let sub = ""; const v = (x) => { if (ts.isJsxElement(x) && x.openingElement.tagName.getText() === "p" && attr(x, "className") === "mtd-head__sub") sub = norm(x.children.map((c) => (ts.isJsxText(c) ? c.text : "")).join("")); else ts.forEachChild(x, v); }; v(loadConsts(file).sf); return sub; })();
      const sections = [{ title: d.title, paragraphs: [head] }, ...d.sections];
      out("methodology", { title: d.title, updatedAt: /<time dateTime="([^"]+)"/.exec(fs.readFileSync(file, "utf8"))?.[1] ?? "", sections }, sections.length);
    }
  }

  /* التنقل: «المزيد» (مجموعات السجل بلا account + صفوف الإعدادات) ودليل الأقسام — من السجل والصفحتين، لا مسارات مخفية/قريبًا */
  {
    const reg = await mod("config/sections.registry");
    const { filterNavItems } = await mod("lib/nav-visibility");
    const strings = (await mod("design-system/strings")).S;
    const groups = reg.menuGroups("drawer").filter((g) => g.group !== "account" && reg.SECTION_GROUP_ORDER.includes(g.group)).map((g) => ({
      id: g.group, title: g.label, subtitle: g.subtitle,
      sections: g.sections.map((x) => ({ id: x.id, title: reg.menuLabel(x), subtitle: x.subtitle, route: x.route })),
    }));
    const rowsSrc = loadConsts(`${src}/design-system/screens/MorePage.tsx`).sf.getText();
    const settingsRows = [...rowsSrc.matchAll(/\{ id: "(\w+)", title: S\.(\w+),(?: description: S\.(\w+),)? href: "([^"]+)", icon: "(\w+)" \}/g)].map((m) => ({
      id: m[1], title: strings[m[2]], ...(m[3] ? { description: strings[m[3]] } : {}), href: m[4], icon: m[5],
    }));
    const sitemap = loadConsts(`${src}/pages/account/ui/SiteMapView.tsx`)("SECTIONS")
      .map((sec) => ({ ...sec, links: filterNavItems(sec.links) })).filter((sec) => sec.links.length > 0);
    const sections = groups.flatMap((g) => g.sections);
    out("navigation", { groups, sections, settingsRows, sitemap }, sections.length);

    /* الملفات التسعة بشكل ContentItem/SectionLink — مشتقة من التنقل نفسه؛ المعتمد على الشبكة فارغ عمدًا بالشكل ذاته */
    const link = (x) => ({ id: x.id, title: x.title, ...(x.subtitle ? { subtitle: x.subtitle } : {}), route: x.route });
    const item = (id, title, subtitle, route, tags = []) => ({ id, title, ...(subtitle ? { subtitle } : {}), tags, ...(route ? { route } : {}) });
    const siteItems = sitemap.flatMap((sec) => sec.links.map((l) => item(l.href, l.label, l.desc, l.href, [sec.title])));
    const byRoute = new Map();
    for (const x of [...sections.map((s) => item(s.id, s.title, s.subtitle, s.route)), ...siteItems]) if (!byRoute.has(x.route)) byRoute.set(x.route, x);
    out("cards", groups.map((g) => item(g.id, g.title, g.subtitle, undefined, g.sections.map((s) => s.id))), groups.length);
    out("more", settingsRows.map((r) => item(r.id, r.title, r.description, r.href)), settingsRows.length);
    out("sections", sections.map(link), sections.length);
    out("sitemap", siteItems, siteItems.length);
    out("search", [...byRoute.values()], byRoute.size);
    /* «مصادر المحتوى»: تعرضها صفحة /sources من public/data/sources/accounts.json (enabled فقط)؛ تمرير كما هي */
    {
      const accounts = JSON.parse(fs.readFileSync(`${appRoot}/public/data/sources/accounts.json`, "utf8")).accounts.filter((a) => a.enabled);
      out("sources", accounts, accounts.length);
    }
    /* «الدليل الإسلامي»: روابط البطاقات الثابتة في كود الصفحة (href,title)؛ وصف كل بطاقة يحوي عدّادًا ديناميكيًا فلا يُصدَّر */
    {
      const cards = objectsWithKeys(`${src}/views/IslamicDirectoryHubPage.tsx`, ["href", "title"]);
      out("islamic-directory", cards, cards.length);
    }
    for (const f of ["academic-research-assistant", "academic-research-submit"]) {
      out(f, [], 0);
      reject(`${L}-${f}`, "فارغ عمدًا: مصدره شبكة/حساب أو غير مراجَع");
    }
  }
}
