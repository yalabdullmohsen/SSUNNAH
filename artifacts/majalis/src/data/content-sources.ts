/**
 * مصدر الحقيقة الوحيد لقسم «المصادر والتراخيص» داخل التطبيق.
 * أي نوع محتوى يظهر في التطبيق يجب أن يكون له مدخل هنا (بوابة content-sources-gate).
 * لا يُوصَف مصدرٌ بترخيص مفتوح إلا بدليل موثّق؛ وما لم يُحسم يُوسَم `unknown` ويظهر في قائمة منفصلة.
 * التفاصيل: docs/store-release/LICENSE_DECISION_MATRIX.md · artifacts/majalis/docs/SOURCES_POLICY.md
 */

export const RIGHTS_SENTENCE =
  "ما أنشأناه في سُنّة حقوقه غير محفوظة لوجه الله، وما نقلناه عن المصادر المذكورة تعود حقوقه لأصحابه وفق تراخيصهم";

export const COPYRIGHT_NOTICE = "الحقوق غير محفوظة — لوجه الله";

/** open: ترخيص مفتوح موثّق · conditional: مسموح بشروط (إسناد/بلا تعديل…) · ours: من إنشائنا · unknown: لم يُحسم */
export type SourceStatus = "open" | "conditional" | "ours" | "unknown";

export type SourceEntry = {
  name: string;
  /** ما أخذناه منه */
  took: string;
  /** الترخيص أو الحالة بلفظ صريح */
  license: string;
  status: SourceStatus;
  url?: string;
};

export type ContentTypeId =
  | "quran-text"
  | "mushaf-layout-fonts"
  | "tafsir"
  | "translations"
  | "recitations"
  | "hadith"
  | "adhkar"
  | "prayer-times"
  | "lessons-scholars"
  | "fiqh-books"
  | "editorial"
  | "library-catalog"
  | "widgets-notifications"
  | "sounds"
  | "fonts-icons"
  | "libraries"
  | "tasmee-model";

export type ContentType = {
  id: ContentTypeId;
  label: string;
  entries: SourceEntry[];
};

export const STATUS_LABEL: Record<SourceStatus, string> = {
  open: "ترخيص مفتوح موثّق",
  conditional: "مسموح بشروط",
  ours: "من إنشائنا",
  unknown: "غير محسوم",
};

