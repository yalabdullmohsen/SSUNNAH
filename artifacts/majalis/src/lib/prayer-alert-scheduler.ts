/**
 * منسّق تنبيه الصلاة القادمة: يجمع بين الإشعار المحلي الأصلي (يعمل في الخلفية)
 * وLive Activity (تعمل تفاعلياً أثناء فتح التطبيق) وحدث الشريط داخل التطبيق.
 *
 * الإشعارات المحلية تُجدوَل فوراً عبر نظام التشغيل (تنجو من إغلاق التطبيق).
 * على الأصل: تُجدوَل كل الصلوات المفروضة القادمة (اليوم + ما يلتفّ للغد) حتى
 * تصل التنبيهات بعد قتل التطبيق/إعادة التشغيل دون الاعتماد على مؤقّتات JS.
 * Live Activity وشريط التطبيق يُفعَّلان بمؤقّتات JS للصلاة التالية فقط.
 */
import {
  calendarNoonInZone,
  epochAtZoneMinutes,
  getPrayerTimes,
  type PrayerSlot,
  type PrayerTimesPayload,
} from "./prayer-times";
import { getActivePrayerLocation } from "./prayer-location-prefs";
import { loadPrayerAlertPrefs, LIVE_ACTIVITY_LINGER_MINUTES } from "./prayer-alert-preferences";
import { getElapsedWindowMinutes } from "./prayer-elapsed-window";
import {
  getEffectiveMuezzinId,
  getEffectivePlaybackMode,
  isIqamahEnabledForPrayer,
  loadAdhanPrefs,
  PRAYER_KEYS,
  type PrayerKey,
} from "./adhan-preferences";
import {
  cancelAllPrayerNativeNotifications,
  cancelPrayerNativeNotificationsExcept,
  listPendingPrayerNotifications,
  MAX_NATIVE_PRAYER_NOTIFS,
  purgePastPrayerNativeNotifications,
  schedulePrayerNativeNotifications,
  verifyPendingAgainstExpected,
} from "./prayer-local-notifications";
import {
  dateISOInZone,
  hashPrayerNotificationId,
  type PrayerNotifIdKind,
} from "./prayer-notification-ids";
import {
  startPrayerLiveActivity,
  markPrayerLiveActivityEntered,
  markPrayerLiveActivityCompleted,
  endPrayerLiveActivity,
  presentPrayerLiveActivityAppLaunch,
} from "./plugins/prayer-live-activity";
import { publishPrayerSnapshotForWidgets } from "./plugins/sunnah-shared-prayer-publish";
import type { PrayerSoundProfile } from "./prayer-notification-sounds";
import { PRAYER_ALERT_EVENT_NAME, type PrayerAlertEvent } from "./prayer-alert-events";
import { isIOS, isNative } from "./capacitor-utils";
import { planPrayerNativeWindow, type WindowSlotPlan } from "./prayer-native-budget";
import { getMuezzin, hasFajrAdhan } from "./adhan-audio";

export { PRAYER_ALERT_EVENT_NAME, type PrayerAlertEvent } from "./prayer-alert-events";

const KEY_TO_ARABIC: Record<string, string> = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

const _timers: ReturnType<typeof setTimeout>[] = [];
/** مؤقّتات linger لـ Live Activity — لا تُمسح مع إعادة جدولة الإشعارات. */
const _liveActivityTimers: ReturnType<typeof setTimeout>[] = [];
/** توقيع آخر جدولة أصلية — يمنع التكرار دون حجب إعادة الجدولة عند تغيّر الوقت/التفضيلات. */
let _lastScheduleSig: string | null = null;
let _lastTimeZone: string | null = null;
let _lastDateISO: string | null = null;
let _liveActivityActiveForKey: string | null = null;

function clearAllTimers() {
  for (const t of _timers) clearTimeout(t);
  _timers.length = 0;
}

function clearLiveActivityTimers() {
  for (const t of _liveActivityTimers) clearTimeout(t);
  _liveActivityTimers.length = 0;
}

