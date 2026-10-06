import type { TabItem } from "../navigation";
import { S } from "@/design-system/strings";

/**
 * التبويبات الخمسة — مصدر وحيد للشريط السفلي (iOS TabBar).
 * match: بادئات المسارات التي تُبرز التبويب؛ أي مسار غير مطابق يُنسب إلى «المزيد».
 */
export const APP_TABS: readonly TabItem[] = [
  { id: "home", label: S.tabs_01, href: "/", icon: "home", match: ["/"] },
  {
    id: "quran",
    label: S.quranHub_01,
    href: "/quran-hub",
    icon: "quran",
    match: ["/quran-hub", "/quran", "/mushaf", "/mushaf-v2-preview", "/tafsir", "/quran-engine", "/quran-index", "/quran-knowledge", "/quran-sciences", "/quran-studies", "/quran-stories", "/quran-memorization", "/quran-circles", "/ulum-quran", "/tajweed", "/mutashabihat"],
  },
  { id: "lessons", label: S.home_08, href: "/lessons", icon: "lessons", match: ["/lessons", "/teachers", "/sheikhs", "/courses", "/calendar", "/kuwait-lessons", "/announcements", "/competitions"] },
  {
    id: "worship",
    label: S.worship_01,
    href: "/worship",
    icon: "prayer",
    match: ["/worship", "/prayer", "/prayer-times", "/prayer-countdown", "/prayer-ranks", "/salah-guide", "/adhkar", "/duas", "/duas-quran", "/qibla", "/tasbih", "/zakat", "/sawm", "/hajj", "/tahara", "/janaza", "/sujood-sahw", "/udhiya"],
  },
  { id: "more", label: S.more_07, href: "/more", icon: "more", match: ["/more", "/sections", "/settings", "/profile", "/search", "/login", "/register"] },
] as const;

export type AppTabId = (typeof APP_TABS)[number]["id"];

function norm(p: string) {
  return (p.split("?")[0] || "/").replace(/\/+$/, "") || "/";
}

/** تبويب واحد دائمًا: الأطول تطابقًا، وإلا «المزيد». */
export function activeTabId(pathname: string): AppTabId {
  const path = norm(pathname);
  if (path === "/") return "home";
  let best: { id: AppTabId; len: number } | null = null;
  for (const t of APP_TABS) {
    for (const m of t.match) {
      if (m === "/") continue;
      if (path === m || path.startsWith(m + "/")) {
        if (!best || m.length > best.len) best = { id: t.id as AppTabId, len: m.length };
      }
    }
  }
  return best?.id ?? "more";
}

/** شاشات تبني شريط تنقّلها الخاص (عنوان كبير) فلا يظهر الشريط العلوي العام فوقها. */
const OWN_NAVBAR = new Set(["/", "/more", "/worship", "/search", "/lessons", "/quran-hub", "/sections"]);
export function screenOwnsNavBar(pathname: string): boolean {
  const path = norm(pathname);
  return OWN_NAVBAR.has(path) || path.startsWith("/search/");
}
