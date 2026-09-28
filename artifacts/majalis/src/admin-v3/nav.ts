/**
 * تنقّل Admin v3 — بنية معلومات موجة 1 (7 وجهات فقط).
 * P3: مراجعات/محتوى أساسي/تصنيف/مجتمع أصلية؛ Legacy للتوافق.
 */
export type AdminV3CenterId =
  | "overview"
  | "reviews"
  | "content"
  | "taxonomy"
  | "analytics"
  | "community"
  | "settings";

/** معرفات قديمة — تُحوَّل إلى المراكز الجديدة */
export type AdminV3LegacyCenterId =
  | "home"
  | "review"
  | "users"
  | "notifications"
  | "automation"
  | "system"
  | "audit";

export type AdminV3NavItem = {
  id: AdminV3CenterId;
  label: string;
  path: string;
  /** عنصر Bottom Nav للهاتف */
  mobilePrimary?: boolean;
  /** يظهر تحت «المزيد» على الهاتف */
  mobileMore?: boolean;
  description: string;
  /** مسار Legacy مؤقت إلى اكتمال الترحيل */
  legacyHref?: string;
};

export const ADMIN_V3_BASE = "/admin/v3";

export const ADMIN_V3_NAV: readonly AdminV3NavItem[] = [
  {
    id: "overview",
    label: "نظرة عامة",
    path: ADMIN_V3_BASE,
    mobilePrimary: true,
    description: "تشغيل اليوم: مراجعات، نشر، تنبيهات، إجراءات سريعة",
  },
  {
    id: "reviews",
    label: "المراجعات",
    path: `${ADMIN_V3_BASE}/reviews`,
    mobilePrimary: true,
    description: "صندوق وارد تحريري للمراجعة والاعتدال",
    legacyHref: "/admin/review-hub",
  },
  {
    id: "content",
    label: "المحتوى",
    path: `${ADMIN_V3_BASE}/content`,
    mobilePrimary: true,
    description: "مساحة محتوى موحّدة: دروس، مشايخ، فوائد، أسئلة",
    legacyHref: "/admin?section=lessons",
  },
  {
    id: "taxonomy",
    label: "التصنيف",
    path: `${ADMIN_V3_BASE}/taxonomy`,
    mobilePrimary: true,
    description: "شجرة أبواب العلم والترتيب والإحصاءات",
    legacyHref: "/admin?section=categories",
  },
  {
    id: "analytics",
    label: "التحليلات",
    path: `${ADMIN_V3_BASE}/analytics`,
    mobileMore: true,
    description: "اتجاهات الأداء والنشر والاعتدال",
    legacyHref: "/admin?section=search-analytics",
  },
  {
    id: "community",
    label: "المجتمع",
    path: `${ADMIN_V3_BASE}/community`,
    mobileMore: true,
    description: "مستخدمون، بلاغات، مساهمات",
    legacyHref: "/admin?section=users",
  },
  {
    id: "settings",
    label: "الإعدادات",
    path: `${ADMIN_V3_BASE}/settings`,
    mobileMore: true,
    description: "إعدادات اللوحة، الأتمتة، النظام، التدقيق",
    legacyHref: "/admin?section=settings",
  },
] as const;

export const ADMIN_V3_MOBILE_PRIMARY = ADMIN_V3_NAV.filter((n) => n.mobilePrimary);
export const ADMIN_V3_MOBILE_MORE = ADMIN_V3_NAV.filter((n) => n.mobileMore);

const LEGACY_PATH_ALIASES: Record<string, AdminV3CenterId> = {
  [`${ADMIN_V3_BASE}/review`]: "reviews",
  [`${ADMIN_V3_BASE}/users`]: "community",
  [`${ADMIN_V3_BASE}/notifications`]: "settings",
  [`${ADMIN_V3_BASE}/automation`]: "settings",
  [`${ADMIN_V3_BASE}/system`]: "settings",
  [`${ADMIN_V3_BASE}/audit`]: "settings",
  [`${ADMIN_V3_BASE}/home`]: "overview",
};

export function resolveAdminV3Center(pathname: string): AdminV3NavItem {
  const clean = pathname.split("?")[0] || ADMIN_V3_BASE;
  if (clean === ADMIN_V3_BASE || clean === `${ADMIN_V3_BASE}/`) {
    return ADMIN_V3_NAV[0]!;
  }
  const aliased = LEGACY_PATH_ALIASES[clean];
  if (aliased) {
    return ADMIN_V3_NAV.find((n) => n.id === aliased) ?? ADMIN_V3_NAV[0]!;
  }
  const hit = ADMIN_V3_NAV.find(
    (n) => n.id !== "overview" && (clean === n.path || clean.startsWith(`${n.path}/`)),
  );
  return hit ?? ADMIN_V3_NAV[0]!;
}
