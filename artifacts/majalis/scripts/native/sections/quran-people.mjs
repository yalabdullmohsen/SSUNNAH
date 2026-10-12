/**
 * أعلام القرآن → Data/quran/people.json (المدخلات المنشورة status=published فقط، كما هي بلا تعديل نص).
 */
import fs from "node:fs";

export default async function exportQuranPeople({ json, counts, appRoot }) {
  const src = JSON.parse(fs.readFileSync(`${appRoot}/public/data/quran-people/people.json`, "utf8"));
  const rows = src.people
    .filter((p) => p.status === "published")
    .map((p) => ({
      slug: p.slug, nameAr: p.nameAr, aliases: p.aliases ?? [], category: p.category,
      definition: p.definition, whyMentioned: p.whyMentioned, lessons: p.lessons ?? [],
      occurrences: (p.occurrences ?? []).map((o) => ({ surah: o.surah, ayah: o.ayah })),
    }));
  json("quran/people.json", rows);
  (counts.quran ??= {}).people = rows.length;
}
