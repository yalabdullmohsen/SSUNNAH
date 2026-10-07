/**
 * Adhan scheduler — sets timers for each prayer and triggers:
 *   1. Audio playback (adhan / iqamah)
 *   2. Browser Notification (web)
 *   3. Custom event for in-app bar
 *
 * Must be started once when the app loads. Re-schedules automatically
 * after midnight local prayer timezone.
 *
 * جيل جدولة (_scheduleGen) يمنع تداخل المؤقتات عند إعادة التشغيل المتزامنة.
 */

import { loadPrayerAlertPrefs } from "./prayer-alert-preferences";
import {
  type PrayerSlot,
  type PrayerTimesPayload,
} from "./prayer-times";
import { getActivePrayerLocation } from "./prayer-location-prefs";
import {
  loadAdhanPrefs,
  PRAYER_ARABIC,
  PRAYER_KEYS,
  type PrayerKey,
  getEffectiveMuezzinId,
  getEffectivePlaybackMode,
  isIqamahEnabledForPrayer,
} from "./adhan-preferences";
import { getMuezzin, playIqamah } from "./adhan-audio";
import { playPrayerAthanSync } from "./athan-playback-manager";
import { hapticTap, isIOS, isNative } from "./capacitor-utils";
import { ADHAN_EVENT_NAME, type AdhanEvent } from "./adhan-events";
import {
  cancelAndroidFullAdhan,
  isAdhanAndroidAlarmAvailable,
  scheduleAndroidFullAdhan,
} from "./adhan-android-alarm";
import { resolveAdhanClip } from "./adhan-playback-modes";

export type { AdhanEvent };
export { ADHAN_EVENT_NAME };

function iosFullAdhanActive(): boolean {
  return isNative && isIOS;
}

/**
 * أقصى تأخّر مسموح به قبل اعتبار المؤقّت "قديماً". مؤقّتات JS تتوقف أثناء نوم
 * الجهاز/الخلفية ثم تُطلَق متأخّرة عند الاستيقاظ — فنمنع تشغيل أذانٍ فات وقته.
 */
const STALE_TOLERANCE_MS = 2 * 60_000; // دقيقتان

const _timers: ReturnType<typeof setTimeout>[] = [];
/** جيل الجدولة — أي مؤقّت قديم يتجاهل نفسه إن تغيّر الجيل */
let _scheduleGen = 0;

function clearAllTimers() {
  for (const t of _timers) clearTimeout(t);
  _timers.length = 0;
}

function pushTimer(tid: ReturnType<typeof setTimeout>) {
  _timers.push(tid);
}

/** للاختبارات: عدد المؤقتات النشطة */
export function getAdhanSchedulerTimerCount(): number {
  return _timers.length;
}

export function getAdhanSchedulerGeneration(): number {
  return _scheduleGen;
}

function kuwaitNowMs(): number {
  const timeZone = getActivePrayerLocation().timeZone || "Asia/Kuwait";
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    const s = Number(parts.find((p) => p.type === "second")?.value ?? 0);
    return (h * 3600 + m * 60 + s) * 1000;
  } catch {
    return Date.now() % 86_400_000;
  }
}

function prayerMs(slot: PrayerSlot): number | null {
  if (slot.minutes == null) return null;
  return slot.minutes * 60_000;
}

import { buildScheduledPrayerNotificationCopy } from "./prayer-notification-copy";

function showBrowserNotification(event: AdhanEvent) {
  if (isNative) return;
  if (event.type === "adhan") return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const copy =
    event.type === "advance"
      ? buildScheduledPrayerNotificationCopy({
          kind: "pre",
          prayerName: event.prayerName,
          prayerTimeLabel: event.prayerTimeLabel ?? "",
          minutesBefore: event.minutesBefore,
        })
      : event.type === "iqamah"
        ? {
            title: `إقامة ${event.prayerName}`,
            body: event.prayerTimeLabel ?? "حان وقت الإقامة",
          }
        : buildScheduledPrayerNotificationCopy({
            kind: "enter",
            prayerName: event.prayerName,
            prayerTimeLabel: event.prayerTimeLabel ?? "",
          });

  try {
    new Notification(copy.title, {
      body: copy.body,
      icon: "/icon-192.png",
      badge: "/icon-72.png",
      tag: `adhan-${event.prayerKey}-${event.type}`,
      silent: false,
    });
  } catch { /* ignore */ }
}

function dispatchAdhanEvent(event: AdhanEvent) {
  window.dispatchEvent(new CustomEvent(ADHAN_EVENT_NAME, { detail: event }));
  showBrowserNotification(event);
}

