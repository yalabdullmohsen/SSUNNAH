/**
 * مؤشر بيانات مخزّنة قديمة — المحتوى يبقى ظاهرًا؛ لا يستبدل الصفحة.
 */
import type { HTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StaleDataIndicatorProps = HTMLAttributes<HTMLDivElement> & {
  message?: string;
  refreshLabel?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export function StaleDataIndicator({
  message = "تُعرض نسخة محفوظة؛ جارٍ التحقق من التحديثات.",
  refreshLabel = "تحديث",
  onRefresh,
  refreshing = false,
  className,
  ...rest
}: StaleDataIndicatorProps) {
  return (
    <div
      className={cn("app-state-v2", "app-state-v2--stale", "ss-state-card", className)}
      role="status"
      aria-live="polite"
      data-app-state="stale"
      {...rest}
    >
      <p className="app-state-v2__body">{message}</p>
      {onRefresh ? (
        <Button
          type="button"
          variant="ghost"
          size="small"
          className="app-state-v2__btn"
          loading={refreshing}
          onClick={onRefresh}
        >
          {refreshLabel}
        </Button>
      ) : null}
    </div>
  );
}
