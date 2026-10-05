/**
 * القائمة الجانبية — عنوان قصير + توضيح مختصر؛ الشريط السفلي يبقى مختصرًا.
 * صفوف التصفّح قائمة سماح صريحة من السجل (لا تُخفى بـ HIDDEN_FROM_NAV).
 */
import type { LucideIcon } from "lucide-react";
import {
  SECTION_GROUP_ACCENT,
  menuGroups,
  menuLabel,
  resolveSectionAccent,
} from "@/config/sections.registry";

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

/**
 * مجموعات الدرج = مجموعات IA السبع من السجل (SECTION_GROUP_META)،
 * والعضوية عبر surface «drawer» في مدخل كل قسم، والاسم المختصر navLabel والتوضيح navHint.
 * لا قوائم معرّفات ولا نصوص مكتوبة يدويًا هنا.
 */
const DEFAULT_OPEN_GROUP = "quran";

export const SIDEBAR_NAV_GROUPS: SidebarNavGroup[] = menuGroups("drawer").map((g) => ({
  id: g.group,
  title: g.label,
  subtitle: g.subtitle,
  accent: SECTION_GROUP_ACCENT[g.group],
  items: g.sections.map((s) => ({
    href: s.route,
    label: menuLabel(s),
    description: s.navHint,
    Icon: s.icon,
    accent: resolveSectionAccent(s),
  })),
  defaultOpen: g.group === DEFAULT_OPEN_GROUP ? true : undefined,
}));

export const SIDEBAR_FLAT_HREFS: string[] = SIDEBAR_NAV_GROUPS.flatMap((g) =>
  g.items.map((i) => i.href),
);
