/**
 * مفتاح الواجهة الأصلية (TestFlight فقط). يفتح majlisilm://native-shell فيعالجه AppDelegate:
 * يرفض في نسخة المتجر، ويطلب تأكيدًا قبل التبديل، ويحفظ الحالة في UserDefaults (native_shell_enabled).
 * الحالة تُقرأ من الويب: داخل الصدفة الأصلية يحمل WebScreen علامة SunnahNative/1 في User-Agent.
 */
import { Button } from "@/components/ui/button";

const NATIVE_SHELL_UA_MARKER = "SunnahNative/1";

export function isNativeShellWebView(): boolean {
  return typeof navigator !== "undefined" && navigator.userAgent.includes(NATIVE_SHELL_UA_MARKER);
}

export function NativeShellToggle() {
  const enabled = isNativeShellWebView();
  const request = () => {
    window.location.href = `majlisilm://native-shell?enabled=${enabled ? "0" : "1"}`;
  };
  return (
    <section style={{ display: "grid", gap: 6 }} data-testid="native-shell-toggle">
      <strong>الواجهة الأصلية (اختبار):</strong>
      <span data-testid="native-shell-state">الحالة الحالية: {enabled ? "مفعّلة" : "مطفأة"}</span>
      <Button type="button" variant="outline" onClick={request}>
        {enabled ? "إيقاف الواجهة الأصلية" : "تفعيل الواجهة الأصلية"}
      </Button>
      <small style={{ opacity: 0.8 }}>يظهر تنبيه تأكيد من التطبيق، وتُحفظ الحالة على هذا الجهاز. لا يعمل في نسخة المتجر.</small>
    </section>
  );
}
