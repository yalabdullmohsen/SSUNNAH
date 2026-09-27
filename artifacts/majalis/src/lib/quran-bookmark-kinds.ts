/**
 * أنواع علامات المصحف V2 — ألوان هادئة، بلا تغطية للنص.
 * المنتج: آخر موضع قراءة · موضع الحفظ · موضع المراجعة · علامة شخصية · ختمة.
 * الأنواع الإضافية (ورد/تدبر/درس) تبقى للتوافق مع البيانات القديمة.
 */

export type MushafBookmarkKind =
  | "reading"
  | "hifz"
  | "review"
  | "custom"
  | "khatmah"
  | "wird"
  | "tadabbur"
  | "lesson";

export type MushafWirdSlot = "morning" | "evening" | "any";

/** أنواع الختمة */
export type MushafKhatmahType = "general" | "ramadan" | "hifz" | "special";

/** الأنواع الظاهرة في ورقة الحفظ السريعة */
export type MushafBookmarkProductKind =
  | "reading"
  | "hifz"
  | "review"
  | "custom"
  | "khatmah";

export type BookmarkKindMeta = {
  id: MushafBookmarkKind;
  label: string;
  /** تسمية إجراء الحفظ السريع */
  actionLabel: string;
  /** كلمات بحث عربية (مدير + بحث موحّد) */
  searchAliases: readonly string[];
  /** لون CSS هادئ */
  color: string;
  /** لون داكن للثيم الليلي */
  colorDark: string;
  product?: boolean;
};

export const MUSHAF_KHATMAH_TYPES: readonly {
  id: MushafKhatmahType;
  label: string;
}[] = [
  { id: "general", label: "ختمة عامة" },
  { id: "ramadan", label: "ختمة رمضان" },
  { id: "hifz", label: "ختمة حفظ" },
  { id: "special", label: "ختمة خاصة" },
] as const;

export const MUSHAF_BOOKMARK_KINDS: readonly BookmarkKindMeta[] = [
  {
    id: "reading",
    label: "آخر موضع قراءة",
    actionLabel: "حفظ آخر موضع قراءة",
    searchAliases: ["قراءة", "موضع قراءة", "آخر موضع", "متابعة"],
    color: "#2a5f8f",
    colorDark: "#7eb0d8",
    product: true,
  },
  {
    id: "hifz",
    label: "موضع الحفظ",
    actionLabel: "إضافة علامة حفظ",
    searchAliases: ["الحفظ", "حفظ", "موضع الحفظ", "تحفيظ", "هفز"],
    color: "#2f6b4f",
    colorDark: "#6fad8c",
    product: true,
  },
  {
    id: "review",
    label: "موضع المراجعة",
    actionLabel: "إضافة علامة مراجعة",
    searchAliases: ["المراجعة", "مراجعة", "موضع المراجعة", "تثبيت"],
    color: "#b06a32",
    colorDark: "#d4a06a",
    product: true,
  },
  {
    id: "custom",
    label: "علامة شخصية",
    actionLabel: "إضافة علامة شخصية",
    searchAliases: ["شخصي", "شخصية", "مخصص", "علامة"],
    color: "#5c564c",
    colorDark: "#b0a898",
    product: true,
  },
  {
    id: "khatmah",
    label: "الختمات",
    actionLabel: "بدء ختمة",
    searchAliases: ["ختمة", "الختمات", "ختم", "رمضان", "604"],
    color: "#6b3d6e",
    colorDark: "#c49bc8",
    product: true,
  },
  {
    id: "wird",
    label: "ورد يومي",
    actionLabel: "حفظ كورد",
    searchAliases: ["ورد"],
    color: "#3d6a96",
    colorDark: "#7aa3c9",
  },
  {
    id: "tadabbur",
    label: "تدبر",
    actionLabel: "حفظ للتدبر",
    searchAliases: ["تدبر"],
    color: "#5c4f7a",
    colorDark: "#a094c0",
  },
  {
    id: "lesson",
    label: "درس",
    actionLabel: "حفظ لدرس",
    searchAliases: ["درس"],
    color: "#9a7a2e",
    colorDark: "#d0b56a",
  },
] as const;

export const MUSHAF_PRODUCT_BOOKMARK_KINDS: readonly BookmarkKindMeta[] =
  MUSHAF_BOOKMARK_KINDS.filter((k) => k.product);

/** ترتيب مجموعات المدير */
export const MUSHAF_MANAGER_GROUP_ORDER: readonly MushafBookmarkKind[] = [
  "reading",
  "hifz",
  "review",
  "khatmah",
  "custom",
  "wird",
  "tadabbur",
  "lesson",
];

export const BOOKMARK_KIND_IDS = MUSHAF_BOOKMARK_KINDS.map((k) => k.id);

export function isMushafBookmarkKind(v: unknown): v is MushafBookmarkKind {
  return typeof v === "string" && (BOOKMARK_KIND_IDS as readonly string[]).includes(v);
}

export function isMushafKhatmahType(v: unknown): v is MushafKhatmahType {
  return v === "general" || v === "ramadan" || v === "hifz" || v === "special";
}

export function getBookmarkKindMeta(kind: MushafBookmarkKind): BookmarkKindMeta {
  return MUSHAF_BOOKMARK_KINDS.find((k) => k.id === kind) ?? MUSHAF_BOOKMARK_KINDS[3]!;
}

export function getKhatmahTypeLabel(type: MushafKhatmahType | undefined): string {
  return MUSHAF_KHATMAH_TYPES.find((t) => t.id === type)?.label ?? "ختمة عامة";
}

export function resolveBookmarkColor(
  kind: MushafBookmarkKind,
  customColor?: string | null,
  dark = false,
): string {
  if (kind === "custom" && customColor && /^#[0-9a-fA-F]{6}$/.test(customColor)) {
    return customColor;
  }
  const meta = getBookmarkKindMeta(kind);
  return dark ? meta.colorDark : meta.color;
}

/** هل النوع يدعم نطاق صفحات (من→إلى) */
export function kindSupportsPageRange(kind: MushafBookmarkKind): boolean {
  return kind === "hifz" || kind === "review" || kind === "khatmah";
}
