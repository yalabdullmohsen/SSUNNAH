/**
 * فئات التذكيرات الموحّدة — بدون تسمية «الإشعارات الإسلامية».
 * كل فئة مفتاح تفعيل واحد يحكم الجدولة فعليًا (smart-local-notifications)،
 * ولكل فئة توقيت ثابت موثّق في وصفها ورسائل قصيرة فصيحة.
 * تنبيهات الصلاة ليست فئة هنا: مصدرها الوحيد prayer-notifications/preferences + محرك الأذان
 * (مواقيت حقيقية) — كانت فئة «الصلاة» تجدول على الويب أوقاتًا ثابتة خاطئة.
 * أُزيلت (2026-10) أقسام «الصلاة على النبي/الاستغفار/الدروس» وحقول العدد/الفترة/الأيام
 * لأنها كانت تُحفَظ ولا يقرؤها أي مُجدوِل — تُرحَّل القيم المخزّنة في local-notifications.
 */

export type NotifSectionId =
  | "quran"
  | "adhkar"
  | "seekingKnowledge"
  | "fridayOccasions";

export type NotifSectionPrefs = {
  enabled: boolean;
};

export type NotifMessage = { title: string; body: string };

export type NotifSectionMeta = {
  id: NotifSectionId;
  title: string;
  description: string;
  /** مسار تفصيلي اختياري (مثل إعدادات الأذان) */
  href?: string;
  defaults: NotifSectionPrefs;
  messages: readonly NotifMessage[];
};

const baseDay = (partial?: Partial<NotifSectionPrefs>): NotifSectionPrefs => ({
  enabled: false,
  ...partial,
});

export const NOTIF_SECTIONS: readonly NotifSectionMeta[] = [
  {
    id: "quran",
    title: "القرآن",
    description: "ورد يومي ٥:٠٠ م، وتنبيه السلسلة والختمة عند الحاجة",
    defaults: baseDay({ enabled: false }),
    messages: [
      { title: "ورد القرآن", body: "خصص وقتاً لوردك اليومي." },
      { title: "متابعة التلاوة", body: "تابع من آخر موضع وصلت إليه." },
      { title: "ورد اليوم", body: "آية اليوم في انتظارك." },
      { title: "ختمة مستمرة", body: "أكمل صفحتك من المصحف." },
      { title: "تلاوة هادئة", body: "افتح المصحف ولو لآيات قليلة." },
      { title: "مراجعة الحفظ", body: "راجع ما حفظته اليوم." },
      { title: "تدبّر آية", body: "اقرأ آية بتأنٍّ." },
      { title: "ورد المساء", body: "وقت مناسب لوردك." },
      { title: "ورد الصباح", body: "ابدأ يومك بآيات." },
      { title: "الاستماع", body: "استمع لتلاوة قصيرة." },
      { title: "سورة قصيرة", body: "اختر سورة وأتممها." },
      { title: "صفحة من المصحف", body: "أكمل صفحة واحدةً واحدةً." },
      { title: "تثبيت الحفظ", body: "أعد قراءة ما ثبت لديك." },
      { title: "متابعة الحزب", body: "أكمل حزب يومك." },
      { title: "فتح المصحف", body: "عُد إلى موضعك المحفوظ." },
    ],
  },
  {
    id: "adhkar",
    title: "الأذكار",
    description: "الصباح بعد الفجر والمساء بعد العصر، والنوم والاستيقاظ وبعد الصلاة والصلاة على النبي ﷺ والاستغفار",
    defaults: baseDay({ enabled: false }),
    messages: [
      { title: "أذكار الصباح", body: "ورد الصباح جاهز." },
      { title: "أذكار المساء", body: "ورد المساء جاهز." },
      { title: "أذكار النوم", body: "أذكار قبل النوم." },
      { title: "أذكار الصباح", body: "حان وقت ورد الصباح." },
      { title: "أذكار المساء", body: "حان وقت ورد المساء." },
      { title: "أذكار النوم", body: "اختم يومك بالذكر." },
      { title: "أذكار الصباح", body: "ابدأ بذكر الله." },
      { title: "أذكار المساء", body: "احفظ ورد المساء." },
      { title: "أذكار النوم", body: "أذكار النوم قصيرة وميسّرة." },
      { title: "أذكار الصباح", body: "لا يفوتك ورد الصباح." },
      { title: "أذكار المساء", body: "أتمم أذكار المساء." },
      { title: "أذكار النوم", body: "وقت مناسب لأذكار النوم." },
      { title: "أذكار الصباح", body: "ورد الصباح بين يديك." },
      { title: "أذكار المساء", body: "ورد المساء بين يديك." },
      { title: "أذكار النوم", body: "ذكّر نفسك قبل النوم." },
    ],
  },
  {
    id: "seekingKnowledge",
    title: "طلب العلم والمراجعة",
    description: "تذكير يومي بمراجعة البطاقات والمحفوظات",
    defaults: baseDay({ enabled: false }),
    messages: [
      { title: "البرامج العلمية", body: "تابع برنامجك العلمي." },
      { title: "السلاسل", body: "أكمل سلسلتك الحالية." },
      { title: "متابعة التعلّم", body: "لديك محتوى لم يُستكمل." },
      { title: "المحفوظات", body: "راجع محفوظاتك." },
      { title: "البرامج العلمية", body: "درس من برنامجك بانتظارك." },
      { title: "السلاسل", body: "الحلقة التالية جاهزة." },
      { title: "متابعة التعلّم", body: "عُد إلى ما توقفت عنده." },
      { title: "المحفوظات", body: "محفوظاتك تحتاج مراجعة." },
      { title: "البرامج العلمية", body: "استمر في برنامجك." },
      { title: "السلاسل", body: "سلسلة لم تُكمل بعد." },
      { title: "متابعة التعلّم", body: "أكمل ما بدأته." },
      { title: "المحفوظات", body: "ثبّت ما حفظته." },
      { title: "البرامج العلمية", body: "وقت لمتابعة العلم." },
      { title: "السلاسل", body: "تابع السلسلة من موضعك." },
      { title: "متابعة التعلّم", body: "محتوى معلّق ينتظرك." },
    ],
  },
  {
    id: "fridayOccasions",
    title: "الجمعة والمناسبات",
    description: "الجمعة، وصيام الاثنين والخميس والأيام البيض، وعرفة وعاشوراء وعشر ذي الحجة ورمضان، والضحى والقيام",
    defaults: baseDay({ enabled: false }),
    messages: [
      { title: "يوم الجمعة", body: "تذكير بصلاة الجمعة." },
      { title: "سورة الكهف", body: "اقرأ سورة الكهف." },
      { title: "المواسم الشرعية", body: "موسم فاضل؛ اغتنمه." },
      { title: "يوم الجمعة", body: "أكثر من الصلاة على النبي ﷺ." },
      { title: "سورة الكهف", body: "سورة الكهف من سنن الجمعة." },
      { title: "المواسم الشرعية", body: "أيام مباركة بين يديك." },
      { title: "يوم الجمعة", body: "تهيأ لصلاة الجمعة." },
      { title: "سورة الكهف", body: "وقت مناسب لسورة الكهف." },
      { title: "المواسم الشرعية", body: "ذكّر نفسك بموسم الطاعة." },
      { title: "يوم الجمعة", body: "تذكير بسنن الجمعة." },
      { title: "سورة الكهف", body: "لا يفوتك ورد الكهف." },
      { title: "المواسم الشرعية", body: "اغتنم هذه الأيام." },
      { title: "يوم الجمعة", body: "تذكير بسنن الجمعة." },
      { title: "سورة الكهف", body: "اقرأ ما تيسّر من الكهف." },
      { title: "المواسم الشرعية", body: "موسم خير؛ زد من العمل." },
    ],
  },
];

