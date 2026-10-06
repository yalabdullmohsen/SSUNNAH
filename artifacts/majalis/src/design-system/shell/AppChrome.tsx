import { useLocation } from "wouter";
import { NavigationBar, TabBar } from "../navigation";
import { IconButton, IconLink } from "../primitives";
import { APP_TABS, activeTabId, screenOwnsNavBar } from "./tabs";
import { getSectionByRoute } from "@/config/sections.registry";
import { useAuth } from "@/components/AuthProvider";
import { S } from "@/design-system/strings";
import { navigateTo } from "@/lib/navigation-intent";

/** رجوع إلى الشاشة السابقة؛ وإن فُتحت الصفحة مباشرة (بلا سجل) فإلى «الأقسام». */
function goBack() {
  if (typeof window !== "undefined" && window.history.length > 1) window.history.back();
  else navigateTo("/sections");
}

/** الشريط السفلي الموحّد — 5 تبويبات. */
export function AppTabBar({ hidden = false }: { hidden?: boolean }) {
  const [location] = useLocation();
  if (hidden) return null;
  return <TabBar tabs={APP_TABS} activeId={activeTabId(location)} />;
}

/** شريط علوي عام للشاشات التي لا تبني شريطها: ملف شخصي + عنوان القسم + بحث. */
export function AppTopBar() {
  const [location] = useLocation();
  const { isLoggedIn } = useAuth();
  if (screenOwnsNavBar(location)) return null;
  const title = getSectionByRoute(location.split("?")[0])?.label ?? "";
  return (
    <NavigationBar
      title={title}
      large={false}
      leading={<IconButton icon="back" label={S.navigation_05} onClick={goBack} />}
      trailing={
        <>
          <IconLink icon="search" label={S.navigation_03} href="/search" />
          <IconLink icon={isLoggedIn ? "user" : "login"} label={isLoggedIn ? S.home_32 : S.auth_18} href={isLoggedIn ? "/profile" : "/login"} />
        </>
      }
    />
  );
}
