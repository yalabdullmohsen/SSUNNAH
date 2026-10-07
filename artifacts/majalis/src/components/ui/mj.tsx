/** @deprecated نظام قديم — استعمل `@/design-system` (مكوّنات sn-). لا استيراد جديد: بوابة scripts/ui-ratchet.mjs تفشل عند زيادة العدد. */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PageHero } from "./PageHero";
import { AppCard } from "@/components/design-system/AppCard";
import { SearchInput } from "@/components/design-system/FormFields";
import { Button as CanonicalButton } from "@/components/ui/button";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <PageHero
      eyebrow={eyebrow}
      title={title}
      description={subtitle}
      withPattern
      className={cn("mj-page-head", className)}
    />
  );
}

export function Card({
  children,
  className,
  link,
  raised,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  link?: boolean;
  raised?: boolean;
  onClick?: () => void;
}) {
  return (
    <AppCard
      as="div"
      padding="md"
      className={cn("mj-card", link && "mj-card--link", raised && "mj-card--raised", className)}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </AppCard>
  );
}

/* ListRow removed (Wave 2 / PR E) — DEAD_WITH_PROOF:
   zero TSX consumers outside definition+re-export; use NavigationList / SettingsList / ContentRow. */

export function Button({
  children,
  variant = "primary",
  pill,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "soft";
  pill?: boolean;
}) {
  const mapped =
    variant === "ghost" ? "ghost" : variant === "soft" ? "secondary" : "primary";
  return (
    <CanonicalButton
      type="button"
      variant={mapped}
      className={cn(
        "mj-btn",
        variant === "ghost" && "mj-btn--ghost",
        variant === "soft" && "mj-btn--soft",
        pill && "mj-btn--pill",
        className,
      )}
      {...props}
    >
      {children}
    </CanonicalButton>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "accent";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "mj-badge",
        tone === "brand" && "mj-badge--brand",
        tone === "accent" && "mj-badge--accent",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("mj-progress", className)} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

export function SearchField({
  className,
  onKeyDown,
  onClear,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { onClear?: () => void }) {
  /* Compat façade → SearchInput (SEARCH authority). Keeps mj-search class for CSS. */
  return (
    <SearchInput
      enterKeyHint="search"
      inputMode="search"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      className={cn("mj-search", className)}
      onClear={onClear}
      {...props}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === "Enter" && !e.defaultPrevented) {
          (e.currentTarget as HTMLInputElement).blur();
        }
      }}
    />
  );
}

export function EmptyState({
  title,
  description,
  className,
  actionHref,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  className?: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className={cn("mj-empty", className)} role="status">
      <div className="mj-dot" aria-hidden="true" />
      <b>{title}</b>
      {description ? <span>{description}</span> : null}
      {actionHref && actionLabel ? (
        <a href={actionHref} className="mj-empty__action mj-pressable">
          {actionLabel}
        </a>
      ) : null}
      {!actionHref && actionLabel && onAction ? (
        <CanonicalButton type="button" variant="ghost" className="mj-empty__action mj-pressable" onClick={onAction}>
          {actionLabel}
        </CanonicalButton>
      ) : null}
    </div>
  );
}