export function getNotifSection(id: NotifSectionId): NotifSectionMeta {
  const found = NOTIF_SECTIONS.find((s) => s.id === id);
  if (!found) throw new Error(`unknown notif section: ${id}`);
  return found;
}

export function defaultSectionsPrefs(): Record<NotifSectionId, NotifSectionPrefs> {
  return Object.fromEntries(NOTIF_SECTIONS.map((s) => [s.id, { ...s.defaults }])) as Record<
    NotifSectionId,
    NotifSectionPrefs
  >;
}

const LAST_MSG_KEY = "ssunnah-notif-section-last-msg-v1";

type LastMsgMap = Partial<Record<NotifSectionId, number>>;

function readLastMap(): LastMsgMap {
  try {
    const raw = localStorage.getItem(LAST_MSG_KEY);
    return raw ? (JSON.parse(raw) as LastMsgMap) : {};
  } catch {
    return {};
  }
}

function writeLastMap(map: LastMsgMap): void {
  try {
    localStorage.setItem(LAST_MSG_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** اختيار رسالة مع منع تكرار نفس الفهرس مرتين متتاليتين. */
export function pickSectionMessage(sectionId: NotifSectionId, pool?: readonly NotifMessage[]): NotifMessage {
  const section = getNotifSection(sectionId);
  const messages = pool && pool.length > 0 ? pool : section.messages;
  if (messages.length === 0) return { title: section.title, body: "" };
  if (messages.length === 1) return messages[0]!;

  const lastMap = readLastMap();
  const last = lastMap[sectionId];
  let idx = Math.floor(Math.random() * messages.length);
  if (last != null && idx === last) {
    idx = (idx + 1 + Math.floor(Math.random() * (messages.length - 1))) % messages.length;
  }
  lastMap[sectionId] = idx;
  writeLastMap(lastMap);
  return messages[idx]!;
}

/** معاينة ثابتة (بدون عشوائية) لواجهة الإعدادات. */
export function previewSectionMessage(sectionId: NotifSectionId): NotifMessage {
  const section = getNotifSection(sectionId);
  return section.messages[0] ?? { title: section.title, body: "" };
}

export function formatSectionStatus(prefs: NotifSectionPrefs): string {
  return prefs.enabled ? "مفعّل" : "متوقف";
}
