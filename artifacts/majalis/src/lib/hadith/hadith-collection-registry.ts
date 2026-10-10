/**
 * السجل الكانوني لمجموعات الحديث — مصدر الحقيقة للتوفّر والأعداد الظاهرة.
 * لا يُجمَع المحلي + المنسّق + الأربعين + الشبكة في مجموع واحد.
 *
 * يُزامَن مع:
 * - public/data/hadith/manifest.json
 * - public/data/hadith-verified/manifest.json (بعد مواءمة العدّ)
 * - lib/arbaeen-nawawi-seed.ts
 * - HADITH_COLLECTIONS (كتالوج شبكي — ترقيم مستقل)
 */

export type LocalAvailability =
  | "LOCAL_COMPLETE"
  | "LOCAL_PARTIAL"
  | "LOCAL_CURATED_SAMPLE"
  | "NOT_IMPORTED"
  | "BLOCKED_LICENSE"
  | "BLOCKED_SOURCE"
  | "BLOCKED_INTEGRITY"
  | "UNKNOWN";

export type NetworkAvailability =
  | "NETWORK_COMPLETE"
  | "NETWORK_PARTIAL"
  | "NETWORK_REFERENCE_ONLY"
  | "NOT_CONFIGURED"
  | "UNKNOWN";

export type LicenseStatus =
  | "APPROVED_FOR_LOCAL_DISTRIBUTION"
  | "APPROVED_WITH_ATTRIBUTION"
  | "NETWORK_REFERENCE_ONLY"
  | "LICENSE_REVIEW_REQUIRED"
  | "BLOCKED_LICENSE"
  | "BLOCKED_SOURCE"
  | "UNKNOWN";

export type PublicationStatus =
  | "SOURCE_APPROVED"
  | "LICENSE_APPROVED"
  | "VALIDATION_PASSED"
  | "READY_FOR_PUBLICATION"
  | "PUBLISHED"
  | "BLOCKED_SOURCE_CONFLICT"
  | "BLOCKED_GRADING_CONFLICT"
  | "BLOCKED_NUMBERING_CONFLICT"
  | "BLOCKED_ATTRIBUTION"
  | "BLOCKED_LICENSE"
  | "BLOCKED_INTEGRITY"
  | "BLOCKED_UNKNOWN"
  | "NOT_IMPORTED";

export type ClassificationModel =
  | "sahih-by-collection"
  | "curated-attributed-grade"
  | "learning-path"
  | "network-catalog-unverified"
  | "not-applicable";

export type HadithCollectionRegistryEntry = {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  sourceName: string;
  pinnedSourceVersion: string | null;
  sourceMetadata: string;
  licenseStatus: LicenseStatus;
  attributionRequirementsAr: string;
  localRecordCount: number;
  networkCatalogCount: number | null;
  numberingScheme: string;
  editionId: string | null;
  localAvailability: LocalAvailability;
  networkAvailability: NetworkAvailability;
  offlineAvailability: "OFFLINE_READY" | "ONLINE_ONLY" | "PARTIAL" | "NONE";
  classificationModel: ClassificationModel;
  gradingProvenanceCoverage: "full-membership" | "curated-sample" | "none" | "unknown";
  explanationCoverage: "learning-path" | "curated-sample" | "none";
  narratorCoverage: "curated-sample" | "none" | "unknown";
  chapterMetadataCoverage: "local-book-numbers" | "network" | "curated-sample" | "none";
  searchAvailability: "in-page-local" | "platform-sample" | "network-page" | "none";
  detailPageAvailability: "hadith-id" | "arbaeen-id" | "books-browser" | "list-modal" | "none";
  integrityStatus: "VALIDATED" | "MANIFEST_ALIGNED" | "NETWORK_UNVERIFIED" | "NOT_IMPORTED" | "BLOCKED";
  publicationStatus: PublicationStatus;
  /** تسمية واجهة مختصرة */
  userAvailabilityLabelAr: string;
};

