import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Canonical product Button (Interaction System).
 * Variants: primary|secondary|outline|ghost|destructive|link
 * Sizes: small|medium|large|icon (aliases: sm|default|lg)
 * Do not add ad-hoc variants without INTERACTION_COMPONENT_AUTHORITY update.
 */
const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-[length:var(--sf-radius-control,var(--radius-button,12px))]",
    "font-ui",
    "text-[length:var(--sf-type-button,0.9375rem)] font-medium leading-none",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--sf-color-quran-gold,var(--ring))_55%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sf-surface-canvas,var(--background))]",
    "disabled:pointer-events-none disabled:cursor-not-allowed",
    "disabled:bg-[color-mix(in_srgb,var(--sf-surface-muted,var(--muted))_85%,transparent)] disabled:text-[var(--sf-color-rich-ink-muted,var(--muted-foreground))] disabled:opacity-100",
    "disabled:border-[color-mix(in_srgb,var(--sf-hairline,var(--border))_80%,transparent)]",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "hover-elevate active-elevate-2",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-brand text-[var(--sf-color-on-emerald,var(--mj-on-brand))] border border-brand",
        /** @deprecated use primary — kept for shadcn/call-site compat */
        default:
          "bg-brand text-[var(--sf-color-on-emerald,var(--mj-on-brand))] border border-brand",
        secondary:
          "border border-hairline bg-surface-2 text-ink",
        outline:
          "border border-hairline bg-surface text-ink shadow-xs active:shadow-none",
        ghost: "border border-transparent text-ink",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm border-destructive-border",
        link: "border border-transparent text-brand underline-offset-4 hover:underline shadow-none hover:shadow-none",
      },
      size: {
        small: "min-h-11 min-h-[44px] px-3 text-xs",
        medium: "min-h-11 min-h-[44px] px-4 py-2",
        large: "min-h-12 min-h-[48px] px-8",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px] p-0",
        /** aliases */
        sm: "min-h-11 min-h-[44px] px-3 text-xs",
        default: "min-h-11 min-h-[44px] px-4 py-2",
        lg: "min-h-12 min-h-[48px] px-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "medium",
    },
  },
);

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link"
  | "default";
type ButtonSize = "small" | "medium" | "large" | "icon" | "sm" | "default" | "lg";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    Omit<VariantProps<typeof buttonVariants>, "variant" | "size"> {
  asChild?: boolean;
  variant?: ButtonVariant | null;
  size?: ButtonSize | null;
  loading?: boolean;
  fullWidth?: boolean;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

function Spinner() {
  return (
    <span
      className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "medium",
      asChild = false,
      loading = false,
      fullWidth = false,
      iconStart,
      iconEnd,
      type = "button",
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = Boolean(disabled || loading);
    const resolvedVariant = variant === "default" ? "primary" : variant;
    const resolvedSize =
      size === "sm" ? "small" : size === "default" ? "medium" : size === "lg" ? "large" : size;

    /* أبناء عناصر متعددة (عنوان + وصف، نص + سهم) يبقون أبناءً مباشرين للزر حتى يعمل
       flex/grid المكتوب في CSS المكوّن؛ تغليفهم بـ<span> سطري كان يلصقهم («التفسيرمعاني…»)
       ويسحق السهم المرسوم بالحدود إلى خط عمودي. النص المختلط يبقى مغلّفًا كما كان. */
    const kids = React.Children.toArray(children);
    const elementChildren = kids.length > 1 && kids.every((k) => React.isValidElement(k));
    const content = (
      <>
        {loading ? <Spinner /> : iconStart ? <span className="inline-flex shrink-0">{iconStart}</span> : null}
        {children != null && children !== false ? (
          elementChildren ? (
            children
          ) : (
            <span className={cn(loading && "opacity-90")}>{children}</span>
          )
        ) : null}
        {!loading && iconEnd ? <span className="inline-flex shrink-0">{iconEnd}</span> : null}
      </>
    );

    return (
      <Comp
        className={cn(
          buttonVariants({
            variant: resolvedVariant as "primary",
            size: resolvedSize as "medium",
          }),
          fullWidth && "w-full",
          loading && "cursor-wait",
          className,
        )}
        ref={ref}
        type={asChild ? undefined : type}
        disabled={asChild ? undefined : isDisabled}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        data-ss-button="1"
        data-variant={resolvedVariant || "primary"}
        data-size={resolvedSize || "medium"}
        data-loading={loading ? "1" : undefined}
        {...props}
      >
        {/* Slot يدمج الخصائص في ابنه الوحيد — تمرير Fragment كان يُسقط className/data-* عن الرابط */}
        {asChild ? children : content}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