/** يُصدَّر للاختبارات والواجهات — يبني توقيع جدولة الإشعار الأصلي. */
export function buildPrayerScheduleSignature(opts: {
  prayerKey: string;
  prayerTimeEpochMs: number;
  preAlertEnabled: boolean;
  enterAlertEnabled: boolean;
  preAlertMinutes: number;
  postReminderEnabled?: boolean;
  soundProfile?: PrayerSoundProfile;
  muezzinId?: string;
  prayerEnabled?: boolean;
  iosFullHandlesEnter?: boolean;
}): string {
  const minuteBucket = Math.floor(opts.prayerTimeEpochMs / 60_000);
  return [
    opts.prayerKey.toLowerCase(),
    String(minuteBucket),
    opts.preAlertEnabled ? "1" : "0",
    opts.enterAlertEnabled ? "1" : "0",
    String(opts.preAlertMinutes),
    opts.postReminderEnabled ? "1" : "0",
    opts.soundProfile ?? "auto",
    opts.muezzinId ?? "",
    opts.prayerEnabled === false ? "off" : "on",
    opts.iosFullHandlesEnter ? "ios-full" : "enter-native",
  ].join("|");
}

/** امسح كاش الجدولة — يُستدعى عند تغيّر التفضيلات أو العودة للتطبيق بقوة. */
export function invalidatePrayerNativeSchedule(): void {
  _lastScheduleSig = null;
}

/**
 * لحظة مطلقة لوقت صلاة في منطقة الموقع النشط.
 * ما فات يلتفّ لليوم التالي عبر تاريخ المنطقة لا عبر Date.now()+delay الغامض.
 */
export function epochForSlot(slot: PrayerSlot, timeZone?: string): number {
  const tz = timeZone || getActivePrayerLocation().timeZone || "Asia/Kuwait";
  if (slot.minutes == null) return Date.now();
  let epoch = epochAtZoneMinutes(tz, slot.minutes);
  if (epoch <= Date.now()) {
    const tomorrowNoon = new Date(calendarNoonInZone(tz).getTime() + 24 * 3600_000);
    epoch = epochAtZoneMinutes(tz, slot.minutes, tomorrowNoon);
  }
  return epoch;
}

/**
 * كل الصلوات المفروضة في نافذة اليوم المتبقي + الغد.
 * ما فات اليوم لا يُدرج؛ الغد يُدرج كاملًا حتى تبقى التنبيهات بعد إغلاق التطبيق.
 */
export function listNativePrayerScheduleSlots(
  prayers: PrayerSlot[],
  timeZone?: string,
): Array<{ slot: PrayerSlot; epoch: number; dateISO: string }> {
  const tz = timeZone || getActivePrayerLocation().timeZone || "Asia/Kuwait";
  const obligatory = prayers.filter((p) => p.obligatory && p.minutes != null);
  const todayNoon = calendarNoonInZone(tz);
  const tomorrowNoon = new Date(todayNoon.getTime() + 24 * 3600_000);
  const now = Date.now();
  const out: Array<{ slot: PrayerSlot; epoch: number; dateISO: string }> = [];
  for (const slot of obligatory) {
    if (slot.minutes == null) continue;
    for (const noon of [todayNoon, tomorrowNoon]) {
      const epoch = epochAtZoneMinutes(tz, slot.minutes, noon);
      if (epoch <= now) continue;
      out.push({
        slot,
        epoch,
        dateISO: dateISOInZone(tz, new Date(epoch)),
      });
    }
  }
  return out.sort((a, b) => a.epoch - b.epoch);
}

/** أقصى أيام النافذة الأصلية — الميزانية (MAX_NATIVE_PRAYER_NOTIFS) تقصّها حسب الأنواع المفعّلة. */
export const NATIVE_PRAYER_WINDOW_DAYS = 7;

/**
 * نافذة متعددة الأيام بمواقيت كل يوم الحقيقية من المحرك (getPrayerTimes لكل تاريخ) —
 * كانت النافذة اليوم + الغد بدقائق اليوم، فتتوقف التنبيهات إن لم يُفتح التطبيق يومين.
 * الأقرب أولًا؛ rescheduleAllNativePrayers يتوقف عند الميزانية.
 */
