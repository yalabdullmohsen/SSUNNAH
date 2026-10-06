import { BRAND } from "@/shared/config/brand";
/**
 * SSOT — سجل أقسام سُنّة.
 * كل سطح تنقّل (شريط سفلي · المزيد · الدرج · الرئيسية · البحث) يُولَّد من هنا.
 * ممنوع إضافة عنصر تنقّل يدوي خارج هذا الملف.
 */
import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Award,
  BadgeCheck,
  Bell,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  BookText,
  BookUser,
  BookHeart,
  BarChart3,
  Book,
  Bookmark,
  BookCopy,
  Building2,
  Calendar,
  CircleDot,
  Clock,
  Compass,
  Feather,
  FileStack,
  FileText,
  Flame,
  FlaskConical,
  Gem,
  FolderOpen,
  Gavel,
  GitBranch,
  GitFork,
  GraduationCap,
  HandHeart,
  HandHelping,
  Hash,
  Headphones,
  Heart,
  HeartHandshake,
  HeartPulse,
  HelpCircle,
  History,
  Home,
  Info,
  Landmark,
  Languages,
  LayoutGrid,
  Layers,
  Leaf,
  Lightbulb,
  ListOrdered,
  Lock,
  Mail,
  Map,
  MapPin,
  Microscope,
  MessageCircleQuestion,
  MessageSquareHeart,
  MoonStar,
  Mountain,
  Network,
  NotebookPen,
  Presentation,
  Radio,
  RotateCcw,
  Scale,
  School,
  Scroll,
  ScrollText,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Shapes,
  Sparkles,
  Sprout,
  Sun,
  TextSearch,
  Trash2,
  Trophy,
  User,
  UserRound,
  Users,
  Volume2,
  Wand2,
  Waypoints,
} from "lucide-react";
import { isHiddenFromNav } from "@/lib/nav-visibility";

/**
 * الهيكل المعلوماتي الموحّد (IA) — سبع مجموعات بترتيب ثابت.
 * كل قائمة (الدرج · التذييل · صفحة الأقسام · المزيد · مركز الخدمات) تُبنى منها،
 * وعضوية القسم في كل قائمة تُعلَن عبر `surfaces` في مدخله هنا فقط.
 * انظر docs/design/INFORMATION_ARCHITECTURE.md.
 */
export type SectionGroup =
  | "quran"
  | "sunnah"
  | "fiqh"
  | "worship"
  | "learning"
  | "knowledge"
  | "account";

/**
 * أسطح العرض: bottomNav · home · moreHub (صفحة الأقسام) · drawer (القائمة الجانبية)
 * · footer (التذييل) · search · quranHub · lessonsHub.
 */
export type Surface =
  | "bottomNav"
  | "home"
  | "moreHub"
  | "drawer"
  | "footer"
  | "search"
  | "quranHub"
  | "lessonsHub";

/** أين يُعرض القسم أساساً — مكان واحد فقط كبطاقة هب */
export type SectionHub = "quran" | "lessons" | "sections";

export type SectionStatus = "live" | "beta" | "hidden";

export interface SectionDef {
  id: string;
  /** الاسم الكامل المعتمد — بطاقات الهبات والبحث والرئيسية */
  label: string;
  /** الاسم المختصر في القوائم (الشريطان · الدرج · التذييل) إن اختلف */
  navLabel?: string;
  subtitle: string;
  /** توضيح قصير تحت الاسم في القائمة الجانبية */
  navHint?: string;
  route: string;
  icon: LucideIcon;
  group: SectionGroup;
  order: number;
  featured?: boolean;
  surfaces: Surface[];
  status: SectionStatus;
  keywords: string[];
  aliases?: string[];
  /** مكان العرض الأساسي — لا تكرار بطاقات بين الهبات */
  hub: SectionHub;
  /** لون العلامة — يُحقَن على الحاوية كـ --section-accent */
  accent?: string;
  /** قسم غير مكتمل للعامة — يُستبعد من القوائم ويبقى مساره متاحًا */
  comingSoon?: boolean;
}

/** لون العلامة الافتراضي لكل مجموعة أقسام */
export const SECTION_GROUP_ACCENT: Record<SectionGroup, string> = {
  quran: "#2A7A6E",
  sunnah: "#0E7A5F",
  fiqh: BRAND.colorDay,
  worship: "#3A9A7A",
  learning: "#1F5C48",
  knowledge: "#8B6914",
  account: BRAND.colorDay,
};

/** تجاوزات لونية تطابق سمات TopicPage */
const SECTION_ACCENT_BY_ID: Record<string, string> = {
  hadith: "#0E7A5F",
  seerah: "#A67C3A",
  "islamic-history": "#7A6B3A",
  tafsir: "#2A7A6E",
  "quran-tajweed": "#2A7A6E",
  "quran-qiraat": "#2A7A6E",
  "ulum-quran": "#2A7A6E",
  "quran-asbab": "#2A7A6E",
  "quran-figures": "#2A7A6E",
  "arbaeen-nawawi": "#0E7A5F",
  prophets: "#1A8A7A",
  nations: "#7A6B3A",
  library: "#8B6914",
  research: "#8B6914",
  glossary: "#8B6914",
  universities: "#8B6914",
  "discover-islam": "#1F5C48",
  fiqh: "#1F6B4A",
  "usul-fiqh": "#8B7A3A",
  adhkar: "#3A9A7A",
  duas: "#3A9A7A",
  fawaid: "#B45309",
  miracles: "#0F5C45",
  lessons: "#1F6B56",
  qa: "#1F6B56",
  "islam-guide": "#7A6B3A",
};

export function resolveSectionAccent(s: {
  id: string;
  group: SectionGroup;
  accent?: string;
}): string {
  return s.accent ?? SECTION_ACCENT_BY_ID[s.id] ?? SECTION_GROUP_ACCENT[s.group];
}

export const SECTION_GROUP_META: Record<
  SectionGroup,
  { label: string; subtitle: string; order: number; rowStyle: boolean }
> = {
  quran: { label: "القرآن الكريم", subtitle: "المصحف • التفسير • التلاوة", order: 1, rowStyle: false },
  sunnah: { label: "الحديث والسنة", subtitle: "الحديث • السيرة • السنن", order: 2, rowStyle: false },
  fiqh: { label: "العقيدة والفقه", subtitle: "العقيدة • الفقه • التزكية", order: 3, rowStyle: false },
  worship: { label: "العبادات والأذكار", subtitle: "الصلاة • الأذكار • الأدعية", order: 4, rowStyle: false },
  learning: { label: "الدروس والعلماء", subtitle: "الدروس • العلماء • المراجعة", order: 5, rowStyle: false },
  knowledge: { label: "المعرفة والتاريخ", subtitle: "التاريخ • القصص • الفوائد", order: 6, rowStyle: false },
  account: { label: "الحساب والإعدادات", subtitle: "الإعدادات • الدعم • السياسات", order: 7, rowStyle: true },
};

