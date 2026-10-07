/**
 * تذكيرات الأذكار على الجهاز: التفضيلات، الجدولة المتجددة على iOS (حد 64)، وأزرار «تم»/«بعد 15 دقيقة».
 * الويب يستهلك نفس الخطة عبر smart-local-notifications (نافذة 24 ساعة).
 */
import { isNative } from "@/lib/capacitor-utils";
import { readLocalJson, writeLocalJson } from "@/lib/safe-json";
import { loadNotifPrefs, type NotifPrefs } from "@/lib/local-notifications";
import { loadSunnahNotificationPrefs } from "@/lib/sunnah-notifications/preferences";
import { getActivePrayerLocation } from "@/lib/prayer-location-prefs";
import { getPrayerTimes } from "@/lib/prayer-times";
import { CHANNEL_GENERAL } from "@/lib/notifications/channels";
import {
  REMINDER_CATEGORIES,
  defaultReminderPrefs,
  planAdhkarReminders,
  type AdhkarReminderPrefs,
  type PlannedReminder,
  type PrayerKey,
  type ReminderGroup,
} from "./plan";

export * from "./plan";

const PREFS_KEY = "majalis_adhkar_reminders_v1";
export const ADHKAR_REMINDER_PREFS_EVENT = "majalis:adhkar-reminder-prefs-changed";

/** نطاق معرّفات محجوز (لا يتقاطع مع 9301 و9401–9499 و9601–9629 ونطاقات الصلاة ≥ 50000). */
export const ADHKAR_ID_BASE = 9700;
export const ADHKAR_ID_MAX = 9998;
export const ADHKAR_SNOOZE_ID = 9999;
export const ADHKAR_ACTION_TYPE = "ADHKAR_REMINDER";

/** ميزانية iOS المركزية: 64 معلّقًا. الصلاة أولًا (حجز ثابت حين تكون مفعّلة)، والأذكار تأخذ الباقي. */
export const IOS_PENDING_LIMIT = 64;
export const PRAYER_RESERVED = 40;
const SAFETY_MARGIN = 2;
const PLAN_DAYS = 14;

export function computeAdhkarBudget(pending: Array<{ id: number; extra?: unknown }>): number {
  let prayer = 0;
  let other = 0;
  for (const n of pending) {
    if (n.id >= ADHKAR_ID_BASE && n.id <= ADHKAR_SNOOZE_ID) continue;
    const kind = String((n.extra as { kind?: unknown } | undefined)?.kind ?? "");
    if (kind.startsWith("prayer") || kind.startsWith("adhan")) prayer++;
    else other++;
  }
  const prayerShare = prayer > 0 ? Math.max(prayer, PRAYER_RESERVED) : 0;
  return Math.max(0, Math.min(ADHKAR_ID_MAX - ADHKAR_ID_BASE, IOS_PENDING_LIMIT - prayerShare - other - SAFETY_MARGIN));
}

export function loadReminderPrefs(): AdhkarReminderPrefs {
  const base = defaultReminderPrefs();
  const saved = readLocalJson<Partial<AdhkarReminderPrefs> | null>(PREFS_KEY, null);
  if (!saved || typeof saved !== "object") return base;
  return {
    hijriOffset: saved.hijriOffset === -1 || saved.hijriOffset === 1 ? saved.hijriOffset : 0,
    categories: { ...base.categories, ...(saved.categories ?? {}) },
  };
}

export function saveReminderPrefs(prefs: AdhkarReminderPrefs): void {
  writeLocalJson(PREFS_KEY, prefs);
  try {
    window.dispatchEvent(new CustomEvent(ADHKAR_REMINDER_PREFS_EVENT));
  } catch {
    /* بيئة بلا window */
  }
}

export function resetReminderPrefs(): AdhkarReminderPrefs {
  const d = defaultReminderPrefs();
  saveReminderPrefs(d);
  return d;
}

export function reminderGroups(p: NotifPrefs = loadNotifPrefs()): Record<ReminderGroup, boolean> {
  return {
    adhkar: p.enabled && (p.sections?.adhkar?.enabled ?? p.adhkarReminder),
    occasions: p.enabled && (p.sections?.fridayOccasions?.enabled ?? false),
  };
}

