import { seoNavLabel } from "@/lib/seo-nav-labels";
import { primaryNav } from "@/config/navigation";

export type NavLink = {
  href: string;
  label: string;
  description?: string;
};

/**
 * PUBLIC_NAV_ITEMS — المصدر الوحيد للحقيقة لجميع الصفحات العامة.
 *
 * القاعدة: أي مسار في هذه القائمة يجب أن:
 *   1. يكون مُعرَّفاً في App.tsx بـ SafeLazyRoute (لا AdminLazyRoute)
 *   2. يفتح بدون تسجيل دخول
 *   3. لا يُعيد التوجيه إلى /login أو /admin
 *
 * تُستخدَم هذه القائمة في:
 *   - اختبار Playwright (00-public-routes.spec.ts) للتحقق من الوصول العام
 *   - القائمة الرئيسية (PRIMARY_NAV_ITEMS)
 *
 * ملاحظة: القائمة الجانبية (SideNavDrawer) والورقة السفلية (MoreBottomSheet)
 * لهما قوائم روابط محلية في ملفَي المكوّنين، وتُصفَّى عبر nav-visibility.
 * توحيد مصدر واحد للقوائم يبقى قرار IA منفصل خارج نطاق دمج/إخفاء المسارات.
 */
export const PUBLIC_NAV_ITEMS: NavLink[] = [
  // الصفحة الرئيسية
  { href: "/",              label: seoNavLabel("/", "الرئيسية") },
  // المحتوى العلمي
  { href: "/lessons",       label: seoNavLabel("/lessons", "الدروس") },
  { href: "/quran-knowledge", label: seoNavLabel("/quran-knowledge", "القرآن وعلومه") },
  { href: "/hadith",        label: seoNavLabel("/hadith", "الأحاديث") },
  { href: "/fawaid",        label: seoNavLabel("/fawaid", "الفوائد") },
  { href: "/prophets",      label: seoNavLabel("/prophets", "قصص الأنبياء") },
  { href: "/miracles",             label: seoNavLabel("/miracles", "الإعجاز العلمي") },
  { href: "/prophetic-medicine",   label: seoNavLabel("/prophetic-medicine", "الطب النبوي") },
  { href: "/arbaeen-nawawi",label: seoNavLabel("/arbaeen-nawawi", "الأربعون النووية") },
  { href: "/occasions-lessons", label: seoNavLabel("/occasions-lessons", "المناسبات والدروس") },
  { href: "/fiqh",               label: seoNavLabel("/fiqh", "الفقه الإسلامي") },
  { href: "/seerah",             label: seoNavLabel("/seerah", "السيرة النبوية") },
  { href: "/tarikh-islami",          label: seoNavLabel("/tarikh-islami", "التاريخ الإسلامي") },
  { href: "/islamic-directory", label: seoNavLabel("/islamic-directory", "الدليل الإسلامي") },
  { href: "/asma-husna",        label: seoNavLabel("/asma-husna", "الأسماء الحسنى") },
  { href: "/akhlaq",            label: seoNavLabel("/akhlaq", "مكارم الأخلاق") },
  { href: "/arkan",             label: seoNavLabel("/arkan", "أركان الإسلام الخمسة") },
  { href: "/arkan-iman",        label: seoNavLabel("/arkan-iman", "أركان الإيمان الستة") },
  { href: "/hadith-science",    label: seoNavLabel("/hadith-science", "مصطلح الحديث") },
  { href: "/madhahib",          label: seoNavLabel("/madhahib", "المذاهب الفقهية") },
  { href: "/sunan-yawmiyya",    label: seoNavLabel("/sunan-yawmiyya", "السنن النبوية اليومية") },
  { href: "/hikam-salaf",       label: seoNavLabel("/hikam-salaf", "حكم السلف الصالح") },
  { href: "/zakat",             label: seoNavLabel("/zakat", "الزكاة وأحكامها") },
  { href: "/sawm",              label: seoNavLabel("/sawm", "الصيام وأحكامه") },
  { href: "/hajj",              label: seoNavLabel("/hajj", "الحج والعمرة") },
  { href: "/tahara",            label: seoNavLabel("/tahara", "الطهارة وأحكامها") },
  { href: "/fadail-aamal",     label: seoNavLabel("/fadail-aamal", "فضائل الأعمال") },
  { href: "/janaza",            label: seoNavLabel("/janaza", "أحكام الجنائز") },
  { href: "/sahabah",           label: seoNavLabel("/sahabah", "أعلام الصحابة") },
  { href: "/shamael",           label: seoNavLabel("/shamael", "صفةُ سيِّد الخلقِ ﷺ") },
  { href: "/islamic-glossary",  label: seoNavLabel("/islamic-glossary", "المعجم الشرعي") },
  { href: "/adab-talab-ilm",   label: seoNavLabel("/adab-talab-ilm", "آداب طالب العلم") },
  { href: "/janna-naar",        label: seoNavLabel("/janna-naar", "الجنة والنار") },
  { href: "/alamat-saah",       label: seoNavLabel("/alamat-saah", "علامات الساعة") },
  { href: "/malaika",           label: seoNavLabel("/malaika", "الملائكة في الإسلام") },
  { href: "/wasaya-nabawiyya",  label: seoNavLabel("/wasaya-nabawiyya", "الوصايا النبوية") },
  { href: "/raqaiq",            label: seoNavLabel("/raqaiq", "الرقائق والزهد") },
  { href: "/tawba",             label: seoNavLabel("/tawba", "التوبة والاستغفار") },
  { href: "/memorization",     label: seoNavLabel("/memorization", "الحفظ والمراجعة") },
  { href: "/tafsir",            label: seoNavLabel("/tafsir", "علم التفسير") },
  { href: "/mawarith",          label: seoNavLabel("/mawarith", "المواريث والفرائض") },
  { href: "/salah-guide",       label: seoNavLabel("/salah-guide", "دليل الصلاة الكامل") },
  { href: "/fiqh-qawaid",      label: seoNavLabel("/fiqh-qawaid", "القواعد الفقهية الكبرى") },
  { href: "/duas-quran",        label: seoNavLabel("/duas-quran", "أدعية القرآن الكريم") },
  // القرآن
  { href: "/mushaf",              label: seoNavLabel("/mushaf", "المصحف الشريف") },
  // الأذكار
  { href: "/adhkar",        label: seoNavLabel("/adhkar", "الأذكار") },
  { href: "/tasbih",        label: seoNavLabel("/tasbih", "التسبيح") },
  // الأدوات
  { href: "/prayer-times",  label: seoNavLabel("/prayer-times", "مواقيت الصلاة") },
  { href: "/qibla",         label: seoNavLabel("/qibla", "القبلة") },
  { href: "/quiz",          label: seoNavLabel("/quiz", "تحدي الأسئلة") },
  // عام
  { href: "/search",        label: seoNavLabel("/search", "البحث") },
  { href: "/settings",      label: seoNavLabel("/settings", "الإعدادات") },
  { href: "/methodology",   label: seoNavLabel("/methodology", "منهجية التوثيق") },
];

/**
 * القائمة العلوية (top navbar) — أربع مساحات موحّدة مع الشريط السفلي.
 * البحث والحساب ليسا هنا لأن لهما عنصري واجهة دائمين مستقلّين في الهيدر
 * (زر البحث الشامل Ctrl+K، ورابط الحساب/تسجيل الدخول) — انظر NavBar.tsx.
 */
export const PRIMARY_NAV_ITEMS: NavLink[] = [...primaryNav];

/** PRIMARY_NAV kept for legacy compatibility */
export const PRIMARY_NAV = PRIMARY_NAV_ITEMS;

/* === unified back navigation re-exports === */
export {
  normalizeNavPath,
  recordNavigationVisit,
  getPreviousInternalRoute,
  sectionAwareFallback,
  registryParentFallback,
  sectionRootEscape,
  prepareInstantBackNavigation,
  goBackOrFallback,
} from "@/lib/navigation-back";