/** أعداد الصحيحين المحلية — مطابقة manifest + ملفات lean */
export const REGISTRY_SAHIHAYN = {
  bukhari: 7580,
  muslim: 7360,
  total: 14940,
  source: "fawazahmed0/hadith-api@1",
  authenticity: "sahih-by-collection" as const,
} as const;

/** البذرة المنسّقة — بعد مواءمة عدّ الـchunks مع أطوال الملفات الفعلية */
export const REGISTRY_CURATED = {
  sahih: 1161,
  daif: 319,
  mawdu: 260,
  total: 1740,
  /** عيّنة حسب حقل collection داخل البذرة (قياس 2026-09-27) */
  byCollection: {
    various: 590,
    bukhari: 504,
    muslim: 441,
    mutafaq: 140,
    nawawi40: 29,
    tirmidhi: 20,
    abudawud: 9,
    ibnmajah: 4,
    nasai: 3,
  } as Record<string, number>,
} as const;

export const REGISTRY_ARBAEEN = {
  total: 42,
} as const;

/** كتالوج الشبكة — بحسب ترقيم المصدر؛ ليس عدًّا محليًا */
export const REGISTRY_NETWORK_CATALOG = {
  "ara-bukhari": 7563,
  "ara-muslim": 3033,
  nawawi: 42,
  qudsi: 40,
  "ara-abudawud": 5274,
  "ara-tirmidhi": 3956,
  "ara-nasai": 5761,
  "ara-ibnmajah": 4341,
  "ara-malik": 1832,
  mutafaq: 7563 + 3033,
} as const;

const MIT_MIRROR =
  "مرآة MIT لحزمة fawazahmed0/hadith-api@1؛ متون تراثية. انظر content/hadith-corpus/LICENSE_RISKS.md";

function networkEntry(
  partial: Pick<
    HadithCollectionRegistryEntry,
    "id" | "nameAr" | "nameEn" | "descriptionAr" | "networkCatalogCount" | "editionId"
  >,
): HadithCollectionRegistryEntry {
  return {
    ...partial,
    sourceName: "fawazahmed0/hadith-api",
    pinnedSourceVersion: "1",
    sourceMetadata: MIT_MIRROR,
    licenseStatus: "NETWORK_REFERENCE_ONLY",
    attributionRequirementsAr: "ذكر المصدر عند الاقتباس من الكتالوج الشبكي",
    localRecordCount: 0,
    numberingScheme: "cdn-edition-numbering",
    localAvailability: "NOT_IMPORTED",
    networkAvailability: "NETWORK_REFERENCE_ONLY",
    offlineAvailability: "ONLINE_ONLY",
    classificationModel: "network-catalog-unverified",
    gradingProvenanceCoverage: "none",
    explanationCoverage: "none",
    narratorCoverage: "none",
    chapterMetadataCoverage: "network",
    searchAvailability: "network-page",
    detailPageAvailability: "books-browser",
    integrityStatus: "NETWORK_UNVERIFIED",
    publicationStatus: "NOT_IMPORTED",
    userAvailabilityLabelAr: "يتطلب اتصالًا",
  };
}

