/**
 * علم منتج للمساعد الذكي — مفعّل افتراضيًا بقرار المالك (2026-10-07) بعد استيفاء شروط الأمان:
 * استناد RAG بمصادر وروابط داخلية، حجب الفتوى الشخصية، حدّ دقيقة/يوم على الخادم، ولا مفاتيح في العميل.
 * إيقاف: localStorage majalis-assistant-disabled=1 أو VITE_ASSISTANT_ENABLED=0 (والخادم: ASSISTANT_DISABLED=1).
 */

export function isAssistantFeatureEnabled(): boolean {
  try {
    if (typeof localStorage !== "undefined") {
      if (localStorage.getItem("majalis-assistant-disabled") === "1") return false;
      if (localStorage.getItem("majalis-assistant-enabled") === "1") return true;
    }
  } catch {
    /* private mode */
  }
  try {
    const env = import.meta.env as Record<string, string | undefined>;
    const raw = String(env.VITE_ASSISTANT_ENABLED ?? "").trim().toLowerCase();
    return !["0", "false", "no", "off"].includes(raw);
  } catch {
    return true;
  }
}
