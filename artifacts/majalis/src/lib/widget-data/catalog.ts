export type WidgetCenterCatalogItem = {
  kind: string;
  nameAr: string;
  descriptionAr: string;
  families: string[];
  dataRequirementsAr: string;
  configurationAr: string;
  privacyClass: "public-safe" | "local-progress";
  requiresAppOpen: boolean;
  deepLink: string;
  section: "prayer" | "calendar" | "adhkar" | "quran" | "content" | "home";
};

export const WIDGET_CENTER_CATALOG: WidgetCenterCatalogItem[] = [
  { kind: "PrayerTimesWidget", nameAr: "الصلاة القادمة", descriptionAr: "عدّ حيّ إلى الصلاة القادمة، ومنذ الأذان بعد دخول الوقت.", families: ["صغير","متوسط","قفل"], dataRequirementsAr: "لقطة المواقيت", configurationAr: "موقع ومدينة الصلاة", privacyClass: "public-safe", requiresAppOpen: true, deepLink: "/prayer-times", section: "prayer" },
  { kind: "sunnah.widget.prayer.all", nameAr: "مواقيت اليوم", descriptionAr: "مواقيت الصلوات كلها في قائمة واحدة.", families: ["كبير"], dataRequirementsAr: "لقطة المواقيت", configurationAr: "لا", privacyClass: "public-safe", requiresAppOpen: true, deepLink: "/prayer-times", section: "prayer" },
  { kind: "sunnah.widget.calendar.hijri", nameAr: "التاريخ", descriptionAr: "التاريخ الهجري والميلادي واسم اليوم.", families: ["صغير","متوسط","قفل"], dataRequirementsAr: "تقويم محلي", configurationAr: "لا", privacyClass: "public-safe", requiresAppOpen: false, deepLink: "/occasions", section: "calendar" },
  { kind: "sunnah.widget.calendar.ramadan", nameAr: "رمضان والمناسبات", descriptionAr: "الأيام المتبقية لرمضان وأقرب مناسبة.", families: ["صغير","متوسط","قفل"], dataRequirementsAr: "تقويم محلي", configurationAr: "لا", privacyClass: "public-safe", requiresAppOpen: false, deepLink: "/occasions", section: "calendar" },
  { kind: "sunnah.widget.adhkar.time-aware", nameAr: "أذكار الصباح والمساء", descriptionAr: "أذكار الصباح أو المساء حسب وقتك.", families: ["صغير","متوسط","قفل"], dataRequirementsAr: "مستودع الأذكار", configurationAr: "حسب الوقت", privacyClass: "public-safe", requiresAppOpen: true, deepLink: "/adhkar", section: "adhkar" },
  { kind: "sunnah.widget.adhkar.rotating", nameAr: "ذكر الساعة", descriptionAr: "ذكر قصير يتجدد كل ساعة.", families: ["صغير","متوسط","قفل"], dataRequirementsAr: "مستودع الأذكار", configurationAr: "لا", privacyClass: "public-safe", requiresAppOpen: false, deepLink: "/adhkar", section: "adhkar" },
  { kind: "sunnah.widget.adhkar.streak", nameAr: "إنجاز اليوم", descriptionAr: "سلسلة أذكارك وهدف قرآن اليوم.", families: ["صغير","متوسط","قفل"], dataRequirementsAr: "تتبع يومي معتمد", configurationAr: "لا تُختلق سلسلة", privacyClass: "local-progress", requiresAppOpen: true, deepLink: "/adhkar", section: "adhkar" },
  { kind: "sunnah.widget.quran.ayah", nameAr: "آية أو دعاء", descriptionAr: "آية أو دعاء قصير يتجدد كل ساعة.", families: ["صغير","متوسط","كبير","قفل"], dataRequirementsAr: "مصدر القرآن المحمي + الأذكار", configurationAr: "لا", privacyClass: "public-safe", requiresAppOpen: false, deepLink: "/adhkar", section: "quran" },
  { kind: "sunnah.widget.mushaf.continue", nameAr: "المصحف", descriptionAr: "تابع القراءة من آخر موضع وصلتَ إليه.", families: ["صغير","متوسط"], dataRequirementsAr: "آخر صفحة محفوظة", configurationAr: "لا اختراع لصفحة ١", privacyClass: "local-progress", requiresAppOpen: true, deepLink: "/mushaf", section: "quran" },
];
