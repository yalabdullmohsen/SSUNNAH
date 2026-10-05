/**
 * سلطة تخطيط لوحة التحكم — المصدر الوحيد لـ: رأس القسم + شريط الأدوات + المحتوى + الحالات
 * (تحميل/خطأ/فارغ) + بطاقات الإحصاء + نبرات الحالة + التبويبات.
 *
 * يعيد استخدام القطع القائمة ولا يكرّرها:
 * - الحالات: AdminV3Loading / AdminV3ErrorState / AdminV3Empty (فوق EmptyStateV2/ErrorStateV2/LoadingStateV2)
 * - التبويبات: ContentTabs من design-system (role=tablist/tab)
 * - التأكيد: useAdminConfirm من AdminConfirmDialog
 * - الحالة: resolveAdminStatus من lib/admin-status (توكنات --mj-* لا hex)
 * الأنماط في styles/admin.css (يحمّلها AdminShell).
 */
import type { KeyboardEvent, ReactNode } from "react";
import { ContentTabs, type ContentTabItem } from "@/components/design-system/TabSystem";
import { AdminV3Empty, AdminV3ErrorState, AdminV3Loading } from "@/admin-v3/states";
import { resolveAdminStatus, type AdminTone } from "@/lib/admin-status";

export type { AdminTone } from "@/lib/admin-status";

/* ─── رأس القسم + شريط الأدوات ─────────────────────────────────────── */

export function AdminSectionHeader({
  title,
  count,
  badge,
  description,
  actions,
  toolbar,
}: {
  title: ReactNode;
  count?: number;
  badge?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** بحث/فلاتر — تُعرض تحت الرأس */
  toolbar?: ReactNode;
}) {
  return (
    <div className="ast-wrap" data-admin-layout="header">
      <div className={`ast-header${toolbar ? " ast-header--padded" : ""}`}>
        <div>
          <h2 className="ast-title">
            {title}
            {count !== undefined && ` (${count})`}
            {badge}
          </h2>
          {description ? <p className="adm-section-desc">{description}</p> : null}
        </div>
        {actions && <div className="ast-actions">{actions}</div>}
      </div>
      {toolbar ? <div className="ast-toolbar">{toolbar}</div> : null}
    </div>
  );
}

/* ─── حالات المحتوى ───────────────────────────────────────────────── */

export type AdminSectionState = {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** true ← يعرض حالة "فارغ" بدل المحتوى */
  empty?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
};

export function AdminStateGate({
  loading,
  error,
  onRetry,
  empty,
  emptyTitle = "لا توجد عناصر بعد",
  emptyBody = "جرّب تغيير عوامل التصفية أو أضف عنصرًا جديدًا.",
  children,
}: AdminSectionState & { children?: ReactNode }) {
  if (loading) return <div className="adm-section-state"><AdminV3Loading label="جارٍ التحميل…" /></div>;
  if (error) return <div className="adm-section-state"><AdminV3ErrorState message={error} onRetry={onRetry} /></div>;
  if (empty) return <div className="adm-section-state"><AdminV3Empty title={emptyTitle} body={emptyBody} /></div>;
  return <>{children}</>;
}

/** القسم الكامل: رأس + أدوات + محتوى محكوم بالحالات. */
export function AdminSectionLayout({
  title,
  count,
  badge,
  description,
  actions,
  toolbar,
  state,
  children,
}: {
  title: ReactNode;
  count?: number;
  badge?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  toolbar?: ReactNode;
  state?: AdminSectionState;
  children?: ReactNode;
}) {
  return (
    <section className="adm-section" data-admin-layout="section">
      <AdminSectionHeader
        title={title}
        count={count}
        badge={badge}
        description={description}
        actions={actions}
        toolbar={toolbar}
      />
      <AdminStateGate {...state}>{children}</AdminStateGate>
    </section>
  );
}

/* ─── بطاقات الإحصاء ─────────────────────────────────────────────── */

export function AdminStatGrid({ children }: { children: ReactNode }) {
  return <div className="adm-stat-grid">{children}</div>;
}

export function AdminStatCard({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  tone?: AdminTone;
}) {
  return (
    <div className={`adm-stat adm-stat--${tone}`}>
      <p className="adm-stat__label">{label}</p>
      <p className="adm-stat__value">{value}</p>
      {sub ? <p className="adm-stat__sub">{sub}</p> : null}
    </div>
  );
}

/* ─── نبرات الحالة ───────────────────────────────────────────────── */

/** شارة بنبرة صريحة (أنواع/أولويات لا تُشتق من حالة). */
export function AdminToneBadge({ tone = "neutral", children }: { tone?: AdminTone; children: ReactNode }) {
  return <span className={`admin-badge admin-badge--${tone}`}>{children}</span>;
}

/** شارة حالة المحتوى — النبرة والتسمية من resolveAdminStatus. */
export function AdminStatusPill({ status, label }: { status: string | null | undefined; label?: string }) {
  const entry = resolveAdminStatus(status);
  return <AdminToneBadge tone={entry.tone}>{label ?? entry.label}</AdminToneBadge>;
}

/** نص ملوّن بنبرة (قيم حالة داخل جمل/جداول). */
export function AdminToneText({ tone = "neutral", children }: { tone?: AdminTone; children: ReactNode }) {
  return <span className={`adm-tone-text--${tone}`}>{children}</span>;
}

/* ─── التبويبات ──────────────────────────────────────────────────── */

export type AdminTabItem = ContentTabItem;

/** لوحة مفاتيح WAI-ARIA للتبويبات: الأسهم (واعية لـRTL) + Home/End مع التفعيل التلقائي. */
export function handleAdminTablistKeyDown(e: KeyboardEvent<HTMLElement>) {
  const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
  if (!keys.includes(e.key)) return;
  const tabs = Array.from(
    e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])'),
  );
  const i = tabs.indexOf(document.activeElement as HTMLElement);
  if (i < 0 || tabs.length === 0) return;
  const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
  const forward = rtl ? "ArrowLeft" : "ArrowRight";
  let n: number;
  if (e.key === "Home") n = 0;
  else if (e.key === "End") n = tabs.length - 1;
  else n = (i + (e.key === forward ? 1 : -1) + tabs.length) % tabs.length;
  e.preventDefault();
  tabs[n].focus();
  tabs[n].click();
}

/** تبويبات اللوحة — نفس ContentTabs (role=tablist/tab) بلا ألوان مضمّنة + أسهم لوحة المفاتيح. */
export function AdminTabs({
  items,
  value,
  onChange,
  ariaLabel,
  idPrefix,
}: {
  items: AdminTabItem[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  idPrefix: string;
}) {
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- يفوّض الأسهم إلى role=tab الداخلية
    <div className="adm-tabs-wrap" onKeyDown={handleAdminTablistKeyDown}>
      <ContentTabs
        items={items}
        value={value}
        onChange={onChange}
        ariaLabel={ariaLabel}
        idPrefix={idPrefix}
        variant="pill"
        className="adm-tabs"
      />
    </div>
  );
}
