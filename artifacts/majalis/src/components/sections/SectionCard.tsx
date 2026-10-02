import { memo } from "react";
import { InteractiveCard } from "@/components/design-system/SurfacePrimitives";
import { isSectionComingSoon, type SectionDef } from "@/config/sections.registry";
import { COMING_SOON_LABEL } from "@/lib/ui-copy";
import { prefetchRoute } from "@/lib/prefetch-route";
import { cn } from "@/lib/utils";

type Props = {
  section: SectionDef;
  className?: string;
  onNavigate?: () => void;
};

/**
 * بطاقة متوسطة محايدة (شبكة عمودين) — سطح عبر InteractiveCard / AppCard.
 */
export const SectionCard = memo(function SectionCard({ section, className, onNavigate }: Props) {
  const Icon = section.icon;
  const subtitle = section.subtitle?.trim();
  const soon = isSectionComingSoon(section);
  const aria = soon
    ? `${section.label} — ${COMING_SOON_LABEL}`
    : subtitle
      ? `${section.label} — ${subtitle}`
      : section.label;

  return (
    <InteractiveCard
      href={soon ? undefined : section.route}
      title={aria}
      aria-label={aria}
      disabled={soon}
      dir="rtl"
      data-section-card="1"
      data-section-id={section.id}
      data-coming-soon={soon ? "1" : undefined}
      data-cs-type="section"
      className={cn("card cs-section", soon && "card--coming-soon", className)}
      onNavigate={onNavigate}
      onPointerDown={() => {
        if (!soon) prefetchRoute(section.route);
      }}
    >
      <span className="card__icon" aria-hidden>
        <Icon strokeWidth={1.75} aria-hidden />
      </span>
      <span className="card__label-row">
        <span className="card__label">{section.label}</span>
        {soon ? (
          <span className="card__soon-badge" aria-hidden="true">
            {COMING_SOON_LABEL}
          </span>
        ) : null}
      </span>
      {subtitle ? <span className="card__subtitle">{subtitle}</span> : null}
    </InteractiveCard>
  );
});
