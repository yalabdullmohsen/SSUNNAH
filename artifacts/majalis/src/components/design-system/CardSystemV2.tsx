/**
 * Card System V2 — تصنيف المنتج (Wave 1).
 * يبني فوق Card System الحالي دون استبداله.
 */
import type { HTMLAttributes, ReactNode } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { CardTitle } from "./text";

export const CS2_CARD_TYPES = [
  "NavigationCard",
  "ContentCard",
  "ContinueCard",
  "ReferenceCard",
  "EvidenceBlock",
  "WarningBlock",
  "SummaryBlock",
  "ActionCard",
] as const;

export type Cs2CardTypeName = (typeof CS2_CARD_TYPES)[number];

type NavProps = HTMLAttributes<HTMLAnchorElement> & {
  href: string;
  title: string;
  description?: string;
  meta?: string;
  icon?: ReactNode;
};

export function NavigationCardV2({
  href,
  title,
  description,
  meta,
  icon,
  className,
  ...rest
}: NavProps) {
  return (
    <Link
      href={href}
      data-cs2-card="1"
      data-cs2-type="navigation"
      className={cn("cs2-nav", className)}
      {...rest}
    >
      {icon ? (
        <span className="cs2-nav__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <CardTitle className="cs2-nav__title">{title}</CardTitle>
      {description ? <p className="cs2-nav__desc">{description}</p> : null}
      {meta ? <p className="cs2-nav__meta">{meta}</p> : null}
    </Link>
  );
}

type ContentProps = HTMLAttributes<HTMLElement> & {
  href?: string;
  title: string;
  excerpt?: string;
  meta?: string;
  overflow?: ReactNode;
  children?: ReactNode;
};

export function ContentCardV2({
  href,
  title,
  excerpt,
  meta,
  overflow,
  className,
  children,
  ...rest
}: ContentProps) {
  const inner = (
    <>
      <div className="cs2-content__head">
        <CardTitle className="cs2-content__title">{title}</CardTitle>
        {overflow}
      </div>
      {excerpt ? <p className="cs2-content__excerpt">{excerpt}</p> : null}
      {meta ? <p className="cs2-content__meta">{meta}</p> : null}
      {children}
    </>
  );
  if (href) {
    return (
      <Link
        href={href}
        data-cs2-card="1"
        data-cs2-type="content"
        className={cn("cs2-content", className)}
        {...(rest as HTMLAttributes<HTMLAnchorElement>)}
      >
        {inner}
      </Link>
    );
  }
  return (
    <article
      data-cs2-card="1"
      data-cs2-type="content"
      className={cn("cs2-content", className)}
      {...rest}
    >
      {inner}
    </article>
  );
}

type ContinueProps = HTMLAttributes<HTMLElement> & {
  href: string;
  title: string;
  meta?: string;
  progressPct?: number;
  actionLabel?: string;
};

export function ContinueCardV2({
  href,
  title,
  meta,
  progressPct,
  actionLabel = "متابعة",
  className,
  ...rest
}: ContinueProps) {
  const pct = Math.max(0, Math.min(100, progressPct ?? 0));
  return (
    <Link
      href={href}
      data-cs2-card="1"
      data-cs2-type="continue"
      className={cn("cs2-continue", className)}
      {...(rest as HTMLAttributes<HTMLAnchorElement>)}
    >
      <CardTitle className="cs2-continue__title">{title}</CardTitle>
      {meta ? <p className="cs2-continue__meta">{meta}</p> : null}
      {progressPct != null ? (
        <div
          className="cs2-continue__progress"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`التقدم ${pct}%`}
        >
          <span style={{ width: `${pct}%` }} />
        </div>
      ) : null}
      <span className="cs2-continue__action">{actionLabel}</span>
    </Link>
  );
}

type EvidenceProps = HTMLAttributes<HTMLElement> & {
  label: string;
  body: string;
  citation?: string;
};

export function EvidenceBlockV2({ label, body, citation, className, ...rest }: EvidenceProps) {
  return (
    <aside
      data-cs2-card="1"
      data-cs2-type="evidence"
      className={cn("cs2-evidence", className)}
      {...rest}
    >
      <p className="cs2-evidence__label">{label}</p>
      <p className="cs2-evidence__body">{body}</p>
      {citation ? <p className="cs2-evidence__cite">{citation}</p> : null}
    </aside>
  );
}

type WarningProps = HTMLAttributes<HTMLElement> & {
  title: string;
  children?: ReactNode;
};

export function WarningBlockV2({ title, children, className, ...rest }: WarningProps) {
  return (
    <aside
      data-cs2-card="1"
      data-cs2-type="warning"
      className={cn("cs2-warning", className)}
      role="note"
      {...rest}
    >
      <p className="cs2-warning__title">{title}</p>
      {children}
    </aside>
  );
}

type SummaryProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  children: ReactNode;
};

export function SummaryBlockV2({ title, children, className, ...rest }: SummaryProps) {
  return (
    <section
      data-cs2-card="1"
      data-cs2-type="summary"
      className={cn("cs2-summary", className)}
      {...rest}
    >
      {title ? <CardTitle className="cs2-nav__title">{title}</CardTitle> : null}
      {children}
    </section>
  );
}
