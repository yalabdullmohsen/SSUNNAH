import { memo } from "react";
import { Button } from "@/components/ui/button";
import { mushafButtonClass } from "@/features/mushaf-reader/mushaf-button-parity";

type Props = {
  onExit: () => void;
  /** يظهر فقط مع Reader Chrome — لا يحجز Geometry */
  visible?: boolean;
  label?: string;
};

/**
 * زر خروج داخل ReaderControlsOverlay فقط.
 * mount مرة واحدة؛ الظهور عبر opacity/visibility بلا تأثير على نص المصحف.
 */
export const MushafExitControl = memo(function MushafExitControl({
  onExit,
  visible = false,
  label = "الخروج من المصحف",
}: Props) {
  return (
    <div
      className="nm-reader-controls-overlay"
      data-testid="reader-controls-overlay"
      data-visible={visible ? "1" : "0"}
      aria-hidden={!visible}
    >
      <Button
        type="button"
        variant="ghost"
        className={mushafButtonClass("nm-exit-control")}
        data-testid="mushaf-exit-control"
        data-visible={visible ? "1" : "0"}
        tabIndex={visible ? 0 : -1}
        aria-label={label}
        aria-hidden={!visible}
        onClick={(e) => {
          e.stopPropagation();
          if (!visible) return;
          onExit();
        }}
      >
        <span className="nm-exit-control__chevron" aria-hidden="true">
          ›
        </span>
        <span className="nm-exit-control__label">{label}</span>
      </Button>
    </div>
  );
});
