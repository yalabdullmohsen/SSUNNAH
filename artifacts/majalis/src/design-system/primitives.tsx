import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { Link } from "wouter";
import { Icon, type DsIconName } from "./Icon";
import { cn } from "@/lib/utils";
import { S } from "@/design-system/strings";
import { hapticTap } from "@/lib/capacitor-utils";

/** الأنواع الأربعة: primary · secondary · tertiary(نصي) · الأيقونة = IconButton. destructive/on-hero حالات خاصة. */
type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive" | "on-hero";
type ButtonSize = "l" | "m" | "s";

type CommonButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  icon?: DsIconName;
  children: ReactNode;
  className?: string;
};

function btnClass({ variant = "primary", size = "m", block, loading, className }: CommonButtonProps) {
  return cn("sn-btn sn-pressable", `sn-btn--${variant.replace("hero", "spot")}`, `sn-btn--${size}`, block && "sn-btn--block", loading && "sn-btn--loading", className);
}

/** زر — ارتفاع ثابت 48، نص بسطر واحد يُختصر بـ…، اهتزاز خفيف عند الضغط. */
export function Button({ variant, size, block, loading, icon, children, className, disabled, onClick, ...rest }: CommonButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...rest} onClick={(e) => { void hapticTap("light"); onClick?.(e); }} disabled={disabled || loading} aria-busy={loading || undefined} className={btnClass({ variant, size, block, loading, className, children })}>
      {icon ? <Icon name={icon} size={20} /> : null}
      {children}
    </button>
  );
}

/** رابط بشكل زر. */
export function ButtonLink({ href, variant, size, block, icon, children, className }: CommonButtonProps & { href: string }) {
  return (
    <Link href={href} className={btnClass({ variant, size, block, className, children })}>
      {icon ? <Icon name={icon} size={20} /> : null}
      {children}
    </Link>
  );
}

type IconButtonProps = {
  icon: DsIconName;
  /** إلزامي — تسمية VoiceOver */
  label: string;
  tone?: "plain" | "filled" | "tinted" | "on-hero";
  size?: 20 | 24;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label">;

export function IconButton({ icon, label, tone = "plain", size = 24, className, ...rest }: IconButtonProps) {
  return (
    <button type="button" aria-label={label} {...rest} className={cn("sn-icon-btn sn-pressable", tone !== "plain" && `sn-icon-btn--${tone.replace("hero", "spot")}`, className)}>
      <Icon name={icon} size={size} />
    </button>
  );
}

export function IconLink({ icon, label, href, tone = "plain", size = 24, className }: { icon: DsIconName; label: string; href: string; tone?: IconButtonProps["tone"]; size?: 20 | 24; className?: string }) {
  return (
    <Link href={href} aria-label={label} className={cn("sn-icon-btn sn-pressable", tone !== "plain" && `sn-icon-btn--${tone.replace("hero", "spot")}`, className)}>
      <Icon name={icon} size={size} />
    </Link>
  );
}

type CardProps = { variant?: "standard" | "featured" | "hero"; flush?: boolean; className?: string; children: ReactNode } & Omit<HTMLAttributes<HTMLElement>, "children">;

export function Card({ variant = "standard", flush, className, children, ...rest }: CardProps) {
  return (
    <section {...rest} className={cn("sn-card", variant !== "standard" && `sn-card--${variant.replace("hero", "spot")}`, flush && "sn-card--flush", className)}>
      {children}
    </section>
  );
}

export function LinkCard({ href, variant = "standard", className, children }: { href: string; variant?: CardProps["variant"]; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={cn("sn-card sn-pressable", variant !== "standard" && `sn-card--${variant.replace("hero", "spot")}`, className)}>
      {children}
    </Link>
  );
}

export function Badge({ tone = "default", children, className }: { tone?: "default" | "accent" | "success" | "warning" | "danger" | "on-hero"; children: ReactNode; className?: string }) {
  return <span className={cn("sn-badge", tone !== "default" && `sn-badge--${tone.replace("hero", "spot")}`, className)}>{children}</span>;
}

type ChipProps = { selected?: boolean; children: ReactNode; className?: string } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;
export function Chip({ selected, children, className, ...rest }: ChipProps) {
  return (
    <button type="button" aria-pressed={selected} {...rest} className={cn("sn-chip sn-pressable", className)}>
      {children}
    </button>
  );
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: ReadonlyArray<{ value: T; label: string }>; label: string }) {
  return (
    <div className="sn-segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} className="sn-segmented__item" onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ProgressBar({ value, label, onHero, className }: { value: number; label: string; onHero?: boolean; className?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("sn-progress", onHero && "sn-progress--on-spot", className)} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <div className="sn-progress__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** حلقة تقدّم: هندسة SVG في إحداثيات 0–100؛ الحجم من CSS (md/lg). */
export function ProgressRing({ value, label, size = "md", children }: { value: number; label: string; size?: "md" | "lg"; children?: ReactNode }) {
  const pct = Math.max(0, Math.min(100, value));
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <span className={cn("sn-ring", `sn-ring--${size}`)} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="sn-ring__track" cx="50" cy="50" r={r} fill="none" strokeWidth="8" />
        <circle className="sn-ring__fill" cx="50" cy="50" r={r} fill="none" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 50 50)" />
      </svg>
      {children ? <span className="sn-ring__label">{children}</span> : null}
    </span>
  );
}

export function Skeleton({ shape = "line", width, className }: { shape?: "title" | "line" | "block"; width?: "full" | "half" | "third" | "two-thirds"; className?: string }) {
  return <span className={cn("sn-skeleton", `sn-skeleton--${shape}`, width && width !== "full" && `sn-skeleton--${width.replace(/-/g, "")}`, className)} aria-hidden="true" />;
}

export function SkeletonCard() {
  return (
    <div className="sn-card sn-stack" aria-hidden="true">
      <Skeleton shape="title" width="third" />
      <Skeleton />
      <Skeleton width="two-thirds" />
    </div>
  );
}

export function EmptyState({ icon = "info", title, description, action }: { icon?: DsIconName; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="sn-state" role="status">
      <span className="sn-state__icon"><Icon name={icon} size={24} /></span>
      <h2 className="sn-state__title">{title}</h2>
      {description ? <p className="sn-state__desc">{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({ title = S.primitives_01, description = S.primitives_02, onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  return (
    <div className="sn-state sn-state--error" role="alert">
      <span className="sn-state__icon"><Icon name="warning" size={24} /></span>
      <h2 className="sn-state__title">{title}</h2>
      <p className="sn-state__desc">{description}</p>
      {onRetry ? <Button variant="secondary" icon="refresh" onClick={onRetry}>{S.primitives_03}</Button> : null}
    </div>
  );
}

/** حقل نصّي: تسمية ظاهرة + إدخال بحدّ لمس 44 + رسالة خطأ مرتبطة بـ aria-describedby. */
export function TextField({ label, id, error, className, ...input }: { label: string; id: string; error?: string; className?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, "id">) {
  return (
    <div className={cn("sn-field", className)}>
      <label htmlFor={id} className="sn-field__label">{label}</label>
      <input id={id} className="sn-field__input" aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} {...input} />
      {error ? <p id={`${id}-error`} className="sn-field__error" role="alert">{error}</p> : null}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "success" | "danger"; children: ReactNode }) {
  return <p className={cn("sn-notice", `sn-notice--${tone}`)} role={tone === "danger" ? "alert" : "status"}>{children}</p>;
}