function scheduleForPrayer(
  slot: PrayerSlot,
  key: PrayerKey,
  cityName: string | undefined,
  gen: number,
) {
  const prefs = loadAdhanPrefs();
  if (!prefs.globalEnabled) return;
  const prayerPrefs = prefs.prayers[key];
  if (!prayerPrefs.enabled) return;

  const nowMs = kuwaitNowMs();
  const slotMs = prayerMs(slot);
  if (slotMs == null) return;

  let adhanDelay = slotMs - nowMs;
  if (adhanDelay < 0) adhanDelay += 24 * 3600_000;
  if (adhanDelay > 24 * 3600_000) return;

  const adhanTargetEpoch = Date.now() + adhanDelay;
  const deliveryMode = getEffectivePlaybackMode(prefs, key);
  // صيغة المستخدم كما هي — الكامل يكتمل عبر AthanPlaybackManager بلا قصّ زمني.
  const effectiveDeliveryMode = deliveryMode;

  if (isAdhanAndroidAlarmAvailable() && effectiveDeliveryMode === "full") {
    void cancelAndroidFullAdhan(key);
    const muezzin = getMuezzin(getEffectiveMuezzinId(prefs, key));
    const isFajr = key === "fajr";
    const clip = resolveAdhanClip(muezzin, { isFajr, mode: "full" });
    if (clip) {
      void scheduleAndroidFullAdhan({
        atMs: adhanTargetEpoch,
        url: clip.url,
        title: `أذان ${PRAYER_ARABIC[key] ?? slot.name}`,
        prayerKey: key,
      });
    }
  }

  // مقاطع أذان iOS الكامل: نافذة 7 أيام بمواقيت كل يوم — تُجدول مرة واحدة في scheduleIosAdhanWindow.

  const t1 = setTimeout(() => {
    if (gen !== _scheduleGen) return;
    if (Date.now() - adhanTargetEpoch > STALE_TOLERANCE_MS) return;
    if (Date.now() - adhanTargetEpoch > 5 * 60_000) return;
    const fresh = loadAdhanPrefs();
    if (!fresh.globalEnabled || !fresh.prayers[key].enabled) return;
    const mode = getEffectivePlaybackMode(fresh, key);
    const effectiveMode = mode;
    const muezzinId = getEffectiveMuezzinId(fresh, key);
    const muezzin = getMuezzin(muezzinId);
    const isFajr = key === "fajr";

    if (effectiveMode === "full" && isAdhanAndroidAlarmAvailable()) {
      if (fresh.vibrateEnabled) void hapticTap("medium");
      dispatchAdhanEvent({
        type: "adhan",
        prayerKey: key,
        prayerName: slot.name,
        cityName,
        prayerTimeLabel: slot.time,
      });
      return;
    }

    /**
     * iOS كامل + التطبيق في الواجهة: شغّل الأذان الكامل داخل التطبيق بلا انقطاع،
     * وألغِ بقية مقاطع الإشعار. إن كانت الشاشة مقفلة فالمقاطع المتتابعة تتولى الصوت.
     */
    if (effectiveMode === "full" && iosFullAdhanActive()) {
      const inForeground =
        typeof document !== "undefined" && document.visibilityState === "visible";
      if (inForeground) {
        void import("./adhan-ios-segments").then((m) => m.cancelAdhanIosSegmentChain(key));
        void import("./adhan-diagnostics").then(({ adhanDiag }) => {
          adhanDiag("ADHAN_START", {
            source: "adhan-scheduler-foreground-full",
            prayerKey: key,
            muezzinId,
          });
        });
        const audio = playPrayerAthanSync(muezzin, isFajr, "full", fresh.volume ?? 1);
        if (audio) {
          audio.addEventListener(
            "ended",
            () => {
              void import("./adhan-diagnostics").then(({ adhanDiag }) => {
                adhanDiag("ADHAN_COMPLETE", {
                  source: "adhan-scheduler-foreground-full",
                  prayerKey: key,
                });
              });
            },
            { once: true },
          );
        }
        if (!audio && isFajr) return;
      }
      if (fresh.vibrateEnabled) void hapticTap("medium");
      dispatchAdhanEvent({
        type: "adhan",
        prayerKey: key,
        prayerName: slot.name,
        cityName,
        prayerTimeLabel: slot.time,
      });
      return;
    }

    // NATIVE_ALERTS_OWN_AUDIO_V1: على iOS/Android الأصلي إشعار النظام يملك صوت دخول الوقت.
    if (isNative) {
      const alertPrefs = loadPrayerAlertPrefs();
      if (alertPrefs.alertsEnabled && alertPrefs.enterAlertEnabled && effectiveMode !== "full") {
        if (fresh.vibrateEnabled) void hapticTap("medium");
        dispatchAdhanEvent({
          type: "adhan",
          prayerKey: key,
          prayerName: slot.name,
          cityName,
          prayerTimeLabel: slot.time,
        });
        return;
      }
    }

    const audio = playPrayerAthanSync(muezzin, isFajr, effectiveMode, fresh.volume ?? 1);
    if (!audio && isFajr && effectiveMode !== "silent") return;
    if (fresh.vibrateEnabled) void hapticTap("medium");
    dispatchAdhanEvent({
      type: "adhan",
      prayerKey: key,
      prayerName: slot.name,
      cityName,
      prayerTimeLabel: slot.time,
    });
  }, adhanDelay);
  pushTimer(t1);

  postSwSchedule(
    key,
    PRAYER_ARABIC[key] ?? slot.name,
    adhanDelay,
    adhanTargetEpoch,
    cityName,
  );

  // ── Iqamah timer (بعد الأذان) ──
  if (isIqamahEnabledForPrayer(prefs, key)) {
    const iqDelayMin = prefs.iqamahDelayMinutes;
    const iqamahDelay = adhanDelay + iqDelayMin * 60_000;
    if (iqamahDelay > 0 && iqamahDelay < 24 * 3600_000) {
      const iqamahTargetEpoch = Date.now() + iqamahDelay;
      const tIq = setTimeout(() => {
        if (gen !== _scheduleGen) return;
        if (Date.now() - iqamahTargetEpoch > STALE_TOLERANCE_MS) return;
        const fresh = loadAdhanPrefs();
        if (!isIqamahEnabledForPrayer(fresh, key)) return;
        const muezzin = getMuezzin(getEffectiveMuezzinId(fresh, key));
        playIqamah(muezzin);
        if (fresh.vibrateEnabled) void hapticTap("light");
        dispatchAdhanEvent({
          type: "iqamah",
          prayerKey: key,
          prayerName: slot.name,
          minutesAfterAdhan: fresh.iqamahDelayMinutes,
          cityName,
          prayerTimeLabel: slot.time,
        });
      }, iqamahDelay);
      pushTimer(tIq);
      postSwIqamahSchedule(
        key,
        PRAYER_ARABIC[key] ?? slot.name,
        iqamahDelay,
        iqamahTargetEpoch,
        cityName,
      );
    }
  }

  // ── Advance reminder ──
  const advMin = prayerPrefs.advanceMinutes;
  if (advMin > 0) {
    const prayerDelayFromNow =
      slotMs - nowMs < 0 ? slotMs - nowMs + 24 * 3600_000 : slotMs - nowMs;
    const advDelay = prayerDelayFromNow - advMin * 60_000;
    if (advDelay > 0 && advDelay < 24 * 3600_000) {
      const advTargetEpoch = Date.now() + advDelay;
      const prayerTargetEpoch = Date.now() + prayerDelayFromNow;
      const t2 = setTimeout(() => {
        if (gen !== _scheduleGen) return;
        if (Date.now() - advTargetEpoch > STALE_TOLERANCE_MS) return;
        if (Date.now() >= prayerTargetEpoch) return;
        const fresh = loadAdhanPrefs();
        if (!fresh.globalEnabled || !fresh.prayers[key].enabled) return;
        if (fresh.prayers[key].advanceMinutes === 0) return;
        const mins = fresh.prayers[key].advanceMinutes;
        dispatchAdhanEvent({
          type: "advance",
          prayerKey: key,
          prayerName: slot.name,
          minutesBefore: mins,
          prayerTimeLabel: slot.time,
        });
      }, advDelay);
      pushTimer(t2);
    }
  }
}

