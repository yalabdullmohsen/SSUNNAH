import { useLocation } from "wouter";
import { NavigationBar, TabBar } from "../navigation";
import { IconLink } from "../primitives";
import { APP_TABS, activeTabId, screenOwnsNavBar } from "./tabs";
import { getSectionByRoute } from "@/config/sections.registry";
import { useAuth } from "@/components/AuthProvider";

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
      leading={<IconLink icon={isLoggedIn ? "user" : "login"} label={isLoggedIn ? "حسابي" : "تسجيل الدخول"} href={isLoggedIn ? "/profile" : "/login"} />}
      trailing={<IconLink icon="search" label="بحث" href="/search" />}
    />
  );
}
