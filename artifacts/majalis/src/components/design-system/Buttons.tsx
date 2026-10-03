import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { ActionButton, type ActionButtonProps } from "./ActionButton";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

/** زر أساسي — يمر عبر ActionButton → Button الرسمي. */
export function PrimaryButton(props: ActionButtonProps) {
  return <ActionButton {...props} variant="primary" />;
}

/** زر ثانوي — سطح + حد. */
export function SecondaryButton(props: ActionButtonProps) {
  return <ActionButton {...props} variant="secondary" />;
}

/** مظهر رابط لأفعال داخل الصفحة — ليس تنقّلًا (التنقّل = Link/Wouter). */
export function LinkButton({
  variant: _v,
  ...props
}: Omit<ButtonProps, "variant"> & { variant?: never }) {
  return <Button {...props} variant="link" />;
}

/** حالة ثنائية مضغوطة — واجهة رقيقة فوق Toggle الرسمي. */
export function ToggleButton(props: ComponentProps<typeof Toggle>) {
  return <Toggle {...props} />;
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
  tone?: "brand" | "muted" | "gold";
  loading?: boolean;
};

/** زر أيقونة — يتطلب `label` لاسم وصول؛ يمر عبر Button size=icon. */
export function IconButton({
  label,
  children,
  tone = "brand",
  className,
  type = "button",
  loading = false,
  ...rest
}: IconButtonProps) {
  return (
    <Button
      type={type}
      variant="ghost"
      size="icon"
      loading={loading}
      aria-label={label}
      title={label}
      className={cn(
        "ss-icon-btn mj-pressable",
        tone === "muted" && "ss-icon-btn--muted",
        tone === "gold" && "ss-icon-btn--gold",
        className,
      )}
      data-icon-button="1"
      {...rest}
    >
      {children}
    </Button>
  );
}
