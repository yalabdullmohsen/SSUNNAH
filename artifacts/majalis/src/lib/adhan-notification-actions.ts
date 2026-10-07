/**
 * أزرار إشعار الأذان (Notification Category): «إيقاف الصوت» و«ذكّرني بعد 5 دقائق».
 * أزرار الأذكار («قرأتها» + «ذكّرني بعد 5 دقائق») في adhkar-reminders.
 * لا تُفتح الصفحة عند الضغط على زر؛ الضغط على الإشعار نفسه يفتح التطبيق كما كان.
 */

import type { PrayerKey } from "@/lib/adhan-preferences";

export const ADHAN_ACTION_TYPE = "ADHAN_ALERT";
export const ADHAN_ACTION_STOP = "stop-sound";
export const ADHAN_ACTION_SNOOZE = "snooze-5";
export const ADHAN_SNOOZE_MS = 5 * 60_000;
/** معرّف ثابت لتذكير التأجيل — يمنع تراكم التأجيلات المتكررة. نطاق بعيد عن معرّفات الصلاة (710k+) والأذكار. */
export const ADHAN_SNOOZE_ID = 9_998;

type LN = typeof import("@capacitor/local-notifications").LocalNotifications;

export async function registerAdhanActionTypes(ln?: LN): Promise<void> {
  const LocalNotifications = ln ?? (await import("@capacitor/local-notifications")).LocalNotifications;
  await LocalNotifications.registerActionTypes({
    types: [
      {
        id: ADHAN_ACTION_TYPE,
        actions: [
          { id: ADHAN_ACTION_STOP, title: "إيقاف الصوت" },
          { id: ADHAN_ACTION_SNOOZE, title: "ذكّرني بعد 5 دقائق" },
        ],
      },
    ],
  });
}

export function isAdhanNotificationExtra(extra: unknown): boolean {
  const e = (extra ?? {}) as { kind?: unknown; adhanSegment?: unknown };
  return e.adhanSegment === true || e.kind === "prayer-enter" || e.kind === "prayer-iqamah";
}

/** يعالج زرّي إشعار الأذان؛ يعيد true إن عولج (فلا يُفتح الرابط). */
export async function handleAdhanAction(
  actionId: string,
  n: { title?: string; body?: string; extra?: unknown },
): Promise<boolean> {
  if (!isAdhanNotificationExtra(n.extra)) return false;
  const extra = (n.extra ?? {}) as { prayerKey?: unknown };
  const prayerKey = typeof extra.prayerKey === "string" ? (extra.prayerKey as PrayerKey) : undefined;

  if (actionId === ADHAN_ACTION_STOP) {
    // أوقف الصوت الجاري داخل التطبيق وألغِ بقية مقاطع السلسلة المجدولة لهذه الصلاة.
    try {
      const { stopAthan } = await import("@/lib/athan-playback-manager");
      stopAthan("user");
    } catch {
      /* لا مشغّل نشط */
    }
    try {
      const { cancelAdhanNotificationChain } = await import("@/lib/adhan-smart-cancel");
      await cancelAdhanNotificationChain({ resumeInternal: false, prayerKey });
    } catch {
      /* لا سلسلة */
    }
    return true;
  }

  if (actionId === ADHAN_ACTION_SNOOZE) {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.schedule({
      notifications: [
        {
          id: ADHAN_SNOOZE_ID,
          title: n.title ?? "تذكير بالصلاة",
          body: n.body ?? "",
          schedule: { at: new Date(Date.now() + ADHAN_SNOOZE_MS), allowWhileIdle: true },
          sound: "default",
          interruptionLevel: "active",
          extra: { url: "/prayer-times", kind: "prayer-snooze", prayerKey },
        },
      ],
    });
    return true;
  }
  return false;
}
