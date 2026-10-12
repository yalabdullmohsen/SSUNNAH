/**
 * قسم «السيرة والتاريخ والأعلام» → Data/sirah/*.json (انظر docs/native/requests/sirah.md).
 * تمرير كما هو من مصدر الويب بلا إعادة صياغة؛ المحجوز (content-hold) يُستبعد بالمعرّف أو slug.
 * ما يشترط قرار المالك أو توثيقًا غير متوفر في الويب يُصدَّر قائمة فارغة بالشكل الصحيح («فارغ عمدًا»)، لا نصًّا بلا مصدر.
 */
import fs from "node:fs";
import { loadConsts, objectsWithKeys } from "../lib/ts-literal.mjs";

export default async function exportSirah({ json, held, reject, counts, appRoot }) {
  const src = `${appRoot}/src`;
  const S = "sirah";
  const idOf = (x) => x?.id ?? x?.slug;
  const keep = (area) => (x) => (held(String(idOf(x))) || (x?.slug && held(String(x.slug))) ? (reject(`${S}-${area}`, "محجوز"), false) : true);
  const cnt = (name, n) => { (counts.sirah ??= {})[name] = n; };
  const out = (name, rows) => { json(`sirah/${name}.json`, rows); cnt(name, rows.length); };
  const mod = (p) => import(`${src}/${p}.ts`);
  const hasSources = (a) => Array.isArray(a) && a.length > 0;
  const readDir = (dir) => fs.readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "manifest.json").sort();

  /* قوائم تمرير مباشرة (معلومات عامة/بذور بلا حقل اعتماد) */
  out("islamic-landmarks", (await mod("lib/islamic-landmarks-data")).ISLAMIC_LANDMARKS.filter(keep("landmarks")));
  out("nations", (await mod("lib/nations-seed")).NATIONS.filter(keep("nations")));

  /* المناسبات: السجل الموثّق المطابق لبذرة، كما يفعل enrichOccasionForPublish؛ يُشترط approved ومصدر */
  {
    const { ISLAMIC_OCCASIONS } = await mod("lib/islamic-occasions-seed");
    const { enrichOccasionForPublish } = await mod("lib/religious-content/publish");
    const rows = [];
    for (const o of ISLAMIC_OCCASIONS) {
      const v = enrichOccasionForPublish(o)?.verified;
      if (!v) { reject(`${S}-occasions`, "بلا سجل موثّق"); continue; }
      if (v.reviewStatus !== "approved" || !String(v.sourceName || "").trim()) { reject(`${S}-occasions`, "غير معتمد/بلا مصدر"); continue; }
      if (keep("occasions")(v)) rows.push(v);
    }
    out("occasions-verified", rows);
  }

  /* معرفة الأنبياء: review_status=verified ولها مصادر */
  {
    const dir = `${appRoot}/public/data/knowledge/prophets`;
    const rows = [];
    for (const f of readDir(dir)) {
      const k = JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"));
      if (k.review_status !== "verified" || !hasSources(k.sources)) { reject(`${S}-prophets`, "غير موثّق/بلا مصادر"); continue; }
      if (keep("prophets")(k)) rows.push(k);
    }
    out("prophets-knowledge", rows);
  }

  /* القصص: كما يعرضها الموقع (is_approved) ولها مصادر — قرار المالك: بلا شرط editorial_review_status (الموقع لا يعرضه) */
  {
    const dir = `${appRoot}/public/data/stories`;
    const rows = [];
    for (const f of readDir(dir)) {
      for (const s of JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"))) {
        if (s.is_approved !== true || !hasSources(s.sources)) { reject(`${S}-stories`, "غير معتمد/بلا مصادر"); continue; }
        if (keep("stories")(s)) rows.push(s);
      }
    }
    out("stories", rows);
  }

  /* التاريخ الإسلامي: لا needs-review ولا عنصر بلا مصادر */
  {
    const rows = [];
    for (const i of (await mod("data/islamic-history/index")).ISLAMIC_HISTORY_ITEMS) {
      if (i.verification === "needs-review" || !hasSources(i.sources)) { reject(`${S}-history`, "قيد المراجعة/بلا مصادر"); continue; }
      if (keep("history")(i)) rows.push(i);
    }
    out("islamic-history", rows);
  }

  /* الصحابة (مضمَّنة في الصفحة): تُصدَّر كما هي؛ quote يبقى في الملف ولا تعرضه الشاشة (قول منسوب بلا مصدر) */
  {
    const SAHABAH = loadConsts(`${src}/views/SahabahPage.tsx`)("SAHABAH");
    out("sahabah", SAHABAH.filter(keep("sahabah")));
  }

  /* مراحل السيرة وشمائل النبي: محتوى ثابت في كود صفحتي /seerah و/shamael؛ تمرير حرفي كما تعرضه الصفحة (بلا درجة ولا مصدر مضاف) */
  {
    const seerahFile = `${src}/views/SeerahPage.tsx`;
    out("seerah-phases", objectsWithKeys(seerahFile, ["id", "num", "title", "year", "desc", "topics", "keyEvents"]));
    const get = loadConsts(seerahFile);
    json(`${S}/seerah-sources.json`, get("SOURCES")); cnt("seerah-sources", get("SOURCES").length);
    const sh = loadConsts(`${src}/views/ShimaelPage.tsx`);
    const tabs = sh("TABS");
    const byTab = { khalq: "ABWAB_KHALQ", khuluq: "ABWAB_KHULUQ", sira: "ABWAB_SIRA", mahabbah: "MAHABBAH_ABWAB" };
    out("shamail", tabs.map((t) => ({ id: t.id, label: t.label, abwab: sh(byTab[t.id]) })));
    json(`${S}/shamail-facts.json`, sh("MAWLID_STATS")); cnt("shamail-facts", sh("MAWLID_STATS").length);
  }
  /* شجرة الأنبياء: جذر واحد (PROPHETS_LINEAGE كما في الموقع، مصدره في رأس الملف: البداية والنهاية/الكامل) يُمرَّر حرفيًا مع وسمين */
  json(`${S}/prophets-lineage.json`, { ...loadConsts(`${src}/lib/prophets-lineage.ts`)("PROPHETS_LINEAGE"), source_origin: "site-embedded", review_status: "pending-owner-review" });
}