export const SECTION_GROUP_ORDER: SectionGroup[] = [
  "quran",
  "sunnah",
  "fiqh",
  "worship",
  "learning",
  "knowledge",
  "account",
];

/** مسارات قديمة → مسار معتمد (دمج إلزامي) */
export const SECTION_MERGE_REDIRECTS: ReadonlyArray<{ from: string; to: string; note: string }> = [
  { from: "/memorize", to: "/flashcards", note: "بطاقات المراجعة → بطاقات الحفظ والمراجعة" },
  { from: "/my-citations", to: "/flashcards", note: "المحفوظات → بطاقات الحفظ والمراجعة" },
  { from: "/citations", to: "/flashcards", note: "citations → بطاقات الحفظ والمراجعة" },
  { from: "/about-us", to: "/about", note: "من نحن → عن سُنّة" },
  { from: "/aqidah", to: "/tawhid", note: "عقيدة قديم → التوحيد/العقيدة" },
  { from: "/prayer", to: "/prayer-times", note: "صلاة مختصر → مواقيت الصلاة" },
  { from: "/more", to: "/sections", note: "المزيد (ملغاة) → الأقسام" },
  { from: "/quran/recitation-test-ai", to: "/quran-hub", note: "تسميع الذكاء الاصطناعي (ملغى) → مركز القرآن" },
  { from: "/learn", to: "/lessons", note: "دروس التعلّم (ملغاة) → الدروس" },
];

const NAV: Surface[] = ["moreHub", "home", "search"];
const ACCOUNT: Surface[] = ["moreHub", "search"];
/** الحساب/الإعدادات في الدرج — بلا تكرار أقسام المحتوى */
const ACCOUNT_DRAWER: Surface[] = ["moreHub", "search", "drawer"];
const SEARCH_ONLY: Surface[] = ["search"];

/** أقسام مركز القرآن الكريم — تُعرض هناك فقط كبطاقات */
const QURAN_HUB_IDS = new Set([
  "open-mushaf",
  "quran-surahs",
  "tafsir",
  "quran-tilawa",
  "quran-tajweed",
  "quran-qiraat",
  "quran-seven-ahruf",
  "quran-figures",
  "quran-asbab",
  "ulum-quran",
  "quran-numbers",
  "flashcards",
  "quran-ulum-terms",
]);

const LESSONS_HUB_IDS = new Set(["quran-circles", "competitions", "lessons-archive"]);

type SectionSeed = Omit<SectionDef, "hub" | "accent"> & {
  hub?: SectionHub;
  accent?: string;
};

