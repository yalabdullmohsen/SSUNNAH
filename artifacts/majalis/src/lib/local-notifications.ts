// Web Notifications API wrapper — إشعارات محلية في المتصفح.
// على Capacitor الأصلي: إذن العرض يُدار عبر @capacitor/local-notifications
// (انظر prayer-local-notifications.ts) — لا تعتمد على window.Notification هناك.

import { isNative } from "@/lib/capacitor-utils";
import {
  notificationBodyWithoutBrand,
  notificationTitleWithoutBrand,
} from "@/lib/notifications/copy";
import { SEASONAL_NOTIFICATION_POOL } from "@/lib/notifications/localization";
import { loadSunnahNotificationPrefs } from "@/lib/sunnah-notifications/preferences";
import { isWithinQuietHours } from "@/lib/sunnah-notifications/quiet-hours";
import {
  defaultSectionsPrefs,
  type NotifSectionId,
  type NotifSectionPrefs,
} from "@/lib/notifications/sections-config";

const STORAGE_KEY = "majalis_notif_prefs_v1";

export type NotifPrefs = {
  /** المفتاح العام لتذكيرات المحتوى (لا يشمل الصلاة — لها مخزنها ومحركها). */
  enabled: boolean;
  flashcardsReminder: boolean;   // مراجعة البطاقات المستحقة (فئة seekingKnowledge)
  /** تذكير ورد القرآن اليومي الساعة 5 مساءً (فئة quran). */
  quranDailyReminder: boolean;
  /** تذكير أذكار الصباح/المساء — يُفعَّل من الإعدادات فقط (لا طلب إذن عند الإطلاق). */
  adhkarReminder: boolean;
  /** تذكيرات بعبارات الذكر (سبحان الله، الحمد لله، …) طوال ساعات اليقظة. */
  dhikrPhraseReminder: boolean;
  reminderHour: number;          // ساعة تذكير المراجعة (0-23)
  reminderMinute: number;
  /** فئات التذكيرات الموحّدة — مصدر الحقيقة للتفعيل */
  sections: Record<NotifSectionId, NotifSectionPrefs>;
};

/** مفاتيح قديمة كانت تُخزَّن ولا يقرؤها أي مُجدوِل — تُحذف عند أول حفظ. */
const DEAD_STORED_KEYS = ["prayerReminder", "resumeReminder", "prayerModes"] as const;
/** أقسام قديمة أُزيلت؛ تفعيل «الصلاة على النبي/الاستغفار» يُرحَّل إلى تذكير الذكر (يشملهما). */
const LEGACY_DHIKR_SECTIONS = ["salawat", "istighfar"] as const;

const DEFAULTS: NotifPrefs = {
  enabled: false,
  flashcardsReminder: false,
  quranDailyReminder: false,
  adhkarReminder: false,
  dhikrPhraseReminder: false,
  reminderHour: 8,
  reminderMinute: 0,
  sections: defaultSectionsPrefs(),
};

type LegacyFlags = Pick<NotifPrefs, "quranDailyReminder" | "adhkarReminder" | "flashcardsReminder">;

function mergeSectionPrefs(
  incoming: Partial<Record<string, Partial<NotifSectionPrefs>>> | undefined,
  legacy: LegacyFlags,
): Record<NotifSectionId, NotifSectionPrefs> {
  const base = defaultSectionsPrefs();
  if (incoming) {
    for (const id of Object.keys(base) as NotifSectionId[]) {
      const patch = incoming[id];
      // نأخذ التفعيل فقط — حقول العدد/الفترة/الأيام القديمة لا يقرؤها أحد.
      if (patch && typeof patch.enabled === "boolean") base[id] = { enabled: patch.enabled };
    }
    return base;
  }
  // ترحيل من الأعلام القديمة عند غياب sections
  base.quran.enabled = legacy.quranDailyReminder;
  base.adhkar.enabled = legacy.adhkarReminder;
  base.seekingKnowledge.enabled = legacy.flashcardsReminder;
  return base;
}

