import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  FieldError,
  FormActions,
  FormLabel,
  SearchInput,
} from "@/components/design-system/FormFields";
import { StatusCard } from "@/components/design-system/SurfacePrimitives";
import { ErrorStateV2 } from "@/components/design-system";
import { AdminV3Empty, AdminV3ErrorState, AdminV3Loading } from "../states";

export function AdminPageHeader({
  title,
  description,
  crumbs,
  actions,
  badge,
}: {
  title: string;
  description?: string;
  crumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <header className="av3-page-header">
      {crumbs && crumbs.length > 0 ? (
        <nav className="av3-breadcrumbs av3-breadcrumbs--inline" aria-label="مسار الصفحة">
          <ol>
            {crumbs.map((c, i) => (
              <li key={`${c.label}-${i}`} aria-current={i === crumbs.length - 1 ? "page" : undefined}>
                {c.href && i < crumbs.length - 1 ? <Link href={c.href}>{c.label}</Link> : c.label}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <div className="av3-page-header__row">
        <div>
          <h1 className="av3-page-header__title">
            {title}
            {badge ? <span className="av3-badge av3-badge--native">{badge}</span> : null}
          </h1>
          {description ? <p className="av3-dash__sub">{description}</p> : null}
        </div>
        {actions ? <div className="av3-page-header__actions">{actions}</div> : null}
      </div>
    </header>
  );
}

export function AdminPermissionDenied({ permission }: { permission?: string }) {
  return (
    <ErrorStateV2
      title="غير مصرّح"
      description={
        permission
          ? `ليس لديك صلاحية عرض هذه الصفحة. (مطلوب: ${permission})`
          : "ليس لديك صلاحية عرض هذه الصفحة."
      }
      homeHref="/admin/v3"
      homeLabel="لوحة التحكم"
      className="av3-state av3-state--error"
    />
  );
}

export function AdminStatusBadge({
  status,
}: {
  status: string | null | undefined;
}) {
  const s = (status || "unknown").toLowerCase();
  const tone =
    s.includes("approved") || s.includes("publish")
      ? "ok"
      : s.includes("pending") || s.includes("draft")
        ? "warn"
        : s.includes("reject") || s.includes("archiv")
          ? "danger"
          : "muted";
  return <span className={`av3-status av3-status--${tone}`}>{status || "—"}</span>;
}

export function AdminFilterBar({
  children,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit?: (e: FormEvent) => void;
}) {
  return (
    <form className="av3-filter-bar" onSubmit={onSubmit || ((e) => e.preventDefault())} role="search">
      {children}
    </form>
  );
}

export function AdminSearchInput({
  value,
  onChange,
  label = "بحث",
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  id?: string;
}) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div className="av3-field">
      <FormLabel htmlFor={inputId} className="av3-sr-only">
        {label}
      </FormLabel>
      <SearchInput
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        autoComplete="off"
        onClear={value ? () => onChange("") : undefined}
        className="av3-center__search"
      />
    </div>
  );
}

export function AdminPagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
}) {
  if (pageCount <= 1) return null;
  return (
    <div className="av3-pager" role="navigation" aria-label="تصفح الصفحات">
      <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        السابق
      </Button>
      <span aria-live="polite">
        {page} / {pageCount}
      </span>
      <Button
        type="button"
        variant="secondary"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        التالي
      </Button>
    </div>
  );
}

export function AdminDataTable({
  columns,
  rows,
  rowKey,
  emptyTitle = "لا توجد نتائج",
}: {
  columns: { key: string; label: string; render?: (row: Record<string, unknown>) => ReactNode }[];
  rows: Record<string, unknown>[];
  rowKey: (row: Record<string, unknown>) => string;
  emptyTitle?: string;
}) {
  if (rows.length === 0) {
    return <AdminV3Empty title={emptyTitle} body="جرّب تغيير عوامل التصفية أو أضف عنصرًا جديدًا." />;
  }
  return (
    <div className="av3-table-wrap" role="region" aria-label="جدول البيانات">
      <table className="av3-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td key={c.key} data-label={c.label}>
                  {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "تأكيد",
  danger,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);
  if (!open) return null;
  return (
    <div className="av3-dialog-backdrop" role="presentation">
      <div className="av3-dialog" role="alertdialog" aria-modal="true" aria-labelledby="av3-dialog-title">
        <h2 id="av3-dialog-title">{title}</h2>
        <p>{body}</p>
        <FormActions className="av3-dialog__actions">
          <Button type="button" variant="secondary" ref={cancelRef} onClick={onCancel} disabled={busy}>
            إلغاء
          </Button>
          <Button
            type="button"
            variant={danger ? "destructive" : "primary"}
            onClick={onConfirm}
            disabled={busy}
            loading={busy}
          >
            {confirmLabel}
          </Button>
        </FormActions>
      </div>
    </div>
  );
}

export function AdminFormLayout({
  children,
  actions,
  onSubmit,
}: {
  children: ReactNode;
  actions: ReactNode;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form className="av3-form" onSubmit={onSubmit} noValidate>
      <div className="av3-form__fields">{children}</div>
      <FormActions className="av3-form__actions">{actions}</FormActions>
    </form>
  );
}

export function AdminFormField({
  label,
  id,
  children,
  error,
}: {
  label: string;
  id: string;
  children: ReactNode;
  error?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="av3-field">
      <FormLabel htmlFor={id}>{label}</FormLabel>
      {children}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

export function AdminFlash({ children }: { children: ReactNode }) {
  return (
    <StatusCard className="av3-success" role="status">
      {children}
    </StatusCard>
  );
}

export function AdminLegacyChip() {
  return <span className="av3-badge av3-badge--legacy">Legacy</span>;
}

export function AdminLoadGate({
  loading,
  error,
  onRetry,
  children,
}: {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  children: ReactNode;
}) {
  if (loading) return <AdminV3Loading />;
  if (error) return <AdminV3ErrorState message={error} onRetry={onRetry} />;
  return <>{children}</>;
}

export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}

export function useDebouncedValue<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return v;
}
