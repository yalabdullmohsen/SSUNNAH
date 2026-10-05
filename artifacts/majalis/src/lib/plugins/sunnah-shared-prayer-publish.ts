/**
 * Canonical App Group prayer snapshot builder for Widget / LA / Watch readers.
 * Consumes the app prayer engine payload — does not recalculate prayer times.
 */
import {
  calendarNoonInZone,
  epochAtZoneMinutes,
  getPrayerTimes,
  type PrayerSlot,
  type PrayerTimesPayload,
} from "../prayer-times";
import { getActivePrayerLocation } from "../prayer-location-prefs";
import { dateISOInZone } from "../prayer-notification-ids";
import {
  publishSharedPrayerSnapshot,
  type SharedPrayerDay,
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

const KEY_TO_ARABIC_LOWER: Record<string, string> = {
  fajr: "الفجر",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

/** Obligatory + sunrise epochs for one engine day (minutes → zone epoch). */
function timesEpochForDay(prayers: PrayerSlot[], tz: string, noon: Date): Record<string, number> {
  const out: Record<string, number> = {};
  for (const slot of prayers) {
    if (slot.minutes == null) continue;
    const key = slot.key.toLowerCase();
    if (slot.obligatory || key === "sunrise") {
      out[key] = epochAtZoneMinutes(tz, slot.minutes, noon);
    }
  }
  return out;
}

function firstUpcomingFromDays(
  days: SharedPrayerDay[],
  nowMs: number,
): { key: string; epochMs: number } | null {
  let best: { key: string; epochMs: number } | null = null;
  for (const day of days) {
    for (const [key, epochMs] of Object.entries(day.timesEpochMs)) {
      if (key === "sunrise" || !(key in KEY_TO_ARABIC_LOWER) || epochMs <= nowMs) continue;
      if (!best || epochMs < best.epochMs) best = { key, epochMs };
    }
  }
  return best;
}

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
  upcomingDays: SharedPrayerDay[] = [],
): SharedPrayerSnapshotPayload {
  const tz = payload.timezone || getActivePrayerLocation().timeZone || "Asia/Kuwait";
  const todayISO = dateISOInZone(tz, new Date(nowMs));
  const todayNoon = calendarNoonInZone(tz, new Date(nowMs));
  const timesEpochMs = timesEpochForDay(payload.prayers, tz, todayNoon);

  const approxNext = listUpcomingObligatory(payload.prayers, tz, nowMs)[0] ?? null;
  const engineNext = firstUpcomingFromDays(upcomingDays, nowMs);
  const todayHasNext = Object.entries(timesEpochMs).some(
    ([key, epoch]) => key !== "sunrise" && epoch > nowMs,
  );
  /* After Isha: tomorrow's Fajr from the engine's own day computation when available. */
  const next =
    !todayHasNext && engineNext
      ? { slot: { key: engineNext.key, name: KEY_TO_ARABIC_LOWER[engineNext.key] ?? engineNext.key }, epoch: engineNext.epochMs }
      : approxNext;
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
    ...(upcomingDays.length ? { upcomingDays } : {}),
  };
}

/**
 * Engine times for the next `days` calendar days (same location/method as the published payload).
 * Consumed by the widget for after-Isha → next-day Fajr and midnight rollover without an app open.
 * Uses `getPrayerTimes` (the app's single prayer source) — no recalculation here.
 */
export async function buildUpcomingPrayerDays(
  payload: PrayerTimesPayload,
  nowMs: number = Date.now(),
  days = 2,
): Promise<SharedPrayerDay[]> {
  const loc = getActivePrayerLocation();
  const tz = payload.timezone || loc.timeZone || "Asia/Kuwait";
  // Only extend the payload we were handed — never mix in another location's times.
  if (!payload.city || payload.city !== loc.label || tz !== loc.timeZone) return [];
  const todayNoon = calendarNoonInZone(tz, new Date(nowMs));
  const out: SharedPrayerDay[] = [];
  for (let i = 1; i <= days; i += 1) {
    const dayKey = dateISOInZone(tz, new Date(todayNoon.getTime() + i * 24 * 3600_000));
    try {
      const next = await getPrayerTimes(dayKey, { lat: loc.lat, lon: loc.lon, label: loc.label, timeZone: tz });
      if (!next?.ok || !next.prayers?.length) break;
      const noon = calendarNoonInZone(tz, new Date(todayNoon.getTime() + i * 24 * 3600_000));
      const timesEpochMs = timesEpochForDay(next.prayers, tz, noon);
      if (!Object.keys(timesEpochMs).length) break;
      out.push({ dayKey, timesEpochMs });
    } catch {
      break;
    }
  }
  return out;
}

/** Publish to App Group when running on native iOS. Never throws. */
export async function publishPrayerSnapshotForWidgets(
  payload: PrayerTimesPayload,
): Promise<boolean> {
  if (!isNative || !isIOS) return false;
  if (!payload?.prayers?.length) return false;
  try {
    const upcomingDays = await buildUpcomingPrayerDays(payload).catch(() => []);
    const ok = await publishSharedPrayerSnapshot(
      buildSharedPrayerSnapshotPayload(payload, Date.now(), upcomingDays),
    );
    const { publishSunnahWidgetEnvelope } = await import("./sunnah-widget-envelope-publish");
    // Pass the engine payload so the envelope prayer domain is real (not reported as missing).
    void publishSunnahWidgetEnvelope({
      domains: ["prayer", "calendar", "adhkar", "quran", "mushaf", "custom", "home"],
      prayerTimes: payload,
      upcomingDays,
    });
    return ok;
  } catch {
    return false;
  }
}