/** مزامنة الأعلام القديمة مع الفئات (للتوافق مع مسارات الجدولة القائمة). */
export function syncLegacyFlagsFromSections(prefs: NotifPrefs): NotifPrefs {
  const s = prefs.sections;
  return {
    ...prefs,
    quranDailyReminder: s.quran?.enabled ?? prefs.quranDailyReminder,
    adhkarReminder: s.adhkar?.enabled ?? prefs.adhkarReminder,
    flashcardsReminder: s.seekingKnowledge?.enabled ?? prefs.flashcardsReminder,
  };
}

function freshDefaults(): NotifPrefs {
  return { ...DEFAULTS, sections: defaultSectionsPrefs() };
}

export function loadNotifPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshDefaults();
    const parsed = JSON.parse(raw) as Partial<NotifPrefs> & Record<string, unknown>;
    const legacySections = (parsed.sections ?? {}) as Record<string, { enabled?: unknown } | undefined>;
    const legacyDhikrOn = LEGACY_DHIKR_SECTIONS.some((id) => legacySections[id]?.enabled === true);
    const merged: NotifPrefs = {
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : DEFAULTS.enabled,
      flashcardsReminder: parsed.flashcardsReminder ?? DEFAULTS.flashcardsReminder,
      quranDailyReminder: parsed.quranDailyReminder ?? DEFAULTS.quranDailyReminder,
      adhkarReminder: parsed.adhkarReminder ?? DEFAULTS.adhkarReminder,
      dhikrPhraseReminder: Boolean(parsed.dhikrPhraseReminder ?? DEFAULTS.dhikrPhraseReminder) || legacyDhikrOn,
      reminderHour: typeof parsed.reminderHour === "number" ? parsed.reminderHour : DEFAULTS.reminderHour,
      reminderMinute: typeof parsed.reminderMinute === "number" ? parsed.reminderMinute : DEFAULTS.reminderMinute,
      sections: mergeSectionPrefs(parsed.sections, {
        quranDailyReminder: parsed.quranDailyReminder ?? DEFAULTS.quranDailyReminder,
        adhkarReminder: parsed.adhkarReminder ?? DEFAULTS.adhkarReminder,
        flashcardsReminder: parsed.flashcardsReminder ?? DEFAULTS.flashcardsReminder,
      }),
    };
    return syncLegacyFlagsFromSections(merged);
  } catch {
    return freshDefaults();
  }
}

/** هل في التخزين قيم قديمة ميتة تحتاج ترحيلًا؟ */
export function notifPrefsNeedMigration(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Record<string, unknown> & { sections?: Record<string, unknown> };
    if (DEAD_STORED_KEYS.some((k) => k in parsed)) return true;
    const sections = parsed.sections ?? {};
    return Object.keys(sections).some((k) => !(k in DEFAULTS.sections)) ||
      Object.values(sections).some((v) => v && typeof v === "object" && Object.keys(v).some((f) => f !== "enabled"));
  } catch {
    return false;
  }
}

/** ترحيل مرة واحدة: يعيد كتابة التخزين بالشكل الموحّد ويحذف المفاتيح الميتة. */
export function migrateNotifPrefsStorage(): boolean {
  if (!notifPrefsNeedMigration()) return false;
  saveNotifPrefs(loadNotifPrefs());
  return true;
}

