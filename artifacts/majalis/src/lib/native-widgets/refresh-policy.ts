import type { WidgetRefreshMode } from "./types";

/** حدود تحديث صديقة للبطارية (دقائق). */
export function timelineIntervalMinutes(mode: WidgetRefreshMode): number {
  switch (mode) {
    case "timeline":
      return 30;
    case "on_open":
      return 120;
    case "manual":
      return 24 * 60;
    default:
      return 30;
  }
}

export function androidUpdatePeriodMillis(mode: WidgetRefreshMode): number {
  return Math.max(30, timelineIntervalMinutes(mode)) * 60_000;
}
