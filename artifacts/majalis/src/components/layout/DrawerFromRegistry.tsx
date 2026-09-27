/**
 * صفوف الدرج من مصدر التنقّل الموحّد — مجموعات قابلة للطي بعناوين مميزة.
 * لا تحميل لخطوط المصحف من هنا — الرابط فقط.
 */
import { memo, useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useLocation } from "wouter";
import { SIDEBAR_NAV_GROUPS } from "@/lib/sidebar-nav";
import { isNavHrefActive } from "@/lib/nav-active";
import { loadLastPageSync } from "@/lib/quran-last-page";

type Props = {
  onNavigate?: () => void;
  className?: string;
};

type Resume = { page: number; surah?: string };

function groupContainsPath(
  items: ReadonlyArray<{ href: string }>,
  pathname: string,
): boolean {
  return items.some((item) => isNavHrefActive(pathname, item.href));
}

export const DrawerFromRegistry = memo(function DrawerFromRegistry({
  onNavigate,
  className,
}: Props) {
  const groups = useMemo(() => SIDEBAR_NAV_GROUPS, []);
  const [pathname] = useLocation();
  const [resume, setResume] = useState<Resume | null>(null);

  const initialOpen = useMemo(() => {
    const active = groups.find((g) => groupContainsPath(g.items, pathname));
    if (active) return new Set([active.id]);
    const preferred = groups.find((g) => g.defaultOpen) ?? groups[0];
    return new Set(preferred ? [preferred.id] : []);
  }, [groups, pathname]);

  const [openIds, setOpenIds] = useState<Set<string>>(initialOpen);

  useEffect(() => {
    setOpenIds(initialOpen);
  }, [initialOpen]);

  useEffect(() => {
    const page = loadLastPageSync();
    if (!page) {
      setResume(null);
      return;
    }
    setResume({ page });
    void import("@/lib/quran-api")
      .then(({ SURAH_START_PAGES, getSurahList }) => {
        let surahId = 1;
        for (let i = 0; i < SURAH_START_PAGES.length; i++) {
          const start = SURAH_START_PAGES[i];
          if (typeof start === "number" && start <= page) surahId = i + 1;
          else if (typeof start === "number" && start > page) break;
        }
        const name = getSurahList()[surahId - 1]?.name;
        setResume({ page, surah: name });
      })
      .catch(() => undefined);
  }, []);

  function toggleGroup(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className={className}>
      {groups.map((group) => {
        const expanded = openIds.has(group.id);
        const panelId = `sidebar-group-panel-${group.id}`;
        const titleId = `sidebar-group-${group.id}`;
        return (
          <section
            key={group.id}
            className={`sidebar-section${expanded ? " sidebar-section--open" : " sidebar-section--collapsed"}`}
            aria-labelledby={titleId}
            style={
              {
                "--sidebar-group-accent": group.accent,
              } as CSSProperties
            }
          >
            <h2 id={titleId} className="sidebar-section-title">
              <button
                type="button"
                className="sidebar-section-toggle"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggleGroup(group.id)}
              >
                <span className="sidebar-section-toggle__label">{group.title}</span>
                <span
                  className={`sidebar-section-toggle__chevron${expanded ? " is-open" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </h2>
            <nav
              id={panelId}
              aria-label={group.title}
              hidden={!expanded}
              className="sidebar-section-panel"
            >
              {group.items.map((item) => {
                const active = isNavHrefActive(pathname, item.href);
                const itemStyle = {
                  "--sidebar-item-accent": item.accent,
                } as CSSProperties;
                const row = (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`sidebar-item${active ? " active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    aria-label={item.label}
                    style={itemStyle}
                  >
                    <span className="sidebar-item-icon" aria-hidden="true">
                      <item.Icon size={18} strokeWidth={1.8} />
                    </span>
                    <span className="sidebar-item-text">
                      <span className="sidebar-item-title">{item.label}</span>
                    </span>
                  </Link>
                );
                if (item.href !== "/mushaf" || !resume) return row;
                return (
                  <div key={`${item.href}-resume`}>
                    {row}
                    <Link
                      href={`/mushaf?page=${resume.page}`}
                      onClick={onNavigate}
                      className="sidebar-item"
                      aria-label={`متابعة القراءة — صفحة ${resume.page}${resume.surah ? ` — ${resume.surah}` : ""}`}
                      style={itemStyle}
                    >
                      <span className="sidebar-item-icon" aria-hidden="true">
                        <item.Icon size={18} strokeWidth={1.8} />
                      </span>
                      <span className="sidebar-item-text">
                        <span className="sidebar-item-title">متابعة القراءة</span>
                        <span className="sidebar-item-sub">
                          صفحة {resume.page}
                          {resume.surah ? ` — ${resume.surah}` : ""}
                        </span>
                      </span>
                    </Link>
                  </div>
                );
              })}
            </nav>
          </section>
        );
      })}
    </div>
  );
});
