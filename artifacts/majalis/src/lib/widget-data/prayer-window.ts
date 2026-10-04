/**
 * Previous / current / next prayer window from published times.
 * Does not recalculate Adhan coordinates or methods.
 */

export const WIDGET_PRAYER_SLOT_ORDER = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;
export const WIDGET_OBLIGATORY_PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

export type WidgetPrayerSlotKey = (typeof WIDGET_PRAYER_SLOT_ORDER)[number];

const KEY_TO_ARABIC: Record<string, string> = {
  fajr: "الفجر",
  sunrise: "الشروق",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

export type WidgetPrayerAnchor = {
  key: string;
  nameAr: string;
  epochMs: number;
};

export type WidgetPrayerWindow = {
  previousPrayer: WidgetPrayerAnchor | null;
  currentPrayer: WidgetPrayerAnchor | null;
  nextPrayer: WidgetPrayerAnchor | null;
  currentPrayerStartedAt: number | null;
  nextTransitionAt: number | null;
};

function anchor(key: string, epochMs: number): WidgetPrayerAnchor {
  return { key, nameAr: KEY_TO_ARABIC[key] ?? key, epochMs };
}

export function derivePrayerWindow(
  timesEpochMs: Record<string, number>,
  nowMs: number,
  upcomingNext?: { key: string; nameAr?: string; epochMs: number } | null,
): WidgetPrayerWindow {
  const obligatory = WIDGET_OBLIGATORY_PRAYER_KEYS.filter((key) => Number.isFinite(timesEpochMs[key])).map((key) =>
    anchor(key, timesEpochMs[key]!),
  );
  const current = [...obligatory].reverse().find((slot) => slot.epochMs <= nowMs) ?? null;
  const previous =
    current != null ? [...obligatory].reverse().find((slot) => slot.epochMs < current.epochMs) ?? null : null;
  const todayNext = obligatory.find((slot) => slot.epochMs > nowMs) ?? null;
  const next = todayNext
    ? todayNext
    : upcomingNext
      ? anchor(upcomingNext.key.toLowerCase(), upcomingNext.epochMs)
      : null;
  return {
    previousPrayer: previous,
    currentPrayer: current,
    nextPrayer: next,
    currentPrayerStartedAt: current?.epochMs ?? null,
    nextTransitionAt: next?.epochMs ?? null,
  };
}
