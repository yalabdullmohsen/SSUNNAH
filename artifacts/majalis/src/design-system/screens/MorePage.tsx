import { ListGroup, ListRow, NavigationBar, IconLink } from "@/design-system";
import { useAuth } from "@/components/AuthProvider";
import { SECTION_GROUP_ORDER, menuGroups, menuLabel } from "@/config/sections.registry";

const SETTINGS_ROWS = [
  { id: "settings", title: "الإعدادات", description: "المظهر والإشعارات والخطوط", href: "/settings", icon: "settings" },
  { id: "support", title: "الدعم والتواصل", href: "/contact", icon: "help" },
  { id: "about", title: "عن سُنّة", href: "/about", icon: "info" },
  { id: "privacy", title: "سياسة الخصوصية", href: "/privacy", icon: "shield" },
  { id: "terms", title: "الشروط والأحكام", href: "/terms", icon: "info" },
] as const;

/** تبويب «المزيد»: حساب · أقسام مجمّعة (من سجل الأقسام) · إعدادات ودعم وسياسات — بأسلوب إعدادات iOS. */
export default function MorePage() {
  const { isLoggedIn } = useAuth();
  const groups = menuGroups("drawer").filter((g) => g.group !== "account" && SECTION_GROUP_ORDER.includes(g.group));
  return (
    <div className="sn-screen" data-testid="more-screen">
      <NavigationBar title="المزيد" trailing={<IconLink icon="search" label="بحث" href="/search" />} />
      <div className="sn-container sn-stack sn-stack--lg">
        <ListGroup label="الحساب">
          {isLoggedIn ? (
            <ListRow icon="user" title="حسابي" description="تقدّمك ومحفوظاتك" href="/profile" />
          ) : (
            <ListRow icon="login" title="تسجيل الدخول أو إنشاء حساب" description="لحفظ تقدّمك ومزامنته" href="/login" />
          )}
        </ListGroup>
        {groups.map((g) => (
          <ListGroup key={g.group} label={g.label}>
            {g.sections.map((s) => (
              <ListRow key={s.id} iconNode={<s.icon width={20} height={20} strokeWidth={1.75} aria-hidden="true" focusable="false" />} title={menuLabel(s)} description={s.navHint || s.subtitle} href={s.route} />
            ))}
          </ListGroup>
        ))}
        <ListGroup label="الإعدادات والدعم">
          {SETTINGS_ROWS.map((r) => (
            <ListRow key={r.id} icon={r.icon} title={r.title} description={"description" in r ? r.description : undefined} href={r.href} />
          ))}
        </ListGroup>
      </div>
    </div>
  );
}