/** يخطط من محرك المواقيت القائم (getPrayerTimes لكل يوم) — لا حساب مواقيت هنا. */
export async function planForDevice(opts: { days?: number; budget: number; now?: number }): Promise<PlannedReminder[]> {
  const prefs = loadReminderPrefs();
  const groups = reminderGroups();
  if (!groups.adhkar && !groups.occasions) return [];
  const loc = getActivePrayerLocation();
  const timeZone = loc.timeZone || "Asia/Kuwait";
  const now = opts.now ?? Date.now();
  const days = opts.days ?? PLAN_DAYS;
  const needsPrayer = REMINDER_CATEGORIES.some(
    (c) => prefs.categories[c.id]?.enabled && (c.when.type === "prayer" || c.when.type === "prayers"),
  );
  const minutes = new Map<string, Partial<Record<PrayerKey, number>>>();
  if (needsPrayer) {
    for (let d = -1; d <= days; d++) {
      const key = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
        .format(new Date(now + d * 86_400_000));
      if (minutes.has(key)) continue;
      try {
        const payload = await getPrayerTimes(key, { lat: loc.lat, lon: loc.lon, label: loc.label, timeZone });
        minutes.set(key, Object.fromEntries(
          payload.prayers.filter((s) => s.minutes != null).map((s) => [s.key, s.minutes as number]),
        ));
      } catch {
        /* يوم بلا مواقيت ⇒ يُتخطّى ولا يُخمَّن */
      }
    }
  }
  let quiet;
  try {
    quiet = loadSunnahNotificationPrefs().quietHours;
  } catch {
    quiet = undefined;
  }
  return planAdhkarReminders({
    prefs,
    groups,
    now,
    timeZone,
    days,
    prayerMinutes: (key) => minutes.get(key) ?? null,
    quiet,
    budget: opts.budget,
  });
}

type LN = typeof import("@capacitor/local-notifications").LocalNotifications;

function toNative(r: PlannedReminder, id: number) {
  const silent = r.sound === "silent";
  return {
    id,
    title: r.title,
    body: r.body,
    schedule: { at: new Date(r.at), allowWhileIdle: true },
    // «صوت النظام» = default؛ النغمة غير الموجودة في الحزمة (قبل نسخة المتجر) يُسقطها iOS للصوت الافتراضي.
    ...(silent ? {} : { sound: r.sound === "system" ? "default" : `${r.sound}.caf` }),
    // Time Sensitive يتطلب صلاحية Apple؛ بدونها يعامله iOS كـ active تلقائيًا.
    interruptionLevel: silent ? ("passive" as const) : ("active" as const),
    threadIdentifier: "adhkar",
    actionTypeId: ADHKAR_ACTION_TYPE,
    channelId: CHANNEL_GENERAL,
    extra: { url: r.url, kind: "adhkar-reminder", categoryId: r.categoryId },
  };
}

let _inflight: Promise<number> | null = null;
let _again = false;

/** يلغي نطاق الأذكار ويعيد جدولة الأقرب ضمن الميزانية. آمن للتكرار المتزامن. */
export function syncNativeAdhkarReminders(): Promise<number> {
  if (!isNative) return Promise.resolve(0);
  if (_inflight) {
    _again = true;
    return _inflight;
  }
  _inflight = (async () => {
    let count: number;
    do {
      _again = false;
      count = await syncOnce().catch(() => 0);
    } while (_again);
    return count;
  })().finally(() => {
    _inflight = null;
  });
  return _inflight;
}

async function syncOnce(): Promise<number> {
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const perm = await LocalNotifications.checkPermissions();
  const pending = (await LocalNotifications.getPending()).notifications ?? [];
  const ours = pending.filter((n) => n.id >= ADHKAR_ID_BASE && n.id <= ADHKAR_ID_MAX);
  if (ours.length) await LocalNotifications.cancel({ notifications: ours.map((n) => ({ id: n.id })) });
  if (perm.display !== "granted") return 0;
  const plan = await planForDevice({ budget: computeAdhkarBudget(pending) });
  if (!plan.length) return 0;
  await LocalNotifications.schedule({ notifications: plan.map((r, i) => toNative(r, ADHKAR_ID_BASE + i)) });
  return plan.length;
}

export async function registerAdhkarActionTypes(ln?: LN): Promise<void> {
  if (!isNative) return;
  const LocalNotifications = ln ?? (await import("@capacitor/local-notifications")).LocalNotifications;
  await LocalNotifications.registerActionTypes({
    types: [
      {
        id: ADHKAR_ACTION_TYPE,
        actions: [
          { id: "done", title: "تم" },
          { id: "snooze", title: "ذكّرني بعد 15 دقيقة" },
        ],
      },
    ],
  });
}

export const SNOOZE_MS = 15 * 60_000;

/** يعالج زرّي الإشعار؛ يعيد true إن عولج (فلا يُفتح الرابط). */
export async function handleAdhkarAction(actionId: string, n: { title?: string; body?: string; extra?: unknown }): Promise<boolean> {
  const extra = (n.extra ?? {}) as { kind?: unknown; categoryId?: unknown; url?: unknown };
  if (extra.kind !== "adhkar-reminder") return false;
  if (actionId === "snooze") {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.schedule({
      notifications: [{
        id: ADHKAR_SNOOZE_ID,
        title: n.title ?? "تذكير",
        body: n.body ?? "",
        schedule: { at: new Date(Date.now() + SNOOZE_MS), allowWhileIdle: true },
        sound: "default",
        actionTypeId: ADHKAR_ACTION_TYPE,
        channelId: CHANNEL_GENERAL,
        extra,
      }],
    });
    return true;
  }
  if (actionId === "done") {
    if (extra.categoryId === "morning") {
      const { markMorningAdhkarDone } = await import("@/lib/local-milestones");
      markMorningAdhkarDone();
    }
    return true;
  }
  return false;
}
