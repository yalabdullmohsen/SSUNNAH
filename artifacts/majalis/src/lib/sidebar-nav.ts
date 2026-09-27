import { BRAND } from "@/shared/config/brand";
/**
 * القائمة الجانبية — مجموعات بعناوين كاملة + صفوف الحساب من السجل.
 * التسميات الكاملة هنا فقط (الشريط السفلي يبقى مختصرًا حيث لزم).
 */
import type { LucideIcon } from "lucide-react";
import { navFor } from "@/config/navigation";
import {
  SECTION_GROUP_ACCENT,
  SECTION_GROUP_META,
  getSectionById,
  resolveSectionAccent,
  sectionsForSurface,
} from "@/config/sections.registry";
import { filterNavItems } from "@/lib/nav-visibility";

export type SidebarNavItem = {
  href: string;
  label: string;
  description?: string;
  Icon: LucideIcon;
  /** لون أيقونة الصف — يميّز القسم عن جيرانه */
  accent: string;
};

export type SidebarNavGroup = {
  id: string;
  title: string;
  /** لون عنوان المجموعة والحد الفاصل */
  accent: string;
  items: SidebarNavItem[];
  /** يُفتح افتراضيًا عند عدم تطابق مسار نشط */
  defaultOpen?: boolean;
};

/** تسميات درج كاملة — لا تغيّر الشريط السفلي */
const DRAWER_FULL_LABEL: Readonly<Record<string, string>> = {
  mushaf: "المصحف",
  quran: "القرآن الكريم",
  tafsir: "التفسير",
  "quran-tilawa": "التلاوة",
  "ulum-quran": "علوم القرآن",
  lessons: "الدروس العلمية",
  flashcards: "المحفوظات",
  progress: "التقدم",
  aqidah: "العقيدة",
  hadith: "الحديث",
  fiqh: "الفقه الإسلامي",
  seerah: "السيرة النبوية",
  "islamic-history": "التاريخ الإسلامي",
  prayer: "الصلاة",
  adhkar: "الأذكار",
  duas: "الأدعية",
  qibla: "القبلة",
  fawaid: "الفوائد العلمية",
  miracles: "الإعجاز العلمي",
  "discover-islam": "التعريف بالإسلام",
  glossary: "المصطلحات",
  sources: "المراجع",
  sections: "جميع الأقسام",
};

/** مجموعات الدرج — IA بتسميات كاملة */
const DRAWER_BROWSE_GROUPS: ReadonlyArray<{
  id: string;
  title: string;
  accent: string;
  /** معرّفات NavEntry (mushaf ← open-mushaf) */
  navIds: readonly string[];
  defaultOpen?: boolean;
}> = [
  {
    id: "quran",
    title: "القرآن الكريم والتلاوة",
    accent: "#2A7A6E",
    navIds: ["mushaf", "quran", "tafsir", "quran-tilawa", "ulum-quran"],
    defaultOpen: true,
  },
  {
    id: "learning",
    title: "التعلم والدروس",
    accent: "#1F5C48",
    navIds: ["lessons", "flashcards", "progress"],
  },
  {
    id: "sciences",
    title: "العلوم الشرعية",
    accent: BRAND.colorDay,
    navIds: ["aqidah", "hadith", "fiqh", "seerah", "islamic-history"],
  },
  {
    id: "worship",
    title: "العبادة والأدوات",
    accent: "#2A7A6E",
    navIds: ["prayer", "adhkar", "duas", "qibla"],
  },
  {
    id: "knowledge",
    title: "المعرفة والموسوعات",
    accent: "#8B6914",
    navIds: ["fawaid", "miracles", "discover-islam", "glossary", "sources", "sections"],
  },
];

function sectionIdFromNavId(navId: string): string {
  return navId === "mushaf" ? "open-mushaf" : navId;
}

function accentForNavId(navId: string, groupAccent: string): string {
  const section = getSectionById(sectionIdFromNavId(navId));
  if (!section) return groupAccent;
  return resolveSectionAccent(section);
}

const drawerEntries = navFor("drawer");
const entryById = new Map(drawerEntries.map((e) => [e.id, e]));

const browseGroups: SidebarNavGroup[] = DRAWER_BROWSE_GROUPS.map((def) => {
  const items: SidebarNavItem[] = [];
  for (const navId of def.navIds) {
    const e = entryById.get(navId);
    if (!e) continue;
    items.push({
      href: e.href,
      label: DRAWER_FULL_LABEL[navId] ?? e.label,
      Icon: e.icon,
      accent: accentForNavId(navId, def.accent),
    });
  }
  return {
    id: def.id,
    title: def.title,
    accent: def.accent,
    items: filterNavItems(items),
    defaultOpen: def.defaultOpen,
  };
}).filter((g) => g.items.length > 0);

const browseHrefs = new Set(browseGroups.flatMap((g) => g.items.map((i) => i.href)));

const accountItems: SidebarNavItem[] = sectionsForSurface("drawer")
  .filter((s) => s.id !== "sections" && !browseHrefs.has(s.route))
  .map((s) => ({
    href: s.route,
    label: s.label,
    description: s.subtitle,
    Icon: s.icon,
    accent: resolveSectionAccent(s),
  }));

export const SIDEBAR_NAV_GROUPS: SidebarNavGroup[] = [
  ...browseGroups,
  {
    id: "account",
    title: SECTION_GROUP_META.account.label,
    accent: SECTION_GROUP_ACCENT.account,
    items: filterNavItems(accountItems),
  },
].filter((group) => group.items.length > 0);

export const MORE_SHEET_ITEMS: SidebarNavItem[] = filterNavItems(
  sectionsForSurface("moreHub").slice(0, 8).map((s) => ({
    href: s.route,
    label: s.label,
    description: s.subtitle,
    Icon: s.icon,
    accent: resolveSectionAccent(s),
  })),
);

export const SIDEBAR_FLAT_HREFS: string[] = SIDEBAR_NAV_GROUPS.flatMap((g) =>
  g.items.map((i) => i.href),
);