export async function listNativePrayerScheduleSlotsAhead(
  prayers: PrayerSlot[],
  timeZone: string,
  days = NATIVE_PRAYER_WINDOW_DAYS,
): Promise<Array<{ slot: PrayerSlot; epoch: number; dateISO: string }>> {
  const todayNoon = calendarNoonInZone(timeZone);
  const todayISO = dateISOInZone(timeZone, todayNoon);
  // اليوم من الحمولة الحالية؛ ما بعده من المحرك بتاريخه (لا إعادة استعمال دقائق اليوم للغد).
  const out = listNativePrayerScheduleSlots(prayers, timeZone).filter((s) => s.dateISO === todayISO);
  if (!prayers.length) return out;
  const loc = getActivePrayerLocation();
  const now = Date.now();
  for (let d = 1; d < days; d++) {
    const noon = new Date(todayNoon.getTime() + d * 24 * 3600_000);
    const dateISO = dateISOInZone(timeZone, noon);
    let dayPrayers: PrayerSlot[];
    try {
      dayPrayers = (await getPrayerTimes(dateISO, { lat: loc.lat, lon: loc.lon, label: loc.label, timeZone })).prayers;
    } catch {
      break; // لا تخمين بدقائق يوم آخر
    }
    for (const slot of dayPrayers) {
      if (!slot.obligatory || slot.minutes == null) continue;
      const epoch = epochAtZoneMinutes(timeZone, slot.minutes, noon);
      if (epoch > now) out.push({ slot, epoch, dateISO });
    }
  }
  return out.sort((a, b) => a.epoch - b.epoch);
}

/** أقرب صلاة قادمة لم يحن وقتها بعد (تتجاهل ما فات، تلتفّ لليوم التالي إن لزم). */
export function findNextUpcomingPrayer(prayers: PrayerSlot[], timeZone?: string): PrayerSlot | null {
  const slots = listNativePrayerScheduleSlots(prayers, timeZone);
  return slots[0]?.slot ?? null;
}

function dispatchAlert(event: PrayerAlertEvent) {
  window.dispatchEvent(new CustomEvent(PRAYER_ALERT_EVENT_NAME, { detail: event }));
}

async function fireLiveActivityStart(slot: PrayerSlot, prayerEpoch: number, locationLabel?: string) {
  const prefs = loadPrayerAlertPrefs();
  if (!prefs.liveActivitiesEnabled) return;
  if (_liveActivityActiveForKey === slot.key) return;
  const started = await startPrayerLiveActivity({
    prayerKey: slot.key.toLowerCase(),
    prayerName: KEY_TO_ARABIC[slot.key] ?? slot.name,
    prayerTimeIso: new Date(prayerEpoch).toISOString(),
    locationLabel,
    phase: "upcoming",
    statusLabel: "قادمة",
  });
  if (started) _liveActivityActiveForKey = slot.key;
}

/** نافذة active = «مضى على الأذان» (إقامة المستخدم أو 30 دقيقة، نفس مصدر الويب والودجت)؛ بعدها completed (الصلاة التالية من الجدول) ثم إنهاء — بلا إعادة حساب مواقيت. */
async function fireLiveActivityEnter(
  current: PrayerSlot,
  following: { slot: PrayerSlot; epoch: number } | null,
  locationLabel?: string,
) {
  const prefs = loadPrayerAlertPrefs();
  if (!prefs.liveActivitiesEnabled) return;
  // استبدل linger السابق فقط — لا تضع هذه المؤقّتات في _timers (تُمسح عند reschedule).
  clearLiveActivityTimers();
  await markPrayerLiveActivityEntered();
  const t = setTimeout(() => {
    void (async () => {
      if (following) {
        await markPrayerLiveActivityCompleted({
          completedPrayerName: KEY_TO_ARABIC[current.key] ?? current.name,
          nextPrayerKey: following.slot.key.toLowerCase(),
          nextPrayerName: KEY_TO_ARABIC[following.slot.key] ?? following.slot.name,
          nextPrayerTimeIso: new Date(following.epoch).toISOString(),
          locationLabel,
        });
        const t2 = setTimeout(() => {
          void endPrayerLiveActivity();
          _liveActivityActiveForKey = null;
        }, Math.min(LIVE_ACTIVITY_LINGER_MINUTES, 3) * 60_000);
        _liveActivityTimers.push(t2);
      } else {
        void endPrayerLiveActivity();
        _liveActivityActiveForKey = null;
      }
    })();
  }, getElapsedWindowMinutes() * 60_000);
  _liveActivityTimers.push(t);
}