export const CONTENT_TYPES: ContentType[] = [
  {
    id: "quran-text",
    label: "القرآن الكريم (النص والرواية)",
    entries: [
      {
        name: "Tanzil — النص العثماني",
        took: "نص المصحف برواية حفص عن عاصم بالرسم العثماني، يُعرض حرفيًا بلا أي تعديل",
        license: "CC BY 3.0 — إسناد ورابط tanzil.net، ولا يُعدَّل النص",
        status: "conditional",
        url: "https://tanzil.net",
      },
      {
        name: "AlQuran Cloud — واجهة التوصيل",
        took: "جلب النص الأصلي (نسخة محلية محفوظة في الحزمة بعد التحقق)",
        license: "شروط الخدمة المنشورة؛ النص نفسه مصدره Tanzil",
        status: "conditional",
        url: "https://alquran.cloud",
      },
    ],
  },
  {
    id: "mushaf-layout-fonts",
    label: "المصحف: التخطيط وخطوط الصفحات",
    entries: [
      {
        name: "خطوط QPC V2 — مجمع الملك فهد (عبر Quran Foundation / QUL)",
        took: "رسم المصحف صفحةً بصفحة بخطوط الصفحات",
        license:
          "شروط Quran Foundation: إسناد في موضع ظاهر وبلا تعديل؛ تأكيد حساب التوزيع بانتظار قرار المالك",
        status: "unknown",
        url: "https://qul.tarteel.ai",
      },
      {
        name: "Quran.com — بيانات تخطيط الصفحات",
        took: "حدود الصفحات والأسطر وأرقام الآيات",
        license: "شروط واجهة Quran Foundation؛ التأكيد النهائي بانتظار قرار المالك",
        status: "unknown",
        url: "https://api.quran.com",
      },
    ],
  },
  {
    id: "tafsir",
    label: "التفسير",
    entries: [
      {
        name: "Quran.com API — توصيل التفاسير",
        took: "الميسّر والسعدي مضمّنان؛ ابن كثير والبغوي والطبري تُجلب عند الطلب بلا حفظ في الحزمة",
        license: "شروط Quran Foundation: إسناد، بلا تعديل، وحد لمدة التخزين المؤقت",
        status: "conditional",
        url: "https://quran.com",
      },
      {
        name: "التفسير الميسّر — مجمع الملك فهد لطباعة المصحف الشريف",
        took: "نص التفسير حرفيًا",
        license: "حقوق الطبعة لجهتها؛ إذن إعادة التضمين في الحزمة لم يُوثَّق",
        status: "unknown",
        url: "https://quran.com/tafsirs/ar-tafsir-muyassar",
      },
      {
        name: "تفسير السعدي — الشيخ عبد الرحمن بن ناصر السعدي",
        took: "نص التفسير حرفيًا",
        license: "المؤلف متوفى؛ حقوق الطبعة المنقولة عنها لم تُوثَّق",
        status: "unknown",
        url: "https://quran.com/tafsirs/ar-tafseer-al-saddi",
      },
    ],
  },
  {
    id: "translations",
    label: "ترجمات معاني القرآن",
    entries: [
      {
        name: "ترجمة Saheeh International عبر AlQuran Cloud",
        took: "ترجمة اختيارية للآية (الإنجليزية افتراضيًا)",
        license: "حقوق الترجمة لناشرها؛ شروط إعادة العرض لم تُوثَّق",
        status: "unknown",
        url: "https://alquran.cloud",
      },
    ],
  },
  {
    id: "recitations",
    label: "التلاوات",
    entries: [
      {
        name: "EveryAyah — الحصري والمنشاوي والعفاسي وغيرهم",
        took: "بث التلاوة آية بآية (لا ملفات صوتية في الحزمة ولا إعادة استضافة)",
        license: "حقوق التسجيلات لأصحابها؛ شروط البث لم تُوثَّق كتابيًا",
        status: "unknown",
        url: "https://everyayah.com",
      },
      {
        name: "MP3Quran — سور كاملة",
        took: "بث وتنزيل اختياري محلي لسور كاملة",
        license: "حقوق التسجيلات لأصحابها؛ شروط الاستخدام لم تُوثَّق كتابيًا",
        status: "unknown",
        url: "https://mp3quran.net",
      },
    ],
  },
  {
    id: "hadith",
    label: "الأحاديث",
    entries: [
      {
        name: "fawazahmed0/hadith-api — صحيح البخاري وصحيح مسلم (النسختان العربيتان)",
        took: "نص الحديث ورقمه وكتابه؛ الصحة منسوبة للكتاب لا لكل سند",
        license:
          "مستودع المؤلف بترخيص Unlicense، أما حقوق تحرير النسختين العربيتين فغير محددة في المستودع",
        status: "unknown",
        url: "https://github.com/fawazahmed0/hadith-api",
      },
      {
        name: "أحاديث موثّقة بالتخريج (صحيح/ضعيف/موضوع) — مجموعة المنصة",
        took: "1740 حديثًا بالكتاب والرقم والدرجة وتخريج الحكم",
        license: "اختيار المنصة وتنسيقها لنا؛ أصل ألفاظ كل حديث وحقوق طبعته غير موثّقين",
        status: "unknown",
      },
    ],
  },
  {
    id: "adhkar",
    label: "الأذكار والأدعية",
    entries: [
      {
        name: "أذكار الصباح والمساء والأحوال",
        took: "نصوص الأذكار منسوبة لحديثها (الكتاب والرقم والدرجة) لا إلى كتاب جامع",
        license: "حقوق تحرير طبعة «حصن المسلم» تتطلب إذنًا ولم يُحصل عليه؛ تُراجَع قبل أي اعتماد",
        status: "unknown",
      },
      {
        name: "أحاديث فضل الأذكار في الإشعارات (12 زوجًا)",
        took: "نص الحديث حرفيًا من الصحيحين مع الكتاب والرقم والدرجة",
        license: "من fawazahmed0/hadith-api (انظر بند الحديث)؛ حقوق تحرير النسخة العربية غير محددة",
        status: "unknown",
        url: "https://github.com/fawazahmed0/hadith-api",
      },
    ],
  },
  {
    id: "prayer-times",
    label: "مواقيت الصلاة",
    entries: [
      {
        name: "adhan-js — Batoul Apps",
        took: "حساب المواقيت على الجهاز دون اتصال بالإنترنت",
        license: "MIT",
        status: "open",
        url: "https://github.com/batoulapps/adhan-js",
      },
      {
        name: "طرق الحساب (الكويت — وزارة الأوقاف، أم القرى، رابطة العالم الإسلامي، المصرية وغيرها)",
        took: "الطريقة الافتراضية: وزارة الأوقاف — الكويت؛ ويختار المستخدم غيرها من الإعدادات",
        license: "معادلات فلكية منشورة لجهاتها؛ لا نصوص منقولة",
        status: "ours",
      },
      {
        name: "قائمة المدن والدول المضمّنة (927 مدينة)",
        took: "إحداثيات المدن وطريقة الحساب المقترنة بكل دولة",
        license: "أصل بيانات القائمة غير موثّق في المستودع",
        status: "unknown",
      },
    ],
  },
  {
    id: "lessons-scholars",
    label: "الدروس والعلماء",
    entries: [
      {
        name: "حسابات الجهات والمشايخ العامة (إنستغرام وتليجرام ومواقع رسمية)",
        took: "العنوان والشيخ والوقت والمكان والرابط الأصلي فقط — بلا نص طويل ولا صور كاملة",
        license: "المحتوى لأصحابه؛ سُنّة وسيط روابط (سياسة SOURCES_POLICY.md)",
        status: "conditional",
      },
      {
        name: "ملفات التعريف بالعلماء والمؤسسات",
        took: "نبذ تعريفية مكتوبة بعبارة المنصة مع روابط المراجع",
        license: "صياغتنا؛ والوقائع من مصادرها المذكورة في كل بطاقة",
        status: "ours",
      },
    ],
  },
  {
    id: "fiqh-books",
    label: "كتب الفقه",
    entries: [
      {
        name: "زاد المستقنع، المغني، كشاف القناع، عمدة الفقه، الروض المربع، الآداب الشرعية، رياض الصالحين",
        took: "عزو أبواب المسائل إلى هذه الكتب (ملخص مصوغ مع إحالة إلى الكتاب والباب)",
        license:
          "المؤلفون متوفون منذ قرون؛ لم يُتحقق أن أي لفظ غير منقول من طبعة محققة محفوظة الحقوق",
        status: "unknown",
      },
    ],
  },
  {
    id: "editorial",
    label: "المحتوى التعليمي (المعرفة والقصص والأسئلة والاختبارات)",
    entries: [
      {
        name: "بطاقات المعرفة والقصص والأسئلة والأجوبة وبنوك الأسئلة",
        took: "نصوص تعريفية وتعليمية مصوغة، لكل بطاقة مصدر ومرجع عند توفره",
        license: "سجل المصدر الفردي غير مكتمل في كل البطاقات؛ ما بلا مصدر عام لا يُفهرس",
        status: "unknown",
      },
    ],
  },
  {
    id: "library-catalog",
    label: "فهرس المراجع",
    entries: [
      {
        name: "فهرس المراجع (نحو 173 كتابًا)",
        took: "بطاقات بيانات (العنوان والمؤلف والوصف) ورابط خارجي للقراءة، دون استضافة نص كتاب",
        license: "فهرسة فردية ناقصة؛ لا يُعرض كتاب كامل دون حق عرض صريح",
        status: "unknown",
      },
    ],
  },
  {
    id: "widgets-notifications",
    label: "الودجات والإشعارات",
    entries: [
      {
        name: "نصوص الإشعارات والودجات",
        took: "المواقيت من محرك الحساب، وأحاديث الفضل من الصحيحين، وصياغة العناوين لنا",
        license: "تتبع حالة مصدرها المذكور في بندي المواقيت والأذكار؛ العناوين من إنشائنا",
        status: "ours",
      },
    ],
  },
  {
    id: "sounds",
    label: "الأصوات",
    entries: [
      {
        name: "نغمات التذكير القصيرة (5 ملفات)",
        took: "أصوات التذكير داخل التطبيق، مولّدة أصليًا",
        license: "CC0 — من إنشائنا",
        status: "ours",
      },
      {
        name: "أصوات النظام (iOS)",
        took: "صوت إشعارات الصلاة والأذكار الافتراضي",
        license: "مضمّنة في نظام التشغيل؛ لا نوزع ملفات",
        status: "open",
      },
    ],
  },
  {
    id: "fonts-icons",
    label: "الخطوط والأيقونات",
    entries: [
      {
        name: "خط Almarai",
        took: "خط الواجهة والنصوص (مستضاف محليًا بلا Google Fonts)",
        license: "SIL Open Font License 1.1",
        status: "open",
        url: "https://fonts.google.com/specimen/Almarai",
      },
      {
        name: "lucide-react",
        took: "أيقونات الواجهة",
        license: "ISC",
        status: "open",
        url: "https://lucide.dev",
      },
      {
        name: "شارة السورة والخرطوش وعلامة الآية (SVG)",
        took: "زخارف واجهة المصحف",
        license: "رسم أصلي — من إنشائنا",
        status: "ours",
      },
    ],
  },
  {
    id: "libraries",
    label: "المكتبات مفتوحة المصدر",
    entries: [
      {
        name: "React · Vite · Capacitor · wouter · Supabase JS وما يتبعها",
        took: "تشغيل التطبيق والواجهة",
        license: "تراخيص تساهلية (MIT وISC وApache-2.0)؛ بوابة CI تمنع GPL وAGPL وSSPL",
        status: "open",
        url: "https://github.com/yalabdullmohsen/SSUNNAH/blob/main/docs/store-release/THIRD_PARTY_NOTICES.md",
      },
    ],
  },
  {
    id: "tasmee-model",
    label: "نموذج التسميع (التعرّف الصوتي على الجهاز)",
    entries: [
      {
        name: "tarteel-ai/whisper-base-ar-quran",
        took: "نموذج التعرّف على التلاوة، محوَّل إلى CoreML بلا أي تدريب إضافي، ويعمل على جهازك ولا يُرسَل صوت",
        license: "Apache-2.0 (مشتق ومحوَّل من النموذج الأصلي؛ التعديل الوحيد التحويل وإرفاق tokenizer)",
        status: "open",
        url: "https://huggingface.co/tarteel-ai/whisper-base-ar-quran",
      },
      {
        name: "OpenAI Whisper (أصل النموذج)",
        took: "البنية الأصلية التي ضُبط منها نموذج Tarteel",
        license: "MIT",
        status: "open",
        url: "https://github.com/openai/whisper",
      },
      {
        name: "WhisperKit — Argmax",
        took: "محرك تشغيل النموذج على الجهاز",
        license: "MIT",
        status: "open",
        url: "https://github.com/argmaxinc/argmax-oss-swift",
      },
      {
        name: "بيانات تدريب نموذج Tarteel",
        took: "لا شيء منقول؛ هذا بيان لما لم يُوثَّق",
        license: "بطاقة النموذج لا تذكر مجموعة التدريب ولا ترخيصها",
        status: "unknown",
      },
    ],
  },
];

