/**
 * انتقاء «آية/حديث اليوم» للويدجت — دوال صافية بلا استيراد بيانات (قابلة للاختبار بمعزل).
 * الفهرس حتمي لليوم: dayIndex % length، فيتغيّر المحتوى كل يوم ولا يتكرر حتى ينفد المخزون.
 */
export function pickByDay<T>(pool: readonly T[], dayIndex: number): T | undefined {
  if (pool.length === 0) return undefined;
  const i = ((dayIndex % pool.length) + pool.length) % pool.length;
  return pool[i];
}

/** حديث يصلح للعرض في الويدجت: نص + مصدر + درجة «صحيح» حرفيًا + راوٍ. */
export function isWidgetReadyHadith(h: {
  text?: string; source?: string; grade?: string; narrator?: string;
}): boolean {
  return Boolean(h.text?.trim() && h.source?.trim() && h.narrator?.trim() && h.grade?.trim() === "صحيح");
}