const SECTION_SEEDS: SectionSeed[] = [
  // —— شريط سفلي ——
  {
    id: "home",
    label: "الرئيسية",
    subtitle: "مدخل المنصة للأقسام والأدوات",
    route: "/",
    icon: Home,
    group: "knowledge",
    order: -10,
    surfaces: ["bottomNav", "search", "home"],
    status: "live",
    keywords: ["رئيسية", "home"],
  },
  {
    id: "quran",
    label: "مركز القرآن الكريم",
    navLabel: "القرآن",
    subtitle: "مصحف وتلاوة وتجويد وحفظ — من موضعك الأخير",
    navHint: "مركز القراءة والتعلّم",
    route: "/quran-hub",
    icon: BookOpen,
    group: "quran",
    order: 0,
    surfaces: ["bottomNav", "moreHub", "search", "drawer", "footer"],
    status: "live",
    keywords: ["مصحف", "قرآن", "quran", "مركز القرآن الكريم"],
    aliases: ["القرآن", "القرآن الكريم", "قرآن", "المصحف", "مركز القرآن الكريم", "مركز القرآن"],
  },
  {
    id: "lessons",
    label: "الدروس",
    navLabel: "الدروس",
    subtitle: "الدروس والمحاضرات",
    navHint: "الدروس والمحاضرات",
    route: "/lessons",
    icon: GraduationCap,
    group: "learning",
    order: -8,
    surfaces: ["bottomNav", "home", "search", "drawer", "footer"],
    status: "live",
    keywords: ["دروس", "شروح"],
    aliases: ["الدروس", "الدروس العلمية"],
  },
  {
    id: "prayer",
    label: "مواقيت الصلاة",
    navLabel: "الصلاة",
    subtitle: "أوقات الصلاة والقبلة وتنبيه الأذان لموقعك",
    route: "/prayer-times",
    icon: MoonStar,
    group: "worship",
    order: -7,
    surfaces: ["bottomNav", "search", "drawer", "footer"],
    status: "live",
    keywords: ["صلاة", "أذان", "مواقيت"],
  },
  {
    id: "sections",
    label: "جميع الأقسام",
    navLabel: "الأقسام",
    subtitle: "دليل كامل لمجالات العلم والتعليم والأدوات",
    navHint: "دليل كامل للأقسام",
    route: "/sections",
    icon: Layers,
    group: "knowledge",
    order: 999,
    surfaces: ["bottomNav", "drawer", "footer"],
    status: "live",
    keywords: ["أقسام", "sections", "دليل"],
    aliases: ["المزيد", "الأقسام"],
  },

  // —— مركز القرآن الكريم (hub: quran) ——
  {
    id: "open-mushaf",
    label: "فتح المصحف",
    navLabel: "المصحف",
    subtitle: "متابعة القراءة من آخر موضع محفوظ",
    route: "/mushaf",
    icon: Book,
    group: "quran",
    order: -20,
    surfaces: [...SEARCH_ONLY, "drawer", "footer"],
    status: "live",
    keywords: ["مصحف", "فتح المصحف", "قراءة"],
    aliases: ["المصحف"],
    hub: "quran",
  },
  {
    id: "quran-surahs",
    label: "فهرس السور",
    subtitle: "تصفّح سور القرآن الكريم",
    route: "/quran/surahs",
    icon: FileStack,
    group: "quran",
    order: 2,
    surfaces: SEARCH_ONLY,
    status: "live",
    keywords: ["سور", "فهرس"],
    hub: "quran",
  },
  {
    id: "tafsir",
    label: "التفسير",
    subtitle: "تفاسير وآيات مختارة",
    route: "/tafsir",
    icon: BookOpenCheck,
    group: "quran",
    order: 3,
    surfaces: [...SEARCH_ONLY, "drawer", "footer"],
    status: "live",
    keywords: ["تفسير", "آيات"],
    hub: "quran",
  },
  {
    id: "quran-tilawa",
    label: "التلاوة والقرّاء",
    navLabel: "التلاوة",
    subtitle: "استماع القرّاء عبر المصحف",
    route: "/quran-hub/tilawa",
    icon: Headphones,
    group: "quran",
    order: 4,
    surfaces: [...SEARCH_ONLY, "drawer"],
    status: "live",
    keywords: ["تلاوة", "قرّاء", "استماع", "قارئ"],
    hub: "quran",
  },
  {
    id: "quran-tajweed",
    label: "التجويد",
    subtitle: "مخارج وصفات وأحكام التلاوة",
    route: "/quran-hub/tajweed",
    icon: AudioLines,
    group: "quran",
    order: 5,
    surfaces: [...SEARCH_ONLY, "footer"],
    status: "live",
    keywords: [
      "تجويد",
      "أحكام النون",
      "المدود",
      "مخارج",
      "قلقلة",
      "وقف",
      "حفص",
      "الشاطبية",
    ],
    hub: "quran",
  },
  {
    id: "quran-qiraat",
    label: "القراءات العشر",
    subtitle: "القرّاء والروايات وأصولها",
    route: "/quran-hub/qiraat",
    icon: GitBranch,
    group: "quran",
    order: 7,
    surfaces: SEARCH_ONLY,
    status: "live",
    keywords: [
      "قراءات",
      "رواية",
      "حفص",
      "ورش",
      "قالون",
      "شاطبية",
      "الدرة",
      "طيبة النشر",
      "نافع",
      "عاصم",
    ],
    hub: "quran",
  },
  {
    id: "quran-seven-ahruf",
    label: "الأحرف السبعة",
    subtitle: "نزول القرآن على سبعة أحرف والفرق عن القراءات",
    route: "/quran-hub/seven-ahruf",
    icon: Sparkles,
    group: "quran",
    order: 8,
    surfaces: SEARCH_ONLY,
    status: "live",
    keywords: [
      "أحرف سبعة",
      "سبعة أحرف",
      "الأحرف السبعه",
      "سبعه احرف",
      "عمر وهشام",
      "أبي بن كعب",
      "عرضة أخيرة",
    ],
    hub: "quran",
  },
  {
    id: "quran-figures",
    label: "المذكورون في القرآن الكريم",
    subtitle: "أعلام ومواضع ذكر — بلا أنبياء (قسمهم مستقل)",
    route: "/quran/people",
    icon: Users,
    group: "quran",
    order: 9,
    surfaces: [...SEARCH_ONLY, "footer"],
    status: "live",
    keywords: ["أعلام قرآن", "شخصيات", "المذكورون"],
    aliases: ["الذين ذكروا في القرآن", "الذين ذُكروا في القرآن", "المذكورون في القرآن"],
    hub: "quran",
  },
  {
    id: "quran-asbab",
    label: "أسباب النزول",
    subtitle: "سياقات النزول وأسباب التسمية والمحاور",
    route: "/quran/surah-stories",
    icon: Waypoints,
    group: "quran",
    order: 9,
    surfaces: SEARCH_ONLY,
    status: "live",
    keywords: ["أسباب النزول", "قصص سور", "سبب تسمية", "محاور السور", "نزول"],
    aliases: ["قصص السور", "قصص القرآن", "قصص سور القرآن", "أسباب نزول"],
    hub: "quran",
  },
  {
    id: "ulum-quran",
    label: "علوم القرآن",
    subtitle: "المكي والمدني والرسم وعدّ الآي",
    route: "/ulum-quran",
    icon: BookCopy,
    group: "quran",
    order: 10,
    surfaces: [...SEARCH_ONLY, "drawer"],
    status: "live",
    keywords: ["علوم قرآن", "ناسخ", "منسوخ", "رسم", "عد الآي"],
    aliases: ["علوم القرآن"],
    hub: "quran",
  },
  {
    id: "quran-numbers",
    label: "القرآن في أرقام",
    subtitle: "إحصاءات موثّقة من مصادر معتمدة",
    route: "/quran-hub/numbers",
    icon: BarChart3,
    group: "quran",
    order: 11,
    surfaces: SEARCH_ONLY,
    status: "live",
    keywords: ["إحصاءات", "عدد الآيات", "عدد السور", "كم آية", "كم كلمة"],
    aliases: ["إحصائيات القرآن", "أرقام القرآن"],
    hub: "quran",
  },
  {
    id: "flashcards",
    label: "المحفوظات",
    navLabel: "المحفوظات",
    subtitle: "حفظ ومراجعة آيات القرآن",
    navHint: "مراجعة وحفظ",
    route: "/flashcards",
    icon: Bookmark,
    group: "learning",
    order: 12,
    surfaces: [...SEARCH_ONLY, "drawer"],
    status: "live",
    keywords: ["بطاقات", "حفظ", "مراجعة", "محفوظات", "حفظ قرآن"],
    aliases: ["المحفوظات", "بطاقات المراجعة", "بطاقات حفظ القرآن", "بطاقات الحفظ والمراجعة"],
    hub: "quran",
  },
  {
    id: "quran-ulum-terms",
    label: "مصطلحات علوم القرآن",
    subtitle: "٢٧ مصطلحًا في علوم القرآن",
    route: "/quran-hub/terms",
    icon: Languages,
    group: "quran",
    order: 13,
    surfaces: SEARCH_ONLY,
    status: "live",
    keywords: ["مصطلحات قرآن", "معجم قرآني", "علوم القرآن"],
    hub: "quran",
  },
  {
    id: "quran-circles",
    label: "حلقات القرآن",
    subtitle: "حلقات تحفيظ ودورات تجويد منظمة",
    route: "/quran-circles",
    icon: School,
    group: "learning",
    order: 5,
    surfaces: SEARCH_ONLY,
    status: "live",
    keywords: ["حلقات", "تحفيظ", "دورات قرآن"],
    aliases: ["حلقات التحفيظ", "دور التحفيظ"],
    hub: "lessons",
  },
  {
    id: "competitions",
    label: "المسابقات",
    subtitle: "إعلانات مسابقات شرعية وقرآنية خارجية",
    route: "/competitions",
    icon: Trophy,
    group: "learning",
    order: 4,
    surfaces: [...SEARCH_ONLY, "footer"],
    status: "live",
    keywords: ["مسابقات", "إعلان مسابقة", "حفظ", "تسميع", "جوائز", "الماهر"],
    aliases: ["مسابقة", "إعلانات المسابقات"],
    hub: "lessons",
  },
  {
    id: "lessons-archive",
    label: "الأرشيف",
    subtitle: "الدروس السابقة المسجّلة",
    route: "/lessons/archive",
    icon: Clock,
    group: "learning",
    order: 6,
    surfaces: SEARCH_ONLY,
    status: "live",
    keywords: ["أرشيف دروس", "دروس سابقة"],
    hub: "lessons",
  },
  {
    id: "quran-search",
    label: "البحث في القرآن",
    subtitle: "ابحث في آيات المصحف",
    route: "/quran/search",
    icon: TextSearch,
    group: "quran",
    order: 90,
    surfaces: ACCOUNT,
    status: "live",
    keywords: ["بحث", "آيات"],
    hub: "sections",
  },
  {
    id: "quran-topics",
    label: "موضوعات القرآن",
    subtitle: "مداخل موضوعية لعلوم القرآن",
    route: "/quran-knowledge",
    icon: Shapes,
    group: "quran",
    order: 91,
    surfaces: SEARCH_ONLY,
    status: "live",
    keywords: ["موضوعات قرآن", "محاور"],
    hub: "sections",
  },

  // —— ١. العلوم الشرعية ——
  {
    id: "aqidah",
    label: "العقيدة",
    subtitle: "أصول الإيمان والتوحيد",
    route: "/tawhid",
    icon: Shield,
    group: "fiqh",
    order: 10,
    featured: true,
    surfaces: [...NAV, "drawer", "footer"],
    status: "live",
    keywords: ["عقيدة", "توحيد", "إيمان"],
  },
  {
    id: "islamic-sects",
    label: "الفرق الإسلامية",
    subtitle: "قريبًا — عرض تاريخي بعد المراجعة",
    route: "/islamic-sects",
    // أيقونة فريدة — Users محجوزة لـ quran-figures (بوابة verify-sections-registry)
    icon: GitFork,
    group: "fiqh",
    order: 20,
    surfaces: NAV,
    status: "live",
    comingSoon: true,
    keywords: ["فرق", "مذاهب", "ملل", "نحل", "عقائد الفرق"],
    aliases: ["الفرق والمذاهب", "الفرق", "المذاهب العقدية", "أهل السنة والفرق"],
    accent: "#0B3D2E",
  },
  {
    id: "quran-sciences",
    label: "القرآن وعلومه",
    subtitle: "علوم القرآن والتجويد",
    route: "/quran-sciences",
    icon: BookMarked,
    group: "quran",
    order: 20,
    surfaces: SEARCH_ONLY,
    status: "hidden",
    keywords: ["علوم قرآن", "تجويد"],
    aliases: ["بوابة علوم القرآن"],
  },
  {
    id: "hadith",
    label: "الحديث وعلومه",
    navLabel: "الحديث",
    subtitle: "أحاديث وشروح ومصطلح الحديث",
    route: "/hadith",
    icon: ScrollText,
    group: "sunnah",
    order: 10,
    featured: true,
    surfaces: [...NAV, "drawer", "footer"],
    status: "live",
    keywords: ["حديث", "سنّة"],
    aliases: ["الحديث"],
  },
  {
    id: "arbaeen-nawawi",
    label: "الأربعون النووية",
    subtitle: "أربعون حديثاً جامعاً مع شرح موجز وفوائد",
    route: "/arbaeen-nawawi",
    icon: ListOrdered,
    group: "sunnah",
    order: 20,
    surfaces: [...NAV, "footer"],
    status: "live",
    keywords: ["أربعون", "نووية", "نووي", "أحاديث جامعة"],
    aliases: ["الأربعين النووية", "أربعون حديثاً", "الأربعون"],
    accent: "#0E7A5F",
  },
  {
    id: "fawaid",
    label: "الفوائد",
    navLabel: "الفوائد",
    subtitle: "فوائد علمية مختارة",
    navHint: "فوائد علمية مختارة",
    route: "/fawaid",
    icon: Lightbulb,
    group: "knowledge",
    order: 50,
    surfaces: [...NAV, "drawer"],
    status: "live",
    keywords: ["فوائد", "فائدة", "مختصرات", "رقائق"],
    aliases: ["الفوائد", "الفوائد العلمية", "الفوائد الدينية", "فوائد شرعية"],
    accent: "#B45309",
  },
  {
    id: "miracles",
    label: "الإعجاز العلمي",
    navLabel: "الإعجاز",
    subtitle: "تأملات علمية منضبطة في إشارات الوحي",
    navHint: "الإعجاز العلمي",
    route: "/miracles",
    icon: Microscope,
    group: "knowledge",
    order: 40,
    surfaces: [...NAV, "drawer"],
    status: "live",
    keywords: ["إعجاز", "معجزات", "إشارات كونية", "علوم", "إعجاز القرآن", "إعجاز السنة"],
    aliases: ["المعجزات", "إشارات كونية", "إعجاز علمي", "الإعجاز", "الإعجاز العلمي", "الإعجاز العلمي في القرآن والسنة"],
    accent: "#0F5C45",
  },
  {
    id: "fiqh",
    label: "الفقه",
    navLabel: "الفقه",
    subtitle: "الأحكام الفقهية",
    navHint: "الأحكام الفقهية",
    route: "/fiqh",
    icon: Scale,
    group: "fiqh",
    order: 30,
    featured: true,
    surfaces: [...NAV, "drawer", "footer"],
    status: "live",
    keywords: ["فقه", "أحكام", "فتاوى"],
    aliases: ["الفقه", "الفقه الإسلامي"],
  },
  {
    id: "tazkiya",
    label: "التزكية والتوبة",
    navLabel: "التزكية",
    subtitle: "الذنوب والحقوق، والتوبة والاستغفار",
    route: "/tazkiya",
    icon: HeartPulse,
    group: "fiqh",
    order: 60,
    surfaces: [...NAV, "drawer"],
    status: "live",
    keywords: ["تزكية", "توبة", "ذنوب", "حقوق", "استغفار", "معاصي", "كبائر"],
    aliases: ["الذنوب والتوبة", "التوبة والذنوب", "التزكية", "الذنوب والحقوق"],
  },
  {
    id: "sins-and-rights",
    label: "الذنوب والحقوق",
    subtitle: "كبائر الذنوب وحقوق الله والعباد",
    route: "/sins-and-rights",
    icon: HeartHandshake,
    group: "fiqh",
    order: 70,
    surfaces: SEARCH_ONLY,
    status: "live",
    keywords: ["ذنوب", "حقوق", "توبة", "كبائر", "معاصي"],
    aliases: ["المعاصي", "حقوق العباد"],
  },
  {
    id: "tawba",
    label: "التوبة والاستغفار",
    subtitle: "شروط التوبة وفضل الاستغفار",
    route: "/tawba",
    icon: RotateCcw,
    group: "fiqh",
    order: 80,
    surfaces: SEARCH_ONLY,
    status: "live",
    keywords: ["توبة", "استغفار", "ندم", "تزكية"],
  },
  {
    id: "akhlaq",
    label: "مكارم الأخلاق",
    subtitle: "أخلاق المسلم من القرآن والسنة",
    route: "/akhlaq",
    icon: Leaf,
    group: "fiqh",
    order: 90,
    surfaces: NAV,
    status: "live",
    keywords: ["أخلاق", "آداب", "تزكية", "حُسن الخلق"],
    aliases: ["الأخلاق", "الأخلاق الإسلامية"],
  },
  {
    id: "adab-talab-ilm",
    label: "آداب طالب العلم",
    subtitle: "شروط وآداب طلب العلم الشرعي",
    route: "/adab-talab-ilm",
    icon: BookUser,
    group: "learning",
    order: 60,
    surfaces: NAV,
    status: "live",
    keywords: ["آداب", "طالب العلم", "طلب العلم", "منهجية"],
    aliases: ["أدب طلب العلم", "آداب الطلب"],
    hub: "sections",
  },
  {
    id: "usul-fiqh",
    label: "أصول الفقه",
    subtitle: "قواعد الاستنباط والأدلة",
    route: "/fiqh/usul",
    icon: Network,
    group: "fiqh",
    order: 40,
    surfaces: NAV,
    status: "live",
    keywords: ["أصول", "استنباط"],
  },
  {
    id: "seerah",
    label: "السيرة النبوية",
    navLabel: "السيرة",
    subtitle: "سيرة النبي ﷺ من المولد إلى الوفاة",
    navHint: "السيرة النبوية",
    route: "/seerah",
    icon: Mountain,
    group: "sunnah",
    order: 60,
    featured: true,
    surfaces: [...NAV, "drawer", "footer"],
    status: "live",
    keywords: ["سيرة", "مغازي"],
  },
  {
    id: "islamic-history",
    label: "التاريخ الإسلامي",
    subtitle: "خط زمني بالأحداث من قبل البعثة إلى يومنا",
    route: "/tarikh-islami",
    icon: History,
    group: "knowledge",
    order: 10,
    surfaces: [...NAV, "drawer", "footer"],
    status: "live",
    featured: true,
    keywords: ["تاريخ", "حضارة", "سيرة", "فتوحات"],
  },
  {
    id: "arabic-language",
    label: "النحو والصرف والبلاغة لطالب العلم",
    navLabel: "النحو والعربية",
    subtitle: "مسار ميسر لفهم العربية المعينة على فهم الوحي",
    route: "/arabic-language",
    icon: Gem,
    group: "knowledge",
    order: 80,
    surfaces: NAV,
    status: "live",
    keywords: ["نحو", "صرف", "بلاغة", "لغة عربية", "العربية"],
    aliases: ["النحو والصرف", "البلاغة", "اللغة العربية", "النحو والعربية"],
    accent: "#3F6F5A",
  },
  {
    id: "maqasid-sharia",
    label: "مقاصد الشريعة",
    subtitle: "مداخل في كليات الشريعة وغايات الأحكام",
    route: "/maqasid-sharia",
    icon: Compass,
    group: "fiqh",
    order: 50,
    surfaces: NAV,
    status: "live",
    keywords: ["مقاصد", "كليات", "شريعة"],
  },
  {
    id: "dalail-nubuwwah",
    label: "دلائل النبوة",
    subtitle: "براهين صدق الرسالة المحمدية",
    route: "/dalail-nubuwwah",
    icon: BadgeCheck,
    group: "sunnah",
    order: 70,
    surfaces: NAV,
    status: "live",
    keywords: ["دلائل", "نبوة", "معجزات"],
  },

  // —— ٢. القصص والأعلام ——
  {
    id: "prophets",
    label: "قصص الأنبياء",
    subtitle: "قصص الأنبياء في القرآن للعبرة",
    route: "/prophets",
    icon: BookHeart,
    group: "knowledge",
    order: 20,
    featured: true,
    surfaces: [...NAV, "drawer", "footer"],
    status: "live",
    keywords: ["أنبياء", "رسل"],
  },
  {
    id: "nations",
    label: "الأمم السابقة",
    subtitle: "أمم سابقة ورد ذكرها في القرآن",
    route: "/nations",
    icon: Landmark,
    group: "knowledge",
    order: 30,
    featured: true,
    surfaces: [...NAV, "footer"],
    status: "live",
    keywords: ["أمم", "أقوام"],
  },
  // —— ٣. الدعوة والتعريف ——
  {
    id: "discover-islam",
    label: "التعريف بالإسلام",
    navLabel: "التعريف",
    subtitle: "مدخل تعريفي لغير المسلمين",
    navHint: "التعريف بالإسلام",
    route: "/discover-islam",
    icon: HandHeart,
    group: "knowledge",
    order: 60,
    surfaces: [...NAV, "drawer"],
    status: "live",
    keywords: ["اكتشف", "تعريف", "غير المسلمين"],
    aliases: ["اكتشف الإسلام", "التعريف"],
  },
  {
    id: "shubuhat",
    label: "تفنيد الشبهات",
    subtitle: "أجوبة مصدرية على الشبهات الشائعة",
    route: "/discover-islam/doubts",
    icon: ShieldAlert,
    group: "knowledge",
    order: 65,
    surfaces: NAV,
    status: "live",
    keywords: ["شبهات", "تفنيد", "ردود", "إشكالات"],
    aliases: ["الشبهات", "رد الشبهات", "تفنيد"],
    hub: "sections",
  },
  {
    id: "new-muslim",
    label: "دليل المسلم الجديد",
    subtitle: "خطوات أولى للمسلم حديث العهد بالإسلام",
    route: "/discover-islam/new-muslim",
    icon: Heart,
    group: "knowledge",
    order: 70,
    surfaces: NAV,
    status: "live",
    keywords: ["مسلم جديد", "هداية", "تعريف بالإسلام"],
    aliases: ["التعريف بالإسلام", "المسلم الجديد"],
  },
  {
    id: "islam-guide",
    label: "دليل المؤسسات والمساجد",
    subtitle: "مؤسسات ومساجد ومعالم إسلامية",
    route: "/islamic-directory",
    icon: Map,
    group: "knowledge",
    order: 75,
    surfaces: NAV,
    status: "live",
    keywords: ["دليل", "مساجد", "مؤسسات", "معالم"],
    aliases: ["الدليل الإسلامي", "الدليل الجغرافي"],
  },

  // —— ٤. الفهارس والمراجع ——
  {
    id: "library",
    label: "البحث الشامل",
    navLabel: "البحث",
    subtitle: "يُفتح عبر البحث العلمي الموحد",
    route: "/search",
    icon: Search,
    group: "knowledge",
    order: 5,
    surfaces: [],
    status: "hidden",
    keywords: [],
  },
  {
    id: "research",
    label: "الأبحاث الشرعية",
    subtitle: "رسائل جامعية وأبحاث وصفية",
    route: "/academic-research",
    icon: FlaskConical,
    group: "knowledge",
    order: 82,
    surfaces: NAV,
    status: "live",
    keywords: ["رسائل", "أبحاث"],
    aliases: ["الرسائل والأبحاث", "الأبحاث"],
  },
  {
    id: "glossary",
    label: "المصطلحات",
    navLabel: "المصطلحات",
    subtitle: "تعريفات دقيقة لأهم المصطلحات الشرعية",
    route: "/islamic-glossary",
    icon: BookText,
    group: "knowledge",
    order: 85,
    surfaces: [...NAV, "drawer"],
    status: "live",
    keywords: ["مصطلح", "معجم", "قاموس", "مصطلحات إسلامية", "معجم شرعي"],
    aliases: ["القاموس الإسلامي", "مفاهيم شرعية", "مصطلحات", "المصطلحات", "المصطلحات الإسلامية", "المعجم"],
    hub: "sections",
  },
  {
    id: "universities",
    label: "دليل الجامعات الشرعية",
    subtitle: "جامعات وكليات شرعية",
    route: "/universities",
    icon: Building2,
    group: "learning",
    order: 80,
    surfaces: NAV,
    status: "live",
    keywords: ["جامعات", "كليات"],
  },

  // —— ٥. أدوات العبادة ——
  {
    id: "tasbih",
    label: "التسبيح",
    subtitle: "عدّاد للتسبيح والذكر بأهداف يومية",
    route: "/tasbih",
    icon: Hash,
    group: "worship",
    order: 10,
    surfaces: NAV,
    status: "live",
    keywords: ["تسبيح", "ذكر"],
  },
  {
    id: "adhkar",
    label: "الأذكار والأدعية",
    navLabel: "الأذكار",
    subtitle: "أذكار الصباح والمساء وما بينهما",
    route: "/adhkar",
    icon: Flame,
    group: "worship",
    order: 20,
    surfaces: [...NAV, "drawer", "footer"],
    status: "live",
    keywords: ["أذكار", "ذكر"],
    aliases: ["الأذكار"],
  },
  {
    id: "duas",
    label: "الأدعية الشرعية",
    navLabel: "الأدعية",
    subtitle: "أدعية مأثورة من القرآن والسنة",
    route: "/duas",
    icon: HandHelping,
    group: "worship",
    order: 22,
    surfaces: [...NAV, "drawer"],
    status: "live",
    keywords: ["دعاء", "أدعية"],
    aliases: ["الأدعية"],
  },
  {
    id: "sunan-yawmiyya",
    label: "السنن النبوية اليومية",
    navLabel: "السنن اليومية",
    subtitle: "سنن يومية مع تتبّع التطبيق",
    route: "/sunan-yawmiyya",
    icon: CircleDot,
    group: "sunnah",
    order: 30,
    surfaces: [...NAV, "drawer"],
    status: "live",
    keywords: ["سنن", "سنّة يومية", "هدي نبوي"],
  },
  {
    id: "wasaya-nabawiyya",
    label: "الوصايا النبوية",
    subtitle: "وصايا جامعة من هديه ﷺ",
    route: "/wasaya-nabawiyya",
    icon: Scroll,
    group: "sunnah",
    order: 40,
    surfaces: NAV,
    status: "live",
    keywords: ["وصايا", "نصيحة", "هدي"],
  },
  {
    id: "fadail-aamal",
    label: "فضائل الأعمال",
    subtitle: "أحاديث في فضائل العبادات والأخلاق",
    route: "/fadail-aamal",
    icon: Sprout,
    group: "sunnah",
    order: 50,
    surfaces: NAV,
    status: "live",
    keywords: ["فضائل", "ثواب", "أعمال صالحة"],
  },
  {
    id: "raqaiq",
    label: "الرقائق والزهد",
    subtitle: "مواعظ ترقّق القلوب ومحاسبة النفس",
    route: "/raqaiq",
    icon: Feather,
    group: "worship",
    order: 35,
    surfaces: NAV,
    status: "live",
    keywords: ["رقائق", "زهد", "موعظة"],
  },
  {
    id: "wird",
    label: "الورد اليومي",
    subtitle: "ورد قرآن وذكر يومي",
    route: "/daily-wird",
    icon: Sun,
    group: "worship",
    order: 30,
    surfaces: NAV,
    status: "live",
    keywords: ["ورد", "أوراد"],
  },
  {
    id: "qibla",
    label: "القبلة",
    subtitle: "اتجاه القبلة والموقع",
    route: "/qibla",
    icon: MapPin,
    group: "worship",
    order: 40,
    surfaces: [...NAV, "drawer"],
    status: "live",
    keywords: ["قبلة", "اتجاه"],
  },
  {
    id: "hijri-calendar",
    label: "تقويم الدروس",
    subtitle: "جدول الدروس والمواعيد",
    route: "/calendar",
    icon: Calendar,
    group: "learning",
    order: 55,
    surfaces: NAV,
    status: "live",
    keywords: ["تقويم", "دروس", "مواعيد"],
  },

  // —— ٦. التعلّم الشخصي ——
  {
    id: "qa",
    label: "تحدي الأسئلة",
    navLabel: "تحدي الأسئلة",
    subtitle: "أسئلة شرعية ولغوية موثقة بعد المراجعة",
    route: "/quiz",
    icon: MessageCircleQuestion,
    group: "learning",
    order: 20,
    surfaces: [...NAV, "footer"],
    status: "live",
    keywords: ["أسئلة", "أجوبة", "تحدي", "مسابقة", "اختبار", "تحدي الأسئلة", "سين جيم"],
    aliases: ["تحدي سُنّة", "لعبة سين جيم", "الأسئلة والأجوبة", "سين جيم"],
  },
  {
    id: "progress",
    label: "التقدم",
    navLabel: "التقدم",
    subtitle: "تتبع إنجازك العلمي",
    route: "/stats",
    icon: Award,
    group: "learning",
    order: 30,
    surfaces: [...NAV, "drawer"],
    status: "live",
    keywords: ["تقدم", "إنجاز"],
  },
  {
    id: "assistant",
    label: "المساعد العلمي",
    subtitle: "مساعدة تفاعلية في العلم",
    route: "/assistant",
    icon: Wand2,
    group: "learning",
    order: 40,
    surfaces: NAV,
    status: "live",
    keywords: ["مساعد", "ذكاء"],
  },
  {
    id: "updates",
    label: "آخر المستجدات",
    navLabel: "المستجدات",
    subtitle: "قرارات وفتاوى ودروس وإعلانات مرتّبة زمنياً",
    route: "/updates",
    icon: NotebookPen,
    group: "learning",
    order: 50,
    surfaces: NAV,
    status: "live",
    keywords: ["مستجدات", "أخبار", "تحديثات", "فتاوى"],
    aliases: ["المستجدات"],
  },

  // —— ٧. الحساب والإعدادات ——
  {
    id: "account",
    label: "حسابي",
    subtitle: "الملف الشخصي والجلسة",
    route: "/my-learning",
    icon: User,
    group: "account",
    order: 10,
    surfaces: ACCOUNT_DRAWER,
    status: "live",
    keywords: ["حساب", "ملف"],
  },
  {
    id: "settings",
    label: "الإعدادات",
    subtitle: "تفضيلات التطبيق العامة",
    route: "/settings",
    icon: Settings,
    group: "account",
    order: 20,
    surfaces: ACCOUNT_DRAWER,
    status: "live",
    keywords: ["إعدادات", "مظهر", "ثيم"],
    aliases: ["المظهر"],
  },
  {
    id: "athan-settings",
    label: "إعدادات الأذان",
    subtitle: "تنبيهات الصلاة والأذان",
    route: "/adhan-settings",
    icon: Volume2,
    group: "account",
    order: 30,
    surfaces: ACCOUNT_DRAWER,
    status: "live",
    keywords: ["أذان", "تنبيه صلاة"],
  },
  {
    id: "notifications",
    label: "التنبيهات",
    subtitle: "إشعارات المحتوى والورد",
    route: "/notification-settings",
    icon: Bell,
    group: "account",
    order: 40,
    surfaces: ACCOUNT_DRAWER,
    status: "live",
    keywords: ["إشعارات", "تنبيهات"],
  },
  {
    id: "support",
    label: "الدعم الفني",
    subtitle: "مساعدة وتواصل وإبلاغ",
    route: "/support",
    icon: HelpCircle,
    group: "account",
    order: 50,
    surfaces: ACCOUNT_DRAWER,
    status: "live",
    keywords: ["دعم", "تواصل"],
    aliases: ["تواصل معنا"],
  },
  {
    id: "about",
    label: "عن سُنّة",
    subtitle: "رؤية المنصة ورسالتها",
    route: "/about",
    icon: Info,
    group: "account",
    order: 60,
    surfaces: [...ACCOUNT_DRAWER, "footer"],
    status: "live",
    keywords: ["حول", "من نحن"],
    aliases: ["حول التطبيق", "من نحن"],
  },
  {
    id: "methodology",
    label: "منهجية التوثيق",
    subtitle: "منهج العرض والتوثيق",
    route: "/methodology",
    icon: FileText,
    group: "account",
    order: 70,
    surfaces: [...ACCOUNT, "footer"],
    status: "live",
    keywords: ["منهجية", "توثيق"],
  },
  {
    id: "sources",
    label: "المصادر والتراخيص",
    subtitle: "مراجع ومصادر المحتوى",
    route: "/data-licenses",
    icon: FolderOpen,
    group: "account",
    order: 80,
    surfaces: [...ACCOUNT, "footer"],
    status: "live",
    keywords: ["مصادر", "تراخيص"],
  },
  {
    id: "lesson-sources",
    label: "دليل الجهات",
    subtitle: "حسابات الدروس والحلقات",
    route: "/sources",
    icon: Radio,
    group: "learning",
    order: 7,
    surfaces: [...SEARCH_ONLY, "footer"],
    status: "live",
    keywords: ["جهات", "دروس", "حلقات", "مصادر"],
    hub: "lessons",
  },
  {
    id: "fatwa-policy",
    label: "سياسة الفتوى",
    subtitle: "ضوابط عرض الأحكام والفتاوى المعتمدة",
    route: "/fatwa-policy",
    icon: Gavel,
    group: "account",
    order: 90,
    surfaces: [...ACCOUNT, "footer"],
    status: "live",
    keywords: ["فتوى", "سياسة"],
  },
  {
    id: "privacy",
    label: "الخصوصية",
    subtitle: "سياسة ومركز الخصوصية",
    route: "/privacy",
    icon: Lock,
    group: "account",
    order: 100,
    surfaces: [...ACCOUNT_DRAWER, "footer"],
    status: "live",
    keywords: ["خصوصية", "بيانات"],
    aliases: ["سياسة الخصوصية", "مركز الخصوصية"],
  },
  {
    id: "terms",
    label: "شروط الاستخدام",
    subtitle: "شروط وأحكام الاستخدام",
    route: "/terms",
    icon: FileText,
    group: "account",
    order: 110,
    surfaces: [...ACCOUNT_DRAWER, "footer"],
    status: "live",
    keywords: ["شروط", "أحكام"],
  },
  {
    id: "delete-account",
    label: "حذف الحساب",
    subtitle: "طلب حذف الحساب نهائياً",
    route: "/account-deletion",
    icon: Trash2,
    group: "account",
    order: 120,
    surfaces: [...ACCOUNT, "footer"],
    status: "live",
    keywords: ["حذف", "إلغاء حساب"],
  },
  // —— مداخل كانت تُكتب يدويًا في التذييل/التنقل الثانوي — صارت من السجل ——
  {
    id: "scholars",
    label: "علماء الأمة",
    navLabel: "العلماء",
    subtitle: "تراجم الأئمة والعلماء ومناهجهم ومؤلفاتهم",
    navHint: "تراجم الأئمة",
    route: "/scholars",
    icon: UserRound,
    group: "learning",
    order: 1,
    surfaces: [...NAV, "drawer", "footer"],
    status: "live",
    keywords: ["علماء", "أئمة", "تراجم", "scholars"],
    aliases: ["العلماء", "الأئمة"],
  },
  {
    id: "teachers",
    label: "المشايخ",
    subtitle: "دليل المشايخ ودروسهم القادمة",
    route: "/teachers",
    icon: Presentation,
    group: "learning",
    order: 2,
    surfaces: [...ACCOUNT, "footer"],
    status: "live",
    keywords: ["مشايخ", "شيخ", "مدرسون", "teachers"],
    aliases: ["دليل المشايخ"],
  },
  {
    id: "duas-quran",
    label: "أدعية القرآن الكريم",
    navLabel: "أدعية القرآن",
    subtitle: "أدعية الأنبياء والمؤمنين في القرآن مع سياقها",
    route: "/duas-quran",
    icon: MessageSquareHeart,
    group: "worship",
    order: 23,
    surfaces: [...NAV, "footer"],
    status: "live",
    keywords: ["أدعية قرآنية", "دعاء", "ربنا"],
  },
  {
    id: "contact",
    label: "تواصل معنا",
    subtitle: "راسل فريق سُنّة باقتراح أو ملاحظة",
    route: "/contact",
    icon: Mail,
    group: "account",
    order: 75,
    surfaces: [...ACCOUNT, "footer"],
    status: "live",
    keywords: ["تواصل", "اتصال", "مراسلة"],
  },
  {
    id: "privacy-center",
    label: "مركز الخصوصية",
    subtitle: "إدارة بياناتك وأذوناتك في مكان واحد",
    route: "/privacy-center",
    icon: ShieldCheck,
    group: "account",
    order: 105,
    surfaces: [...ACCOUNT, "footer"],
    status: "live",
    keywords: ["خصوصية", "بيانات", "أذونات"],
  },
  {
    id: "widget-center",
    label: "مركز الويدجت",
    subtitle: "ودجات الشاشة الرئيسية وطريقة إضافتها",
    route: "/widget-center",
    icon: LayoutGrid,
    group: "account",
    order: 115,
    surfaces: [...ACCOUNT, "footer"],
    status: "live",
    keywords: ["ويدجت", "ودجت", "widget"],
  },
];