/** السجل الكامل — كل مجموعة مذكورة في الواجهة أو الفلاتر أو الطابور */
export const HADITH_COLLECTION_REGISTRY: HadithCollectionRegistryEntry[] = [
  {
    id: "bukhari",
    nameAr: "صحيح البخاري",
    nameEn: "Sahih al-Bukhari",
    descriptionAr: "مرآة محلية كاملة بحسب طبعة ara-bukhari.",
    sourceName: "fawazahmed0/hadith-api",
    pinnedSourceVersion: "1",
    sourceMetadata: MIT_MIRROR,
    licenseStatus: "APPROVED_FOR_LOCAL_DISTRIBUTION",
    attributionRequirementsAr: "ذكر البخاري ورقم الحديث عند الاقتباس",
    localRecordCount: REGISTRY_SAHIHAYN.bukhari,
    networkCatalogCount: REGISTRY_NETWORK_CATALOG["ara-bukhari"],
    numberingScheme: "local-ara-bukhari-mirror",
    editionId: "ara-bukhari",
    localAvailability: "LOCAL_COMPLETE",
    networkAvailability: "NETWORK_REFERENCE_ONLY",
    offlineAvailability: "OFFLINE_READY",
    classificationModel: "sahih-by-collection",
    gradingProvenanceCoverage: "full-membership",
    explanationCoverage: "curated-sample",
    narratorCoverage: "curated-sample",
    chapterMetadataCoverage: "local-book-numbers",
    searchAvailability: "in-page-local",
    detailPageAvailability: "hadith-id",
    integrityStatus: "VALIDATED",
    publicationStatus: "PUBLISHED",
    userAvailabilityLabelAr: "متاح محليًا",
  },
  {
    id: "muslim",
    nameAr: "صحيح مسلم",
    nameEn: "Sahih Muslim",
    descriptionAr: "مرآة محلية كاملة بحسب طبعة ara-muslim (ترقيم يختلف عن كتالوج الشبكة).",
    sourceName: "fawazahmed0/hadith-api",
    pinnedSourceVersion: "1",
    sourceMetadata: MIT_MIRROR,
    licenseStatus: "APPROVED_FOR_LOCAL_DISTRIBUTION",
    attributionRequirementsAr: "ذكر مسلم ورقم الحديث عند الاقتباس",
    localRecordCount: REGISTRY_SAHIHAYN.muslim,
    networkCatalogCount: REGISTRY_NETWORK_CATALOG["ara-muslim"],
    numberingScheme: "local-ara-muslim-mirror",
    editionId: "ara-muslim",
    localAvailability: "LOCAL_COMPLETE",
    networkAvailability: "NETWORK_REFERENCE_ONLY",
    offlineAvailability: "OFFLINE_READY",
    classificationModel: "sahih-by-collection",
    gradingProvenanceCoverage: "full-membership",
    explanationCoverage: "curated-sample",
    narratorCoverage: "curated-sample",
    chapterMetadataCoverage: "local-book-numbers",
    searchAvailability: "in-page-local",
    detailPageAvailability: "hadith-id",
    integrityStatus: "VALIDATED",
    publicationStatus: "PUBLISHED",
    userAvailabilityLabelAr: "متاح محليًا",
  },
  {
    id: "nawawi40",
    nameAr: "الأربعون النووية",
    nameEn: "Arbaeen al-Nawawi",
    descriptionAr: "مسار تعليمي مستقل بالمتن والشرح وتقدّم القراءة.",
    sourceName: "arbaeen-nawawi-seed",
    pinnedSourceVersion: "seed-v1",
    sourceMetadata: "بذرة تعليمية داخل المستودع مع إحالات مصادر",
    licenseStatus: "APPROVED_WITH_ATTRIBUTION",
    attributionRequirementsAr: "ذكر النووي والمصدر المنقول في البطاقة",
    localRecordCount: REGISTRY_ARBAEEN.total,
    networkCatalogCount: REGISTRY_NETWORK_CATALOG.nawawi,
    numberingScheme: "nawawi-1-42",
    editionId: "nawawi40-learning",
    localAvailability: "LOCAL_COMPLETE",
    networkAvailability: "NETWORK_REFERENCE_ONLY",
    offlineAvailability: "OFFLINE_READY",
    classificationModel: "learning-path",
    gradingProvenanceCoverage: "curated-sample",
    explanationCoverage: "learning-path",
    narratorCoverage: "none",
    chapterMetadataCoverage: "none",
    searchAvailability: "in-page-local",
    detailPageAvailability: "arbaeen-id",
    integrityStatus: "VALIDATED",
    publicationStatus: "PUBLISHED",
    userAvailabilityLabelAr: "مسار تعليمي",
  },
  {
    id: "verified-curated",
    nameAr: "عيّنة منسّقة ومحقّقة",
    nameEn: "Curated verified sample",
    descriptionAr:
      "عيّنة مصنّفة (صحيح/ضعيف/موضوع) — ليست كل الصحيح ولا كل الضعيف ولا كل الموضوع.",
    sourceName: "hadith-verified local seed",
    pinnedSourceVersion: "manifest-v1-aligned-1740",
    sourceMetadata: "public/data/hadith-verified/* — أحكام منقولة منسوبة عند التوفّر",
    licenseStatus: "APPROVED_WITH_ATTRIBUTION",
    attributionRequirementsAr: "إظهار نسبة الحكم عند وجودها؛ لا اختراع محدّث",
    localRecordCount: REGISTRY_CURATED.total,
    networkCatalogCount: null,
    numberingScheme: "curated-ids",
    editionId: "hadith-verified",
    localAvailability: "LOCAL_CURATED_SAMPLE",
    networkAvailability: "NOT_CONFIGURED",
    offlineAvailability: "OFFLINE_READY",
    classificationModel: "curated-attributed-grade",
    gradingProvenanceCoverage: "curated-sample",
    explanationCoverage: "curated-sample",
    narratorCoverage: "curated-sample",
    chapterMetadataCoverage: "curated-sample",
    searchAvailability: "in-page-local",
    detailPageAvailability: "list-modal",
    integrityStatus: "MANIFEST_ALIGNED",
    publicationStatus: "PUBLISHED",
    userAvailabilityLabelAr: "مجموعة منسّقة",
  },
  // عيّنات داخل البذرة المنسّقة (ليست كوربوسًا كاملًا)
  ...(["tirmidhi", "abudawud", "nasai", "ibnmajah", "mutafaq", "various"] as const).map(
    (id): HadithCollectionRegistryEntry => {
      const names: Record<string, { ar: string; en: string }> = {
        tirmidhi: { ar: "سنن الترمذي", en: "Jami al-Tirmidhi" },
        abudawud: { ar: "سنن أبي داود", en: "Sunan Abu Dawud" },
        nasai: { ar: "سنن النسائي", en: "Sunan al-Nasai" },
        ibnmajah: { ar: "سنن ابن ماجه", en: "Sunan Ibn Majah" },
        mutafaq: { ar: "متفق عليه", en: "Muttafaq alayh (sample)" },
        various: { ar: "متفرقات مشهورة", en: "Various famous narrations" },
      };
      return {
        id,
        nameAr: names[id].ar,
        nameEn: names[id].en,
        descriptionAr: "عيّنة داخل البذرة المنسّقة فقط — ليست المجموعة كاملة.",
        sourceName: "hadith-verified local seed",
        pinnedSourceVersion: "manifest-v1-aligned-1740",
        sourceMetadata: "صفوف محدودة داخل hadith-verified",
        licenseStatus: "APPROVED_WITH_ATTRIBUTION",
        attributionRequirementsAr: "وسم «مجموعة منسّقة» إلزامي",
        localRecordCount: REGISTRY_CURATED.byCollection[id] ?? 0,
        networkCatalogCount: null,
        numberingScheme: "curated-sample",
        editionId: "hadith-verified",
        localAvailability: "LOCAL_CURATED_SAMPLE",
        networkAvailability: "NOT_CONFIGURED",
        offlineAvailability: "PARTIAL",
        classificationModel: "curated-attributed-grade",
        gradingProvenanceCoverage: "curated-sample",
        explanationCoverage: "curated-sample",
        narratorCoverage: "curated-sample",
        chapterMetadataCoverage: "curated-sample",
        searchAvailability: "in-page-local",
        detailPageAvailability: "list-modal",
        integrityStatus: "MANIFEST_ALIGNED",
        publicationStatus: "PUBLISHED",
        userAvailabilityLabelAr: "مجموعة منسّقة",
      };
    },
  ),
  {
    id: "riyadh",
    nameAr: "رياض الصالحين",
    nameEn: "Riyad al-Salihin",
    descriptionAr: "مذكور في الواجهة/البحث كمرجع — بلا كوربوس محلي مستورد.",
    sourceName: "not-imported",
    pinnedSourceVersion: null,
    sourceMetadata: "طابور ترخيص — انظر HADITH_IMPORT_QUEUE.md",
    licenseStatus: "LICENSE_REVIEW_REQUIRED",
    attributionRequirementsAr: "لا يُعاد توزيعه محليًا قبل اعتماد الترخيص",
    localRecordCount: 0,
    networkCatalogCount: null,
    numberingScheme: "unknown",
    editionId: null,
    localAvailability: "NOT_IMPORTED",
    networkAvailability: "NOT_CONFIGURED",
    offlineAvailability: "NONE",
    classificationModel: "not-applicable",
    gradingProvenanceCoverage: "none",
    explanationCoverage: "none",
    narratorCoverage: "none",
    chapterMetadataCoverage: "none",
    searchAvailability: "platform-sample",
    detailPageAvailability: "none",
    integrityStatus: "NOT_IMPORTED",
    publicationStatus: "BLOCKED_LICENSE",
    userAvailabilityLabelAr: "غير متاح حاليًا",
  },
  {
    id: "jawami",
    nameAr: "صحيح الجامع",
    nameEn: "Sahih al-Jami",
    descriptionAr: "مذكور كتسمية فلتر محتملة — بلا استيراد محلي.",
    sourceName: "not-imported",
    pinnedSourceVersion: null,
    sourceMetadata: "طابور ترخيص/مصدر",
    licenseStatus: "LICENSE_REVIEW_REQUIRED",
    attributionRequirementsAr: "محظور بلا إذن تخريج معاصر كامل",
    localRecordCount: 0,
    networkCatalogCount: null,
    numberingScheme: "unknown",
    editionId: null,
    localAvailability: "BLOCKED_LICENSE",
    networkAvailability: "NOT_CONFIGURED",
    offlineAvailability: "NONE",
    classificationModel: "not-applicable",
    gradingProvenanceCoverage: "none",
    explanationCoverage: "none",
    narratorCoverage: "none",
    chapterMetadataCoverage: "none",
    searchAvailability: "none",
    detailPageAvailability: "none",
    integrityStatus: "BLOCKED",
    publicationStatus: "BLOCKED_LICENSE",
    userAvailabilityLabelAr: "غير متاح حاليًا",
  },
  {
    id: "silsila",
    nameAr: "السلسلة الصحيحة",
    nameEn: "Al-Silsilah al-Sahihah",
    descriptionAr: "مذكور كتسمية — بلا استيراد محلي (تخريجات معاصرة).",
    sourceName: "not-imported",
    pinnedSourceVersion: null,
    sourceMetadata: "محظور بلا ترخيص تخريج معاصر",
    licenseStatus: "BLOCKED_LICENSE",
    attributionRequirementsAr: "لا يُشحن كوربوس كامل بلا إذن",
    localRecordCount: 0,
    networkCatalogCount: null,
    numberingScheme: "unknown",
    editionId: null,
    localAvailability: "BLOCKED_LICENSE",
    networkAvailability: "NOT_CONFIGURED",
    offlineAvailability: "NONE",
    classificationModel: "not-applicable",
    gradingProvenanceCoverage: "none",
    explanationCoverage: "none",
    narratorCoverage: "none",
    chapterMetadataCoverage: "none",
    searchAvailability: "none",
    detailPageAvailability: "none",
    integrityStatus: "BLOCKED",
    publicationStatus: "BLOCKED_LICENSE",
    userAvailabilityLabelAr: "غير متاح حاليًا",
  },
  {
    id: "bulugh",
    nameAr: "بلوغ المرام",
    nameEn: "Bulugh al-Maram",
    descriptionAr: "مذكور في محتوى الدروس/التحديثات — ليس كوربوس حديث مستوردًا.",
    sourceName: "not-imported",
    pinnedSourceVersion: null,
    sourceMetadata: "خارج كوربوس الحديث المحلي",
    licenseStatus: "LICENSE_REVIEW_REQUIRED",
    attributionRequirementsAr: "مراجعة ترخيص قبل أي استيراد",
    localRecordCount: 0,
    networkCatalogCount: null,
    numberingScheme: "unknown",
    editionId: null,
    localAvailability: "NOT_IMPORTED",
    networkAvailability: "NOT_CONFIGURED",
    offlineAvailability: "NONE",
    classificationModel: "not-applicable",
    gradingProvenanceCoverage: "none",
    explanationCoverage: "none",
    narratorCoverage: "none",
    chapterMetadataCoverage: "none",
    searchAvailability: "none",
    detailPageAvailability: "none",
    integrityStatus: "NOT_IMPORTED",
    publicationStatus: "NOT_IMPORTED",
    userAvailabilityLabelAr: "غير متاح حاليًا",
  },
  {
    id: "umdat",
    nameAr: "عمدة الأحكام",
    nameEn: "Umdat al-Ahkam",
    descriptionAr: "مذكور في مسارات علمية — ليس كوربوس حديث مستوردًا.",
    sourceName: "not-imported",
    pinnedSourceVersion: null,
    sourceMetadata: "خارج كوربوس الحديث المحلي",
    licenseStatus: "LICENSE_REVIEW_REQUIRED",
    attributionRequirementsAr: "مراجعة ترخيص قبل أي استيراد",
    localRecordCount: 0,
    networkCatalogCount: null,
    numberingScheme: "unknown",
    editionId: null,
    localAvailability: "NOT_IMPORTED",
    networkAvailability: "NOT_CONFIGURED",
    offlineAvailability: "NONE",
    classificationModel: "not-applicable",
    gradingProvenanceCoverage: "none",
    explanationCoverage: "none",
    narratorCoverage: "none",
    chapterMetadataCoverage: "none",
    searchAvailability: "none",
    detailPageAvailability: "none",
    integrityStatus: "NOT_IMPORTED",
    publicationStatus: "NOT_IMPORTED",
    userAvailabilityLabelAr: "غير متاح حاليًا",
  },
  {
    id: "qudsi",
    nameAr: "الأحاديث القدسية",
    nameEn: "Hadith Qudsi",
    descriptionAr: "متاح عبر كتالوج الشبكة فقط في /hadith/books.",
    sourceName: "fawazahmed0/hadith-api",
    pinnedSourceVersion: "1",
    sourceMetadata: MIT_MIRROR,
    licenseStatus: "NETWORK_REFERENCE_ONLY",
    attributionRequirementsAr: "وسم يتطلب اتصالًا + بحسب ترقيم المصدر",
    localRecordCount: REGISTRY_CURATED.byCollection.qudsi ?? 0,
    networkCatalogCount: REGISTRY_NETWORK_CATALOG.qudsi,
    numberingScheme: "cdn-ara-qudsi",
    editionId: "ara-qudsi",
    localAvailability: "LOCAL_CURATED_SAMPLE",
    networkAvailability: "NETWORK_REFERENCE_ONLY",
    offlineAvailability: "ONLINE_ONLY",
    classificationModel: "network-catalog-unverified",
    gradingProvenanceCoverage: "none",
    explanationCoverage: "none",
    narratorCoverage: "none",
    chapterMetadataCoverage: "network",
    searchAvailability: "network-page",
    detailPageAvailability: "books-browser",
    integrityStatus: "NETWORK_UNVERIFIED",
    publicationStatus: "NOT_IMPORTED",
    userAvailabilityLabelAr: "يتطلب اتصالًا",
  },
  networkEntry({
    id: "ara-abudawud",
    nameAr: "سنن أبي داود",
    nameEn: "Sunan Abu Dawud (network catalog)",
    descriptionAr: "كتالوج شبكي — ليس مستوردًا محليًا كاملًا.",
    networkCatalogCount: REGISTRY_NETWORK_CATALOG["ara-abudawud"],
    editionId: "ara-abudawud",
  }),
  networkEntry({
    id: "ara-tirmidhi",
    nameAr: "جامع الترمذي",
    nameEn: "Jami al-Tirmidhi (network catalog)",
    descriptionAr: "كتالوج شبكي — ليس مستوردًا محليًا كاملًا.",
    networkCatalogCount: REGISTRY_NETWORK_CATALOG["ara-tirmidhi"],
    editionId: "ara-tirmidhi",
  }),
  networkEntry({
    id: "ara-nasai",
    nameAr: "سنن النسائي",
    nameEn: "Sunan al-Nasai (network catalog)",
    descriptionAr: "كتالوج شبكي — ليس مستوردًا محليًا كاملًا.",
    networkCatalogCount: REGISTRY_NETWORK_CATALOG["ara-nasai"],
    editionId: "ara-nasai",
  }),
  networkEntry({
    id: "ara-ibnmajah",
    nameAr: "سنن ابن ماجه",
    nameEn: "Sunan Ibn Majah (network catalog)",
    descriptionAr: "كتالوج شبكي — ليس مستوردًا محليًا كاملًا.",
    networkCatalogCount: REGISTRY_NETWORK_CATALOG["ara-ibnmajah"],
    editionId: "ara-ibnmajah",
  }),
  networkEntry({
    id: "ara-malik",
    nameAr: "موطأ مالك",
    nameEn: "Muwatta Malik (network catalog)",
    descriptionAr: "كتالوج شبكي — ليس مستوردًا محليًا كاملًا.",
    networkCatalogCount: REGISTRY_NETWORK_CATALOG["ara-malik"],
    editionId: "ara-malik",
  }),
  {
    id: "muwatta",
    nameAr: "موطأ مالك",
    nameEn: "Muwatta Malik (filter alias)",
    descriptionAr: "اسم فلتر قديم — بلا كوربوس محلي؛ الكتالوج الشبكي تحت ara-malik.",
    sourceName: "not-imported",
    pinnedSourceVersion: null,
    sourceMetadata: "alias → ara-malik network",
    licenseStatus: "NETWORK_REFERENCE_ONLY",
    attributionRequirementsAr: "لا تُعرض كمتاحة محليًا",
    localRecordCount: 0,
    networkCatalogCount: REGISTRY_NETWORK_CATALOG["ara-malik"],
    numberingScheme: "unknown",
    editionId: null,
    localAvailability: "NOT_IMPORTED",
    networkAvailability: "NETWORK_REFERENCE_ONLY",
    offlineAvailability: "ONLINE_ONLY",
    classificationModel: "network-catalog-unverified",
    gradingProvenanceCoverage: "none",
    explanationCoverage: "none",
    narratorCoverage: "none",
    chapterMetadataCoverage: "network",
    searchAvailability: "network-page",
    detailPageAvailability: "books-browser",
    integrityStatus: "NOT_IMPORTED",
    publicationStatus: "NOT_IMPORTED",
    userAvailabilityLabelAr: "يتطلب اتصالًا",
  },
  {
    id: "ahmad",
    nameAr: "مسند أحمد",
    nameEn: "Musnad Ahmad",
    descriptionAr: "في طابور الاستيراد — غير مشحون.",
    sourceName: "not-imported",
    pinnedSourceVersion: null,
    sourceMetadata: "HADITH_IMPORT_QUEUE",
    licenseStatus: "LICENSE_REVIEW_REQUIRED",
    attributionRequirementsAr: "مراجعة ترخيص قبل الاستيراد",
    localRecordCount: 0,
    networkCatalogCount: null,
    numberingScheme: "unknown",
    editionId: null,
    localAvailability: "NOT_IMPORTED",
    networkAvailability: "NOT_CONFIGURED",
    offlineAvailability: "NONE",
    classificationModel: "not-applicable",
    gradingProvenanceCoverage: "none",
    explanationCoverage: "none",
    narratorCoverage: "none",
    chapterMetadataCoverage: "none",
    searchAvailability: "none",
    detailPageAvailability: "none",
    integrityStatus: "NOT_IMPORTED",
    publicationStatus: "NOT_IMPORTED",
    userAvailabilityLabelAr: "غير متاح حاليًا",
  },
  {
    id: "darimi",
    nameAr: "سنن الدارمي",
    nameEn: "Sunan al-Darimi",
    descriptionAr: "في طابور الاستيراد — غير مشحون.",
    sourceName: "not-imported",
    pinnedSourceVersion: null,
    sourceMetadata: "HADITH_IMPORT_QUEUE",
    licenseStatus: "LICENSE_REVIEW_REQUIRED",
    attributionRequirementsAr: "مراجعة ترخيص قبل الاستيراد",
    localRecordCount: 0,
    networkCatalogCount: null,
    numberingScheme: "unknown",
    editionId: null,
    localAvailability: "NOT_IMPORTED",
    networkAvailability: "NOT_CONFIGURED",
    offlineAvailability: "NONE",
    classificationModel: "not-applicable",
    gradingProvenanceCoverage: "none",
    explanationCoverage: "none",
    narratorCoverage: "none",
    chapterMetadataCoverage: "none",
    searchAvailability: "none",
    detailPageAvailability: "none",
    integrityStatus: "NOT_IMPORTED",
    publicationStatus: "NOT_IMPORTED",
    userAvailabilityLabelAr: "غير متاح حاليًا",
  },
];

