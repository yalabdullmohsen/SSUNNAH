/**
 * محرك إشعارات محلية ذكية — أذكار، ذكر، ورد القرآن، مراجعة، الجمعة، السلسلة، الختمة.
 * يعتمد على Web Notifications API وجدولة داخل Service Worker عند التوفر،
 * مع fallback لمؤقّتات داخل الصفحة؛ وعلى الأصل Capacitor (تكرار يومي/أسبوعي).
 * كل عنصر محكوم بفئة في notifications/sections-config (أو dhikrPhraseReminder)،
 * ويُسقَط ما يقع داخل ساعات الهدوء (عدا الأذكار المؤقّتة بأوقات العبادة).
 * تنبيهات الصلاة ليست هنا — يملكها محرك الأذان بمواقيت حقيقية.
 */

import {
  loadNotifPrefs,
  sendLocalNotification,
  type NotifPrefs,
} from "./local-notifications";
import { loadSunnahNotificationPrefs, type QuietHoursPrefs } from "./sunnah-notifications/preferences";
import { isNative } from "./capacitor-utils";
import { getUserStreak } from "./user-streak";
import {
  QURAN_DAILY_REMINDER_BODY,
  QURAN_DAILY_REMINDER_HOUR,
  QURAN_DAILY_REMINDER_MINUTE,
  QURAN_DAILY_REMINDER_TAG,
  QURAN_DAILY_REMINDER_TITLE,
  QURAN_DAILY_REMINDER_URL,
} from "./quran-daily-reminder";
import {
  DHIKR_PHRASE_REMINDER_BODY,
  DHIKR_PHRASE_REMINDER_URL,
  DHIKR_PHRASE_SLOTS,
  dhikrPhraseTag,
} from "./dhikr-phrase-reminders";
import {
  notificationBodyWithoutBrand,
  notificationTitleWithoutBrand,
} from "./notifications/copy";
import { pickLocalizedNotification } from "./notifications/localization";
import { pickSectionMessage } from "./notifications/sections-config";

export interface SmartNotifScheduleItem {
  id: string;
  kind: "adhkar" | "dhikr" | "streak" | "khatmah" | "flashcards" | "quran" | "occasion";
  title: string;
  body: string;
  /** دقائق من منتصف الليل المحلي */
  minuteOfDay: number;
  tag: string;
  url?: string;
  /** يوم أسبوع ثابت (0=الأحد … 5=الجمعة) — للتذكيرات الأسبوعية */
  weekday?: number;
}

/** أنواع لا تُسقطها ساعات الهدوء: أوقات عبادة اختارها المستخدم صراحةً. */
const QUIET_HOURS_EXEMPT_KINDS: ReadonlySet<SmartNotifScheduleItem["kind"]> = new Set(["adhkar"]);

/** هل الدقيقة (من منتصف الليل) داخل ساعات الهدوء؟ */
export function isMinuteWithinQuietHours(quiet: QuietHoursPrefs, minuteOfDay: number): boolean {
  if (!quiet.enabled) return false;
  const hour = Math.floor(minuteOfDay / 60) % 24;
  const { startHour, endHour } = quiet;
  if (startHour === endHour) return true;
  if (startHour < endHour) return hour >= startHour && hour < endHour;
  return hour >= startHour || hour < endHour;
}

function loadQuietHoursSafe(): QuietHoursPrefs {
  try {
    return loadSunnahNotificationPrefs().quietHours;
  } catch {
    return { enabled: false, startHour: 22, endHour: 8 };
  }
}

export const FRIDAY_KAHF_MINUTE = 9 * 60;
/** سورة الكهف (18) — نفس صيغة mushafSurahHref دون استيراد فهرس السور الثقيل. */
export const FRIDAY_KAHF_URL = "/mushaf/18";

export const SW_SCHEDULE_LOCAL_MSG = "MAJALIS_SCHEDULE_LOCAL_NOTIFS";
const LAST_STREAK_WARN_KEY = "majalis_last_streak_warn_day";
const PAGE_TIMERS_KEY = "__majalis_smart_notif_timers__";

