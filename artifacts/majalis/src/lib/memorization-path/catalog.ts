/**
 * كتالوج مسار الحفظ للعامة.
 *
 * منشور: مسارات المصحف فقط (مراجع سور/آيات إلى مصدر المشروع المعتمد — بلا أي نص قرآني مخزّن هنا،
 * ومرخّصة PROJECT_QURAN). الوحدات تُشتق من بيانات المصحف نفسها (اسم السورة وعدد آياتها)،
 * وحدود الأجزاء الثلاثة حقائق ثابتة: 28 = سور 58–66، 29 = 67–77، 30 = 78–114.
 * اعتماد المالك بتوجيهه (2026-10-07) لمسارات المراجع القرآنية فقط.
 * بقية القوالب (الأربعون، عمدة الأحكام، الأذكار، المتون…) تبقى DRAFT في
 * docs/memorization-research/path-templates.json حتى ترخيص المالك (OWNER_ACTIONS 1–3).
 */

import { getSurahMeta } from "@/lib/quran-api";
import { isHifzPathPubliclyVisible } from "./publication-states";
import type { HifzCategory, HifzLevel, HifzPath, HifzUnit } from "./types";

const OWNER_APPROVAL_NOTE =
  "اعتمده المالك بتوجيهه (2026-10-07): مسار مراجع قرآنية فقط من مصدر المشروع، بلا نص مخزّن ولا مصدر خارجي.";

function surahUnit(surah: number, sequence: number): HifzUnit {
  const meta = getSurahMeta(surah);
  return {
    unitId: `s${surah}`,
    title: `سورة ${meta.name}`,
    sequence,
    verifiedTextReference: { kind: "quran", surah, ayahFrom: 1, ayahTo: meta.ayahs },
    reviewStatus: "APPROVED",
    publicationStatus: "PUBLISHED",
  };
}

function quranPath(input: {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  level: HifzLevel;
  surahs: readonly number[];
  category?: HifzCategory;
}): HifzPath {
  const units = input.surahs.map((s, i) => surahUnit(s, i + 1));
  return {
    id: input.id,
    slug: input.slug,
    title: input.title,
    shortDescription: input.shortDescription,
    category: input.category ?? "quran",
    level: input.level,
    estimatedUnits: units.length,
    sourceId: "project-quran",
    sourceReference: "مصحف التطبيق المعتمد",
    edition: null,
    licenseStatus: "PROJECT_QURAN",
    reviewStatus: "APPROVED",
    reviewNote: OWNER_APPROVAL_NOTE,
    publicationStatus: "PUBLISHED",
    units,
    searchVisibility: true,
    seoVisibility: false,
  };
}

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

/** مسارات المصحف المنشورة — مبنية عند أول طلب (تعتمد على بيانات المصحف). */
let cached: readonly HifzPath[] | null = null;

function buildPublishedPaths(): readonly HifzPath[] {
  return [
    quranPath({
      id: "hifz-quran-fatiha",
      slug: "surat-al-fatiha",
      title: "سورة الفاتحة",
      shortDescription: "مسار مقترح لحفظ سورة الفاتحة عبر المرجع القرآني المعتمد في التطبيق.",
      level: "beginner",
      surahs: [1],
    }),
    quranPath({
      id: "hifz-quran-juz-amma",
      slug: "juz-amma",
      title: "جزء عمّ",
      shortDescription:
        "مسار مقترح لحفظ الجزء الثلاثين، يبدأ بقصار السور من الناس صعودًا إلى النبأ.",
      level: "beginner",
      surahs: range(78, 114).reverse(),
    }),
    quranPath({
      id: "hifz-quran-juz-tabarak",
      slug: "juz-tabarak",
      title: "جزء تبارك",
      shortDescription: "مسار مقترح لحفظ الجزء التاسع والعشرين بترتيب المصحف، من الملك إلى المرسلات.",
      level: "intermediate",
      surahs: range(67, 77),
    }),
    quranPath({
      id: "hifz-quran-juz-qad-sami",
      slug: "juz-qad-sami",
      title: "جزء قد سمع",
      shortDescription: "مسار مقترح لحفظ الجزء الثامن والعشرين بترتيب المصحف، من المجادلة إلى التحريم.",
      level: "intermediate",
      surahs: range(58, 66),
    }),
  ];
}

function paths(): readonly HifzPath[] {
  if (!cached) cached = buildPublishedPaths();
  return cached;
}

export function listAllHifzPathsInternal(): readonly HifzPath[] {
  return paths();
}

export function listPublishedHifzPaths(): HifzPath[] {
  return paths().filter(
    (p) => isHifzPathPubliclyVisible(p.publicationStatus) && p.searchVisibility,
  );
}

export function listPublishedHifzPathsByCategory(category: HifzCategory): HifzPath[] {
  return listPublishedHifzPaths().filter((p) => p.category === category);
}

export function getPublishedHifzPathBySlug(slug: string): HifzPath | null {
  const path = paths().find((p) => p.slug === slug);
  if (!path || !isHifzPathPubliclyVisible(path.publicationStatus)) return null;
  return path;
}

export function countPublishedHifzPaths(): number {
  return listPublishedHifzPaths().length;
}

/** وحدات منشورة داخل مسار منشور فقط. */
export function listPublishedUnitsForPath(path: HifzPath) {
  return path.units
    .filter((u) => isHifzPathPubliclyVisible(u.publicationStatus))
    .slice()
    .sort((a, b) => a.sequence - b.sequence);
}