/**
 * مقاطع أذان iOS الكامل لنافذة تصل إلى 7 أيام، بمواقيت كل يوم من محرك الصلاة (لا بدقائق اليوم الأول).
 * المخطِّط (planNativePrayerWindow) مشترك مع جدولة التنبيهات: الأقرب أولًا ضمن حصة الصلاة (40 من 64)
 * فلا تجور المقاطع على حصة الأذكار؛ أقرب صلوات بأذان كامل متعدد المقاطع وما بعدها بمقطع قصير واحد.
 */
async function scheduleIosAdhanWindow(payload: PrayerTimesPayload, gen: number): Promise<void> {
  if (!iosFullAdhanActive()) return;
  const prefs = loadAdhanPrefs();
  const keepIds = new Set<number>();
  const alertsMod = await import("./prayer-alert-scheduler");
  const segMod = await import("./adhan-ios-segments");
  const budgetMod = await import("./prayer-native-budget");
  if (gen !== _scheduleGen) return;

  if (!prefs.globalEnabled) {
    await segMod.cancelStaleAdhanSegments(keepIds);
    return;
  }

  const tz = payload.timezone || getActivePrayerLocation().timeZone || "Asia/Kuwait";
  const slots = await alertsMod.listNativePrayerScheduleSlotsAhead(payload.prayers, tz);
  const window = await alertsMod.planNativePrayerWindow(slots, loadPrayerAlertPrefs());
  if (gen !== _scheduleGen) return;

  const targets = window.filter((w) => w.plan.include && w.plan.segmentMode !== "none");
  const bases = budgetMod.assignAdhanChainIdBases(
    targets.map((w) => `${w.slot.key.toLowerCase()}:${w.dateISO}`),
  );

  for (const w of targets) {
    if (gen !== _scheduleGen) return;
    const key = w.slot.key.toLowerCase() as PrayerKey;
    const muezzin = getMuezzin(getEffectiveMuezzinId(prefs, key));
    const mapKey = `${key}:${w.dateISO}`;
    const idBase = bases.get(mapKey);
    const result = await segMod.scheduleIosFullAdhan({
      prayerKey: key,
      prayerName: PRAYER_ARABIC[key] ?? w.slot.name,
      recordingId: muezzin.id,
      isFajr: key === "fajr",
      startAtMs: w.epoch,
      deliveryMode: w.plan.segmentMode === "full" ? "full" : "short",
      dayKey: w.dateISO,
      idBase,
    });
    for (const id of result.ids) keepIds.add(id);
  }
  // أي مقطع معلّق خارج الخطة الحالية (نافذة أقدم/معرّفات قديمة) يُلغى فلا يتكرر الأذان.
  await segMod.cancelStaleAdhanSegments(keepIds);
}