function todayKey(): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kuwait",
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function minuteOfDayToDate(minuteOfDay: number): Date {
  const d = new Date();
  d.setSeconds(0, 0);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(minuteOfDay);
  if (d.getTime() <= Date.now() + 5_000) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

/** بناء جدول اليوم من تفضيلات المستخدم + سياق السلسلة/الختمة */
export function buildDailySmartSchedule(opts?: {
  prefs?: NotifPrefs;
  includeStreakWarn?: boolean;
  streakWarnMinute?: number;
  khatmahBehind?: boolean;
  /** يتجاوز فحص «هل الجمعة؟» — للجدولة الأصلية الأسبوعية المتكررة */
  forceWeekly?: boolean;
  /** حقن ساعات الهدوء (اختبارات) — الافتراضي من التخزين */
  quietHours?: QuietHoursPrefs;
}): SmartNotifScheduleItem[] {
  const prefs = opts?.prefs ?? loadNotifPrefs();
  if (!prefs.enabled) return [];

  const items: SmartNotifScheduleItem[] = [];
  const reminderMinute = prefs.reminderHour * 60 + prefs.reminderMinute;

  // أذكار الصباح/المساء/النوم — تُفعَّل صراحة عبر adhkarReminder (لا طلب إذن تلقائي)
  const adhkarOn = prefs.sections?.adhkar?.enabled ?? prefs.adhkarReminder;
  if (adhkarOn) {
    items.push({
      id: "adhkar-morning",
      kind: "adhkar",
      title: "أذكار الصباح",
      body: "ورد الصباح جاهز.",
      minuteOfDay: 6 * 60 + 30,
      tag: "majalis-adhkar-morning",
      url: "/adhkar/morning",
    });
    items.push({
      id: "adhkar-evening",
      kind: "adhkar",
      title: "أذكار المساء",
      body: "ورد المساء جاهز.",
      minuteOfDay: 17 * 60 + 30,
      tag: "majalis-adhkar-evening",
      url: "/adhkar/evening",
    });
    items.push({
      id: "adhkar-sleep",
      kind: "adhkar",
      title: "أذكار النوم",
      body: "أذكار قبل النوم.",
      minuteOfDay: 21 * 60 + 30,
      tag: "majalis-adhkar-sleep",
      url: "/adhkar/sleep",
    });
    items.push({
      id: "adhkar-after-salah",
      kind: "adhkar",
      title: "أذكار بعد الصلاة",
      body: "سبّح واستغفر بعد صلاتك.",
      minuteOfDay: 12 * 60 + 30,
      tag: "majalis-adhkar-after-salah",
      url: "/adhkar/after-salah",
    });
  }

  if (prefs.dhikrPhraseReminder) {
    for (const slot of DHIKR_PHRASE_SLOTS) {
      items.push({
        id: `dhikr-${slot.id}`,
        kind: "dhikr",
        title: slot.phrase,
        body: DHIKR_PHRASE_REMINDER_BODY,
        minuteOfDay: slot.hour * 60,
        tag: dhikrPhraseTag(slot.id),
        url: DHIKR_PHRASE_REMINDER_URL,
      });
    }
  }

  const flashcardsOn = prefs.sections?.seekingKnowledge?.enabled ?? prefs.flashcardsReminder;
  if (flashcardsOn) {
    const cards = pickLocalizedNotification("flashcards", { count: "—" });
    items.push({
      id: "flashcards-daily",
      kind: "flashcards",
      title: cards.title,
      body: "بطاقات بانتظار المراجعة.",
      minuteOfDay: reminderMinute,
      tag: "majalis-flashcards-daily",
      url: "/flashcards",
    });
  }

  const quranOn = prefs.sections?.quran?.enabled ?? prefs.quranDailyReminder;
  if (quranOn) {
    const quranCopy = pickSectionMessage("quran");
    items.push({
      id: "quran-daily-wird",
      kind: "quran",
      title: quranCopy.title || QURAN_DAILY_REMINDER_TITLE,
      body: quranCopy.body || QURAN_DAILY_REMINDER_BODY,
      minuteOfDay: QURAN_DAILY_REMINDER_HOUR * 60 + QURAN_DAILY_REMINDER_MINUTE,
      tag: QURAN_DAILY_REMINDER_TAG,
      url: QURAN_DAILY_REMINDER_URL,
    });
  }

  const occasionsOn = prefs.sections?.fridayOccasions?.enabled ?? false;
  if (occasionsOn && (opts?.forceWeekly || minuteOfDayToDate(FRIDAY_KAHF_MINUTE).getDay() === 5)) {
    const kahf = pickSectionMessage("fridayOccasions");
    items.push({
      id: "friday-kahf",
      kind: "occasion",
      title: kahf.title || "سورة الكهف",
      body: kahf.body || "اقرأ سورة الكهف.",
      minuteOfDay: FRIDAY_KAHF_MINUTE,
      tag: "majalis-friday-kahf",
      url: FRIDAY_KAHF_URL,
      weekday: 5,
    });
  }

  // السلسلة والختمة تتبعان فئة القرآن — كانتا تُجدولان بلا أي مفتاح يوقفهما.
  if (quranOn && opts?.includeStreakWarn !== false) {
    const warnMin = opts?.streakWarnMinute ?? 21 * 60;
    const streak = pickLocalizedNotification("streak");
    items.push({
      id: "streak-risk",
      kind: "streak",
      title: streak.title,
      body: streak.body,
      minuteOfDay: warnMin,
      tag: "majalis-streak-risk",
      url: "/quran-hub",
    });
  }

  if (quranOn && opts?.khatmahBehind) {
    const khatmah = pickLocalizedNotification("khatmah");
    items.push({
      id: "khatmah-behind",
      kind: "khatmah",
      title: khatmah.title,
      body: khatmah.body,
      minuteOfDay: 20 * 60,
      tag: "majalis-khatmah-behind",
      url: "/daily-wird",
    });
  }

  const quiet = opts?.quietHours ?? loadQuietHoursSafe();
  return items
    .filter((it) => QUIET_HOURS_EXEMPT_KINDS.has(it.kind) || !isMinuteWithinQuietHours(quiet, it.minuteOfDay))
    .sort((a, b) => a.minuteOfDay - b.minuteOfDay);
}

/** إرسال الجدول إلى Service Worker إن وُجد */
export async function pushScheduleToServiceWorker(
  items: SmartNotifScheduleItem[],
): Promise<boolean> {
  try {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return false;
    const reg = await navigator.serviceWorker.ready;
    const payload = items.map((it) => {
      const fireAt = minuteOfDayToDate(it.minuteOfDay).getTime();
      return {
        id: it.id,
        title: notificationTitleWithoutBrand(it.title),
        body: notificationBodyWithoutBrand(it.body),
        tag: it.tag,
        url: it.url || "/",
        fireAt,
        delayMs: Math.max(0, fireAt - Date.now()),
      };
    });
    reg.active?.postMessage({ type: SW_SCHEDULE_LOCAL_MSG, items: payload });
    return Boolean(reg.active);
  } catch {
    return false;
  }
}

/** جدولة داخل الصفحة كاحتياطي إن تعذّر الـ SW */
export function scheduleInPageFallbacks(items: SmartNotifScheduleItem[]): number {
  try {
    if (typeof window === "undefined") return 0;
    const w = window as unknown as Record<string, unknown>;
    const prev = (w[PAGE_TIMERS_KEY] as number[] | undefined) || [];
    for (const t of prev) window.clearTimeout(t);
    const next: number[] = [];
    for (const it of items) {
      const fireAt = minuteOfDayToDate(it.minuteOfDay).getTime();
      const delay = fireAt - Date.now();
      if (delay < 0 || delay > 86_400_000) continue;
      const tid = window.setTimeout(() => {
        sendLocalNotification(it.title, { body: it.body, tag: it.tag, url: it.url });
      }, delay);
      next.push(tid);
    }
    w[PAGE_TIMERS_KEY] = next;
    return next.length;
  } catch {
    return 0;
  }
}

/** فحص فوري: هل المستخدم على وشك فقدان السلسلة؟ */
export function isStreakAtRisk(now = new Date()): boolean {
  try {
    const streak = getUserStreak();
    if (streak.currentStreak <= 0) return false;
    const today = todayKey();
    if (streak.lastActiveDate === today) return false;
    return now.getHours() >= 18;
  } catch {
    return false;
  }
}

/** إطلاق تحذير سلسلة مرة واحدة يوميًا عند الحاجة */
export function maybeWarnStreakLoss(): boolean {
  try {
    const prefs = loadNotifPrefs();
    if (!prefs.enabled) return false;
    if (!(prefs.sections?.quran?.enabled ?? prefs.quranDailyReminder)) return false;
    if (isMinuteWithinQuietHours(loadQuietHoursSafe(), new Date().getHours() * 60)) return false;
    if (!isStreakAtRisk()) return false;
    const day = todayKey();
    if (localStorage.getItem(LAST_STREAK_WARN_KEY) === day) return false;
    const streak = pickLocalizedNotification("streak");
    sendLocalNotification(streak.title, {
      body: streak.body,
      tag: "majalis-streak-risk",
      url: "/quran-hub",
    });
    localStorage.setItem(LAST_STREAK_WARN_KEY, day);
    return true;
  } catch {
    return false;
  }
}

/** مزامنة الجدول اليومي مع SW + fallback الصفحة (الويب) أو Capacitor (الأصل). */
export async function syncSmartLocalNotifications(opts?: {
  khatmahBehind?: boolean;
}): Promise<{ scheduled: number; viaSw: boolean }> {
  try {
    const prefs = loadNotifPrefs();
    if (!prefs.enabled) {
      // تعطيل تفضيلات التذكيرات العامة يُلغي ورد القرآن فقط —
      // تنبيهات الصلاة لها مخزن تفضيلات منفصل (prayer-alert-preferences).
      if (isNative) {
        const { cancelNativeQuranReminder } = await import("./quran-daily-reminder");
        await cancelNativeQuranReminder();
        const { cancelNativeDhikrPhraseReminders } = await import("./dhikr-phrase-reminders");
        await cancelNativeDhikrPhraseReminders();
        const { syncNativeDailyReminders } = await import("./notifications/native-daily-reminders");
        await syncNativeDailyReminders([]);
      }
      return { scheduled: 0, viaSw: false };
    }

    // على الأصل: لا SW — ورد القرآن والذكر عبر Capacitor؛ باقي التذكيرات وهي الصفحة مفتوحة فقط.
    if (isNative) {
      const { ensureQuranDailyReminderScheduled } = await import("./quran-daily-reminder");
      await ensureQuranDailyReminderScheduled();
      const { ensureDhikrPhraseRemindersScheduled } = await import("./dhikr-phrase-reminders");
      const dhikr = await ensureDhikrPhraseRemindersScheduled();
      // الأذكار والمراجعة والجمعة: كانت مفاتيحها على iOS لا تجدول شيئًا (مسار الويب فقط).
      const { syncNativeDailyReminders, NATIVE_DAILY_REMINDER_KINDS } = await import(
        "./notifications/native-daily-reminders"
      );
      const nativeItems = buildDailySmartSchedule({
        prefs,
        includeStreakWarn: false,
        forceWeekly: true,
      }).filter((it) => NATIVE_DAILY_REMINDER_KINDS.has(it.kind));
      const extra = await syncNativeDailyReminders(nativeItems);
      maybeWarnStreakLoss();
      return {
        scheduled:
          (prefs.quranDailyReminder ? 1 : 0) + (dhikr.ok ? dhikr.scheduled : 0) + extra.scheduled,
        viaSw: false,
      };
    }

    const items = buildDailySmartSchedule({
      prefs,
      khatmahBehind: opts?.khatmahBehind,
    });
    const viaSw = await pushScheduleToServiceWorker(items);
    if (!viaSw) scheduleInPageFallbacks(items);
    maybeWarnStreakLoss();
    return { scheduled: items.length, viaSw };
  } catch {
    return { scheduled: 0, viaSw: false };
  }
}
