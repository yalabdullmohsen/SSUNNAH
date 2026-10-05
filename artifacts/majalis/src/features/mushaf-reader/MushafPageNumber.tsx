/**
 * MushafPageNumber — رقم الصفحة الوحيد لكل الصفحات ١…٦٠٤.
 * القيمة من pageNumber فقط — بلا أرقام مكتوبة يدويًا.
 * لا يمسّ نص القرآن ولا Page Mapping.
 */
import { toArabicPageDigits } from "@/lib/numerals";
import { Button } from "@/components/ui/button";
import { mushafButtonClass } from "@/features/mushaf-reader/mushaf-button-parity";

type Props = {
  pageNumber: number;
  onPress?: () => void;
  className?: string;
};

export function MushafPageNumber({ pageNumber, onPress, className = "" }: Props) {
  const label = toArabicPageDigits(pageNumber);
  return (
    <Button
      type="button"
      variant="ghost"
      className={mushafButtonClass("nm-page__footer-num", className)}
      data-component="MushafPageNumber"
      data-testid="mushaf-page-number"
      data-page-number={pageNumber}
      disabled={!onPress}
      aria-label={onPress ? `الصفحة ${pageNumber} — انتقال إلى صفحة` : `الصفحة ${pageNumber}`}
      onClick={(e) => {
        e.stopPropagation();
        onPress?.();
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {label}
    </Button>
  );
}
