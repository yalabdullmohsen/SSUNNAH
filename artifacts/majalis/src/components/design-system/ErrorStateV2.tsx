import type { HTMLAttributes } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export type ErrorStateV2Props = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  homeHref?: string;
  homeLabel?: string;
};

export function ErrorStateV2({
  title = "تعذّر إكمال الطلب",
  description = "تحقق من الاتصال ثم أعد المحاولة. إن استمر العطل فعد لاحقًا.",
  retryLabel = "إعادة المحاولة",
  onRetry,
  homeHref = "/",
  homeLabel = "الرئيسية",
  className,
  ...rest
}: ErrorStateV2Props) {
  return (
    <div
      className={cn("app-state-v2", "app-state-v2--error", className)}
      role="alert"
      data-app-state="error"
      {...rest}
    >
      <p className="app-state-v2__title">{title}</p>
      <p className="app-state-v2__body">{description}</p>
      <div className="app-state-v2__actions">
        {onRetry ? (
          <button type="button" className="app-state-v2__btn app-state-v2__btn--primary" onClick={onRetry}>
            {retryLabel}
          </button>
        ) : null}
        <Link href={homeHref} className="app-state-v2__btn">
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
