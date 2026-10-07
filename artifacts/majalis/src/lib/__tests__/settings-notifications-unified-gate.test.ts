/**
 * بوابة الإعدادات والإشعارات الموحّدة (2026-10).
 * node --import tsx src/lib/__tests__/settings-notifications-unified-gate.test.ts
 *
 * تحرس: مصدر حقيقة واحد لكل إعداد، لا إعدادات ميتة، كل فئة تحكم جدولة فعلية،
 * ساعات الهدوء مطبَّقة، روابط عميقة صحيحة، ترحيل القيم المخزّنة.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

/* ── localStorage وهمي قبل تحميل الوحدات ── */
const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() {
    return store.size;
  },
} as Storage;

const sections = await import("../notifications/sections-config");
const local = await import("../local-notifications");
const smart = await import("../smart-local-notifications");
const nativeDaily = await import("../notifications/native-daily-reminders");
const prefsMod = await import("../user-preferences");

/* 1) فئات التذكير = ما يُجدوَل فعلًا فقط */
assert.deepEqual(
  sections.NOTIF_SECTIONS.map((s) => s.id),
  ["quran", "adhkar", "seekingKnowledge", "fridayOccasions"],
  "لا فئات بلا مُجدوِل (الصلاة على النبي/الاستغفار/الدروس) ولا فئة صلاة مكررة",
);
const sectionsSrc = read("src/lib/notifications/sections-config.ts");
assert.doesNotMatch(sectionsSrc, /dailyCount|windowStartHour|weekdays:/, "لا حقول عدد/فترة/أيام ميتة");

/* 2) ترحيل التخزين القديم */
store.set(
  "majalis_notif_prefs_v1",
  JSON.stringify({
    enabled: true,
    prayerReminder: true,
    resumeReminder: true,
    prayerModes: { preEnabled: true, adhanEnabled: true, postEnabled: true },
    sections: {
      prayer: { enabled: true, dailyCount: 5 },
      salawat: { enabled: true, dailyCount: 3 },
      quran: { enabled: true, dailyCount: 2, weekdays: [0] },
    },
  }),
);
assert.equal(local.notifPrefsNeedMigration(), true, "يكتشف المفاتيح الميتة");
const migrated = local.loadNotifPrefs();
assert.equal(migrated.dhikrPhraseReminder, true, "تفعيل الصلاة على النبي يُرحَّل إلى تذكير الذكر");
assert.equal(migrated.sections.quran.enabled, true);
assert.equal(migrated.quranDailyReminder, true);
assert.equal(local.migrateNotifPrefsStorage(), true);
const stored = JSON.parse(store.get("majalis_notif_prefs_v1")!) as Record<string, unknown> & {
  sections: Record<string, Record<string, unknown>>;
};
for (const k of ["prayerReminder", "resumeReminder", "prayerModes"]) {
  assert.ok(!(k in stored), `حُذف ${k}`);
}
assert.deepEqual(Object.keys(stored.sections).sort(), ["adhkar", "fridayOccasions", "quran", "seekingKnowledge"]);
assert.deepEqual(stored.sections.quran, { enabled: true }, "فئة = تفعيل فقط");
assert.equal(local.notifPrefsNeedMigration(), false, "الترحيل مرة واحدة");

