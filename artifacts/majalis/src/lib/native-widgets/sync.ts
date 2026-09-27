import { fetchPrayerTimes } from "@/lib/prayer-times";
import { trackWidgetEvent } from "./analytics";
import { buildWidgetSnapshot, serializeWidgetSnapshot } from "./snapshot";
import { reloadSunnahWidgets, writeSunnahWidgetSnapshotJson } from "@/lib/plugins/sunnah-widgets";

/**
 * يبني لقطة من المواقيت الحالية ويكتبها للطبقة الأصلية ثم يطلب إعادة تحميل الودجت.
 * آمن على الويب (لا يرمي).
 */
export async function syncSunnahWidgets(opts?: { governorateId?: string }): Promise<boolean> {
  try {
    const payload = await fetchPrayerTimes(opts?.governorateId);
    const snap = buildWidgetSnapshot(payload);
    const json = serializeWidgetSnapshot(snap);
    const ok = await writeSunnahWidgetSnapshotJson(json);
    trackWidgetEvent({ name: "widget_snapshot_write", ok });
    if (ok) {
      await reloadSunnahWidgets();
      trackWidgetEvent({ name: "widget_reload_request" });
    }
    return ok;
  } catch {
    trackWidgetEvent({ name: "widget_snapshot_write", ok: false });
    return false;
  }
}
