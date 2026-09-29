/**
 * Form field helpers — Interaction PR-6.
 * Thin wrappers over ui/input · ui/label · ui/button + IconButton.
 * No hex or important overrides; touch-friendly via tokens + min-h.
 */
import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/design-system/Buttons";
import { cn } from "@/lib/utils";

export type FormLabelProps = ComponentProps<typeof Label>;

/** Visible field label — wraps ui/Label; keep associated via htmlFor. */
export function FormLabel({ className, ...props }: FormLabelProps) {
  return (
    <Label
      data-ss-form="label"
      className={cn("ss-form-label text-sm font-medium leading-normal text-foreground", className)}
      {...props}
    />
  );
}

/** Alias — تفاعل النماذج يستخدم FieldLabel في العقود. */
export const FieldLabel = FormLabel;

export type FieldDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

/** Supporting hint under a control. */
export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <p
      data-ss-form="description"
      className={cn("ss-field-description text-sm leading-normal text-muted-foreground", className)}
      {...props}
    />
  );
}

export type FieldErrorProps = HTMLAttributes<HTMLParagraphElement>;

/** Field or form error — role=alert; pair id with aria-describedby on the control. */
export function FieldError({ className, children, ...props }: FieldErrorProps) {
  if (children == null || children === false || children === "") return null;
  return (
    <p
      role="alert"
      data-ss-form="error"
      className={cn("ss-field-error text-sm font-normal leading-normal text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export type FormActionsProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

/** Action row slot for primary/secondary buttons (or Links for cancel navigation). */
export function FormActions({ className, children, ...props }: FormActionsProps) {
  return (
    <div
      data-ss-form="actions"
      className={cn("ss-form-actions flex flex-wrap items-center gap-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export type FormPrimaryButtonProps = ComponentProps<typeof Button>;

/** Primary form action helper — defaults type=submit. */
export function FormPrimaryButton({ type = "submit", variant = "primary", ...props }: FormPrimaryButtonProps) {
  return <Button type={type} variant={variant} data-ss-form="primary" {...props} />;
}

export type FormSecondaryButtonProps = ComponentProps<typeof Button>;

/** Secondary form action helper — defaults type=button. */
export function FormSecondaryButton({
  type = "button",
  variant = "secondary",
  ...props
}: FormSecondaryButtonProps) {
  return <Button type={type} variant={variant} data-ss-form="secondary" {...props} />;
}

export type SearchInputProps = Omit<ComponentProps<typeof Input>, "type"> & {
  onClear?: () => void;
  clearLabel?: string;
};

/** Search control — type=search, ≥16px on mobile, optional clear IconButton. */
export function SearchInput({
  className,
  value,
  onClear,
  clearLabel = "مسح البحث",
  ...props
}: SearchInputProps) {
  const hasValue = String(value ?? "").length > 0;
  const showClear = Boolean(onClear && hasValue);

  return (
    <div data-ss-form="search" className="ss-search-input relative flex w-full min-h-11 items-center">
      <Input
        type="search"
        value={value}
        className={cn("min-h-11 w-full text-base md:text-sm", showClear && "pe-11", className)}
        {...props}
      />
      {showClear ? (
        <IconButton
          type="button"
          label={clearLabel}
          tone="muted"
          className="absolute end-1 top-1/2 -translate-y-1/2"
          onClick={onClear}
        >
          <X aria-hidden="true" />
        </IconButton>
      ) : null}
    </div>
  );
}