export function saveNotifPrefs(prefs: NotifPrefs): void {
  // ادفع الأعلام القديمة → الفئات (مسارات Adhan/Quran التي تعدّل العلم فقط)
  // ثم أعد مزامنة الأعلام من الفئات لضمان اتساق واحد عند القراءة.
  const baseSections = prefs.sections ?? defaultSectionsPrefs();
  const sections: Record<NotifSectionId, NotifSectionPrefs> = {
    quran: { enabled: prefs.quranDailyReminder },
    adhkar: { enabled: prefs.adhkarReminder },
    seekingKnowledge: { enabled: prefs.flashcardsReminder },
    fridayOccasions: { enabled: Boolean(baseSections.fridayOccasions?.enabled) },
  };
  const synced = syncLegacyFlagsFromSections({ ...prefs, sections });
  const next: NotifPrefs = {
    enabled: synced.enabled,
    flashcardsReminder: synced.flashcardsReminder,
    quranDailyReminder: synced.quranDailyReminder,
    adhkarReminder: synced.adhkarReminder,
    dhikrPhraseReminder: synced.dhikrPhraseReminder,
    reminderHour: synced.reminderHour,
    reminderMinute: synced.reminderMinute,
    sections: synced.sections,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  void import("@/lib/native-storage").then(({ storageSetSync }) => {
    storageSetSync(STORAGE_KEY, JSON.stringify(next));
  });
}

export function updateNotifSection(
  sectionId: NotifSectionId,
  patch: Partial<NotifSectionPrefs>,
): NotifPrefs {
  const current = loadNotifPrefs();
  const section: NotifSectionPrefs = { ...current.sections[sectionId], ...patch };
  const next: NotifPrefs = {
    ...current,
    sections: { ...current.sections, [sectionId]: section },
  };
  // احفظ التفعيل في الأعلام القديمة قبل save (وإلا سيُعاد من العلم القديم)
  if (sectionId === "quran") next.quranDailyReminder = section.enabled;
  if (sectionId === "adhkar") next.adhkarReminder = section.enabled;
  if (sectionId === "seekingKnowledge") next.flashcardsReminder = section.enabled;
  saveNotifPrefs(next);
  return loadNotifPrefs();
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (isNative) {
    const { requestNotificationPermission, getNotificationPermissionStatus } = await import(
      "@/lib/prayer-local-notifications"
    );
    const granted = await requestNotificationPermission();
    if (granted) return "granted";
    const status = await getNotificationPermissionStatus();
    if (status === "denied") return "denied";
    if (status === "unsupported") return "denied";
    return "default";
  }
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

/** حالة متزامنة للويب فقط — على الأصل استخدم getNotificationPermissionStatus(). */
export function getPermissionStatus(): NotificationPermission | "unsupported" {
  if (isNative) {
    // WKWebView قد يعرض Notification.permission بلا صلة بإذن Capacitor.
    return "default";
  }
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export type LocalNotificationOptions = {
  body?: string;
  icon?: string;
  tag?: string;
  /** مسار داخلي يُفتح عند النقر (يُنقّى: يجب أن يبدأ بـ / ولا يبدأ بـ //). */
  url?: string;
};

/** ينقّي مسار الربط العميق — لا روابط خارجية من الإشعارات. */
export function sanitizeNotificationUrl(url: unknown): string | undefined {
  if (typeof url !== "string" || !url.startsWith("/") || url.startsWith("//")) return undefined;
  return url;
}

/** تنقّل داخلي من نقرة إشعار (ويب/أصلي) — عبر History API ليلتقطه wouter. */
export function navigateToNotificationUrl(url: unknown): void {
  const target = sanitizeNotificationUrl(url);
  if (!target || typeof window === "undefined") return;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (current === target) return;
  window.history.pushState({}, "", target);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function recordDelivered(title: string, options?: LocalNotificationOptions): void {
  void import("@/lib/notification-history").then(({ addNotifRecord }) => {
    addNotifRecord(title, options?.body, options?.tag, sanitizeNotificationUrl(options?.url));
  });
}

export function sendLocalNotification(title: string, options?: LocalNotificationOptions): void {
  const url = sanitizeNotificationUrl(options?.url);
  if (isNative) {
    // Web Notification API غير موثوق داخل WKWebView — جدول عبر Capacitor.
    void (async () => {
      try {
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        const {
          ensureNotificationChannels,
          CHANNEL_GENERAL,
          DEFAULT_ALERT_SOUND,
        } = await import("@/lib/notifications/channels");
        await ensureNotificationChannels();
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== "granted") return;
        const id = 99800 + (Math.abs(hashTag(options?.tag ?? title)) % 90);
        await LocalNotifications.cancel({ notifications: [{ id }] });
        await LocalNotifications.schedule({
          notifications: [
            {
              id,
              title: notificationTitleWithoutBrand(title),
              body: notificationBodyWithoutBrand(options?.body ?? ""),
              schedule: { at: new Date(Date.now() + 800), allowWhileIdle: true },
              sound: DEFAULT_ALERT_SOUND,
              channelId: CHANNEL_GENERAL,
              extra: { kind: "local-web-bridge", tag: options?.tag, url },
            },
          ],
        });
        recordDelivered(title, options);
      } catch {
        /* ignore */
      }
    })();
    return;
  }
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    const n = new Notification(notificationTitleWithoutBrand(title), {
      body: notificationBodyWithoutBrand(options?.body ?? "") || undefined,
      icon: options?.icon ?? "/logo.png",
      tag: options?.tag,
      dir: "rtl",
      lang: "ar",
    });
    n.onclick = () => {
      try {
        window.focus();
      } catch {
        /* ignore */
      }
      navigateToNotificationUrl(url);
      n.close();
    };
    recordDelivered(title, options);
  } catch {
    // Safari may throw if page is not focused
  }
}

function hashTag(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

// ── جدولة التذكيرات عند تحميل الصفحة ──────────────────────────────────────

const SCHED_KEY = "majalis_notif_sched_v1";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function alreadySentToday(tag: string): boolean {
  try {
    const raw = localStorage.getItem(SCHED_KEY);
    const sent: Record<string, string> = raw ? JSON.parse(raw) : {};
    return sent[tag] === todayKey();
  } catch {
    return false;
  }
}

function markSentToday(tag: string): void {
  try {
    const raw = localStorage.getItem(SCHED_KEY);
    const sent: Record<string, string> = raw ? JSON.parse(raw) : {};
    sent[tag] = todayKey();
    localStorage.setItem(SCHED_KEY, JSON.stringify(sent));
  } catch { /* localStorage unavailable */ }
}

// ── تذكير العبادات الإسلامية حسب التقويم الهجري ────────────────────────────

type IslamicRemindersPool = { icon: string; title: string; body: string }[];

function getIslamicReminders(): IslamicRemindersPool {
  try {
    const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      timeZone: "Asia/Kuwait",
      day: "numeric",
      month: "numeric",
    });
    const parts = formatter.formatToParts(new Date());
    const month = parseInt(parts.find((p) => p.type === "month")?.value ?? "0", 10);
    const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "0", 10);

    const map = (key: keyof typeof SEASONAL_NOTIFICATION_POOL) =>
      SEASONAL_NOTIFICATION_POOL[key].map((x) => ({ icon: "", title: x.title, body: x.body }));

    if (month === 9) return map(day >= 21 ? "ramadanLate" : "ramadan");
    if (month === 12 && day <= 9) return map("dhulHijjah");
    if (month === 1 && day <= 10) return map("ashura");
    if (month === 10 && day <= 6) return map("shawwal");

    const general = map("daily");
    return [general[new Date().getDay() % general.length]!];
  } catch {
    return [{ icon: "", title: "تذكير", body: "حافظ على صلواتك وأذكارك." }];
  }
}

/** تذكير المواسم/اليوم — تحكمه فئة «الجمعة والمناسبات» ويحترم ساعات الهدوء. */
export function scheduleIslamicReminder(prefs: NotifPrefs = loadNotifPrefs()): void {
  if (!prefs.enabled || !prefs.sections.fridayOccasions?.enabled) return;
  if (isWithinQuietHours(loadSunnahNotificationPrefs().quietHours)) return;
  if (alreadySentToday("islamic-reminder")) return;
  const pool = getIslamicReminders();
  if (!pool.length) return;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  sendLocalNotification(pick.title, {
    body: pick.body,
    tag: "islamic-reminder",
    url: "/occasions",
  });
  markSentToday("islamic-reminder");
}
