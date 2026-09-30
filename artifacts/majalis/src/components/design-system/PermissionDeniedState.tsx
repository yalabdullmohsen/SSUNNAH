/**
 * 401/403 — بدون تفاصيل داخلية أو كشف سطح الإدارة.
 */
import type { HTMLAttributes } from "react";
import { Link } from "wouter";
import { SectionTitle } from "@/components/design-system/text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PermissionDeniedStateProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  loginHref?: string;
  loginLabel?: string;
  homeHref?: string;
  homeLabel?: string;
  onLoginClick?: () => void;
};

export function PermissionDeniedState({
  title = "غير مصرّح بالوصول",
  description = "سجّل الدخول إن كان لديك حساب، أو عد إلى الصفحة الرئيسية.",
  loginHref = "/login",
  loginLabel = "تسجيل الدخول",
  homeHref = "/",
  homeLabel = "الرئيسية",
  onLoginClick,
  className,
  ...rest
}: PermissionDeniedStateProps) {
  return (
    <div
      className={cn("app-state-v2", "app-state-v2--error", className)}
      role="alert"
      data-app-state="permission-denied"
      {...rest}
    >
      <SectionTitle as="h2" className="app-state-v2__title">
        {title}
      </SectionTitle>
      <p className="app-state-v2__body">{description}</p>
      <div className="app-state-v2__actions">
        {onLoginClick ? (
          <Button type="button" variant="primary" className="app-state-v2__btn app-state-v2__btn--primary" onClick={onLoginClick}>
            {loginLabel}
          </Button>
        ) : (
          <Link href={loginHref} className="app-state-v2__btn app-state-v2__btn--primary">
            {loginLabel}
          </Link>
        )}
        <Link href={homeHref} className="app-state-v2__btn">
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