/**
 * Start the scheduler for the current prayer data. Call once on app load.
 * لا يطلب إذن الإشعارات هنا أبداً.
 */
export async function startAdhanScheduler(payload: PrayerTimesPayload): Promise<void> {
  const gen = ++_scheduleGen;
  clearAllTimers();
  postSwCancelAll();

  if (isAdhanAndroidAlarmAvailable()) {
    for (const key of PRAYER_KEYS) {
      void cancelAndroidFullAdhan(key);
    }
  }

  if (iosFullAdhanActive()) {
    void import("./adhan-ios-segments").then(({ cancelAdhanIosSegmentChain }) =>
      cancelAdhanIosSegmentChain(),
    );
  }

  const SLOT_KEYS: Array<[string, PrayerKey]> = [
    ["Fajr", "fajr"],
    ["Dhuhr", "dhuhr"],
    ["Asr", "asr"],
    ["Maghrib", "maghrib"],
    ["Isha", "isha"],
  ];

  for (const [slotKey, prayerKey] of SLOT_KEYS) {
    if (gen !== _scheduleGen) return;
    const slot = payload.prayers.find((p) => p.key === slotKey);
    if (slot) scheduleForPrayer(slot, prayerKey, payload.city, gen);
  }

  if (gen !== _scheduleGen) return;

  void scheduleIosAdhanWindow(payload, gen).catch(() => {});

  const nowMs = kuwaitNowMs();
  const midnightDelay = 24 * 3600_000 - nowMs + 5_000;
  const midnight = setTimeout(() => {
    if (gen !== _scheduleGen) return;
    import("./prayer-times").then(({ fetchPrayerTimes }) => {
      fetchPrayerTimes().then((p) => startAdhanScheduler(p));
    });
  }, midnightDelay);
  pushTimer(midnight);
}

export function stopAdhanScheduler() {
  _scheduleGen += 1;
  clearAllTimers();
  postSwCancelAll();
  if (isAdhanAndroidAlarmAvailable()) {
    for (const key of PRAYER_KEYS) {
      void cancelAndroidFullAdhan(key);
    }
  }
  if (iosFullAdhanActive()) {
    void import("./adhan-ios-segments").then(({ cancelAdhanIosSegmentChain }) =>
      cancelAdhanIosSegmentChain(),
    );
  }
}

function postSwCancelAll() {
  const sw = navigator.serviceWorker?.controller;
  if (!sw) return;
  sw.postMessage({ type: "CANCEL_ALL_ADHAN" });
}

function postSwSchedule(
  prayerKey: PrayerKey,
  prayerArabic: string,
  delayMs: number,
  fireAt: number,
  cityName?: string,
) {
  const sw = navigator.serviceWorker?.controller;
  if (!sw) return;
  sw.postMessage({
    type: "SCHEDULE_ADHAN",
    prayerKey,
    prayerArabic,
    delayMs,
    fireAt,
    cityName: cityName || "",
  });
}

function postSwIqamahSchedule(
  prayerKey: PrayerKey,
  prayerArabic: string,
  delayMs: number,
  fireAt: number,
  cityName?: string,
) {
  const sw = navigator.serviceWorker?.controller;
  if (!sw) return;
  sw.postMessage({
    type: "SCHEDULE_IQAMAH",
    prayerKey,
    prayerArabic,
    delayMs,
    fireAt,
    cityName: cityName || "",
  });
}
