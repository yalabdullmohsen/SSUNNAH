/**
 * هوية بصرية خفيفة لأنواع الدروس — ألوان دلالية هادئة لا عدوانية.
 */
export type LessonTypeId =
  | "quran"
  | "tafsir"
  | "hadith"
  | "aqeedah"
  | "fiqh"
  | "seerah"
  | "general";

export type LessonTypeMeta = {
  id: LessonTypeId;
  label: string;
};

const RULES: Array<{ id: LessonTypeId; label: string; re: RegExp }> = [
  { id: "quran", label: "قرآن", re: /قرآن|تجويد|حفظ|قراءة|تلاوة|مصحف/i },
  { id: "tafsir", label: "تفسير", re: /تفسير|تدبر/i },
  { id: "hadith", label: "حديث", re: /حديث|سنن|بخاري|مسلم|ترمذي|أربعين/i },
  { id: "aqeedah", label: "عقيدة", re: /عقيدة|توحيد|أسماء|إيمان|اعتقاد/i },
  { id: "fiqh", label: "فقه", re: /فقه|أحكام|عبادات|معاملات|فرائض|صيام|زكاة|حج/i },
  { id: "seerah", label: "سيرة", re: /سيرة|مغازي|شمائل|الأنبياء|الصحابة/i },
];

export function resolveLessonType(input: {
  category?: string | null;
  title?: string | null;
  keywords?: string[] | null;
  activityType?: string | null;
}): LessonTypeMeta {
  const hay = [input.category, input.title, input.activityType, ...(input.keywords || [])]
    .filter(Boolean)
    .join(" ");
  for (const rule of RULES) {
    if (rule.re.test(hay)) return { id: rule.id, label: rule.label };
  }
  return { id: "general", label: input.category?.trim() || "عام" };
}