function asPrayerKey(slotKey: string): PrayerKey | null {
  const k = slotKey.toLowerCase();
  return (PRAYER_KEYS as readonly string[]).includes(k) ? (k as PrayerKey) : null;
}

function resolveSlotAlertOpts(
  slotKey: string,
  prefs: ReturnType<typeof loadPrayerAlertPrefs>,
) {
  const adhanPrefs = loadAdhanPrefs();
  const pk = asPrayerKey(slotKey);
  const prayerOn = pk ? adhanPrefs.prayers[pk].enabled : true;
  const preMinutes = pk ? adhanPrefs.prayers[pk].advanceMinutes : prefs.preAlertMinutes;
  const fullMode = pk ? getEffectivePlaybackMode(adhanPrefs, pk) === "full" : false;
  /**
   * على iOS الوضع الكامل: مقاطع الأذان (`scheduleIosFullAdhan`) هي إشعار الدخول.
   * لا نُجدول enter منفصلًا هنا وإلا يتكرر الإشعار.
   */
  const iosFullHandlesEnter = isNative && isIOS && fullMode;
  return {
    prayerEnabled: prayerOn,
    preAlertMinutes: preMinutes,
    preAlertEnabled: prefs.alertsEnabled && prefs.preAlertEnabled && prayerOn,
    enterAlertEnabled:
      prefs.alertsEnabled && prefs.enterAlertEnabled && prayerOn && !iosFullHandlesEnter,
    postReminderEnabled: prefs.alertsEnabled && prefs.postReminderEnabled && prayerOn,
    muezzinId: pk ? getEffectiveMuezzinId(adhanPrefs, pk) : "",
    iosFullHandlesEnter,
  };
}

/** عدد التنبيهات الأصلية المفعّلة لصلاة (قبل/دخول/بعد/إقامة) — يطابق ما تجدوله schedulePrayerNativeNotifications. */
export function countSlotNativeAlerts(
  slotKey: string,
  prefs: ReturnType<typeof loadPrayerAlertPrefs>,
): number {
  const o = resolveSlotAlertOpts(slotKey, prefs);
  if (!o.prayerEnabled) return 0;
  const pk = asPrayerKey(slotKey);
  const iqamah = pk ? isIqamahEnabledForPrayer(loadAdhanPrefs(), pk) : false;
  return [o.preAlertEnabled, o.enterAlertEnabled, o.postReminderEnabled, iqamah].filter(Boolean).length;
}

export type NativeWindowEntry = {
  slot: PrayerSlot;
  epoch: number;
  dateISO: string;
  plan: WindowSlotPlan;
};

/**
 * خطة النافذة الموحّدة (حتى 7 أيام) — تستعملها جدولة التنبيهات ومقاطع أذان iOS معًا
 * فتتفقان على الأيام المشمولة والميزانية (حصة الصلاة 40 من 64 دون المساس بحصة الأذكار).
 */
