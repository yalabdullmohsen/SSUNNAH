/**
 * قسم «القرآن» → Data/quran/surahs-meta.json (انظر docs/native/requests/quran.md).
 * ترتيب النزول فقط من public/data/quran-v2/chapters.json كما هو؛ لا يمسّ فهرس المصحف ولا نصه.
 */
import fs from "node:fs";

export default async function exportQuran({ json, counts, appRoot }) {
  const chapters = JSON.parse(fs.readFileSync(`${appRoot}/public/data/quran-v2/chapters.json`, "utf8"));
  const rows = chapters
    .map((c) => ({ id: c.id, revelationOrder: c.revelation_order, place: c.revelation_place }))
    .sort((a, b) => a.id - b.id);
  json("quran/surahs-meta.json", rows);
  (counts.quran ??= {})["surahs-meta"] = rows.length;
}
