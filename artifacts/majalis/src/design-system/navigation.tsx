import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Icon, type DsIconName } from "./Icon";
import { cn } from "@/lib/utils";
import { S } from "@/design-system/strings";

/** شريط التنقّل: عنوان كبير يصغر عند التمرير ويظهر عنوان مصغّر في الشريط. */
export function NavigationBar({ title, subtitle, leading, trailing, large = true }: { title: string; subtitle?: string; leading?: ReactNode; trailing?: ReactNode; large?: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setCollapsed(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <>
      <header className="sn-navbar" data-collapsed={large ? collapsed : true}>
        <div className="sn-navbar__bar">
          <div className="sn-navbar__side">{leading}</div>
          <span className="sn-navbar__title-sm" aria-hidden="true">{title}</span>
          <div className="sn-navbar__side sn-navbar__side--end">{trailing}</div>
        </div>
        {large ? (
          <div className="sn-navbar__large">
            <h1 className="sn-navbar__large-title">{title}</h1>
            {subtitle ? <p className="sn-navbar__subtitle">{subtitle}</p> : null}
          </div>
        ) : null}
      </header>
      {/* حارس مراقبة التمرير: خارج الشريط اللاصق فلا يتأثر بانكماشه */}
      <div ref={sentinel} aria-hidden="true" className="sn-navbar__sentinel" />
    </>
  );
}

export type TabItem = { id: string; label: string; href: string; icon: DsIconName; match: readonly string[] };

/** شريط التبويب: 5 تبويبات؛ الضغط على النشط يعيد للأعلى. */
export function TabBar({ tabs, activeId, label = S.navigation_01 }: { tabs: readonly TabItem[]; activeId?: string; label?: string }) {
  const [location, navigate] = useLocation();
  const isActive = (t: TabItem) =>
    activeId != null ? t.id === activeId : t.match.some((m) => (m === "/" ? location === "/" : location === m || location.startsWith(m + "/")));
  return (
    <nav className="sn-tabbar" aria-label={label}>
      {tabs.map((t) => {
        const active = isActive(t);
        return (
          <Link
            key={t.id}
            href={t.href}
            className="sn-tab sn-pressable"
            aria-current={active ? "page" : undefined}
            onClick={(e) => {
              if (active) {
                e.preventDefault();
                if (location !== t.href) navigate(t.href);
                window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
              }
            }}
          >
            <span className="sn-tab__icon"><Icon name={t.icon} size={24} /></span>
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function SectionHeader({ title, actionLabel, actionHref, onAction }: { title: string; actionLabel?: string; actionHref?: string; onAction?: () => void }) {
  return (
    <div className="sn-section-header">
      <h2 className="sn-section-header__title">{title}</h2>
      {actionLabel && actionHref ? <Link href={actionHref} className="sn-section-header__action">{actionLabel}</Link> : null}
      {actionLabel && !actionHref && onAction ? <button type="button" className="sn-section-header__action" onClick={onAction}>{actionLabel}</button> : null}
    </div>
  );
}

/** مفتاح تبديل iOS (role=switch). */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className="sn-switch" onClick={() => onChange(!checked)} />;
}

type ListRowProps = {
  icon?: DsIconName;
  /** أيقونة جاهزة (مثل أيقونات سجل الأقسام) بدل الاسم */
  iconNode?: ReactNode;
  title: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  /** مفتاح تبديل بدل السهم */
  toggle?: { checked: boolean; onChange: (v: boolean) => void };
  trailing?: ReactNode;
};

/** صف قائمة: أيقونة + عنوان + وصف + سهم/مفتاح. */
export function ListRow({ icon, iconNode, title, description, href, onClick, toggle, trailing }: ListRowProps) {
  const body = (
    <>
      {icon || iconNode ? <span className="sn-row-item__icon">{iconNode ?? (icon ? <Icon name={icon} size={20} /> : null)}</span> : null}
      <span className="sn-row-item__body">
        <span className="sn-row-item__title">{title}</span>
        {description ? <span className="sn-row-item__desc">{description}</span> : null}
      </span>
      {toggle || trailing || href || onClick ? (
        <span className="sn-row-item__trail">
          {trailing}
          {toggle ? <Switch checked={toggle.checked} onChange={toggle.onChange} label={title} /> : href || onClick ? <Icon name="chevron" size={20} className="sn-row-item__chev" /> : null}
        </span>
      ) : null}
    </>
  );
  if (toggle) return <div className="sn-row-item">{body}</div>;
  if (href) return <Link href={href} className="sn-row-item sn-pressable">{body}</Link>;
  return <button type="button" className="sn-row-item sn-pressable" onClick={onClick}>{body}</button>;
}

export function ListGroup({ children, label, className }: { children: ReactNode; label?: string; className?: string }) {
  return (
    <div className={cn("sn-list-wrap", className)}>
      {label ? <p className="sn-list__label">{label}</p> : null}
      <div className="sn-list">{children}</div>
    </div>
  );
}

type SearchFieldProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  label?: string;
  large?: boolean;
};

export function SearchField({ value, onChange, onSubmit, placeholder = S.navigation_02, label = S.navigation_03, large }: SearchFieldProps) {
  return (
    <form
      role="search"
      className={cn("sn-search", large && "sn-search--large")}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <Icon name="search" size={20} />
      <input
        className="sn-search__input"
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
      {value ? (
        <button type="button" className="sn-icon-btn" aria-label={S.navigation_04} onClick={() => onChange("")}>
          <Icon name="close" size={20} />
        </button>
      ) : null}
    </form>
  );
}
