/**
 * كتالوج مراكز Admin v3 — IA موجة 1 (7 وجهات).
 * Wave P3: الدروس/المشايخ/الفوائد/المراجعات تشير لمسارات v3 الأصلية؛
 * بقية الأدوات تبقى روابط توافق Legacy بوسم واضح.
 */
import type { AdminV3CenterId } from "../nav";

export type AdminV3Permission =
  | "admin.read"
  | "content.read"
  | "content.write"
  | "review.read"
  | "review.decide"
  | "users.read"
  | "users.roles"
  | "notifications.read"
  | "analytics.read"
  | "automation.read"
  | "system.read"
  | "settings.read"
  | "audit.read";

export type AdminV3ToolItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  tags: string[];
  /** مصدر الجرد — للتوثيق فقط */
  legacySource: string;
};

export type AdminV3CenterDef = {
  id: Exclude<AdminV3CenterId, "overview">;
  title: string;
  summary: string;
  permissions: readonly AdminV3Permission[];
  tools: readonly AdminV3ToolItem[];
};

export const ADMIN_V3_CENTERS: Record<
  Exclude<AdminV3CenterId, "overview">,
  AdminV3CenterDef
> = {
  reviews: {
    id: "reviews",
    title: "المراجعات",
    summary: "صندوق وارد تحريري — الوجهات السابقة مجمّعة دون دمج منطق CRUD.",
    permissions: ["admin.read", "review.read", "review.decide"],
    tools: [
      { id: "review-hub", title: "مركز المراجعة", description: "مساحة المراجعة الرئيسية", href: "/admin/review-hub", tags: ["مراجعة"], legacySource: "ReviewHubPage" },
      { id: "review-center", title: "مراجعة الأتمتة", description: "طابور مراجعة الأتمتة", href: "/admin/review-center", tags: ["أتمتة", "مراجعة"], legacySource: "AutomationReviewPage" },
      { id: "submissions", title: "مقترحات المجتمع", description: "مراجعة المساهمات (أصلي)", href: "/admin/v3/reviews", tags: ["مجتمع", "أصلي"], legacySource: "admin-v3/ReviewInboxPage" },
      { id: "scholarly", title: "التوثيق العلمي", description: "مراجعة علمية", href: "/admin?section=scholarly-verification", tags: ["توثيق"], legacySource: "AdminShell#scholarly-verification" },
      { id: "calendar-review", title: "مراجعة التقويم الشرعي", description: "مراجعة مناسبات التقويم", href: "/admin?section=religious-calendar-review", tags: ["تقويم"], legacySource: "AdminShell#religious-calendar-review" },
      { id: "reports", title: "البلاغات", description: "بلاغات المستخدمين", href: "/admin?section=reports", tags: ["بلاغات"], legacySource: "AdminShell#reports" },
    ],
  },
  content: {
    id: "content",
    title: "مركز المحتوى",
    summary: "مساحة محتوى موحّدة — التحرير والسياق عبر المسارات السابقة حتى اكتمال الموجات.",
    permissions: ["admin.read", "content.read", "content.write"],
    tools: [
      { id: "lessons", title: "الدروس", description: "إدارة الدروس (أصلي)", href: "/admin/v3/content/lessons", tags: ["دروس", "أصلي"], legacySource: "admin-v3/EntityCrudPage#lessons" },
      { id: "sheikhs", title: "المشايخ", description: "ملفات المشايخ (أصلي)", href: "/admin/v3/content/sheikhs", tags: ["مشايخ", "أصلي"], legacySource: "admin-v3/EntityCrudPage#sheikhs" },
      { id: "library", title: "المكتبة", description: "كتب ومراجع", href: "/admin?section=library", tags: ["مكتبة"], legacySource: "AdminShell#library" },
      { id: "fawaid", title: "الفوائد", description: "فوائد مختصرة (أصلي)", href: "/admin/v3/content/fawaid", tags: ["فوائد", "أصلي"], legacySource: "admin-v3/EntityCrudPage#fawaid" },
      { id: "adhkar", title: "الأذكار", description: "أذكار وأوراد", href: "/admin?section=adhkar", tags: ["أذكار"], legacySource: "AdminShell#adhkar" },
      { id: "qa", title: "الأسئلة والأجوبة", description: "بنك الأسئلة", href: "/admin?section=qa", tags: ["أسئلة"], legacySource: "AdminShell#qa" },
      { id: "quiz", title: "المسابقة", description: "أسئلة التحدي", href: "/admin?section=quiz", tags: ["تحدي"], legacySource: "AdminShell#quiz" },
      { id: "miracles", title: "إشارات كونية", description: "محتوى الإعجاز", href: "/admin?section=miracles", tags: ["إشارات"], legacySource: "AdminShell#miracles" },
      { id: "rulings", title: "الأحكام", description: "موسوعة الأحكام", href: "/admin?section=rulings", tags: ["فقه"], legacySource: "AdminShell#rulings" },
      { id: "import-url", title: "استيراد برابط", description: "استيراد درس عبر رابط", href: "/admin/content-import/url", tags: ["استيراد"], legacySource: "LessonImportUrlPage" },
      { id: "import-image", title: "استيراد بصورة", description: "استخلاص من صورة", href: "/admin/content-import/image", tags: ["استيراد"], legacySource: "LessonImportImagePage" },
      { id: "prophet-stories", title: "قصص الأنبياء", description: "إدارة قصص الأنبياء", href: "/admin?section=prophet-stories", tags: ["قصص"], legacySource: "AdminShell#prophet-stories" },
      { id: "islamic-stories", title: "القصص الإسلامية", description: "إدارة القصص", href: "/admin?section=islamic-stories", tags: ["قصص"], legacySource: "AdminShell#islamic-stories" },
      { id: "universities", title: "الجامعات", description: "إدارة الجامعات", href: "/admin/universities", tags: ["جامعات"], legacySource: "UniversitiesAdminPage" },
    ],
  },
  taxonomy: {
    id: "taxonomy",
    title: "مركز التصنيف",
    summary: "شجرة أبواب العلم أولًا — دون بطاقات مكررة كواجهة أساسية.",
    permissions: ["admin.read", "content.read", "content.write"],
    tools: [
      { id: "categories", title: "أبواب العلم", description: "شجرة التصنيفات (أصلي)", href: "/admin/v3/taxonomy", tags: ["تصنيف", "شجرة", "أصلي"], legacySource: "admin-v3/TaxonomyPage" },
      { id: "knowledge-graph", title: "الرسم البياني", description: "علاقات المعرفة (عرض)", href: "/admin?section=knowledge-graph", tags: ["علاقات"], legacySource: "AdminShell#knowledge-graph" },
      { id: "relationships", title: "العلاقات", description: "ربط الكيانات", href: "/admin?section=knowledge-graph", tags: ["علاقات"], legacySource: "RelationshipsSection" },
    ],
  },
  analytics: {
    id: "analytics",
    title: "التحليلات",
    summary: "منصة التحليلات الرسمية — بيانات حقيقية / NO DATA، Admin وSuper Admin فقط.",
    permissions: ["admin.read", "analytics.read"],
    tools: [
      { id: "analytics-platform", title: "منصة التحليلات", description: "المرجع الرسمي لإحصاءات سُنّة (أصلي)", href: "/admin/v3/analytics", tags: ["منصة", "أصلي"], legacySource: "admin-v3/AnalyticsPlatformPage" },
      { id: "search-analytics", title: "تحليلات البحث (Legacy)", description: "إحصاءات البحث السابقة", href: "/admin?section=search-analytics", tags: ["بحث"], legacySource: "AdminShell#search-analytics" },
      { id: "feature-status", title: "صحة المحتوى", description: "حالة الميزات والنشر", href: "/admin/feature-status", tags: ["صحة"], legacySource: "FeatureStatusPage" },
      { id: "verified-knowledge", title: "المعرفة الموثقة", description: "مؤشرات التوثيق", href: "/admin?section=verified-knowledge", tags: ["توثيق"], legacySource: "AdminShell#verified-knowledge" },
    ],
  },
  community: {
    id: "community",
    title: "المجتمع",
    summary: "مستخدمون وأدوار وبلاغات — بلا تغيير RLS/صلاحيات خادم.",
    permissions: ["admin.read", "users.read", "users.roles", "review.read"],
    tools: [
      { id: "users", title: "المستخدمون", description: "قائمة الحسابات والأدوار (أصلي)", href: "/admin/v3/community", tags: ["مستخدمون", "أصلي"], legacySource: "admin-v3/UsersPage" },
      { id: "roles", title: "كتالوج الأدوار", description: "مصفوفة صلاحيات الحوكمة (أصلي FINAL-3)", href: "/admin/v3/community/roles", tags: ["أدوار", "أصلي"], legacySource: "admin-v3/RolesPage" },
      { id: "reports", title: "البلاغات", description: "بلاغات المجتمع", href: "/admin?section=reports", tags: ["بلاغات"], legacySource: "AdminShell#reports" },
      { id: "submissions", title: "المساهمات", description: "مقترحات بانتظار المراجعة", href: "/admin/v3/reviews", tags: ["مساهمات", "أصلي"], legacySource: "admin-v3/ReviewInboxPage" },
      { id: "governance", title: "الحوكمة", description: "سياسات الحوكمة (عرض)", href: "/admin?section=governance", tags: ["حوكمة"], legacySource: "AdminShell#governance" },
    ],
  },
  settings: {
    id: "settings",
    title: "الإعدادات",
    summary: "إعدادات اللوحة والأتمتة والنظام والتدقيق — مجمّعة دون تشتيت الوجهات.",
    permissions: [
      "admin.read",
      "settings.read",
      "notifications.read",
      "automation.read",
      "system.read",
      "audit.read",
    ],
    tools: [
      { id: "settings", title: "إعدادات اللوحة", description: "إعدادات عامة", href: "/admin?section=settings", tags: ["إعدادات"], legacySource: "AdminShell#settings" },
      { id: "telegram", title: "Telegram", description: "تكامل تيليجرام", href: "/admin?section=telegram", tags: ["إشعار"], legacySource: "AdminShell#telegram" },
      { id: "instagram", title: "إنستغرام", description: "تكامل إنستغرام", href: "/admin/integrations/instagram", tags: ["تكامل"], legacySource: "InstagramIntegrationPage" },
      { id: "auto-center", title: "مركز الأتمتة", description: "المركز الرئيسي", href: "/admin/automation/center", tags: ["أتمتة"], legacySource: "AutomationCenterPage" },
      { id: "auto-dashboard", title: "لوحة الأتمتة", description: "لوحة تشغيل", href: "/admin/automation/dashboard", tags: ["أتمتة"], legacySource: "AutomationDashboardPage" },
      { id: "auto-content", title: "المحتوى الآلي", description: "إنتاج محتوى آلي", href: "/admin/auto-content", tags: ["أتمتة"], legacySource: "AutoContentPage" },
      { id: "content-production", title: "إنتاج المحتوى", description: "خط إنتاج المحتوى", href: "/admin/content-production", tags: ["إنتاج"], legacySource: "ContentProductionDashboardPage" },
      { id: "sources", title: "مصادر الاستيراد", description: "مصادر الأتمتة", href: "/admin/sources", tags: ["مصادر"], legacySource: "AutomationSourcesPage" },
      { id: "smart-cms", title: "CMS الذكي", description: "إدارة CMS", href: "/admin?section=smart-cms", tags: ["CMS"], legacySource: "AdminShell#smart-cms" },
      { id: "error-logs", title: "سجل الأخطاء", description: "أخطاء العميل", href: "/admin?section=error-logs", tags: ["أخطاء"], legacySource: "AdminShell#error-logs" },
      { id: "feature-status", title: "مراقبة الميزات", description: "حالة المنصة", href: "/admin/feature-status", tags: ["مراقبة"], legacySource: "FeatureStatusPage" },
      { id: "internal-status", title: "الحالة الداخلية", description: "تشخيص للمطورين", href: "/internal/status", tags: ["تشخيص"], legacySource: "InternalStatusPage" },
      { id: "audit", title: "سجل التدقيق", description: "أحداث واجهة اللوحة المحلية", href: "/admin/v3/settings?view=audit", tags: ["تدقيق"], legacySource: "admin-v3/audit-events" },
    ],
  },
};

export function listCenterTools(centerId: Exclude<AdminV3CenterId, "overview">): readonly AdminV3ToolItem[] {
  return ADMIN_V3_CENTERS[centerId]?.tools ?? [];
}

export function filterCenterTools(
  tools: readonly AdminV3ToolItem[],
  query: string,
  tag: string,
): AdminV3ToolItem[] {
  const q = query.trim().toLowerCase();
  return tools.filter((t) => {
    if (tag && tag !== "الكل" && !t.tags.includes(tag)) return false;
    if (!q) return true;
    const blob = `${t.title} ${t.description} ${t.tags.join(" ")} ${t.href}`.toLowerCase();
    return blob.includes(q);
  });
}

export function uniqueTags(tools: readonly AdminV3ToolItem[]): string[] {
  const set = new Set<string>();
  for (const t of tools) for (const tag of t.tags) set.add(tag);
  return ["الكل", ...[...set].sort((a, b) => a.localeCompare(b, "ar"))];
}
