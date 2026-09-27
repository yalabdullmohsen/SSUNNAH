import type { HTMLAttributes } from "react";
import { STATUS } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";

export type LoadingStateV2Props = HTMLAttributes<HTMLDivElement> & {
  /** عنوان اختياري ظاهر — الافتراضي هيكل صامت مع تسمية وصول */
  title?: string;
  description?: string;
  /** هيكل عظمي بدل مؤشر دوران كامل الشاشة */
  skeletonLines?: number;
};

export function LoadingStateV2({
  title,
  description,
  skeletonLines = 2,
  className,
  ...rest
}: LoadingStateV2Props) {
  const lines = Math.max(1, Math.min(4, skeletonLines));
  return (
    <div
      className={cn("app-state-v2", "app-state-v2--loading", className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={title ?? STATUS.contentLoading}
      data-app-state="loading"
      {...rest}
    >
      {title ? <p className="app-state-v2__title">{title}</p> : null}
      {description ? <p className="app-state-v2__body">{description}</p> : null}
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="app-state-v2__skeleton" aria-hidden="true" />
      ))}
    </div>
  );
}
