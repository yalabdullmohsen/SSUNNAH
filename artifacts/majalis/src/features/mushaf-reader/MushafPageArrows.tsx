import { memo, useCallback, useRef } from "react";
import {
  canGoToNextMushafPage,
  canGoToPreviousMushafPage,
  goToNextMushafPage,
  goToPreviousMushafPage,
  MUSHAF_NAV_LABEL,
} from "@/features/mushaf-reader/mushaf-page-navigation";
import { Button } from "@/components/ui/button";
import { mushafButtonClass } from "@/features/mushaf-reader/mushaf-button-parity";

type Props = {
  page: number;
  /** يظهر مع Reader Chrome فقط */
  visible: boolean;
  /** تفضيل المستخدم لإظهار الأسهم */
  enabled: boolean;
  /**
   * انشغال مؤقت (تسوية/جوار) — لا يخفي السهم؛ يمنع الضغط فقط.
   */
  busy?: boolean;
  /**
   * التزام الصفحة — يستقبل رقم الصفحة المطلق من الخدمة المركزية.
   */
  go: (page: number) => void;
};

/**
 * أسهم تقليب المصحف — دلالة مصحف (ليس RTL عام).
 * التالية على يسار الشاشة (جهة تقليب الورقة)؛ السابقة على اليمين.
 * الحدود: معطّلة ظاهرة لا مخفية.
 */
export const MushafPageArrows = memo(function MushafPageArrows({
  page,
  visible,
  enabled,
  busy = false,
  go,
}: Props) {
  const guardRef = useRef(false);

  const runOnce = useCallback(
    (fn: () => void) => {
      if (guardRef.current || busy) return;
      guardRef.current = true;
      try {
        fn();
      } finally {
        window.setTimeout(() => {
          guardRef.current = false;
        }, 240);
      }
    },
    [busy],
  );

  if (!enabled) return null;

  const atFirst = !canGoToPreviousMushafPage(page);
  const atLast = !canGoToNextMushafPage(page);
  const show = visible;

  return (
    <div
      className="nm-page-arrows"
      data-testid="mushaf-page-arrows"
      data-visible={show ? "1" : "0"}
      data-busy={busy ? "1" : "0"}
      data-page={page}
      aria-hidden={!show}
    >
      {/* مصحف: التالية يسار الشاشة (جهة التقليب) */}
      <Button
        type="button"
        variant="ghost"
        className={mushafButtonClass("nm-page-arrow nm-page-arrow--next")}
        data-testid="mushaf-page-arrow-next"
        aria-label={MUSHAF_NAV_LABEL.next}
        title={MUSHAF_NAV_LABEL.next}
        tabIndex={show && !atLast ? 0 : -1}
        disabled={atLast}
        aria-disabled={busy || !show || atLast ? true : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (atLast || !show || busy) return;
          runOnce(() => {
            goToNextMushafPage(page, go);
          });
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span className="nm-page-arrow__hit" aria-hidden="true" />
        <span className="nm-page-arrow__icon" aria-hidden="true" data-dir="next">
          ‹
        </span>
        <span className="nm-page-arrow__label">{MUSHAF_NAV_LABEL.nextShort}</span>
      </Button>
      {/* مصحف: السابقة يمين الشاشة */}
      <Button
        type="button"
        variant="ghost"
        className={mushafButtonClass("nm-page-arrow nm-page-arrow--prev")}
        data-testid="mushaf-page-arrow-prev"
        aria-label={MUSHAF_NAV_LABEL.previous}
        title={MUSHAF_NAV_LABEL.previous}
        tabIndex={show && !atFirst ? 0 : -1}
        disabled={atFirst}
        aria-disabled={busy || !show || atFirst ? true : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (atFirst || !show || busy) return;
          runOnce(() => {
            goToPreviousMushafPage(page, go);
          });
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span className="nm-page-arrow__hit" aria-hidden="true" />
        <span className="nm-page-arrow__icon" aria-hidden="true" data-dir="prev">
          ›
        </span>
        <span className="nm-page-arrow__label">{MUSHAF_NAV_LABEL.previousShort}</span>
      </Button>
    </div>
  );
});
