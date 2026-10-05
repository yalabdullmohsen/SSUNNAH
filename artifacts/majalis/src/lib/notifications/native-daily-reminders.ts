/**
 * جدولة أصلية (Capacitor) لتذكيرات المحتوى المتكررة: الأذكار، المراجعة، الجمعة.
 *
 * قبل هذا الملف كانت مفاتيح «الأذكار» و«طلب العلم» في الإعدادات تجدول على الويب فقط
 * (Service Worker)، أما على iOS فلا شيء — أي مفاتيح بلا أثر على المنصة الأساسية.
 * ورد القرآن (9301) والذكر (9401–9407) لهما وحدتاهما؛ هنا النطاق 9601–9629 فقط،
 * ولا يبدأ أي `kind` بـ "prayer-" كي لا يمسّه تنظيف إشعارات الصلاة.
 */

import { isNative } from "@/lib/capacitor-utils";
import type { SmartNotifScheduleItem } from "@/lib/smart-local-notifications";

export const NATIVE_DAILY_REMINDER_ID_BASE = 9601;
export const NATIVE_DAILY_REMINDER_SLOTS = 29;

/** الأنواع التي تُجدوَل أصليًا هنا (البقية لها وحدات مستقلة أو شرطية داخل الصفحة). */
export const NATIVE_DAILY_REMINDER_KINDS: ReadonlySet<SmartNotifScheduleItem["kind"]> = new Set([
  "adhkar",
  "flashcards",
  "occasion",
]);

/** إزاحات ثابتة للعناصر المعروفة — لا تصادم بينها. */
const KNOWN_OFFSETS: Readonly<Record<string, number>> = {
  "adhkar-morning": 0,
  "adhkar-evening": 1,
  "adhkar-sleep": 2,
  "adhkar-after-salah": 3,
  "flashcards-daily": 4,
  "friday-kahf": 5,
};
const KNOWN_SLOTS = 6;

/** معرّف ثابت لكل عنصر حسب معرّفه المنطقي — لا تكرار بين الجدولات. */
export function nativeDailyReminderId(itemId: string): number {
  const known = KNOWN_OFFSETS[itemId];
  if (known !== undefined) return NATIVE_DAILY_REMINDER_ID_BASE + known;
  let h = 0;
  for (let i = 0; i < itemId.length; i++) h = (h * 31 + itemId.charCodeAt(i)) | 0;
  return (
    NATIVE_DAILY_REMINDER_ID_BASE +
    KNOWN_SLOTS +
    (Math.abs(h) % (NATIVE_DAILY_REMINDER_SLOTS - KNOWN_SLOTS))
  );
}

export function allNativeDailyReminderIds(): Array<{ id: number }> {
  return Array.from({ length: NATIVE_DAILY_REMINDER_SLOTS }, (_, i) => ({
    id: NATIVE_DAILY_REMINDER_ID_BASE + i,
  }));
}

/** تحويل يوم JS (0=الأحد) إلى يوم Capacitor (1=الأحد … 7=السبت). */
export function capacitorWeekday(jsDay: number): number {
  return (((jsDay % 7) + 7) % 7) + 1;
}

/**
 * يلغي النطاق كاملًا ثم يجدول العناصر المعطاة (قائمة فارغة = إلغاء فقط).
 * لا يطلب إذنًا — يكتفي بالفحص؛ الطلب يتم من فعل صريح في الإعدادات.
 */
export async function syncNativeDailyReminders(
  items: readonly SmartNotifScheduleItem[],
): Promise<{ scheduled: number }> {
  if (!isNative) return { scheduled: 0 };
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({ notifications: allNativeDailyReminderIds() });
    const eligible = items.filter((it) => NATIVE_DAILY_REMINDER_KINDS.has(it.kind));
    if (eligible.length === 0) return { scheduled: 0 };
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") return { scheduled: 0 };
    const { CHANNEL_GENERAL, DEFAULT_ALERT_SOUND, ensureNotificationChannels } = await import(
      "@/lib/notifications/channels"
    );
    const { notificationBodyWithoutBrand, notificationTitleWithoutBrand } = await import(
      "@/lib/notifications/copy"
    );
    await ensureNotificationChannels();
    await LocalNotifications.schedule({
      notifications: eligible.map((it) => ({
        id: nativeDailyReminderId(it.id),
        title: notificationTitleWithoutBrand(it.title),
        body: notificationBodyWithoutBrand(it.body),
        schedule: {
          on: {
            ...(typeof it.weekday === "number" ? { weekday: capacitorWeekday(it.weekday) } : {}),
            hour: Math.floor(it.minuteOfDay / 60),
            minute: it.minuteOfDay % 60,
          },
          repeats: true,
          allowWhileIdle: true,
        },
        sound: DEFAULT_ALERT_SOUND,
        channelId: CHANNEL_GENERAL,
        extra: { url: it.url, kind: `smart-${it.kind}`, itemId: it.id },
      })),
    });
    return { scheduled: eligible.length };
  } catch (e) {
    console.warn("[notifications/native-daily] sync failed", e);
    return { scheduled: 0 };
  }
}
