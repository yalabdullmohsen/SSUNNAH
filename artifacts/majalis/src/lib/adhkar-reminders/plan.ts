/**
 * تخطيط تذكيرات الأذكار — منطق نقي بلا منصة (قابل للاختبار في node).
 * الفئات من البيانات (src/data/adhkar-reminder-categories.json) والنصوص من بيانات الأذكار الموثّقة فقط.
 * المواقيت تُمرَّر من محرك الصلاة القائم (لا حساب هنا)، وكل الأوقات بمنطقة الموقع النشط.
 */
import data from "@/data/adhkar-reminder-categories.json";
import { ADHKAR_ITEMS, type AdhkarItem } from "@/lib/adhkar-seed";
import { isBlockedFromPublic } from "@/lib/content-display-zones";
import { calendarNoonInZone, epochAtZoneMinutes } from "@/lib/prayer-times";
import { gregorianToHijri } from "@/lib/hijri-utils";
import type { SmartNotifScheduleItem } from "@/lib/smart-local-notifications";

export type PrayerKey = "Fajr" | "Sunrise" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
export type ReminderSound = "system" | "silent" | "tone-nada" | "tone-chime" | "tone-fajr" | "tone-qatra" | "tone-nasim";
export type ReminderGroup = "adhkar" | "occasions";

type When =
  | { type: "prayer"; prayer: PrayerKey; offsetMin: number }
  | { type: "prayers"; prayers: PrayerKey[]; offsetMin: number }
  | { type: "time"; time: string }
  | { type: "interval"; start: string; end: string; everyMinutes: number };

type Repeat =
  | { type: "daily" }
  | { type: "weekly"; weekdays: number[]; dayBefore?: boolean }
  | { type: "hijri"; dates: Array<{ month?: number; day: number }>; dayBefore?: boolean };

export type ReminderCategory = {
  id: string;
  group: ReminderGroup;
  title: string;
  body?: string;
  adhkarCategory?: string;
  href: string;
  defaultEnabled: boolean;
  when: When;
  defaultTime?: string;
  repeat?: Repeat;
  sound: ReminderSound;
};

export const REMINDER_CATEGORIES = data.categories as ReminderCategory[];

export const REMINDER_SOUNDS: ReadonlyArray<{ id: ReminderSound; label: string }> = [
  { id: "tone-nada", label: "ندى" },
  { id: "tone-chime", label: "رنين" },
  { id: "tone-fajr", label: "فجر" },
  { id: "tone-qatra", label: "قطرة" },
  { id: "tone-nasim", label: "نسيم" },
  { id: "system", label: "صوت النظام" },
  { id: "silent", label: "صامت" },
];

export const INTERVAL_CHOICES = [120, 180, 240, 360] as const;

export type CategoryPref = {
  enabled: boolean;
  /** «prayer»: مرتبط بالصلاة مع إزاحة · «time»: وقت يختاره المستخدم */
  mode?: "prayer" | "time";
  time?: string;
  offsetMin?: number;
  sound?: ReminderSound;
  everyMinutes?: number;
};

export type AdhkarReminderPrefs = {
  categories: Record<string, CategoryPref>;
  /** تصحيح الهجري المحلي (رؤية الهلال) بيوم */
  hijriOffset: -1 | 0 | 1;
};

export function defaultReminderPrefs(): AdhkarReminderPrefs {
  return {
    hijriOffset: 0,
    categories: Object.fromEntries(REMINDER_CATEGORIES.map((c) => [c.id, { enabled: c.defaultEnabled }])),
  };
}

export type PlannedReminder = {
  categoryId: string;
  at: number;
  title: string;
  body: string;
  url: string;
  sound: ReminderSound;
};

export type PlanInput = {
  prefs: AdhkarReminderPrefs;
  /** المجموعات المفعّلة من المفتاح العام وأقسام الإشعارات */
  groups: Record<ReminderGroup, boolean>;
  now: number;
  timeZone: string;
  days: number;
  /** دقائق الصلاة لتاريخ YYYY-MM-DD من محرك المواقيت؛ null إن تعذّر */
  prayerMinutes: (dateKey: string) => Partial<Record<PrayerKey, number>> | null;
  quiet?: { enabled: boolean; startHour: number; endHour: number };
  budget: number;
};

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
};

function dateKey(timeZone: string, d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

function shiftKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days, 12)).toISOString().slice(0, 10);
}

function weekdayOf(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
}

export function hijriOf(key: string, offset = 0): { day: number; month: number } | null {
  const [y, m, d] = key.split("-").map(Number);
  return gregorianToHijri(new Date(Date.UTC(y, m - 1, d + offset, 12)));
}

function matchesDay(c: ReminderCategory, key: string, hijriOffset: number): boolean {
  const r = c.repeat;
  if (!r || r.type === "daily") return true;
  const target = r.dayBefore ? shiftKey(key, 1) : key;
  if (r.type === "weekly") return r.weekdays.includes(weekdayOf(target));
  const h = hijriOf(target, hijriOffset);
  return !!h && r.dates.some((x) => x.day === h.day && (x.month == null || x.month === h.month));
}

function inQuiet(q: PlanInput["quiet"], minute: number): boolean {
  if (!q?.enabled) return false;
  const h = Math.floor(((minute % 1440) + 1440) % 1440 / 60);
  if (q.startHour === q.endHour) return true;
  return q.startHour < q.endHour ? h >= q.startHour && h < q.endHour : h >= q.startHour || h < q.endHour;
}

