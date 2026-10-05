import { BRAND } from "@/shared/config/brand";
/**
 * القائمة الجانبية — عنوان قصير + توضيح مختصر؛ الشريط السفلي يبقى مختصرًا.
 * صفوف التصفّح من DRAWER_IDS صراحةً (لا تُخفى بـ HIDDEN_FROM_NAV).
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
  /** سطر توضيحي تحت عنوان المجموعة */
  subtitle?: string;
  /** لون عنوان المجموعة والحد الفاصل */
  accent: string;
  items: SidebarNavItem[];
  /** يُفتح افتراضيًا عند عدم تطابق مسار نشط */
  defaultOpen?: boolean;
};

/** عنوان قصير + توضيح — وضوح دون إطالة السطر الواحد */
const DRAWER_ITEM_COPY: Readonly<
  Record<string, { label: string; description?: string }>
> = {
  mushaf: { label: "المصحف" },
  quran: { label: "القرآن", description: "مركز القراءة والتعلّم" },
  tafsir: { label: "التفسير" },
  "quran-tilawa": { label: "التلاوة" },
  "ulum-quran": { label: "علوم القرآن" },
  lessons: { label: "الدروس", description: "الدروس والمحاضرات" },
  flashcards: { label: "المحفوظات", description: "مراجعة وحفظ" },
  progress: { label: "التقدم" },
  aqidah: { label: "العقيدة" },
  hadith: { label: "الحديث" },
  fiqh: { label: "الفقه", description: "الأحكام الفقهية" },
  seerah: { label: "السيرة", description: "السيرة النبوية" },
  "islamic-history": { label: "التاريخ", description: "التاريخ الإسلامي" },
  prayer: { label: "الصلاة" },
  adhkar: { label: "الأذكار" },
  duas: { label: "الأدعية" },
  qibla: { label: "القبلة" },
  fawaid: { label: "الفوائد", description: "فوائد علمية مختارة" },
  miracles: { label: "الإعجاز", description: "الإعجاز العلمي" },
  "discover-islam": { label: "التعريف", description: "التعريف بالإسلام" },
  glossary: { label: "المصطلحات" },
  sources: { label: "المراجع" },
  sections: { label: "جميع الأقسام", description: "دليل كامل للأقسام" },
};

/** مجموعات الدرج — عنوان قصير + توضيح المحتويات */
const DRAWER_BROWSE_GROUPS: ReadonlyArray<{
  id: string;
  title: string;
  subtitle?: string;
  accent: string;
  /** معرّفات NavEntry (mushaf ← open-mushaf) */
  navIds: readonly string[];
  defaultOpen?: boolean;
}> = [
  {
    id: "quran",
    title: "القرآن",
    subtitle: "المصحف • التفسير • التلاوة",
    accent: "#2A7A6E",
    navIds: ["mushaf", "quran", "tafsir", "quran-tilawa", "ulum-quran"],
    defaultOpen: true,
  },
  {
    id: "learning",
    title: "الدروس",
    subtitle: "الدروس والمحاضرات",
    accent: "#1F5C48",
    navIds: ["lessons", "flashcards", "progress"],
  },
  {
    id: "sciences",
    title: "العلوم",
    subtitle: "عقيدة • حديث • فقه • سيرة",
    accent: BRAND.colorDay,
    navIds: ["aqidah", "hadith", "fiqh", "seerah", "islamic-history"],
  },
  {
    id: "worship",
    title: "العبادة",
    subtitle: "صلاة • أذكار • أدوات",
    accent: "#2A7A6E",
    navIds: ["prayer", "adhkar", "duas", "qibla"],
  },
  {
    id: "knowledge",
    title: "المعرفة",
    subtitle: "فوائد • إعجاز • مراجع",
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
    const copy = DRAWER_ITEM_COPY[navId];
    items.push({
      href: e.href,
      label: copy?.label ?? e.label,
      description: copy?.description,
      Icon: e.icon,
      accent: accentForNavId(navId, def.accent),
    });
  }
  return {
    id: def.id,
    title: def.title,
    subtitle: def.subtitle,
    accent: def.accent,
    /* صفوف التصفّح مصرّح بها هنا — لا تُسقط بـ HIDDEN_FROM_NAV */
    items,
    defaultOpen: def.defaultOpen,
  };
}).filter((g) => g.items.length > 0);

const browseHrefs = new Set(browseGroups.flatMap((g) => g.items.map((i) => i.href)));

const accountItems: SidebarNavItem[] = sectionsForSurface("drawer")
  /* صفوف الحساب فقط — أقسام المحتوى في الدرج تأتي من مجموعات التصفّح */
  .filter((s) => s.group === "account" && !browseHrefs.has(s.route))
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
