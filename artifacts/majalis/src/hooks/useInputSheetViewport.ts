import { useEffect, useRef, type RefObject } from "react";

export const MUSHAF_BOOKMARK_EDITOR_OPEN_ATTR = "data-mushaf-bookmark-editor-open";

/**
 * يربط لوحة إدخال بـ VisualViewport عبر CSS variables على العنصر نفسه فقط
 * (بلا حالة React → لا يعيد تصيير شجرة المصحف عند كل حرف أو resize صغير).
 *
 * المتغيرات:
 * - `--rb-vv-height` ارتفاع المساحة المرئية
 * - `--rb-vv-offset-top` إزاحة visualViewport
 * - `--rb-keyboard-inset` تقريب ارتفاع لوحة المفاتيح
 */
export function useInputSheetViewport(panelRef: RefObject<HTMLElement | null>, active: boolean): void {
  const rafRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const panel = panelRef.current;
    if (!panel || typeof window === "undefined") return;

    const apply = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const el = panelRef.current;
        if (!el) return;
        const vv = window.visualViewport;
        const height = Math.max(120, Math.round(vv?.height ?? window.innerHeight));
        const offsetTop = Math.max(0, Math.round(vv?.offsetTop ?? 0));
        const keyboardInset = Math.max(
          0,
          Math.round(window.innerHeight - (vv?.height ?? window.innerHeight) - (vv?.offsetTop ?? 0)),
        );
        el.style.setProperty("--rb-vv-height", `${height}px`);
        el.style.setProperty("--rb-vv-offset-top", `${offsetTop}px`);
        el.style.setProperty("--rb-keyboard-inset", `${keyboardInset}px`);
      });
    };

    apply();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", apply);
    vv?.addEventListener("scroll", apply);
    window.addEventListener("resize", apply);
    return () => {
      cancelAnimationFrame(rafRef.current);
      vv?.removeEventListener("resize", apply);
      vv?.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
      panel.style.removeProperty("--rb-vv-height");
      panel.style.removeProperty("--rb-vv-offset-top");
      panel.style.removeProperty("--rb-keyboard-inset");
    };
  }, [active, panelRef]);
}

type ScrollLockSnapshot = {
  bodyOverflow: string;
  htmlOverflow: string;
  bodyTouchAction: string;
};

/**
 * قفل تمرير الخلفية مع استعادة حتمية — لا يغيّر position/top لتجنّب قفز المصحف الثابت.
 */
export function lockDocumentScrollForSheet(): () => void {
  const html = document.documentElement;
  const body = document.body;
  const snap: ScrollLockSnapshot = {
    bodyOverflow: body.style.overflow,
    htmlOverflow: html.style.overflow,
    bodyTouchAction: body.style.touchAction,
  };
  html.setAttribute(MUSHAF_BOOKMARK_EDITOR_OPEN_ATTR, "1");
  body.style.overflow = "hidden";
  html.style.overflow = "hidden";
  body.style.touchAction = "none";

  return () => {
    body.style.overflow = snap.bodyOverflow;
    html.style.overflow = snap.htmlOverflow;
    body.style.touchAction = snap.bodyTouchAction;
    html.removeAttribute(MUSHAF_BOOKMARK_EDITOR_OPEN_ATTR);
  };
}

export function blurActiveTextField(): void {
  const active = document.activeElement;
  if (
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement ||
    active instanceof HTMLSelectElement
  ) {
    active.blur();
  }
}