/** دقائق اليوم التي تقع فيها الفئة (قد تكون سالبة أو ≥1440 بإزاحة الصلاة — تُعالَج عبر epoch). */
function minutesFor(c: ReminderCategory, p: CategoryPref, prayers: Partial<Record<PrayerKey, number>> | null): { minute: number; prayerBased: boolean }[] {
  const w = c.when;
  if (w.type === "interval") {
    const every = Math.max(60, p.everyMinutes ?? w.everyMinutes);
    const out = [];
    for (let m = toMin(w.start); m <= toMin(w.end); m += every) out.push({ minute: m, prayerBased: false });
    return out;
  }
  if (w.type === "time") return [{ minute: toMin(p.time ?? w.time), prayerBased: false }];
  const mode = p.mode ?? "prayer";
  if (mode === "time" && c.defaultTime) return [{ minute: toMin(p.time ?? c.defaultTime), prayerBased: false }];
  const offset = p.offsetMin ?? w.offsetMin;
  const keys = w.type === "prayer" ? [w.prayer] : w.prayers;
  return keys.flatMap((k) => {
    const base = prayers?.[k];
    // بلا مواقيت من المحرك لا نخمّن وقتًا — يُتخطّى اليوم ويُعاد التخطيط عند توفرها.
    return base == null ? [] : [{ minute: base + offset, prayerBased: true }];
  });
}

const sourcedCache = new Map<string, AdhkarItem[]>();
/** أذكار الفئة التي لها مصدر ودرجة وتصلح للنشر — غير ذلك مستبعد. */
export function sourcedAdhkar(categoryId: string): AdhkarItem[] {
  let hit = sourcedCache.get(categoryId);
  if (!hit) {
    hit = ADHKAR_ITEMS.filter((i) => i.categoryId === categoryId && i.source && i.grade && !isBlockedFromPublic(i));
    sourcedCache.set(categoryId, hit);
  }
  return hit;
}

function snippet(text: string, max = 70): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 40))}…`;
}

function content(c: ReminderCategory, key: string, slot: number): { body: string; url: string } {
  const pool = c.adhkarCategory ? sourcedAdhkar(c.adhkarCategory) : [];
  if (!pool.length) return { body: c.body ?? "", url: c.href };
  const dayIndex = Math.floor(Date.parse(`${key}T12:00:00Z`) / 86_400_000);
  const item = pool[(dayIndex + slot) % pool.length];
  return {
    body: `${snippet(item.text)}\n${item.source} · ${item.grade}`,
    url: `${c.href}?dhikr=${encodeURIComponent(item.id)}`,
  };
}

/** الخطة المتجددة: أقرب التذكيرات أولًا حتى حدّ الميزانية، بلا تكرار لنفس الفئة والوقت. */
export function planAdhkarReminders(input: PlanInput): PlannedReminder[] {
  const { prefs, now, timeZone, days } = input;
  const out: PlannedReminder[] = [];
  const seen = new Set<string>();
  const firstNoon = calendarNoonInZone(timeZone, new Date(now)).getTime();
  for (let d = 0; d < days; d++) {
    const noon = new Date(firstNoon + d * 86_400_000);
    const key = dateKey(timeZone, noon);
    const prayers = input.prayerMinutes(key);
    for (const c of REMINDER_CATEGORIES) {
      const p = prefs.categories[c.id] ?? { enabled: c.defaultEnabled };
      if (!p.enabled || !input.groups[c.group] || !matchesDay(c, key, prefs.hijriOffset)) continue;
      minutesFor(c, p, prayers).forEach(({ minute, prayerBased }, slot) => {
        // ساعات الهدوء لا تُسقط ما ارتبط بوقت صلاة (عبادة مؤقّتة اختارها المستخدم).
        if (!prayerBased && inQuiet(input.quiet, minute)) return;
        const at = epochAtZoneMinutes(timeZone, minute, noon);
        const dedupe = `${c.id}@${at}`;
        if (at <= now || seen.has(dedupe)) return;
        seen.add(dedupe);
        out.push({
          categoryId: c.id,
          at,
          title: c.title,
          ...content(c, key, slot),
          sound: p.sound ?? c.sound,
        });
      });
    }
  }
  return out.sort((a, b) => a.at - b.at).slice(0, Math.max(0, input.budget));
}

/** الويب: عناصر الـ24 ساعة القادمة بصيغة جدول smart-local (دقيقة اليوم بتوقيت الجهاز). */
export function planToSmartItems(plan: PlannedReminder[], now = Date.now()): SmartNotifScheduleItem[] {
  const groupOf = new Map(REMINDER_CATEGORIES.map((c) => [c.id, c.group]));
  return plan
    .filter((r) => r.at - now < 86_400_000)
    .map((r) => {
      const d = new Date(r.at);
      return {
        id: `${r.categoryId}-${r.at}`,
        kind: groupOf.get(r.categoryId) === "occasions" ? ("occasion" as const) : ("adhkar" as const),
        title: r.title,
        body: r.body,
        minuteOfDay: d.getHours() * 60 + d.getMinutes(),
        tag: `majalis-adhkar-${r.categoryId}`,
        url: r.url,
      };
    });
}
