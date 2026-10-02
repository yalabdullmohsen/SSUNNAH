import { InteractiveCard } from "@/components/design-system/SurfacePrimitives";
import type { SectionDef } from "@/config/sections.registry";
import { prefetchRoute } from "@/lib/prefetch-route";
import { cn } from "@/lib/utils";

type Props = {
  section: SectionDef;
  className?: string;
  onNavigate?: () => void;
  /** تجاوز المسار (مثل المصحف بآخر موضع) */
  resolveRoute?: (section: SectionDef) => string;
};

/**
 * مربع مميّز — الخلفية الخضراء عبر `.card--featured` فوق InteractiveCard.
 */
export function HeroActionCard({ section, className, onNavigate, resolveRoute }: Props) {
  const Icon = section.icon;
  const subtitle = section.subtitle?.trim();
  const aria = subtitle ? `${section.label} — ${subtitle}` : section.label;
  const href = resolveRoute?.(section) ?? section.route;

  return (
    <InteractiveCard
      href={href}
      title={aria}
      aria-label={aria}
      dir="rtl"
      data-section-card="featured"
      data-hero-action="1"
      data-section-id={section.id}
      className={cn("card--featured hero-action-card", className)}
      onNavigate={onNavigate}
      onPointerDown={() => prefetchRoute(href)}
    >
      <span className="card__icon" aria-hidden>
        <Icon strokeWidth={1.75} aria-hidden />
      </span>
      <span className="card__label">{section.label}</span>
      {subtitle ? <span className="card__subtitle">{subtitle}</span> : null}
    </InteractiveCard>
  );
}

/** اسم سابق — نفس مكوّن البطاقة البطلة الموسّطة */
export const FeaturedSectionCard = HeroActionCard;
