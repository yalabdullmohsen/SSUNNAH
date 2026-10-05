import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Options = {
  /** العنصر الذي يستقبل التركيز عند الفتح (الافتراضي: أول عنصر قابل للتركيز) */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** حوار modal: يحبس Tab داخل الحاوية */
  trapFocus?: boolean;
  /** يستقبل التركيز بعد الإغلاق إن أُزيل المُشغِّل الأصلي من DOM (أو أول عنصر قابل للتركيز داخله) */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * سلوك لوحة المفاتيح لحوارات التأكيد المضمّنة (role="alertdialog"):
 * تركيز أولي داخل الحوار · Escape يغلق · حبس Tab للـmodal · إعادة التركيز للمُشغِّل عند الإغلاق.
 */
export function useDialogKeyboard(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  { initialFocusRef, trapFocus = false, returnFocusRef }: Options = {},
): void {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    // المُشغِّل قد يكون أُزيل في نفس الإيداع (فيصير التركيز على body) → نعتمد returnFocusRef حينها
    const active = document.activeElement;
    const opener = active instanceof HTMLElement && active !== document.body ? active : null;
    const raf = window.requestAnimationFrame(() => {
      const container = containerRef.current;
      const target =
        initialFocusRef?.current ?? container?.querySelector<HTMLElement>(FOCUSABLE) ?? null;
      target?.focus({ preventScroll: true });
    });

    const onKey = (e: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (!trapFocus || e.key !== "Tab") return;
      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !container.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !container.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);

    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey, true);
      const fallback = returnFocusRef?.current;
      const back =
        opener && opener.isConnected
          ? opener
          : fallback && !fallback.matches(FOCUSABLE)
            ? fallback.querySelector<HTMLElement>(FOCUSABLE)
            : fallback;
      back?.focus({ preventScroll: true });
    };
  }, [open, containerRef, initialFocusRef, trapFocus, returnFocusRef]);
}