const BY_ID = new Map(HADITH_COLLECTION_REGISTRY.map((e) => [e.id, e]));

export function getCollectionRegistryEntry(
  id: string | null | undefined,
): HadithCollectionRegistryEntry | undefined {
  if (!id) return undefined;
  return BY_ID.get(id);
}

export function listPublishedLocalCollections(): HadithCollectionRegistryEntry[] {
  return HADITH_COLLECTION_REGISTRY.filter(
    (e) =>
      e.publicationStatus === "PUBLISHED" &&
      (e.localAvailability === "LOCAL_COMPLETE" || e.localAvailability === "LOCAL_CURATED_SAMPLE"),
  );
}

export function userAvailabilityLabel(id: string): string {
  return getCollectionRegistryEntry(id)?.userAvailabilityLabelAr ?? "غير متاح حاليًا";
}

/** تسميات واجهة ثابتة — لا تعرض مصطلحات تقنية */
export const USER_LABELS = {
  local: "متاح محليًا",
  curated: "مجموعة منسّقة",
  learning: "مسار تعليمي",
  network: "يتطلب اتصالًا",
  partial: "متاح جزئيًا",
  bySourceNumbering: "بحسب ترقيم المصدر",
  unavailable: "غير متاح حاليًا",
  membershipBukhari: "من صحيح البخاري",
  membershipMuslim: "من صحيح مسلم",
  membershipBoth: "من الصحيحين",
  sourcedGrade: "حكم منقول من المصدر",
  curatedTakhrij: "تخريج منسّق",
  curatedDaifSample: "مجموعة منسّقة من الأحاديث الضعيفة",
  curatedMawduSample: "مجموعة منسّقة من الأحاديث الموضوعة",
} as const;