function resolveHub(s: SectionSeed): SectionHub {
  if (s.hub) return s.hub;
  if (QURAN_HUB_IDS.has(s.id)) return "quran";
  if (LESSONS_HUB_IDS.has(s.id)) return "lessons";
  return "sections";
}

export const SECTIONS: readonly SectionDef[] = SECTION_SEEDS.map((s) => ({
  ...s,
  hub: resolveHub(s),
  accent: resolveSectionAccent(s),
}));

function visible(s: SectionDef): boolean {
  return s.status !== "hidden";
}

/** لا يظهر في الاكتشاف العام إن كان مخفياً من التنقل أو غير معتمد أو «قريبًا» (صفحة بلا محتوى منشور). */
function discoverable(s: SectionDef): boolean {
  return visible(s) && !s.comingSoon && !isHiddenFromNav(s.route);
}

/** أقسام غير مكتملة للعامة — شارة «قريبًا» */
export function isSectionComingSoon(section: Pick<SectionDef, "comingSoon" | "id" | "route">): boolean {
  return Boolean(section.comingSoon);
}

export function sectionsForSurface(surface: Surface): SectionDef[] {
  return SECTIONS.filter((s) => {
    if (!discoverable(s) || !s.surfaces.includes(surface)) return false;
    if (surface === "moreHub" || surface === "drawer" || surface === "home") {
      return s.hub === "sections";
    }
    return true;
  }).sort(
    (a, b) =>
      SECTION_GROUP_META[a.group].order - SECTION_GROUP_META[b.group].order ||
      a.order - b.order,
  );
}

