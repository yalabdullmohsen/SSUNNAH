/**
 * Mushaf Button parity — تحويل `<button>` الخام إلى `Button` الرسمي دون أي أثر بصري على القارئ.
 *
 * مُقاس (Playwright, computed style قبل/بعد — docs/audit/MUSHAF_BUTTON_AUTHORITY.md):
 * - مظهر أزرار المصحف يملكه CSS المصحف غير الطبقي؛ أصناف cva في `Button` لا تُنتج قواعد في هذا التطبيق
 *   (لا يوجد `@import "tailwindcss"`)، فلا تغيّر الـcomputed style للزر نفسه.
 * - الفرق الوحيد المقاس هو غلاف المحتوى `<span>` الذي يضيفه `Button`: كان يُحوّل أبناء الزر المرنين/الشبكيين
 *   إلى سطر واحد. الصنف `mushaf-btn` + `display: contents` على ذلك الغلاف يعيد شجرة الصناديق كما كانت.
 *
 * الاستخدام: `<Button variant="ghost" className={mushafButtonClass("nm-page-arrow …")} />`
 * (أسماء أصناف CSS المصحف تبقى كما هي).
 *
 * قاعدة التحييد `.mushaf-btn > span[class=""]` في src/styles/interaction-states.css (عام، متزامن من main.tsx)
 * لأن المكوّنات المحوّلة تُركَّب أيضًا خارج القارئ (SettingsView، QuranAudioPlayer) — بلا ملف CSS جديد.
 */

export const MUSHAF_BUTTON_CLASS = "mushaf-btn";

export function mushafButtonClass(...classes: Array<string | false | null | undefined>): string {
  return [MUSHAF_BUTTON_CLASS, ...classes].filter(Boolean).join(" ");
}
