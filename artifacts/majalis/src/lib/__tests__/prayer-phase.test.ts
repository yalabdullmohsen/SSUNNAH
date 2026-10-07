/**
 * مرحلة «مضى على الأذان» → العدّ التنازلي: الحدود (لحظة الأذان، نهاية النافذة، ما بعد العشاء حتى الفجر).
 * تشغيل: node --import tsx src/lib/__tests__/prayer-phase.test.ts
 */
import assert from "node:assert/strict";
import {
  DEFAULT_ELAPSED_WINDOW_MINUTES,
  resolveElapsedWindowMinutes,
  resolvePrayerPhase,
  type PhaseSlot,
} from "../prayer-phase.ts";
import { computePrayerCountdown, computePrayerStatus, type PrayerSlot } from "../prayer-times.ts";

const MIN = 60_000;
const SEC = 1_000;

console.log("=== نافذة الظهور من إعداد الإقامة ===");
{
  assert.equal(DEFAULT_ELAPSED_WINDOW_MINUTES, 30);
  assert.equal(resolveElapsedWindowMinutes(), 30, "لا إعداد → 30");
  assert.equal(resolveElapsedWindowMinutes(null), 30);
  assert.equal(resolveElapsedWindowMinutes({ iqamahEnabled: true, iqamahDelayMinutes: 10 }), 10);
  assert.equal(resolveElapsedWindowMinutes({ iqamahEnabled: true, iqamahDelayMinutes: 5 }), 5);
  assert.equal(resolveElapsedWindowMinutes({ iqamahEnabled: true, iqamahDelayMinutes: 15 }), 15);
  assert.equal(resolveElapsedWindowMinutes({ iqamahEnabled: true, iqamahDelayMinutes: 0 }), 30, "«مع الأذان» لا فترة → 30");
  assert.equal(resolveElapsedWindowMinutes({ iqamahEnabled: false, iqamahDelayMinutes: 15 }), 30, "الإقامة معطّلة → 30");
}

// يوم افتراضي: كل الأوقات epoch ms من منتصف الليل D0 (دقائق اليوم)
const D0 = Date.UTC(2026, 9, 7, 0, 0, 0);
const at = (dayOffset: number, h: number, m: number) => D0 + dayOffset * 24 * 60 * MIN + (h * 60 + m) * MIN;
const daySlots = (offset: number): PhaseSlot[] => [
  { key: "Fajr", epochMs: at(offset, 4, 0) },
  { key: "Dhuhr", epochMs: at(offset, 12, 0) },
  { key: "Asr", epochMs: at(offset, 15, 30) },
  { key: "Maghrib", epochMs: at(offset, 18, 0) },
  { key: "Isha", epochMs: at(offset, 19, 30) },
];
const SLOTS = [...daySlots(-1), ...daySlots(0), ...daySlots(1)];
const dhuhr = at(0, 12, 0);

console.log("=== لحظة الأذان ===");
{
  const before = resolvePrayerPhase(SLOTS, dhuhr - 1, 30);
  assert.equal(before.kind, "countdown");
  if (before.kind === "countdown") {
    assert.equal(before.next.key, "Dhuhr");
    assert.equal(before.remainingMs, 1);
  }
  const exact = resolvePrayerPhase(SLOTS, dhuhr, 30);
  assert.equal(exact.kind, "elapsed", "عند لحظة الأذان تبدأ «مضى»");
  if (exact.kind === "elapsed") {
    assert.equal(exact.prayer.key, "Dhuhr");
    assert.equal(exact.elapsedMs, 0);
    assert.equal(exact.next?.key, "Asr");
    assert.equal(exact.previous?.key, "Fajr");
    assert.equal(exact.endsAtMs, dhuhr + 30 * MIN);
  }
  const mid = resolvePrayerPhase(SLOTS, dhuhr + 12 * MIN + 40 * SEC, 30);
  assert.equal(mid.kind === "elapsed" && mid.elapsedMs, 12 * MIN + 40 * SEC);
}

console.log("=== لحظة انتهاء الفترة (30 دقيقة افتراضيًا) ===");
{
  const justBefore = resolvePrayerPhase(SLOTS, dhuhr + 30 * MIN - 1, 30);
  assert.equal(justBefore.kind, "elapsed", "قبل النهاية بمللي ثانية ما زال «مضى»");
  const end = resolvePrayerPhase(SLOTS, dhuhr + 30 * MIN, 30);
  assert.equal(end.kind, "countdown", "عند النهاية يعود العدّ التنازلي");
  if (end.kind === "countdown") {
    assert.equal(end.next.key, "Asr");
    assert.equal(end.remainingMs, at(0, 15, 30) - (dhuhr + 30 * MIN));
    assert.equal(end.previous?.key, "Dhuhr");
  }
}

console.log("=== نافذة الإقامة (10 دقائق) ===");
{
  assert.equal(resolvePrayerPhase(SLOTS, dhuhr + 10 * MIN - 1, 10).kind, "elapsed");
  assert.equal(resolvePrayerPhase(SLOTS, dhuhr + 10 * MIN, 10).kind, "countdown");
  assert.equal(resolvePrayerPhase(SLOTS, dhuhr + 5 * MIN, 5).kind, "countdown", "إقامة 5 د: بعد دقيقتين… الدقيقة الخامسة عدّ تنازلي");
  assert.equal(resolvePrayerPhase(SLOTS, dhuhr + 5 * MIN - 1, 5).kind, "elapsed");
}

