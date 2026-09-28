import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Common = {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "gold" | "outline";
  size?: "md" | "sm" | "lg";
  className?: string;
  children: ReactNode;
  loading?: boolean;
};

type AsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type AsLink = Common & {
  href: string;
  type?: never;
  disabled?: boolean;
};

export type ActionButtonProps = AsButton | AsLink;

const LEGACY_CLASS: Record<NonNullable<Common["variant"]>, string> = {
  primary: "ss-action-btn--primary",
  secondary: "ss-action-btn--secondary",
  ghost: "ss-action-btn--ghost",
  destructive: "ss-action-btn--destructive",
  outline: "ss-action-btn--secondary",
  gold: "ss-action-btn--secondary",
};

function toButtonVariant(variant: NonNullable<Common["variant"]>): "primary" | "secondary" | "outline" | "ghost" | "destructive" {
  if (variant === "gold") return "secondary";
  if (variant === "primary") return "primary";
  if (variant === "secondary") return "secondary";
  if (variant === "outline") return "outline";
  if (variant === "ghost") return "ghost";
  return "destructive";
}

function toButtonSize(size: NonNullable<Common["size"]>): "small" | "medium" | "large" {
  if (size === "sm") return "small";
  if (size === "lg") return "large";
  return "medium";
}

/**
 * Product action façade — buttons delegate to canonical `Button`;
 * `href` keeps Wouter `Link` (never use Button for navigation).
 */
export function ActionButton(props: ActionButtonProps) {
  const { variant = "primary", size = "md", className, children, loading = false } = props;
  const legacy = cn(
    "ss-action-btn mj-pressable",
    LEGACY_CLASS[variant],
    size === "sm" && "ss-action-btn--sm",
    size === "lg" && "ss-action-btn--lg",
    loading && "is-loading",
    className,
  );

  if ("href" in props && props.href) {
    const { href, disabled } = props;
    if (disabled) {
      return (
        <span className={cn(legacy, "is-disabled")} aria-disabled="true">
          {children}
        </span>
      );
    }
    return (
      <Link href={href} className={legacy} data-action-button="1">
        {children}
      </Link>
    );
  }

  const buttonProps = props as AsButton;
  const {
    type = "button",
    disabled,
    loading: _busy,
    variant: _v,
    size: _s,
    className: _c,
    children: _ch,
    href: _h,
    ...rest
  } = buttonProps;
  return (
    <Button
      type={type}
      variant={toButtonVariant(variant)}
      size={toButtonSize(size)}
      loading={loading}
      disabled={disabled}
      className={legacy}
      data-action-button="1"
      {...rest}
    >
      {children}
    </Button>
  );
}
