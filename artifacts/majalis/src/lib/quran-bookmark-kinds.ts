/**
 * أنواع فواصل المصحف — ألوان هادئة، بلا تغطية للنص.
 * الأنواع الأساسية للمنتج: قراءة · حفظ · مراجعة · شخصي.
 * الأنواع الإضافية (ورد/تدبر/درس) تبقى للتوافق مع البيانات القديمة.
 */

export type MushafBookmarkKind =
  | "reading"
  | "hifz"
  | "review"
  | "custom"
  | "wird"
  | "tadabbur"
  | "lesson";

export type MushafWirdSlot = "morning" | "evening" | "any";

/** الأنواع الأربعة الظاهرة في ورقة الحفظ السريعة */
export type MushafBookmarkProductKind = "reading" | "hifz" | "review" | "custom";

export type BookmarkKindMeta = {
  id: MushafBookmarkKind;
  label: string;
  /** تسمية إجراء الحفظ السريع */
  actionLabel: string;
  /** لون CSS هادئ */
  color: string;
  /** لون داكن للثيم الليلي */
  colorDark: string;
  product?: boolean;
};

export const MUSHAF_BOOKMARK_KINDS: readonly BookmarkKindMeta[] = [
  {
    id: "reading",
    label: "موضع قراءة",
    actionLabel: "حفظ كموضع قراءة",
    color: "#2a5f8f",
    colorDark: "#7eb0d8",
    product: true,
  },
  {
    id: "hifz",
    label: "حفظ",
    actionLabel: "حفظ للحفظ",
    color: "#2f6b4f",
    colorDark: "#6fad8c",
    product: true,
  },
  {
    id: "review",
    label: "مراجعة",
    actionLabel: "حفظ للمراجعة",
    color: "#b06a32",
    colorDark: "#d4a06a",
    product: true,
  },
  {
    id: "custom",
    label: "شخصي",
    actionLabel: "علامة مخصصة",
    color: "#5c564c",
    colorDark: "#b0a898",
    product: true,
  },
  { id: "wird", label: "ورد يومي", actionLabel: "حفظ كورد", color: "#3d6a96", colorDark: "#7aa3c9" },
  { id: "tadabbur", label: "تدبر", actionLabel: "حفظ للتدبر", color: "#5c4f7a", colorDark: "#a094c0" },
  { id: "lesson", label: "درس", actionLabel: "حفظ لدرس", color: "#9a7a2e", colorDark: "#d0b56a" },
] as const;

export const MUSHAF_PRODUCT_BOOKMARK_KINDS: readonly BookmarkKindMeta[] =
  MUSHAF_BOOKMARK_KINDS.filter((k) => k.product);

export const BOOKMARK_KIND_IDS = MUSHAF_BOOKMARK_KINDS.map((k) => k.id);

export function isMushafBookmarkKind(v: unknown): v is MushafBookmarkKind {
  return typeof v === "string" && (BOOKMARK_KIND_IDS as readonly string[]).includes(v);
}

export function getBookmarkKindMeta(kind: MushafBookmarkKind): BookmarkKindMeta {
  return MUSHAF_BOOKMARK_KINDS.find((k) => k.id === kind) ?? MUSHAF_BOOKMARK_KINDS[3]!;
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