console.log("=== ما بعد العشاء حتى الفجر ===");
{
  const isha = at(0, 19, 30);
  const fajrTomorrow = at(1, 4, 0);
  assert.equal(resolvePrayerPhase(SLOTS, isha, 30).kind, "elapsed");
  const afterWindow = resolvePrayerPhase(SLOTS, isha + 30 * MIN, 30);
  assert.equal(afterWindow.kind, "countdown");
  if (afterWindow.kind === "countdown") {
    assert.equal(afterWindow.next.key, "Fajr");
    assert.equal(afterWindow.next.epochMs, fajrTomorrow, "الفجر التالي هو فجر الغد");
    assert.equal(afterWindow.previous?.key, "Isha");
  }
  const midnight = resolvePrayerPhase(SLOTS, at(1, 0, 0), 30);
  assert.equal(midnight.kind === "countdown" && midnight.next.epochMs, fajrTomorrow, "منتصف الليل: عدّ تنازلي للفجر");
  const justBeforeFajr = resolvePrayerPhase(SLOTS, fajrTomorrow - 1, 30);
  assert.equal(justBeforeFajr.kind === "countdown" && justBeforeFajr.remainingMs, 1);
  const fajrExact = resolvePrayerPhase(SLOTS, fajrTomorrow, 30);
  assert.equal(fajrExact.kind === "elapsed" && fajrExact.prayer.key, "Fajr");
  // عشاء متأخر قبل منتصف الليل: النافذة تعبر منتصف الليل
  const lateIsha: PhaseSlot[] = [
    { key: "Isha", epochMs: at(0, 23, 50) },
    { key: "Fajr", epochMs: at(1, 4, 0) },
  ];
  const crossing = resolvePrayerPhase(lateIsha, at(1, 0, 10), 30);
  assert.equal(crossing.kind === "elapsed" && crossing.prayer.key, "Isha", "00:10 ما زال ضمن نافذة عشاء 23:50");
  assert.equal(resolvePrayerPhase(lateIsha, at(1, 0, 20), 30).kind, "countdown");
}

console.log("=== لا بيانات ===");
{
  assert.equal(resolvePrayerPhase([], dhuhr, 30).kind, "none");
  assert.equal(resolvePrayerPhase([{ key: "Fajr", epochMs: at(0, 4, 0) }], at(0, 5, 0), 30).kind, "none", "لا صلاة تالية");
}

console.log("=== computePrayerCountdown / Status فوق نفس المصدر (الكويت UTC+3) ===");
{
  const mk = (key: string, name: string, h: number, m: number): PrayerSlot => ({
    key, name, obligatory: true, minutes: h * 60 + m, time24: `${h}:${m}`, time: `${h}:${m}`,
  });
  const prayers = [
    mk("Fajr", "الفجر", 4, 0), mk("Dhuhr", "الظهر", 12, 0), mk("Asr", "العصر", 15, 30),
    mk("Maghrib", "المغرب", 18, 0), mk("Isha", "العشاء", 19, 30),
  ];
  const kw = (h: number, m: number, s = 0) => Date.UTC(2026, 9, 7, h - 3, m, s); // توقيت الكويت → UTC
  const run = (h: number, m: number, s = 0, win = 30) =>
    computePrayerCountdown(prayers, "Asia/Kuwait", { nowMs: kw(h, m, s), elapsedWindowMinutes: win });

  const before = run(11, 59, 30);
  assert.equal(before.sinceSeconds, null);
  assert.equal(before.next?.key, "Dhuhr");
  assert.equal(Math.round(before.remainingMs / 1000), 30);

  const atAdhan = run(12, 0, 0);
  assert.equal(atAdhan.sinceSeconds, 0, "لحظة الأذان: مضى 0");
  assert.equal(atAdhan.next?.key, "Dhuhr", "تبقى «القادمة» هي التي دخل وقتها خلال النافذة");
  assert.equal(atAdhan.graceNextSlot?.key, "Asr");
  assert.equal(atAdhan.elapsedWindowSeconds, 1800);

  const inside = run(12, 12, 40);
  assert.equal(inside.sinceSeconds, 12 * 60 + 40);
  assert.equal(inside.graceNextSeconds, 3 * 3600 + 17 * 60 + 20);

  const lastSecond = run(12, 29, 59);
  assert.equal(lastSecond.sinceSeconds, 29 * 60 + 59);
  const ended = run(12, 30, 0);
  assert.equal(ended.sinceSeconds, null, "انتهت النافذة");
  assert.equal(ended.next?.key, "Asr", "العدّ التنازلي للصلاة التالية");
  assert.equal(Math.round(ended.remainingMs / 1000), 3 * 3600);

  const iqama = run(12, 10, 0, 10);
  assert.equal(iqama.sinceSeconds, null, "إقامة 10 د: انتهت عند الدقيقة 10");
  assert.equal(iqama.next?.key, "Asr");
  assert.equal(run(12, 9, 59, 10).sinceSeconds, 9 * 60 + 59);

  const afterIsha = run(21, 0, 0);
  assert.equal(afterIsha.sinceSeconds, null);
  assert.equal(afterIsha.next?.key, "Fajr");
  assert.equal(Math.round(afterIsha.remainingMs / 1000), 7 * 3600, "21:00 → فجر الغد 04:00");
  assert.equal(computePrayerStatus(prayers, "Asia/Kuwait", { nowMs: kw(2, 0, 0) }).next?.key, "Fajr");
  assert.equal(computePrayerStatus(prayers, "Asia/Kuwait", { nowMs: kw(2, 0, 0) }).previous?.key, "Isha");
}

console.log("prayer-phase.test.ts: ok");
