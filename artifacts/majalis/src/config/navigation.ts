/**
 * مصدر واحد للتنقّل العام — سُنّة / ssunnah.com
 * primaryNav · secondaryNav · footerNav · الشريط السفلي · الدرج · الرئيسية
 * كل القوائم هنا مشتقة من sections.registry — لا أسماء ولا مسارات مكتوبة يدويًا.
 */
import type { LucideIcon } from "lucide-react";
import {
  bottomNavSections,
  getSectionById,
  menuGroups,
  menuLabel,
  menuSections,
  searchSectionsIndex,
  type SectionDef,
} from "@/config/sections.registry";

export type NavPlacement = "bottom" | "drawer" | "home";

export type NavLinkItem = {
  href: string;
  label: string;
  id?: string;
};

export type FooterGroup = {
  id: string;
  title: string;
  links: NavLinkItem[];
};

export type NavEntry = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  surfaces: readonly NavPlacement[];
};

/** رابط قائمة من مدخل السجل — الاسم المختصر للقوائم والمسار المعتمد. */
function linkFromSection(id: string): NavLinkItem {
  const s = getSectionById(id);
  if (!s) throw new Error(`navigation: قسم غير مسجّل في sections.registry: ${id}`);
  return { id: s.id, href: s.route, label: menuLabel(s) };
}

/** التنقل الأساسي الموحّد — نفسه في الهيدر والـprerender وكل الصفحات العامة. */
const PRIMARY_IDS = ["home", "lessons", "quran", "adhkar", "prayer", "fiqh", "library"] as const;
export const primaryNav: readonly NavLinkItem[] = PRIMARY_IDS.map(linkFromSection);

/** أقسام ثانوية — sitemap · الروابط الداخلية (من السجل). */
const SECONDARY_IDS = [
  "hadith",
  "islamic-history",
  "seerah",
  "prophets",
  "nations",
  "quran-figures",
  "lesson-sources",
  "sections",
  "qa",
  "competitions",
] as const;
export const secondaryNav: readonly NavLinkItem[] = SECONDARY_IDS.map(linkFromSection);

/** مجموعات التذييل — مجموعات IA نفسها، والعضوية عبر surface «footer» في السجل. */
export const footerNav: readonly FooterGroup[] = menuGroups("footer").map((g) => ({
  id: g.group,
  title: g.label,
  links: g.sections.map((s) => ({ id: s.id, href: s.route, label: menuLabel(s) })),
}));

/** مسارات مؤهّلة للفهرس في البحث الموحّد (من سجل الأقسام). */
export const searchEligibleSections: readonly NavLinkItem[] = searchSectionsIndex().map((s) => ({
  href: s.route,
  label: s.label,
  id: s.id,
}));

/**
 * مسارات عامة تُتوقع في sitemap — الأقسام الرئيسية والثانوية المهمة.
 * الفحص الكامل يقرأ seo-routes.json؛ هذه قائمة مرجعية للتدقيق.
 */
export const sitemapEligibleSections: readonly NavLinkItem[] = [
  ...primaryNav.filter((i) => i.href !== "/"),
  ...secondaryNav,
  ...["open-mushaf", "about", "contact", "methodology", "privacy", "terms"].map(linkFromSection),
];

/** تسميات موحّدة للتدقيق — مشتقة من السجل فلا تختلف بين الأسطح. */
export const NAV_LABEL_CANONICAL: Record<string, string> = Object.fromEntries(
  ["quran", "open-mushaf", "prayer", "hadith", "fiqh", "adhkar", "lessons", "sections", "library"].map(
    (id) => {
      const l = linkFromSection(id);
      return [l.href, l.label];
    },
  ),
);

// ── الشريط السفلي والدرج والرئيسية (من سجل الأقسام) ───────────────────────

const HOME_IDS = ["quran", "lessons", "fiqh"] as const;

function entryFromSection(s: SectionDef, surfaces: readonly NavPlacement[]): NavEntry {
  return {
    id: s.id === "open-mushaf" ? "mushaf" : s.id,
    label: menuLabel(s),
    href: s.route,
    icon: s.icon,
    surfaces,
  };
}

const bottomSections = bottomNavSections();
const drawerSections = menuSections("drawer");
const homeSections = HOME_IDS.map((id) => getSectionById(id)).filter(
  (s): s is SectionDef => Boolean(s),
);

function placementsOf(s: SectionDef): NavPlacement[] {
  const out: NavPlacement[] = [];
  if (bottomSections.includes(s)) out.push("bottom");
  if (drawerSections.includes(s)) out.push("drawer");
  if (homeSections.includes(s)) out.push("home");
  return out;
}

export const NAV_ITEMS: NavEntry[] = [
  ...new Set([...bottomSections, ...drawerSections, ...homeSections]),
].map((s) => entryFromSection(s, placementsOf(s)));

export function navFor(surface: NavPlacement): NavEntry[] {
  const list =
    surface === "bottom" ? bottomSections : surface === "home" ? homeSections : drawerSections;
  return list.map((s) => entryFromSection(s, placementsOf(s)));
}

/**
 * مسار عام كانوني من معرّف قسم أو مسار خام — مصدر واحد للبحث/البطاقات/التفتيت.
 * لا يخترع مسارات؛ يعيد المسار المسجّل أو ينظّف المدخل فقط.
 */
export function buildCanonicalPublicHref(sectionIdOrPath: string): string | null {
  const raw = sectionIdOrPath.trim();
  if (!raw) return null;
  if (raw.startsWith("/")) {
    const clean = raw.split("?")[0].replace(/\/$/, "") || "/";
    const fromNav = NAV_ITEMS.find((i) => (i.href.replace(/\/$/, "") || "/") === clean);
    if (fromNav) return fromNav.href;
    const fromLists = [...primaryNav, ...secondaryNav, ...searchEligibleSections].find(
      (i) => (i.href.replace(/\/$/, "") || "/") === clean,
    );
    return fromLists?.href ?? clean;
  }
  const section = getSectionById(raw);
  if (section) return section.route;
  return NAV_ITEMS.find((i) => i.id === raw)?.href ?? null;
}

/** HTML تنقّل الـprerender — يُستهلك من generate-seo.mjs */
export function prerenderNavItems(): NavLinkItem[] {
  return [...primaryNav];
}
