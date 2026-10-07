/**
 * مستويات صرامة «تسميع»: متسامح · عادي · دقيق. تُحفظ في إعدادات المصحف (QuranSettingsRepository) وتحدّد عتبة المطابقة
 * وما يُعدّ خطأً. ليست مرتبطة بـMushafHideLevel (ذاك مستوى إخفاء العرض) ولا بـHifzLevel (مستوى مسار الحفظ).
 *
 * المطابقة تعتمد التشابه المُطبَّع بين الكلمة المسموعة والمطلوبة (1 = تطابق تام):
 *  - تشابه ≥ العتبة → كلمة صحيحة.
 *  - دون العتبة وفوق wrongSim ثم يأتي بعدها كلام مطابق → «خطأ» (كلمة مبدّلة).
 *  - دونهما → «لم تُقرأ» (متجاوزة).
 * الكلمات القصيرة (حرفان فأقل) تُطابَق تامة في كل المستويات.
 */
import type { TasmeeMatchParams } from "./matcher";

export const TASMEE_STRICTNESS_LEVELS = ["lenient", "normal", "strict"] as const;
export type TasmeeStrictness = (typeof TASMEE_STRICTNESS_LEVELS)[number];
export const DEFAULT_TASMEE_STRICTNESS: TasmeeStrictness = "normal";

export const TASMEE_STRICTNESS_LABELS: Record<TasmeeStrictness, string> = {
  lenient: "متسامح",
  normal: "عادي",
  strict: "دقيق",
};

/** ما يعنيه كل مستوى للمستخدم (يُعرض في الإعدادات). */
export const TASMEE_STRICTNESS_DESCRIPTIONS: Record<TasmeeStrictness, string> = {
  lenient: "يتسامح مع اختلاف حرفين في الكلمة الطويلة (لضجيج التفريغ الصوتي)؛ لا يعدّ الخطأ إلا ما بَعُد كثيرًا عن الكلمة المطلوبة.",
  normal: "يقبل اختلاف حرف واحد في الكلمة الطويلة، ويعدّ الكلمة المبدّلة أو الناقصة خطأً.",
  strict: "لا يقبل إلا ما طابق الكلمة تقريبًا تامًا؛ أي اختلاف في حرف من كلمة قصيرة أو متوسطة يُعدّ خطأً، وأي كلمة مبدّلة قريبة الشكل تُعدّ خطأً، وينبّه على الكلمة الزائدة.",
};

/**
 * كشف الكلمة الزائدة: مفتوح في مستوى «دقيق» فقط. شرط الفتح تحقق: صفر زيادة في التنبيهات الخاطئة على التلاوات السليمة
 * (قياس base على 13 تلاوة/804 كلمة بمستوى دقيق: 0 كلمة زائدة خاطئة؛ ومحاكاة حقن كلمة زائدة في نصوص التفريغ: 85 من 101 كُشفت). إن ظهرت تنبيهات خاطئة تُغلق.
 */
export const TASMEE_EXTRA_DETECTION_ENABLED = true;

export const TASMEE_LEVEL_PARAMS: Record<TasmeeStrictness, Pick<TasmeeMatchParams, "thrLong" | "thrMid" | "wrongSim">> = {
  lenient: { thrLong: 0.6, thrMid: 0.66, wrongSim: 0.3 },
  normal: { thrLong: 0.75, thrMid: 0.66, wrongSim: 0.4 },
  strict: { thrLong: 0.85, thrMid: 1, wrongSim: 0.5 },
};

export function isTasmeeStrictness(v: unknown): v is TasmeeStrictness {
  return typeof v === "string" && (TASMEE_STRICTNESS_LEVELS as readonly string[]).includes(v);
}

export function paramsForStrictness(level: TasmeeStrictness): Partial<TasmeeMatchParams> {
  return { ...TASMEE_LEVEL_PARAMS[level], detectExtra: level === "strict" && TASMEE_EXTRA_DETECTION_ENABLED };
}