export function sectionsByGroup(
  group: SectionGroup,
  surface: Surface = "moreHub",
): SectionDef[] {
  return SECTIONS.filter((s) => {
    if (!discoverable(s) || s.group !== group || !s.surfaces.includes(surface) || s.order < 0) {
      return false;
    }
    if (surface === "moreHub" || surface === "drawer" || surface === "home") {
      return s.hub === "sections";
    }
    return true;
  }).sort((a, b) => a.order - b.order);
}

function byIaOrder(a: SectionDef, b: SectionDef): number {
  return SECTION_GROUP_META[a.group].order - SECTION_GROUP_META[b.group].order || a.order - b.order;
}

/**
 * قوائم ذات قائمة سماح صريحة (الدرج · التذييل): العضوية من `surfaces` فقط،
 * ولا تُسقطها HIDDEN_FROM_NAV لأن الإدراج قرار IA مقصود في السجل.
 */
export function menuSections(surface: "drawer" | "footer"): SectionDef[] {
  return SECTIONS.filter((s) => visible(s) && !s.comingSoon && s.surfaces.includes(surface)).sort(
    byIaOrder,
  );
}

/** مجموعات قائمة صريحة بترتيب IA الموحّد — تُسقط المجموعات الفارغة. */
export function menuGroups(
  surface: "drawer" | "footer",
): Array<{ group: SectionGroup; label: string; subtitle: string; sections: SectionDef[] }> {
  const all = menuSections(surface);
  return SECTION_GROUP_ORDER.map((group) => ({
    group,
    label: SECTION_GROUP_META[group].label,
    subtitle: SECTION_GROUP_META[group].subtitle,
    sections: all.filter((s) => s.group === group),
  })).filter((g) => g.sections.length > 0);
}

