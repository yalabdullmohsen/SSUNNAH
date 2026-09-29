import type { HTMLAttributes } from "react";
import { Link } from "wouter";
import { SectionTitle } from "@/components/design-system/text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ErrorStateV2Props = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  homeHref?: string;
  homeLabel?: string;
  /** معرّف تشغيلي قابل للنسخ — لا تفاصيل مزوّد خام */
  correlationId?: string;
};

export function ErrorStateV2({
  title = "تعذّر إكمال الطلب",
  description = "تحقق من الاتصال ثم أعد المحاولة. إن استمر العطل فعد لاحقًا.",
  retryLabel = "إعادة المحاولة",
  onRetry,
  homeHref = "/",
  homeLabel = "الرئيسية",
  correlationId,
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
      <SectionTitle as="h2" className="app-state-v2__title">
        {title}
      </SectionTitle>
      <p className="app-state-v2__body">{description}</p>
      {correlationId ? (
        <p className="app-state-v2__meta" dir="ltr">
          ref: {correlationId}
        </p>
      ) : null}
      <div className="app-state-v2__actions">
        {onRetry ? (
          <Button
            type="button"
            variant="primary"
            className="app-state-v2__btn app-state-v2__btn--primary"
            onClick={onRetry}
          >
            {retryLabel}
          </Button>
        ) : null}
        <Link href={homeHref} className="app-state-v2__btn">
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
