/**
 * محور المحتوى البارز في الرئيسية — أعلى قيمة سردية.
 */
import type { LucideIcon } from "lucide-react";
import { BookOpen, Landmark, Users } from "lucide-react";
import { getSectionByRoute } from "@/config/sections.registry";

/** الاسم المعتمد من سجل الأقسام — يطابق القوائم وصفحة الأقسام. */
function sectionTitle(route: string): string {
  const s = getSectionByRoute(route);
  if (!s) throw new Error(`home-content-hub: مسار غير مسجّل ${route}`);
  return s.label;
}

export type ContentHubCard = {
  href: string;
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  /** مسار الـ chunk للتحميل المسبق عند النية */
  preload?: () => Promise<unknown>;
};

export const HOME_CONTENT_HUB: ContentHubCard[] = [
  {
    href: "/prophets",
    Icon: BookOpen,
    title: sectionTitle("/prophets"),
    subtitle: "من آدم إلى محمد ﷺ — قصص وعِبَر من القرآن",
    preload: () => import("@/views/ProphetStoriesPage"),
  },
  {
    href: "/quran/people",
    Icon: Users,
    title: sectionTitle("/quran/people"),
    subtitle: "أسماء صريحة في القرآن مع مواضع الآيات والعِبَر",
    preload: () => import("@/pages/quran/QuranPeoplePage"),
  },
  {
    href: "/nations",
    Icon: Landmark,
    title: sectionTitle("/nations"),
    subtitle: "أقوام ذُكروا في القرآن: دعوتهم وعاقبتهم والعِبَر",
    preload: () => import("@/views/NationsPage"),
  },
];
