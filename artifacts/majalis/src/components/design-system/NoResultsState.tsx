/**
 * No Results — فهرس/بيانات موجودة لكن البحث أو التصفية لم تُرجع شيئًا.
 * منفصل عن EmptyStateV2 (لا بيانات أصلًا).
 */
import type { HTMLAttributes, ReactNode } from "react";
import { SectionTitle } from "@/components/design-system/text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NoResultsStateProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  /** الاستعلام أو ملخص الفلتر الظاهر للمستخدم */
  queryHint?: string;
  clearLabel?: string;
  onClear?: () => void;
  icon?: ReactNode;
};

export function NoResultsState({
  title = "لا نتائج مطابقة",
  description = "جرّب كلمات أخرى أو امسح التصفية ثم أعد البحث.",
  queryHint,
  clearLabel = "مسح التصفية",
  onClear,
  icon,
  className,
  ...rest
}: NoResultsStateProps) {
  return (
    <div
      className={cn("empty-state-v2", "es2", "es2--no-results", className)}
      role="status"
      data-empty-state-v2=""
      data-app-state="no-results"
      {...rest}
    >
      {icon ? (
        <div className="es2__icon" aria-hidden="true">
          {icon}
        </div>
      ) : (
        <div className="es2__icon" aria-hidden="true">
          <span className="es2__mark">∅</span>
        </div>
      )}
      <SectionTitle as="h2" className="es2__title">
        {title}
      </SectionTitle>
      {queryHint ? <p className="es2__nav-path">{queryHint}</p> : null}
      {description ? <p className="es2__desc">{description}</p> : null}
      {onClear ? (
        <Button type="button" variant="secondary" className="es2__cta" onClick={onClear}>
          {clearLabel}
        </Button>
      ) : null}
    </div>
  );
}
