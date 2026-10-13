/**
 * الدفعة 2 من النصوص المضمَّنة في ملفات الموقع (docs/native/requests/n2-to-n1-embedded-texts-2.md) → Data/<section>/<name>.json.
 * حرفيًا كما في الثوابت؛ الوسمان في رأس الملف: source_origin = "site-embedded" و review_status = "pending-owner-review".
 * arbaeen-love-of-allah لا يُصدَّر هنا: صفوفه المنشورة في جدول Supabase لا في الكود (راجع data-gaps.md).
 */
import { loadConsts } from "../lib/ts-literal.mjs";

const EMBEDDED = { source_origin: "site-embedded", review_status: "pending-owner-review" };

/* ثوابت حرفية تُقرأ بالـAST */
const LITERAL = [
  ["adhkar", "duas-quran", "src/pages/quran/ui/DuasQuranView.tsx", { categories: "CATEGORIES", duas: "DUAS" }],
  ["adhkar", "sunan-yawmiyya", "src/views/SunanYawmiyyaPage.tsx", { categories: "CATEGORIES", sunan: "SUNAN" }],
  ["adhkar", "adhan-help", "src/pages/worship/ui/AdhanHelpView.tsx", { sections: "SECTIONS" }],
  ["hadith", "hadith-science", "src/pages/hadith/ui/HadithScienceView.tsx", { categories: "CATEGORIES", terms: "TERMS" }],
];
/* ثوابت مبنية بدالة ls() داخل الملف (تُقيَّم بالاستيراد) */
const MODULE = [
  ["sirah", "dalail-nubuwwah", "src/lib/dalail-nubuwwah-data.ts", { sections: "DALAIL_NUBUWWAH" }],
  ["hadith", "sunnah-studies", "src/lib/sunnah-studies-data.ts", { sections: "SUNNAH_STUDIES" }],
];

export default async function exportEmbeddedPages2({ json, counts, appRoot }) {
  const put = (section, name, body) => {
    json(`${section}/${name}.json`, { ...EMBEDDED, ...body });
    /* counts[قسم] قد يكون رقمًا (عدّاد القسم الرئيسي) فلا يُكتب عليه خاصية */
    const key = typeof counts[section] === "object" || counts[section] === undefined ? section : `${section}-embedded`;
    (counts[key] ??= {})[name] = Object.values(body).reduce((a, v) => a + (Array.isArray(v) ? v.length : 1), 0);
  };
  for (const [section, name, file, map] of LITERAL) {
    const c = loadConsts(`${appRoot}/${file}`);
    put(section, name, Object.fromEntries(Object.entries(map).map(([k, n]) => [k, c(n)])));
  }
  for (const [section, name, file, map] of MODULE) {
    const m = await import(`${appRoot}/${file}`);
    put(section, name, Object.fromEntries(Object.entries(map).map(([k, n]) => [k, m[n]])));
  }
}