/* 3) الجدول: كل فئة تحكم عناصرها، لا صلاة بأوقات ثابتة، روابط عميقة داخلية */
const allOn = {
  ...local.loadNotifPrefs(),
  enabled: true,
  quranDailyReminder: true,
  adhkarReminder: true,
  flashcardsReminder: true,
  dhikrPhraseReminder: true,
  sections: {
    quran: { enabled: true },
    adhkar: { enabled: true },
    seekingKnowledge: { enabled: true },
    fridayOccasions: { enabled: true },
  },
};
const noQuiet = { enabled: false, startHour: 22, endHour: 8 };
const full = smart.buildDailySmartSchedule({
  prefs: allOn,
  khatmahBehind: true,
  forceWeekly: true,
  quietHours: noQuiet,
});
assert.ok(!full.some((i) => (i.kind as string) === "prayer"), "الصلاة يملكها محرك الأذان");
for (const kind of ["adhkar", "dhikr", "flashcards", "quran", "occasion", "streak", "khatmah"]) {
  assert.ok(full.some((i) => i.kind === kind), `يُجدوَل ${kind}`);
}
assert.ok(full.every((i) => typeof i.url === "string" && i.url.startsWith("/") && !i.url.startsWith("//")), "كل عنصر له رابط داخلي");
const kahf = full.find((i) => i.kind === "occasion");
assert.equal(kahf?.weekday, 5, "الكهف أسبوعي يوم الجمعة");
assert.equal(kahf?.url, "/mushaf/18");

const quranOff = smart.buildDailySmartSchedule({
  prefs: { ...allOn, quranDailyReminder: false, sections: { ...allOn.sections, quran: { enabled: false } } },
  khatmahBehind: true,
  forceWeekly: true,
  quietHours: noQuiet,
});
assert.ok(!quranOff.some((i) => ["quran", "streak", "khatmah"].includes(i.kind)), "السلسلة والختمة تتبعان فئة القرآن");
const occOff = smart.buildDailySmartSchedule({
  prefs: { ...allOn, sections: { ...allOn.sections, fridayOccasions: { enabled: false } } },
  forceWeekly: true,
  quietHours: noQuiet,
});
assert.ok(!occOff.some((i) => i.kind === "occasion"), "فئة المناسبات تحكم الكهف");
assert.equal(smart.buildDailySmartSchedule({ prefs: { ...allOn, enabled: false } }).length, 0, "المفتاح العام");

/* 4) ساعات الهدوء مطبَّقة (عدا الأذكار المؤقّتة) */
const quiet = smart.buildDailySmartSchedule({
  prefs: allOn,
  forceWeekly: true,
  includeStreakWarn: false,
  quietHours: { enabled: true, startHour: 16, endHour: 19 },
});
assert.ok(!quiet.some((i) => i.kind === "quran"), "ورد ٥ م يسقط داخل الهدوء");
assert.ok(!quiet.some((i) => i.kind === "dhikr" && i.minuteOfDay >= 16 * 60 && i.minuteOfDay < 19 * 60));
assert.ok(quiet.some((i) => i.id === "adhkar-evening"), "أذكار المساء معفاة");
assert.equal(smart.isMinuteWithinQuietHours({ enabled: true, startHour: 22, endHour: 8 }, 23 * 60), true);
assert.equal(smart.isMinuteWithinQuietHours({ enabled: true, startHour: 22, endHour: 8 }, 8 * 60), false);

/* 5) الجدولة الأصلية: معرّفات ثابتة بلا تصادم */
const ids = ["adhkar-morning", "adhkar-evening", "adhkar-sleep", "adhkar-after-salah", "flashcards-daily", "friday-kahf"].map(
  nativeDaily.nativeDailyReminderId,
);
assert.equal(new Set(ids).size, ids.length);
for (const id of ids) {
  assert.ok(id >= 9601 && id <= 9629, "نطاق محجوز");
  assert.ok(id !== 9301 && !(id >= 9401 && id <= 9499), "لا تصادم مع الورد والذكر");
}
assert.equal(nativeDaily.capacitorWeekday(5), 6, "الجمعة = 6 في Capacitor");
assert.match(read("src/lib/smart-local-notifications.ts"), /syncNativeDailyReminders\(nativeItems\)/, "iOS يجدول الأذكار/المراجعة/الجمعة");
assert.match(read("src/lib/dhikr-phrase-reminders.ts"), /isMinuteWithinQuietHours/, "الذكر الأصلي يحترم الهدوء");
assert.match(read("src/lib/local-notifications.ts"), /fridayOccasions\?\.enabled/, "تذكير المواسم له مفتاح");

