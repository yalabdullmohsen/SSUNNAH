import { ListGroup, ListRow, NavigationBar, IconLink } from "@/design-system";
import { useAuth } from "@/components/AuthProvider";
import { SECTION_GROUP_ORDER, menuGroups, menuLabel } from "@/config/sections.registry";
import { S } from "@/design-system/strings";

const SETTINGS_ROWS = [
  { id: "settings", title: S.more_01, description: S.more_02, href: "/settings", icon: "settings" },
  { id: "support", title: S.more_03, href: "/contact", icon: "help" },
  { id: "about", title: S.more_04, href: "/about", icon: "info" },
  { id: "privacy", title: S.more_05, href: "/privacy", icon: "shield" },
  { id: "terms", title: S.more_06, href: "/terms", icon: "info" },
] as const;

/** تبويب «المزيد»: حساب · أقسام مجمّعة (من سجل الأقسام) · إعدادات ودعم وسياسات — بأسلوب إعدادات iOS. */
export default function MorePage() {
  const { isLoggedIn } = useAuth();
  const groups = menuGroups("drawer").filter((g) => g.group !== "account" && SECTION_GROUP_ORDER.includes(g.group));
  return (
    <div className="sn-screen" data-testid="more-screen">
      <NavigationBar title={S.more_07} trailing={<IconLink icon="search" label={S.navigation_03} href="/search" />} />
      <div className="sn-container sn-stack sn-stack--lg">
        <ListGroup label={S.more_08}>
          {isLoggedIn ? (
            <ListRow icon="user" title={S.home_32} description={S.more_09} href="/profile" />
          ) : (
            <ListRow icon="login" title={S.more_10} description={S.more_11} href="/login" />
          )}
        </ListGroup>
        {groups.map((g) => (
          <ListGroup key={g.group} label={g.label}>
            {g.sections.map((s) => (
              <ListRow key={s.id} iconNode={<s.icon width={20} height={20} strokeWidth={1.75} aria-hidden="true" focusable="false" />} title={menuLabel(s)} description={s.navHint || s.subtitle} href={s.route} />
            ))}
          </ListGroup>
        ))}
        <ListGroup label={S.more_12}>
          {SETTINGS_ROWS.map((r) => (
            <ListRow key={r.id} icon={r.icon} title={r.title} description={"description" in r ? r.description : undefined} href={r.href} />
          ))}
        </ListGroup>
      </div>
    </div>
  );
}
