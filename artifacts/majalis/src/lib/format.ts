/**
 * تنسيق موحّد للأرقام والأوقات — يتبع لغة الجهاز (ar → ٠١٢٣، en → 0123) في كل الشاشات.
 * لا يُستعمل على نصوص شرعية مخزَّنة؛ للعرض فقط.
 */

function deviceLocale(): string {
  if (typeof navigator !== "undefined" && navigator.language) return navigator.language;
  return "ar";
}

/** "ar" وحدها قد تُخرج أرقامًا لاتينية في ICU الحديث؛ نفرض الأرقام العربية-الهندية للعربية صراحةً. */
function resolve(locale?: string): string {
  const l = locale ?? deviceLocale();
  return l.toLowerCase().startsWith("ar") && !l.includes("-nu-") ? "ar-u-nu-arab" : l;
}

export function formatNumber(value: number, opts?: Intl.NumberFormatOptions, locale?: string): string {
  return new Intl.NumberFormat(resolve(locale), opts).format(value);
}

/** وقت 12 ساعة بلا ثوانٍ، بنفس نظام الأرقام (مثل ٤:٥٦ ص). */
export function formatTime(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(resolve(locale), { hour: "numeric", minute: "2-digit", hour12: true }).format(date);
}

/** رقم + وحدة بفاصل مسافة غير منكسرة: «٤ ركعات» — لا يلتصق الرقم بالكلمة. */
export function formatCount(value: number, unit: string, locale?: string): string {
  return `${formatNumber(value, undefined, locale)}\u00A0${unit}`;
}