/** الاسم المعروض في القوائم (مختصر إن وُجد). */
export function menuLabel(s: Pick<SectionDef, "label" | "navLabel">): string {
  return s.navLabel ?? s.label;
}

export function featuredSections(): SectionDef[] {
  return SECTIONS.filter((s) => discoverable(s) && s.featured && s.hub === "sections").sort(
    (a, b) =>
      SECTION_GROUP_META[a.group].order - SECTION_GROUP_META[b.group].order ||
      a.order - b.order,
  );
}

export function bottomNavSections(): SectionDef[] {
  const order = ["quran", "lessons", "home", "prayer", "sections"];
  return order
    .map((id) => SECTIONS.find((s) => s.id === id && s.surfaces.includes("bottomNav")))
    .filter((s): s is SectionDef => Boolean(s));
}

export function quranHubSections(): SectionDef[] {
  return SECTIONS.filter((s) => visible(s) && s.hub === "quran").sort(
    (a, b) => a.order - b.order,
  );
}

export function lessonsHubSections(): SectionDef[] {
  return SECTIONS.filter((s) => visible(s) && s.hub === "lessons").sort(
    (a, b) => a.order - b.order,
  );
}

export function getSectionById(id: string): SectionDef | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export function getSectionByRoute(route: string): SectionDef | undefined {
  const clean = route.split("?")[0].replace(/\/$/, "") || "/";
  return SECTIONS.find((s) => {
    const r = s.route.replace(/\/$/, "") || "/";
    return r === clean;
  });
}

/** --section-accent لمسار قسم؛ يرجع لون المجموعة إن لم يُسجَّل المسار */
export function getSectionAccent(route: string): string {
  const sec = getSectionByRoute(route);
  if (sec) return resolveSectionAccent(sec);
  return SECTION_GROUP_ACCENT.fiqh;
}

export function searchSectionsIndex(): Array<{
  id: string;
  label: string;
  subtitle: string;
  route: string;
  keywords: string[];
  aliases: string[];
}> {
  return SECTIONS.filter((s) => discoverable(s) && s.surfaces.includes("search")).map((s) => ({
    id: s.id,
    label: s.label,
    subtitle: s.subtitle,
    route: s.route,
    keywords: s.keywords,
    aliases: s.aliases ?? [],
  }));
}
