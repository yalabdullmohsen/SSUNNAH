// تسمية عربية موحّدة (مصدر واحد) لقيم الوسوم التقنية التي تظهر شارات في واجهة عربية. لا تمسّ أي حقل غير tags، ولا قيمة غير مذكورة هنا.
export const TAG_LABELS = {
  verified: "موثَّق", scholarly_source: "مصدر علمي", primary_text: "نص أصلي", general_reasoning: "استدلال عام",
  needs_review: "قيد المراجعة", official_website: "موقع رسمي", center: "مركز", mosque: "مسجد", library: "مكتبة", university: "جامعة",
  faq: "أسئلة شائعة", FAQ: "أسئلة شائعة",
  ibadat: "العبادات", muamalat: "المعاملات", usrah: "الأسرة", jinayat: "الجنايات", qada: "القضاء",
};
const walk = (x, inTags = false) =>
  Array.isArray(x) ? x.map((i) => walk(i, inTags))
    : x && typeof x === "object" ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, k === "tags" && Array.isArray(v) ? v.map((t) => (typeof t === "string" && Object.hasOwn(TAG_LABELS, t) ? TAG_LABELS[t] : t)) : walk(v)]))
      : x;
export const arabicTags = walk;
