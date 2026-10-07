/**
 * إقلاع إشعارات Capacitor: قنوات، مستمعو النقر (محلي + remote)، إعادة جدولة الورد.
 * Remote Push يمر عبر maybeRegisterRemotePush → pushNotifications.ts فقط.
 */
import { isNative } from "@/lib/capacitor-utils";
import { ensureNotificationChannels } from "@/lib/notifications/channels";
import { maybeRegisterRemotePush } from "@/lib/notifications/apns-scaffold";
import { ensureQuranDailyReminderScheduled } from "@/lib/quran-daily-reminder";

const BOOT_FLAG = "__majalis_native_notif_booted__";
let _listenersAttached = false;

function navigateFromNotificationExtra(extra: unknown): void {
  try {
    const url =
      extra && typeof extra === "object" && "url" in extra
        ? (extra as { url?: unknown }).url
        : undefined;
    if (typeof url !== "string" || !url.startsWith("/") || url.startsWith("//")) return;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (current === url) return;
    window.history.pushState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
    if (import.meta.env.DEV) console.info("[notifications] deep-link from notification →", url);
  } catch (e) {
    console.warn("[notifications] deep-link failed", e);
  }
}

type DeliveredNotification = {
  id?: number | string;
  title?: string;
  body?: string;
  extra?: unknown;
};

/**
 * يسجّل الإشعار الأصلي في صندوق الإشعارات (عند الاستلام في الواجهة أو عند النقر)
 * بمعرّف ثابت (id + اليوم) فلا يتكرر — كان الصندوق فارغًا دائمًا لأن لا أحد يسجّل فيه.
 */
function recordNativeNotification(n: DeliveredNotification | undefined): void {
  if (!n?.title) return;
  const extra = (n.extra && typeof n.extra === "object" ? n.extra : {}) as {
    url?: unknown;
    kind?: unknown;
  };
  if (extra.kind === "adhan-test" || extra.kind === "adhan-seq-test") return;
  const url = typeof extra.url === "string" && extra.url.startsWith("/") && !extra.url.startsWith("//")
    ? extra.url
    : undefined;
  const day = new Date().toISOString().slice(0, 10);
  void import("@/lib/notification-history").then(({ addNotifRecord }) => {
    addNotifRecord(
      n.title!,
      n.body,
      typeof extra.kind === "string" ? extra.kind : undefined,
      url,
      `native-${String(n.id ?? n.title)}-${day}`,
    );
  });
}

export async function attachLocalNotificationListeners(): Promise<void> {
  if (!isNative || _listenersAttached) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.addListener("localNotificationActionPerformed", (event) => {
      if (import.meta.env.DEV) {
        console.info(
          "[notifications] actionPerformed",
          event.actionId,
          event.notification?.id,
          event.notification?.extra,
        );
      }
      // سلسلة مقاطع الأذان: ألغِ البقية واستأنف داخليًا قبل أي deep-link
      void import("@/lib/adhan-smart-cancel").then(({ onAdhanSegmentNotificationInteraction }) =>
        onAdhanSegmentNotificationInteraction(event.notification?.extra),
      );
      recordNativeNotification(event.notification);
      if (event.actionId === "stop-sound" || event.actionId === "snooze-5") {
        void import("@/lib/adhan-notification-actions").then(({ handleAdhanAction }) =>
          handleAdhanAction(event.actionId, event.notification ?? {}),
        );
        return;
      }
      // زرّا «تم» و«بعد 15 دقيقة» لتذكير الأذكار لا يفتحان التطبيق على صفحة.
      if (event.actionId === "done" || event.actionId === "snooze") {
        void import("@/lib/adhkar-reminders").then(({ handleAdhkarAction }) =>
          handleAdhkarAction(event.actionId, event.notification ?? {}),
        );
        return;
      }
      navigateFromNotificationExtra(event.notification?.extra);
    });
    await LocalNotifications.addListener("localNotificationReceived", (notification) => {
      recordNativeNotification(notification);
      if (import.meta.env.DEV) {
        console.info(
          "[notifications] received (foreground)",
          notification.id,
          notification.title,
        );
      }
    });
    void import("@/lib/adhan-notification-actions").then(({ registerAdhanActionTypes }) =>
      registerAdhanActionTypes(LocalNotifications).catch(() => {}),
    );
    _listenersAttached = true;
    void import("@/lib/adhkar-reminders").then(({ registerAdhkarActionTypes }) =>
      registerAdhkarActionTypes(LocalNotifications),
    ).catch(() => {});
    if (import.meta.env.DEV) console.info("[notifications] local listeners attached");
    void import("@/lib/adhan-smart-cancel").then(({ attachAdhanSmartCancelListeners }) =>
      attachAdhanSmartCancelListeners(),
    );
  } catch (e) {
    console.warn("[notifications] attach local listeners failed", e);
  }
}

/** يُستدعى مرة واحدة من App — آمن للتكرار. */
export async function bootstrapNativeNotifications(): Promise<void> {
  if (typeof window === "undefined") return;
  const w = window as unknown as Record<string, unknown>;
  if (w[BOOT_FLAG]) return;
  w[BOOT_FLAG] = true;

  try {
    if (isNative) {
      await ensureNotificationChannels();
      await attachLocalNotificationListeners();
      // Remote push registration (APNs/FCM) — no-op when disabled / non-native.
      await maybeRegisterRemotePush();
      const pending = await import("@capacitor/local-notifications")
        .then(({ LocalNotifications }) => LocalNotifications.getPending())
        .catch(() => null);
      if (pending && import.meta.env.DEV) {
        console.info(
          "[notifications] pending count on boot:",
          pending.notifications?.length ?? 0,
        );
      }
    }
    await ensureQuranDailyReminderScheduled();
    const { ensureDhikrPhraseRemindersScheduled } = await import("@/lib/dhikr-phrase-reminders");
    await ensureDhikrPhraseRemindersScheduled();
    // ترحيل سياسات سُنّة فقط — بلا طلب إذن نظام عند الإقلاع
    const { bootstrapSunnahNotifications } = await import("@/lib/sunnah-notifications");
    bootstrapSunnahNotifications();
  } catch (e) {
    console.warn("[notifications] bootstrap failed", e);
  }
}
