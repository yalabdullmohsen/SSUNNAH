import type { WidgetKind } from "./types";

export type WidgetAnalyticsEvent =
  | { name: "widget_settings_open" }
  | { name: "widget_prefs_save"; kinds: WidgetKind[] }
  | { name: "widget_snapshot_write"; ok: boolean }
  | { name: "widget_reload_request" }
  | { name: "widget_interaction"; kind: WidgetKind; destination: string };

/** إرسال خفيف — لا يرمي؛ يتوافق مع أي جامع أحداث لاحق. */
export function trackWidgetEvent(event: WidgetAnalyticsEvent): void {
  try {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("sunnah:widget-analytics", { detail: event }));
    if (import.meta.env.DEV) {
      console.info("[widgets]", event.name, event);
    }
  } catch {
    /* ignore */
  }
}
