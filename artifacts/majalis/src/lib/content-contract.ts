/**
 * عقد محتوى عام — حقول مشتركة عند توفرها دون فرض نموذج واحد لكل المجالات.
 * الحالات مأخوذة من النماذج الحالية (published/draft، verification، إلخ).
 * UNKNOWN يبقى UNKNOWN؛ اسم ملف seed ليس مصدرًا علميًا.
 */

export type ContentLanguage = "ar" | "en" | string;

/** حالات النشر المستخدمة فعليًا في المنصة */
export type PublicationStatus = "published" | "draft" | "archived" | "UNKNOWN";

/** حالات التوثيق — لا تُرقّى تلقائيًا من اسم ملف */
export type VerificationStatus =
  | "source_verified"
  | "source_missing"
  | "needs_review"
  | "UNKNOWN";

export type ContentSourceType =
  | "book"
  | "url"
  | "api"
  | "asset"
  | "editorial"
  | "UNKNOWN";

export type OfflineEligibility = "eligible" | "online_only" | "UNKNOWN";

/**
 * سجل محتوى موحّد للحدود (تحميل/توليد/فهرسة).
 * الحقول الاختيارية تبقى غير موجودة إن لم تتوفر في المصدر الأصلي.
 */
export type UnifiedContentRecord = {
  id: string;
  contentType: string;
  title: string;
  titleAr?: string;
  summary?: string;
  /** مرجع للجسم الكامل (مسار أصل / معرّف جزء) — لا يُضمَّن النص الحساس كاملًا هنا إلزامًا */
  bodyRef?: string;
  source?: string;
  sourceUrl?: string;
  sourceType?: ContentSourceType;
  provenance?: string;
  verificationStatus?: VerificationStatus;
  publicationStatus?: PublicationStatus;
  language?: ContentLanguage;
  categoryIds?: string[];
  tags?: string[];
  authorRef?: string;
  scholarRef?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  version?: string | number;
  checksum?: string;
  offlineEligibility?: OfflineEligibility;
  searchVisibility?: boolean;
};

export type ContentManifestFile = {
  file: string;
  bytes: number;
  itemCount?: number;
  checksum?: string;
};

export type ContentDomainManifest = {
  version: number;
  contentType: string;
  checksum: string;
  files: ContentManifestFile[];
  generatedAt?: string;
  offlineEligible: boolean;
};

/** قواعد فهرسة عامة — تطابق سياسة البحث الحالية */
export function isSearchIndexable(record: Pick<UnifiedContentRecord, "publicationStatus" | "searchVisibility" | "verificationStatus">): boolean {
  if (record.searchVisibility === false) return false;
  const pub = record.publicationStatus ?? "UNKNOWN";
  if (pub === "draft" || pub === "archived") return false;
  return pub === "published";
}

/** هل يُعرض للعامة كمحتوى موثوق المصدر */
export function isPublicTrusted(record: Pick<UnifiedContentRecord, "verificationStatus" | "publicationStatus">): boolean {
  if (record.publicationStatus === "draft" || record.publicationStatus === "archived") return false;
  return record.verificationStatus === "source_verified";
}
