/**
 * حالة عدم اتصال موحّدة — لا تدّعي حداثة البيانات المخزّنة محليًا.
 */
import type { HTMLAttributes } from "react";
import { Link } from "wouter";
import { SectionTitle } from "@/components/design-system/text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type OfflineStateV2Props = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  /** ما يمكن استخدامه دون شبكة (نص صريح فقط) */
  availableHint?: string;
  retryLabel?: string;
  onRetry?: () => void;
  offlineCenterHref?: string;
  offlineCenterLabel?: string;
};

export function OfflineStateV2({
  title = "أنت غير متصل",
  description = "يمكنك متابعة ما سبق حفظه على الجهاز. قد لا تكون البيانات أحدث نسخة.",
  availableHint,
  retryLabel = "إعادة المحاولة",
  onRetry,
  offlineCenterHref = "/offline",
  offlineCenterLabel = "مركز دون اتصال",
  className,
  ...rest
}: OfflineStateV2Props) {
  return (
    <div
      className={cn("app-state-v2", "app-state-v2--offline", className)}
      role="status"
      data-app-state="offline"
      {...rest}
    >
      <SectionTitle as="h2" className="app-state-v2__title">
        {title}
      </SectionTitle>
      <p className="app-state-v2__body">{description}</p>
      {availableHint ? <p className="app-state-v2__body">{availableHint}</p> : null}
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
        <Link href={offlineCenterHref} className="app-state-v2__btn">
          {offlineCenterLabel}
        </Link>
      </div>
    </div>
  );
}