export async function planNativePrayerWindow(
  slots: Array<{ slot: PrayerSlot; epoch: number; dateISO: string }>,
  prefs: ReturnType<typeof loadPrayerAlertPrefs>,
): Promise<NativeWindowEntry[]> {
  const seg = isNative && isIOS ? await import("./adhan-ios-segments") : null;
  const inputs = slots.map(({ slot }) => {
    const o = resolveSlotAlertOpts(slot.key, prefs);
    const pk = asPrayerKey(slot.key);
    let iosFullAdhan = false;
    let chainLength = 1;
    if (seg && o.prayerEnabled && o.iosFullHandlesEnter && pk) {
      const muezzin = getMuezzin(o.muezzinId);
      iosFullAdhan = pk !== "fajr" || hasFajrAdhan(muezzin);
      chainLength = seg.recordingSupportsIosChainedSegments(muezzin.id) ? seg.ADHAN_IOS_MAX_SEGMENTS : 1;
    }
    return { alertCount: countSlotNativeAlerts(slot.key, prefs), iosFullAdhan, chainLength };
  });
  const plans = planPrayerNativeWindow(inputs);
  return slots.map((s, i) => ({ ...s, plan: plans[i] }));
}

async function rescheduleAllNativePrayers(
  slots: Array<{ slot: PrayerSlot; epoch: number; dateISO: string }>,
  prefs: ReturnType<typeof loadPrayerAlertPrefs>,
): Promise<void> {
  const anyAlert =
    prefs.alertsEnabled &&
    (prefs.preAlertEnabled || prefs.enterAlertEnabled || prefs.postReminderEnabled);

  if (!anyAlert) {
    await cancelAllPrayerNativeNotifications();
    await purgePastPrayerNativeNotifications();
    return;
  }

  await purgePastPrayerNativeNotifications();

  /** خطة موحّدة مع مقاطع أذان iOS: الأقرب أولًا ضمن حصة الصلاة (40 من 64). */
  const windowPlan = await planNativePrayerWindow(slots, prefs);
  const planned = windowPlan.filter((w) => w.plan.include);

  /** معرّفات مطلوبة لهذه النافذة — لا نمسح الكل أولًا */
  const keepIds = new Set<number>();
  const kinds: PrayerNotifIdKind[] = ["pre", "enter", "post", "iqamah"];
  for (const { slot, dateISO } of planned) {
    const pk = slot.key.toLowerCase();
    for (const kind of kinds) {
      keepIds.add(hashPrayerNotificationId(pk, dateISO, kind));
    }
  }
  await cancelPrayerNativeNotificationsExcept(keepIds);

  const expected: Array<{ prayerKey: string; atMs: number; kind: string }> = [];
  let budget = MAX_NATIVE_PRAYER_NOTIFS;

  for (const { slot, epoch, dateISO } of planned) {
    if (budget <= 0) break;
    const slotOpts = resolveSlotAlertOpts(slot.key, prefs);
    if (!slotOpts.prayerEnabled) continue;
    const scheduled = await schedulePrayerNativeNotifications({
      prayerKey: slot.key.toLowerCase(),
      prayerName: KEY_TO_ARABIC[slot.key] ?? slot.name,
      prayerTimeEpochMs: epoch,
      prayerMinutesOfDay: slot.minutes ?? undefined,
      dateISO,
      preAlertEnabled: slotOpts.preAlertEnabled,
      enterAlertEnabled: slotOpts.enterAlertEnabled,
      postReminderEnabled: slotOpts.postReminderEnabled,
      preAlertMinutes: slotOpts.preAlertMinutes,
      soundProfile: prefs.soundProfile,
    });
    budget -= scheduled.length;
    for (const s of scheduled) {
      expected.push({
        prayerKey: slot.key.toLowerCase(),
        atMs: s.atMs,
        kind: s.kind,
      });
    }
  }

  const verify = await verifyPendingAgainstExpected(expected);
  if (!verify.ok) {
    console.error("[prayer-alert] post-schedule drift", verify.diffs);
  }

  const pending = await listPendingPrayerNotifications();
  
  {
    const pendingList = await listPendingPrayerNotifications();
    let verified = 0;
    for (const e of expected) {
      const hit = pendingList.items.find((p) => {
        if (!p.at) return false;
        const at = Date.parse(p.at);
        return Number.isFinite(at) && Math.abs(at - e.atMs) <= 60_000;
      });
      if (hit) verified += 1;
    }
    if (expected.length > 0 && verified !== expected.length) {
      console.error("[prayer-alert] verification mismatch", {
        expected: expected.length,
        verified,
      });
    }
  }

console.info("[adhan/debug] pending after reschedule", {
    count: pending.count,
    items: pending.items.map((i) => ({
      id: i.id,
      kind: i.kind,
      friendlyKey: i.friendlyKey,
      at: i.at,
      sound: i.sound,
    })),
  });
}

