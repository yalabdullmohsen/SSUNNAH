/**
 * Canonical App Group prayer snapshot builder for Widget / LA / Watch readers.
 * Consumes the app prayer engine payload — does not recalculate prayer times.
 */
import {
  calendarNoonInZone,
  epochAtZoneMinutes,
  type PrayerSlot,
  type PrayerTimesPayload,
} from "../prayer-times";
import { getActivePrayerLocation } from "../prayer-location-prefs";
import { dateISOInZone } from "../prayer-notification-ids";
import {
  publishSharedPrayerSnapshot,
  type SharedPrayerSnapshotPayload,
} from "./sunnah-shared-data";
import { isIOS, isNative } from "../capacitor-utils";
import { derivePrayerWindow } from "../widget-data/prayer-window";

const KEY_TO_ARABIC: Record<string, string> = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

/** WidgetKit kind — must match PrayerTimesWidget.kind / SunnahWidgetKind.prayerTimes. */
export const SUNNAH_PRAYER_WIDGET_KIND = "PrayerTimesWidget";

export const SUNNAH_PRAYER_SNAPSHOT_SCHEMA_VERSION = 1;
export const SUNNAH_PRAYER_SNAPSHOT_KEY = "sunnah.shared.prayer.v1";

type UpcomingSlot = { slot: PrayerSlot; epoch: number };

/** Upcoming obligatory slots for today remainder + tomorrow (engine minutes only). */
function listUpcomingObligatory(
  prayers: PrayerSlot[],
  tz: string,
  nowMs: number,
): UpcomingSlot[] {
  const todayNoon = calendarNoonInZone(tz, new Date(nowMs));
  const tomorrowNoon = new Date(todayNoon.getTime() + 24 * 3600_000);
  const out: UpcomingSlot[] = [];
  for (const slot of prayers) {
    if (!slot.obligatory || slot.minutes == null) continue;
    for (const noon of [todayNoon, tomorrowNoon]) {
      const epoch = epochAtZoneMinutes(tz, slot.minutes, noon);
      if (epoch <= nowMs) continue;
      out.push({ slot, epoch });
    }
  }
  return out.sort((a, b) => a.epoch - b.epoch);
}

/**
 * Build today's obligatory times + next upcoming (wraps to tomorrow when needed).
 * Does not filter by alert-enabled prefs — widget data is independent of notifications.
 */
export function buildSharedPrayerSnapshotPayload(
  payload: PrayerTimesPayload,
  nowMs: number = Date.now(),
): SharedPrayerSnapshotPayload {
  const tz = payload.timezone || getActivePrayerLocation().timeZone || "Asia/Kuwait";
  const todayISO = dateISOInZone(tz, new Date(nowMs));
  const todayNoon = calendarNoonInZone(tz, new Date(nowMs));
  const timesEpochMs: Record<string, number> = {};
  for (const slot of payload.prayers) {
    if (slot.minutes == null) continue;
    const key = slot.key.toLowerCase();
    if (slot.obligatory || key === "sunrise") {
      timesEpochMs[key] = epochAtZoneMinutes(tz, slot.minutes, todayNoon);
    }
  }

  const next = listUpcomingObligatory(payload.prayers, tz, nowMs)[0] ?? null;
  const window = derivePrayerWindow(
    timesEpochMs,
    nowMs,
    next
      ? {
          key: next.slot.key.toLowerCase(),
          nameAr: KEY_TO_ARABIC[next.slot.key] ?? next.slot.name,
          epochMs: next.epoch,
        }
      : null,
  );

  return {
    locationLabel: payload.city || "",
    timeZoneIdentifier: tz,
    dayKey: todayISO,
    timesEpochMs,
    nextPrayerKey: window.nextPrayer?.key ?? (next ? next.slot.key.toLowerCase() : undefined),
    nextPrayerNameAr:
      window.nextPrayer?.nameAr ??
      (next ? KEY_TO_ARABIC[next.slot.key] ?? next.slot.name : undefined),
    nextPrayerEpochMs: window.nextPrayer?.epochMs ?? next?.epoch,
    nextHasStarted: window.nextPrayer ? nowMs >= window.nextPrayer.epochMs : false,
    previousPrayerKey: window.previousPrayer?.key,
    previousPrayerNameAr: window.previousPrayer?.nameAr,
    previousPrayerEpochMs: window.previousPrayer?.epochMs,
    currentPrayerKey: window.currentPrayer?.key,
    currentPrayerNameAr: window.currentPrayer?.nameAr,
    currentPrayerStartedAtEpochMs: window.currentPrayerStartedAt ?? undefined,
    nextTransitionAtEpochMs: window.nextTransitionAt ?? undefined,
    calculationDate: todayISO,
    calculationMethodIdentifier: payload.method || undefined,
    permissionState: payload.city ? "configured" : "REQUIRES_CONFIGURATION",
    initializationState: Object.keys(timesEpochMs).length ? "ready" : "REQUIRES_INITIALIZATION",
  };
}

/** Publish to App Group when running on native iOS. Never throws. */
export async function publishPrayerSnapshotForWidgets(
  payload: PrayerTimesPayload,
): Promise<boolean> {
  if (!isNative || !isIOS) return false;
  if (!payload?.prayers?.length) return false;
  try {
    const ok = await publishSharedPrayerSnapshot(buildSharedPrayerSnapshotPayload(payload));
    const { publishSunnahWidgetEnvelope } = await import("./sunnah-widget-envelope-publish");
    void publishSunnahWidgetEnvelope({ domains: ["prayer", "calendar", "adhkar", "quran", "mushaf", "custom"] });
    return ok;
  } catch {
    return false;
  }
}
