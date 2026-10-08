/**
 * نموذج الكلمات المشتق من صفحة المصحف: مفتاح الآية لكل كلمة بترتيبها (بلا علامات نهاية الآية).
 */

/** فهرس أول كلمة في الآية التي يقع عندها الرجوع من `cursor` (الكلمة التالية المنتظَرة). */
export function ayahStartBefore(keys: readonly string[], cursor: number): number {
  const c = Math.min(Math.max(cursor, 0), keys.length);
  if (c === 0) return 0;
  let i = c - 1;
  const key = keys[i];
  while (i > 0 && keys[i - 1] === key) i--;
  return i;
}

/** فهرس بداية الآية التي تحتوي الكلمة `index`. */
export function ayahStartOf(keys: readonly string[], index: number): number {
  let i = Math.min(Math.max(index, 0), Math.max(keys.length - 1, 0));
  while (i > 0 && keys[i - 1] === keys[i]) i--;
  return i;
}

/** نهاية الآية (فهرس آخر كلمة) التي تحتوي الكلمة `index`. */
export function ayahEndOf(keys: readonly string[], index: number): number {
  let i = Math.min(Math.max(index, 0), Math.max(keys.length - 1, 0));
  while (i < keys.length - 1 && keys[i + 1] === keys[i]) i++;
  return i;
}

/** عدد الخطوات للرجوع إلى بداية الآية السابقة/الحالية من المؤشر. */
export function stepsBackToAyahStart(keys: readonly string[], cursor: number): number {
  return Math.max(0, cursor - ayahStartBefore(keys, cursor));
}
