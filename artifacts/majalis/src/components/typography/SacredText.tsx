import type { ElementType, HTMLAttributes } from "react";

/**
 * مكوّنات النصوص الشرعية — تفرض خط النص (Sunnah Text) أو خط الآيات (Sunnah Quran)
 * عبر الأصناف في styles/typography-system.css؛ لا font-family مكتوب داخل المكوّنات.
 */
type SacredProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
};

function join(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}

/** حديث/متن — Sunnah Text (19–20 / 1.9). `featured` = الحديث المميّز الكبير (24 / 700 / 1.8). */
export function HadithText({ as: Tag = "p", featured = false, className, ...rest }: SacredProps & { featured?: boolean }) {
  return <Tag className={join(featured ? "text-hadith-featured" : "text-hadith", className)} {...rest} />;
}

/** ذكر/دعاء — Sunnah Text (19–20 / 1.9). */
export function DhikrText({ as: Tag = "p", className, ...rest }: SacredProps) {
  return <Tag className={join("text-dhikr", className)} {...rest} />;
}

/** آية — Sunnah Quran (22–24 / 2.0؛ ارتفاع السطر يحمي التشكيل من القص). */
export function AyahText({ as: Tag = "p", className, ...rest }: SacredProps) {
  return <Tag className={join("text-ayah", className)} lang="ar" {...rest} />;
}

/** مرجع («رواه مسلم»، «الأنفال: ٤٥») — خط الواجهة 13 / 400 بلون ثانوي. */
export function RefText({ as: Tag = "span", className, ...rest }: SacredProps) {
  return <Tag className={join("text-ref", className)} {...rest} />;
}
