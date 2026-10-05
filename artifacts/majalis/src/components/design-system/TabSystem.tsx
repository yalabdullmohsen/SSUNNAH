import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { onTablistKeyDown } from "@/lib/tablist-keyboard";

/**
 * Tab authorities — product façades over Button + a11y tablist.
 * See docs/design/TAB_AUTHORITY_MAP.md
 *
 * Filter / chip exclusive choice → SegmentedFilter (not this module).
 * App chrome bottom tabs → BottomNavBar (navigation authority).
 */

export type ContentTabItem = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

type ContentTabsProps = {
  items: ContentTabItem[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  className?: string;
  /** Prefix for tab / panel ids — `tab-{prefix}-{id}` / panel via aria-controls */
  idPrefix: string;
  /** underline = page content tabs · pill = denser segmented look (still role=tab) */
  variant?: "underline" | "pill";
};

export function ContentTabs({
  items,
  value,
  onChange,
  ariaLabel,
  className,
  idPrefix,
  variant = "underline",
}: ContentTabsProps) {
  return (
    <div
      className={cn("ss-tabs", variant === "pill" && "ss-tabs--pill", className)}
      role="tablist"
      aria-label={ariaLabel}
      data-component="ContentTabs"
    >
      {items.map((item) => {
        const active = value === item.id;
        const tabId = `${idPrefix}-tab-${item.id}`;
        const panelId = `${idPrefix}-panel-${item.id}`;
        return (
          <Button
            key={item.id}
            id={tabId}
            type="button"
            variant="ghost"
            size="small"
            role="tab"
            disabled={item.disabled}
            className={cn("ss-tabs__tab", active && "ss-tabs__tab--active")}
            aria-selected={active}
            aria-controls={panelId}
            tabIndex={active ? 0 : -1}
            data-active={active ? "1" : "0"}
            onClick={() => onChange(item.id)}
            onKeyDown={onTablistKeyDown}
          >
            {item.icon ? <span className="ss-tabs__icon">{item.icon}</span> : null}
            <span className="ss-tabs__label">{item.label}</span>
            {active && variant === "underline" ? (
              <span className="ss-tabs__marker" aria-hidden="true" />
            ) : null}
          </Button>
        );
      })}
    </div>
  );
}

/** Alias semantic — same ContentTabs underline contract. */
export function PageTabs(props: ContentTabsProps) {
  return <ContentTabs {...props} variant={props.variant ?? "underline"} />;
}