/** كل مجلد في public/data يجب أن يُنسب إلى نوع محتوى (أو يُصرَّح أنه تقني). */
export const DATA_DIR_CONTENT: Record<string, ContentTypeId | "technical"> = {
  "adhan-audio-remote.json": "sounds",
  audio: "recitations",
  fiqh: "fiqh-books",
  graph: "editorial",
  hadith: "hadith",
  "hadith-verified": "hadith",
  knowledge: "editorial",
  lessons: "lessons-scholars",
  prayer: "prayer-times",
  qa: "editorial",
  quiz: "editorial",
  quran: "quran-text",
  "quran-audio-remote.json": "recitations",
  "quran-people": "editorial",
  "quran-v2": "mushaf-layout-fonts",
  search: "technical",
  sources: "lessons-scholars",
  stories: "editorial",
  tafsir: "tafsir",
  "tafsir-audio-catalog.json": "tafsir",
  "tafsir-audio-map.json": "tafsir",
  "tafsir-audio-remote.json": "tafsir",
  "tasmee-flags.json": "technical",
  "tasmee-model.json": "tasmee-model",
};

/** كل قسم في sections.registry يجب أن يُنسب إلى نوع محتوى أو يُصرَّح أنه بلا محتوى مصدري. */
export const SECTION_CONTENT: Record<string, ContentTypeId | "none"> = {
  home: "none",
  quran: "quran-text",
  lessons: "lessons-scholars",
  prayer: "prayer-times",
  sections: "none",
  "open-mushaf": "mushaf-layout-fonts",
  "quran-surahs": "quran-text",
  tafsir: "tafsir",
  "quran-tilawa": "recitations",
  "quran-tajweed": "editorial",
  "quran-qiraat": "editorial",
  "quran-seven-ahruf": "editorial",
  "quran-figures": "editorial",
  "quran-asbab": "editorial",
  "ulum-quran": "editorial",
  "quran-numbers": "quran-text",
  flashcards: "editorial",
  "quran-ulum-terms": "editorial",
  "quran-circles": "lessons-scholars",
  competitions: "editorial",
  "lessons-archive": "lessons-scholars",
  "quran-search": "quran-text",
  "quran-topics": "editorial",
  aqidah: "editorial",
  "islamic-sects": "editorial",
  "quran-sciences": "editorial",
  hadith: "hadith",
  "arbaeen-nawawi": "hadith",
  fawaid: "editorial",
  miracles: "editorial",
  fiqh: "fiqh-books",
  tazkiya: "editorial",
  "sins-and-rights": "editorial",
  tawba: "editorial",
  akhlaq: "editorial",
  "adab-talab-ilm": "editorial",
  "usul-fiqh": "fiqh-books",
  seerah: "editorial",
  "islamic-history": "editorial",
  "arabic-language": "editorial",
  "maqasid-sharia": "editorial",
  "dalail-nubuwwah": "editorial",
  prophets: "editorial",
  nations: "editorial",
  "discover-islam": "editorial",
  shubuhat: "editorial",
  "new-muslim": "editorial",
  "islam-guide": "editorial",
  library: "library-catalog",
  research: "editorial",
  glossary: "editorial",
  universities: "lessons-scholars",
  tasbih: "adhkar",
  adhkar: "adhkar",
  duas: "adhkar",
  "sunan-yawmiyya": "hadith",
  "wasaya-nabawiyya": "hadith",
  "fadail-aamal": "hadith",
  raqaiq: "editorial",
  wird: "quran-text",
  qibla: "none",
  "hijri-calendar": "none",
  qa: "editorial",
  progress: "none",
  assistant: "none",
  updates: "none",
  account: "none",
  settings: "none",
  "athan-settings": "prayer-times",
  notifications: "widgets-notifications",
  support: "none",
  about: "none",
  methodology: "none",
  sources: "lessons-scholars",
  "lesson-sources": "lessons-scholars",
  "fatwa-policy": "none",
  privacy: "none",
  terms: "none",
  "delete-account": "none",
  teachers: "lessons-scholars",
  "duas-quran": "adhkar",
  contact: "none",
  "privacy-center": "none",
  "widget-center": "widgets-notifications",
};

export function unknownLicenseEntries(): Array<SourceEntry & { typeId: ContentTypeId; typeLabel: string }> {
  return CONTENT_TYPES.flatMap((t) =>
    t.entries
      .filter((e) => e.status === "unknown")
      .map((e) => ({ ...e, typeId: t.id, typeLabel: t.label })),
  );
}