/* 6) الإعدادات: لا مفاتيح ميتة ولا تكرار */
const settingsDefaults = prefsMod.DEFAULT_PREFERENCES as unknown as Record<string, unknown>;
for (const k of prefsMod.DEAD_PREFERENCE_KEYS) assert.ok(!(k in settingsDefaults), `مفتاح ميت ${k}`);
store.set("majalis-user-settings-v1", JSON.stringify({ lessonNotifications: false, fontSize: "كبير" }));
(globalThis as unknown as { window: unknown }).window = globalThis; // readPreferences يتطلب window
const readBack = prefsMod.readPreferences() as unknown as Record<string, unknown>;
assert.ok(!("lessonNotifications" in readBack));
assert.equal(readBack.fontSize, "كبير");
assert.ok(!store.get("majalis-user-settings-v1")!.includes("lessonNotifications"), "ترحيل التخزين");

const settings = read("src/pages/account/ui/SettingsView.tsx");
for (const title of ["العرض والمظهر", "القراءة والمصحف", "الصلاة والأذان", "الإشعارات", "الخصوصية والحساب", "حول"]) {
  assert.match(settings, new RegExp(`title:\\s*"${title}"`), `مجموعة ${title}`);
}
assert.doesNotMatch(settings, /lessonNotifications|contentNotifications|occasionNotifications/, "لا مفاتيح إشعار ميتة");
assert.doesNotMatch(settings, /BackgroundPlayback|التشغيل في الخلفية/, "لا مفتاح تشغيل خلفي ميت");
assert.doesNotMatch(settings, /notifications-and-sound/, "لا رابط مكرر");
assert.equal((settings.match(/href: "\/notification-settings"/g) ?? []).length, 1, "رابط إشعارات واحد");
assert.match(settings, /hapticsEnabled/, "الاهتزاز موصول بمفتاح يقرؤه haptics.ts");
assert.match(read("src/lib/haptics.ts"), /hapticsEnabled/);

/* 7) مركز الإشعارات: إذن واضح، روابط النقر، لا أخطاء دمج أصناف */
const view = read("src/pages/account/ui/NotificationSettingsView.tsx");
assert.match(view, /openSystemNotificationSettings/, "فتح إعدادات النظام عند الرفض");
assert.match(view, /visibilitychange/, "إعادة فحص الإذن عند العودة");
assert.match(view, /navigateTo\(rec\.url\)/, "النقر على سجل يفتح رابطه");
assert.match(view, /href: "\/adhan-settings"/, "الصلاة تُدار من مصدرها الوحيد");
assert.doesNotMatch(view, /\$\{[^}]*\?\s*"(?!\s)[a-z][^"]*"\s*:\s*""\}`/, "لا دمج أصناف بلا مسافة");
assert.doesNotMatch(view, /e\.key === ""/, "مفتاح المسافة صحيح");
assert.match(read("src/lib/local-notifications.ts"), /n\.onclick/, "نقر إشعار الويب يفتح الرابط");
assert.match(read("src/lib/notifications/native-bootstrap.ts"), /recordNativeNotification/, "الصندوق يُغذّى");
assert.match(read("src/lib/notification-history.ts"), /url\?: string/);
assert.match(
  read("src/AppRoutes.tsx"),
  /path="\/notifications-and-sound"><Redirect to="\/notification-settings" \/>/,
  "الصفحة المكررة تُحوَّل",
);
assert.doesNotMatch(read("src/components/PushPrompt.tsx"), /تتطلب إعداد مفتاح VAPID/, "لا رسالة مطوّر للمستخدم");

assert.match(read("../../docs/design/SETTINGS_AND_NOTIFICATIONS.md"), /مصدر الحقيقة/);

console.log("settings-notifications-unified-gate: ok");
