/**
 * نصوص صفحات الموقع المضمَّنة ثوابتَ في ملف الصفحة (الطهارة، الصوم، الحج، الجنازة، دليل الصلاة، المواريث، التوحيد)
 * → Data/fiqh/embedded/<page>.json و Data/aqidah/embedded/tawhid.json. حرفيًا كما في الثوابت: بلا تعديل ولا إضافة ولا دمج.
 * كل ملف يحمل الوسمين: source_origin = "site-embedded" و review_status = "pending-owner-review" (راجع data-gaps.md).
 * لا يُكرَّر ما صُدِّر أصلًا: asma-husna.json (أسماء الله) وtawhid.json (مواضيع lib/tawhid-topics) وحاسبة المواريث تُحسب داخل التطبيق.
 */
import { loadConsts } from "../lib/ts-literal.mjs";

const EMBEDDED = { source_origin: "site-embedded", review_status: "pending-owner-review" };

const PAGES = [
  ["fiqh", "tahara", "src/views/TaharaPage.tsx", ["WUDU_FARDH", "WUDU_SUNNAH", "WUDU_NAWAQIDH", "GHUSL_MUJIBAT", "GHUSL_FARAIDH", "GHUSL_SIFAT", "TAYAMMUM_IBAHA", "TAYAMMUM_KAYFIYYA", "NAJASAT_ITEMS"]],
  ["fiqh", "sawm", "src/views/SawmPage.tsx", ["FAST_TYPES", "SAWM_CONDITIONS", "SAWM_ARKAAN", "MUFTIRAT", "EXEMPTIONS", "VIRTUES"]],
  ["fiqh", "hajj", "src/pages/fiqh/ui/HajjView.tsx", ["ARKAN", "WAJIBAT", "MASHAER", "UMRA_STEPS"]],
  ["fiqh", "janaza", "src/pages/fiqh/ui/JanazaView.tsx", ["GHUSL_STEPS", "GHUSL_NOTES", "TAKFIN_ITEMS", "SALAH_ARKAN", "DAFN_ITEMS", "TAAZIYA_AADAB"]],
  ["fiqh", "salah-guide", "src/pages/fiqh/ui/SalahGuideView.tsx", ["WAJIBAAT", "SUWAR_SALAH", "NAWAFIL", "SHURUT", "ARKAN", "KAYFIYYA", "MUBTILATAT", "MAKRUHAT", "KHUSHUU_WAYS", "FAWAID", "AHADITH_FAWAID"]],
  ["fiqh", "mawarith", "src/pages/fiqh/ui/MawarithView.tsx", ["WARASA", "HUQUQ", "ASBAB_MAWAANI", "ASAB_TYPES", "HAJB_TYPES", "MASAIL"]],
  ["aqidah", "tawhid", "src/views/TawhidPage.tsx", ["TAWHEED_TYPES", "IMAN_PILLARS", "PRINCIPLES", "RECOMMENDED_BOOKS"]],
];

export default async function exportEmbeddedPages({ json, counts, appRoot }) {
  for (const [section, page, file, names] of PAGES) {
    const c = loadConsts(`${appRoot}/${file}`);
    const sections = Object.fromEntries(names.map((n) => [n, c(n)]));
    json(`${section}/embedded/${page}.json`, { ...EMBEDDED, sections });
    (counts[section] ??= {})[`embedded-${page}`] = Object.values(sections).reduce((a, v) => a + (Array.isArray(v) ? v.length : Object.keys(v).length), 0);
  }
}
