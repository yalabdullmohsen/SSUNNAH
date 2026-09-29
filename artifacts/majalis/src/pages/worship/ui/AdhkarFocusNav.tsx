import type { CSSProperties } from "react";

import { Button } from "@/components/ui/button";
/**
 * شريط تنقّل الأذكار الموحّد — ارتفاع/موضع ثابت عبر CSS (.adhkar-focus-controls).
 */
type Props = {
  onPrev: () => void;
  onNext: () => void;
  onDetails: () => void;
  onResetProgress: () => void;
  canPrev: boolean;
  canNext: boolean;
  progressIndex: number;
  progressTotal: number;
};

export function AdhkarFocusNav({
  onPrev,
  onNext,
  onDetails,
  onResetProgress,
  canPrev,
  canNext,
  progressIndex,
  progressTotal,
}: Props) {
  const pct = progressTotal > 0 ? ((progressIndex + 1) / progressTotal) * 100 : 0;
  return (
    <div className="adhkar-focus-controls" data-adhkar-controls="1">
      <div className="adhkar-focus-nav" role="group" aria-label="تنقل الأذكار">
        <Button
          type="button"
          className="adhkar-focus-btn adhkar-focus-btn--prev"
          onClick={onPrev}
          disabled={!canPrev}
          aria-label="الذكر السابق" variant="secondary">
          ← السابق
        </Button>
        <Button
          type="button"
          className="adhkar-focus-btn adhkar-focus-btn--details"
          onClick={onDetails}
          aria-label="عرض تفاصيل الذكر" variant="secondary">
          التفاصيل
        </Button>
        <Button
          type="button"
          className="adhkar-focus-btn adhkar-focus-btn--next"
          onClick={onNext}
          disabled={!canNext}
          aria-label="الذكر التالي"
          data-adhkar-next="1" variant="secondary">
          التالي →
        </Button>
      </div>

      <div className="adhkar-focus-nav adhkar-focus-nav--reset">
        <Button
          type="button"
          className="adhkar-focus-btn adhkar-focus-btn--ghost"
          onClick={onResetProgress} variant="ghost">
          إعادة ضبط التقدّم
        </Button>
      </div>

      <div
        className="adhkar-focus-progress"
        role="progressbar"
        aria-valuenow={progressIndex + 1}
        aria-valuemax={progressTotal}
      >
        <div
          className="adhkar-focus-progress-fill adhkar-prog-fill"
          style={{ "--adhkar-pct": `${pct}%` } as CSSProperties}
        />
      </div>
    </div>
  );
}
