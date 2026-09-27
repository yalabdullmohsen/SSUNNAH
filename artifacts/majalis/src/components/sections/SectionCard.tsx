import { memo } from "react";
import { useLocation } from "wouter";
import { isSectionComingSoon, type SectionDef } from "@/config/sections.registry";
import { COMING_SOON_LABEL } from "@/lib/ui-copy";
import { prefetchRoute } from "@/lib/prefetch-route";
import { cn } from "@/lib/utils";

type Props = {
  section: SectionDef;
  className?: string;
  onNavigate?: () => void;
};

function go(href: string, setLocation: (h: string) => void) {
  const [path, hash] = href.split("#");
  if (path) setLocation(path);
  window.scrollTo(0, 0);
  if (hash) {
    window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "auto", block: "nearest" });
    }, 40);
  }
}

/**
 * بطاقة متوسطة محايدة (شبكة عمودين) — بلا تدرّج أخضر.
 */
export const SectionCard = memo(function SectionCard({ section, className, onNavigate }: Props) {
  const [, setLocation] = useLocation();
  const Icon = section.icon;
  const subtitle = section.subtitle?.trim();
  const soon = isSectionComingSoon(section);
  const aria = soon
    ? `${section.label} — ${COMING_SOON_LABEL}`
    : subtitle
      ? `${section.label} — ${subtitle}`
      : section.label;

  return (
    <button
      type="button"
      dir="rtl"
      data-section-card="1"
      data-section-id={section.id}
      data-coming-soon={soon ? "1" : undefined}
      aria-label={aria}
      data-cs-card="1"
      data-cs-type="section"
      className={cn(
        "card cs-card cs-section soft-card soft-card--on-light",
        soon && "card--coming-soon",
        className,
      )}
      onPointerDown={() => prefetchRoute(section.route)}
      onClick={() => {
        go(section.route, setLocation);
        onNavigate?.();
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
    </button>
  );
});
