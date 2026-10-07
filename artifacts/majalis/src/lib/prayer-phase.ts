/**
 * مصدر الحساب الوحيد لمرحلة العدّاد حول الأذان — منطق نقي بلا اعتماد على الواجهة.
 * - من دخول الوقت حتى نهاية النافذة: «مضى X على أذان {الصلاة}» (elapsed).
 * - بعدها حتى أذان الصلاة التالية: عدّ تنازلي (countdown) — وبعد العشاء حتى الفجر كذلك.
 * يستهلكه: الويب (prayer-times) · الودجت وLive Activity عبر لقطة App Group (elapsedWindowMinutes) ·
 * ومنطق Swift يطابق هذه الحدود حرفيًا (عند الأذان elapsed، عند نهاية النافذة countdown).
 */

/** نافذة «مضى على الأذان» الافتراضية حين لا يوجد إعداد إقامة. */
export const DEFAULT_ELAPSED_WINDOW_MINUTES = 30;

export type PhaseSlot = { key: string; epochMs: number };

export type PrayerPhase =
  | {
      kind: "elapsed";
      /** الصلاة التي دخل وقتها */
      prayer: PhaseSlot;
      /** الصلاة التالية الفعلية بعدها (null إن لم تُمرَّر) */
      next: PhaseSlot | null;
      elapsedMs: number;
      /** لحظة انتهاء النافذة (adhan + window) */
      endsAtMs: number;
      /** الصلاة السابقة للتي دخل وقتها */
      previous: PhaseSlot | null;
    }
  | {
      kind: "countdown";
      next: PhaseSlot;
      previous: PhaseSlot | null;
      remainingMs: number;
    }
  | { kind: "none" };

/**
 * نافذة الظهور بالدقائق: إقامة مفعّلة بتأخير > 0 → التأخير؛ وإلا (لا إعداد/«مع الأذان») → 30 دقيقة.
 */
export function resolveElapsedWindowMinutes(
  prefs?: { iqamahEnabled?: boolean; iqamahDelayMinutes?: number } | null,
): number {
  const delay = Number(prefs?.iqamahDelayMinutes);
  if (prefs?.iqamahEnabled && Number.isFinite(delay) && delay > 0) return Math.floor(delay);
  return DEFAULT_ELAPSED_WINDOW_MINUTES;
}

/**
 * @param slots أذانات الفروض الخمسة بإحداثيات epoch تغطي الأمس واليوم والغد (أي ترتيب).
 * @param nowMs اللحظة الحالية.
 * @param windowMinutes نافذة «مضى على الأذان».
 * الحدود: nowMs == الأذان → elapsed (0)؛ nowMs == الأذان+النافذة → countdown.
 */
export function resolvePrayerPhase(
  slots: PhaseSlot[],
  nowMs: number,
  windowMinutes: number = DEFAULT_ELAPSED_WINDOW_MINUTES,
): PrayerPhase {
  const sorted = slots.filter((s) => Number.isFinite(s.epochMs)).sort((a, b) => a.epochMs - b.epochMs);
  if (!sorted.length) return { kind: "none" };
  const windowMs = Math.max(0, windowMinutes) * 60_000;

  let idx = -1;
  for (let i = 0; i < sorted.length; i++) if (sorted[i]!.epochMs <= nowMs) idx = i;
  const current = idx >= 0 ? sorted[idx]! : null;
  const following = sorted.slice(idx + 1).find((s) => s.epochMs > nowMs) ?? null;

  if (current && nowMs < current.epochMs + windowMs) {
    return {
      kind: "elapsed",
      prayer: current,
      next: following,
      elapsedMs: nowMs - current.epochMs,
      endsAtMs: current.epochMs + windowMs,
      previous: idx > 0 ? sorted[idx - 1]! : null,
    };
  }
  if (!following) return { kind: "none" };
  return { kind: "countdown", next: following, previous: current, remainingMs: following.epochMs - nowMs };
}