/**
 * يُجدوِل إشعارات نظام التشغيل لكل الصلوات المفروضة القادمة، ويضبط مؤقّتات
 * الشريط/Live Activity للصلاة التالية فقط.
 */
export async function startPrayerAlertScheduler(
  payload: PrayerTimesPayload,
  opts?: { forceNativeReschedule?: boolean },
): Promise<void> {
  clearAllTimers();
  const tz = payload.timezone || getActivePrayerLocation().timeZone || "Asia/Kuwait";
  const todayISO = dateISOInZone(tz);
  if (_lastTimeZone && _lastTimeZone !== tz) {
    opts = { ...opts, forceNativeReschedule: true };
  }
  if (_lastDateISO && _lastDateISO !== todayISO) {
    opts = { ...opts, forceNativeReschedule: true };
  }
  _lastTimeZone = tz;
  _lastDateISO = todayISO;

  const slots = await listNativePrayerScheduleSlotsAhead(payload.prayers, tz);

  /* Widget/LA App Group snapshot — مستقل عن تفعيل التنبيهات ونجاح جدولة الإشعارات. */
  if (isNative && isIOS && payload.prayers.length) {
    void publishPrayerSnapshotForWidgets(payload);
  }

  if (!slots.length) return;

  const prefs = loadPrayerAlertPrefs();
  const anyAlert =
    prefs.alertsEnabled &&
    (prefs.preAlertEnabled || prefs.enterAlertEnabled || prefs.postReminderEnabled);
  const batchSig = !anyAlert
    ? "disabled"
    : [
        tz,
        todayISO,
        ...slots.map(({ slot, epoch }) => {
          const slotOpts = resolveSlotAlertOpts(slot.key, prefs);
          return buildPrayerScheduleSignature({
            prayerKey: slot.key,
            prayerTimeEpochMs: epoch,
            preAlertEnabled: slotOpts.preAlertEnabled,
            enterAlertEnabled: slotOpts.enterAlertEnabled,
            preAlertMinutes: slotOpts.preAlertMinutes,
            postReminderEnabled: slotOpts.postReminderEnabled,
            soundProfile: prefs.soundProfile,
            muezzinId: slotOpts.muezzinId,
            prayerEnabled: slotOpts.prayerEnabled,
            iosFullHandlesEnter: slotOpts.iosFullHandlesEnter,
          });
        }),
      ].join(";");

  if (opts?.forceNativeReschedule || batchSig !== _lastScheduleSig) {
    _lastScheduleSig = batchSig;
    try {
      // مسار أصلي واحد عبر المنسّق — القفل داخل coordinatePrayerNotifications
      const { coordinatePrayerNotifications } = await import("./prayer-notifications");
      const coord = await coordinatePrayerNotifications(payload, {
        reason: opts?.forceNativeReschedule ? "force" : "app_open_new_day",
        force: true,
        applyNative: async () => {
          await rescheduleAllNativePrayers(slots, prefs);
          return { scheduled: slots.length };
        },
      });
      const { savePrayerScheduleStatus } = await import("./prayer-schedule-status");
      savePrayerScheduleStatus({
        ok: coord.ok,
        atIso: new Date().toISOString(),
        prayerCount: slots.length,
        soundProfile: prefs.soundProfile,
        note: `${tz}|${todayISO}|${payload.method}|${coord.fingerprint}`,
      });
      if (!coord.ok && coord.error && coord.error !== "feature_disabled") {
        throw new Error(coord.error);
      }
    } catch (e) {
      const { savePrayerScheduleStatus } = await import("./prayer-schedule-status");
      savePrayerScheduleStatus({
        ok: false,
        atIso: new Date().toISOString(),
        prayerCount: slots.length,
        soundProfile: prefs.soundProfile,
        note: e instanceof Error ? e.message : "schedule_failed",
      });
      throw e;
    }
  }

  const enabledSlots = slots.filter((s) => resolveSlotAlertOpts(s.slot.key, prefs).prayerEnabled);
  const next = enabledSlots[0]?.slot ?? null;
  if (!next) {
    if (prefs.liveActivitiesEnabled && isNative && isIOS) {
      void presentPrayerLiveActivityAppLaunch(payload.city);
    }
    return;
  }

  const prayerEpoch = epochForSlot(next, tz);
  const prayerName = KEY_TO_ARABIC[next.key] ?? next.name;
  const prayerKey = next.key.toLowerCase();
  const following =
    enabledSlots.find((s) => s.epoch > prayerEpoch) ??
    null;
  const nextOpts = resolveSlotAlertOpts(next.key, prefs);
  const preMinutes = nextOpts.preAlertMinutes;
  const preAlertDelay = prayerEpoch - Date.now() - preMinutes * 60_000;
  const enterDelay = prayerEpoch - Date.now();

  const fireEvent: PrayerAlertEvent = {
    type: "pre-alert",
    prayerKey,
    prayerName,
    prayerTimeEpochMs: prayerEpoch,
    preAlertMinutes: preMinutes,
  };

  const preOn = nextOpts.preAlertEnabled;
  if (preAlertDelay <= 0 && enterDelay > 0) {
    if (preOn) dispatchAlert(fireEvent);
    void fireLiveActivityStart(next, prayerEpoch, payload.city);
  } else if (preAlertDelay > 0) {
    const t = setTimeout(() => {
      if (Date.now() >= prayerEpoch) return; // حارس: لا pre بعد دخول الوقت
      if (preOn) dispatchAlert(fireEvent);
      void fireLiveActivityStart(next, prayerEpoch, payload.city);
    }, preAlertDelay);
    _timers.push(t);
  }

  if (enterDelay > 0) {
    const t = setTimeout(() => {
      if (Date.now() - prayerEpoch > 5 * 60_000) return; // حارس: لا enter متأخر >5د
      void import("./adhan-diagnostics").then(({ adhanDiag }) => {
        adhanDiag("ADHAN_START", {
          source: "prayer-alert-enter-reschedule",
          prayerKey,
          prayerEpoch,
          note: "enter timer → startPrayerAlertScheduler (must not cancel adhanSegment)",
        });
      });
      dispatchAlert({ ...fireEvent, type: "entered" });
      void fireLiveActivityEnter(
        next,
        following ? { slot: following.slot, epoch: following.epoch } : null,
        payload.city,
      );
      _lastScheduleSig = null;
      void import("./prayer-times")
        .then(({ fetchPrayerTimes }) => fetchPrayerTimes())
        .then((p) => startPrayerAlertScheduler(p))
        .catch((err) => {
          try {
            console.warn("[prayer-alert] enter reschedule failed", err);
          } catch {
            /* ignore */
          }
        });
    }, enterDelay);
    _timers.push(t);
  }
}

export function stopPrayerAlertScheduler() {
  clearAllTimers();
  clearLiveActivityTimers();
}

/** للاختبارات — هل مؤقّتات LA منفصلة عن مؤقّتات الجدولة؟ */
export function __prayerAlertSchedulerTimerDebug() {
  return {
    scheduleTimers: _timers.length,
    liveActivityTimers: _liveActivityTimers.length,
  };
}

/** يُستدعى عند عودة التطبيق للواجهة (resume) — يُعيد فحص النافذة الحالية فوراً. */
export async function recheckPrayerAlertWindow(
  payload: PrayerTimesPayload | null,
  opts?: { force?: boolean },
) {
  if (!payload) return;
  if (opts?.force) invalidatePrayerNativeSchedule();
  await startPrayerAlertScheduler(payload, { forceNativeReschedule: opts?.force });
}
