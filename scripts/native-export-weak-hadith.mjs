#!/usr/bin/env node
// يصدّر الأحاديث الضعيفة والموضوعة من بيانات الموقع إلى ملفات منفصلة عن verified-sahih.json (قرار يوسف، DATA_CONTRACT §5.2).
// لا يعدّل أي نص أو حكم: نسخ حرفي. من لا محدّث له أو لا مرجع (source_name) أو لا نص يُخفى (hidden:true) ويُدرج في قائمة يوسف.
import fs from "node:fs"; import crypto from "node:crypto";
const SRC = "artifacts/majalis/public/data/hadith-verified", OUT = process.argv[2] || "ios-native/Data/hadith";
fs.mkdirSync(OUT, { recursive: true });
const hidden = [];
for (const kind of ["daif", "mawdu"]) {
  const rows = fs.readdirSync(SRC).filter((f) => f.startsWith(kind + "-")).sort()
    .flatMap((f) => JSON.parse(fs.readFileSync(`${SRC}/${f}`, "utf8")));
  const out = rows.filter((h) => h.authenticity_class === kind).map((h) => {
    const muhaddith = (h.metadata?.muhaddith || "").trim(), ref = (h.source_name || "").trim();
    const miss = [!muhaddith && "المحدّث", !ref && "المرجع", !(h.text || "").trim() && "النص", !(h.grade || "").trim() && "الحكم"].filter(Boolean);
    if (miss.length) hidden.push(`${h.id} — ناقص: ${miss.join("، ")}`);
    return { id: h.id, title: h.title, text: h.text, narrator: h.narrator ?? null, source_name: ref, grade: h.grade, chapter: h.chapter ?? null,
      explanation: h.explanation ?? null, muhaddith, authenticity_class: kind, review_status: "pending_review", hidden: miss.length > 0 };
  });
  fs.writeFileSync(`${OUT}/weak-${kind}.json`, JSON.stringify(out));
  console.log(kind, out.length, "مخفي:", out.filter((x) => x.hidden).length);
}
fs.writeFileSync("docs/native/requests/weak-hadith-hidden.md", `# أحاديث ضعيفة/موضوعة مخفية (لـ يوسف)\n\nتُخفى ولا تُحذف؛ المعيار: محدّث + مرجع + نص + حكم. العدد: ${hidden.length}\n\n${hidden.map((x) => "- " + x).join("\n") || "- لا شيء: كل العناصر مستوفية"}\n`);
// يسجّل الملفين في MANIFEST.json (<OUT>/../MANIFEST.json) كي لا يُعدّا يتيمين ويُتحقَّق من sha256 لهما كباقي الملفات
{
  const mp = `${OUT}/../MANIFEST.json`;
  if (fs.existsSync(mp)) {
    const m = JSON.parse(fs.readFileSync(mp, "utf8")); const prefix = OUT.replace(/\/+$/, "").split("/").pop();
    m.files = m.files.filter((f) => !f.path.startsWith(`${prefix}/weak-`));
    for (const kind of ["daif", "mawdu"]) {
      const b = fs.readFileSync(`${OUT}/weak-${kind}.json`);
      m.files.push({ path: `${prefix}/weak-${kind}.json`, bytes: b.length, sha256: crypto.createHash("sha256").update(b).digest("hex") });
    }
    m.files.sort((a, b) => (a.path < b.path ? -1 : 1));
    fs.writeFileSync(mp, JSON.stringify(m));
  }
}
