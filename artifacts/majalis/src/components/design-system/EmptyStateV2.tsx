/**
 * Empty State V2 — حالة فارغة أنيقة (Visual Redesign V2 expansion).
 * الأنماط عبر html[data-v2-app] + app-shell-v2.css (يُحمَّل كسولًا من App).
 */
import type { HTMLAttributes, ReactNode } from "react";
import { Link } from "wouter";
import { SectionTitle } from "@/components/design-system/text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EmptyStateV2Props = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: string;
  /** خطوة تالية واضحة للمستخدم */
  nextStep?: string;
  /** مسار تنقّل نصي (مثل: الرئيسية ← التاريخ) */
  navPath?: string;
  icon?: ReactNode;
  ctaLabel?: string;
  href?: string;
  onCtaClick?: () => void;
};

export function EmptyStateV2({
  title,
  description,
  nextStep,
  navPath,
  icon,
  ctaLabel,
  href,
  onCtaClick,
  className,
  ...rest
}: EmptyStateV2Props) {
  const cta =
    ctaLabel &&
    (href ? (
      <Link href={href} className="es2__cta">
        {ctaLabel}
      </Link>
    ) : onCtaClick ? (
      <Button type="button" variant="ghost" className="es2__cta" onClick={onCtaClick}>
        {ctaLabel}
      </Button>
    ) : null);

  return (
    <div
      className={cn("empty-state-v2", "es2", className)}
      role="status"
      data-empty-state-v2=""
      {...rest}
    >
      {icon ? (
        <div className="es2__icon" aria-hidden="true">
          {icon}
        </div>
      ) : (
        <div className="es2__icon" aria-hidden="true">
          <span className="es2__mark">س</span>
        </div>
      )}
      <SectionTitle as="h2" className="es2__title">
        {title}
      </SectionTitle>
      {description ? <p className="es2__desc">{description}</p> : null}
      {nextStep ? <p className="es2__next">{nextStep}</p> : null}
      {navPath ? <p className="es2__nav-path">{navPath}</p> : null}
      {cta}
    </div>
  );
}
