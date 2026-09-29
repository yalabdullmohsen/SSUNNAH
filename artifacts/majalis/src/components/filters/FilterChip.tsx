import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import "@/styles/sunnah-identity-forms-filters.css";

export type FilterChipProps = {
  label: ReactNode;
  active?: boolean;
  disabled?: boolean;
  soon?: boolean;
  onClick?: () => void;
  className?: string;
  "aria-label"?: string;
};

/** شريحة فلتر موحّدة — هدف لمس ≥44px، حالة نشطة واضحة. */
export function FilterChip({
  label,
  active = false,
  disabled = false,
  soon = false,
  onClick,
  className,
  "aria-label": ariaLabel,
}: FilterChipProps) {
  if (soon) return null;
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="small"
      aria-pressed={active}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn("mj-filter-chip", active && "is-active", className)}
      onClick={onClick}
    >
      <span className="mj-filter-chip__label">{label}</span>
      {active ? <span className="mj-filter-chip__mark" aria-hidden="true">●</span> : null}
    </Button>
  );
}
