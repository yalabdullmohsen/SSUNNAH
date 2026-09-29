/**
 * Surface primitives — طبقة رفيعة فوق AppCard (سلطة البطاقات).
 * لا تضف hex / shadow / radius خامًا هنا؛ اعتمد tokens عبر AppCard.
 */
import type { HTMLAttributes, ReactNode } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { AppCard, type AppCardProps } from "./AppCard";

type SurfaceBase = Omit<AppCardProps, "as"> & {
  children?: ReactNode;
};

/** سطح ثابت غير تفاعلي (محتوى / إعدادات / ملخص). */
export function InsetSurface({ className, children, ...rest }: SurfaceBase) {
  return (
    <AppCard
      as="section"
      tone="muted"
      padding="md"
      data-ss-surface="inset"
      className={cn("ss-surface ss-surface--inset", className)}
      {...rest}
    >
      {children}
    </AppCard>
  );
}

/** سطح مرتفع خفيف للمحتوى البارز (بدون ظل خام جديد). */
export function ElevatedSurface({ className, children, ...rest }: SurfaceBase) {
  return (
    <AppCard
      as="section"
      tone="default"
      padding="md"
      data-ss-surface="elevated"
      className={cn("ss-surface ss-surface--elevated", className)}
      {...rest}
    >
      {children}
    </AppCard>
  );
}

export type StatusCardProps = SurfaceBase & {
  tone?: "default" | "accent" | "muted";
  role?: "status" | "alert" | "note";
};

/** بطاقة حالة (نجاح / تحذير / معلومات) — ليست للتنقل. */
export function StatusCard({
  className,
  children,
  tone = "muted",
  role = "status",
  ...rest
}: StatusCardProps) {
  return (
    <AppCard
      as="aside"
      tone={tone}
      padding="md"
      role={role}
      data-ss-surface="status"
      data-cs2-card="1"
      data-cs2-type="summary"
      className={cn("ss-surface ss-surface--status", className)}
      {...rest}
    >
      {children}
    </AppCard>
  );
}

export type InteractiveCardProps = HTMLAttributes<HTMLElement> & {
  href?: string;
  title?: string;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  onNavigate?: () => void;
};

/**
 * بطاقة تفاعلية واحدة — إما Link للتنقل أو سطح ثابت.
 * ممنوع تضمين أزرار تفاعلية متداخلة بدون فصل دلالي.
 */
export function InteractiveCard({
  href,
  title,
  disabled,
  className,
  children,
  onNavigate,
  ...rest
}: InteractiveCardProps) {
  const surface = (
    <AppCard
      as="div"
      padding="md"
      data-ss-surface="interactive"
      data-cs2-card="1"
      data-cs2-type={href ? "navigation" : "content"}
      className={cn(
        "ss-surface ss-surface--interactive",
        href && !disabled && "ss-surface--pressable",
        disabled && "ss-surface--disabled",
        className,
      )}
      aria-disabled={disabled || undefined}
      {...(href ? {} : rest)}
    >
      {children}
    </AppCard>
  );

  if (!href || disabled) return surface;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="ss-surface__anchor mj-pressable"
      aria-label={title}
      {...(rest as HTMLAttributes<HTMLAnchorElement>)}
    >
      {surface}
    </Link>
  );
}
