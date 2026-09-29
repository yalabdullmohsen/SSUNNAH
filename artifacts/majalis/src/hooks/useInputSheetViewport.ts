import { useEffect, useRef, type RefObject } from "react";
import { measureInputSheetViewport } from "@/hooks/input-sheet-viewport-metrics";

export const MUSHAF_BOOKMARK_EDITOR_OPEN_ATTR = "data-mushaf-bookmark-editor-open";
export { measureInputSheetViewport, BOOKMARK_EDITOR_VIEWPORT_FIXTURES } from "@/hooks/input-sheet-viewport-metrics";

type CapHandle = { remove: () => Promise<void> | void };

/**
 * يربط لوحة إدخال بـ VisualViewport (+ Capacitor Keyboard عند التوفر)
 * عبر متغيرات CSS + top/height مباشرة على الغلاف — بلا حالة React.
 *
 * المتغيرات:
 * - `--rb-vv-height` / `--rb-vv-offset-top` مستطيل المرئي فوق الكيبورد
 * - `--rb-keyboard-inset` ارتفاع الكيبورد المقاس
 */
export function useInputSheetViewport(panelRef: RefObject<HTMLElement | null>, active: boolean): void {
  const rafRef = useRef(0);
  const capKbRef = useRef(0);
  const restingInnerHRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!active) return;
    const panel = panelRef.current;
    if (!panel || typeof window === "undefined") return;

    restingInnerHRef.current = Math.max(restingInnerHRef.current, window.innerHeight);

    const readRootKeyboardInset = (): number => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--keyboard-inset")
        .trim();
      if (!raw) return 0;
      const n = parseFloat(raw);
      return Number.isFinite(n) ? n : 0;
    };

    const apply = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const el = panelRef.current;
        if (!el) return;
        const vv = window.visualViewport;
        const innerH = window.innerHeight;
        const rootKb = readRootKeyboardInset();
        /* حدّث ارتفاع الراحة فقط عندما لا يوجد كيبورد مُبلَّغ */
        if (capKbRef.current < 48 && rootKb < 48) {
          const gap =
            vv != null
              ? Math.max(0, innerH - Math.round(vv.offsetTop) - Math.round(vv.height))
              : 0;
          if (gap < 48) {
            restingInnerHRef.current = Math.max(restingInnerHRef.current, innerH);
          }
        }
        const metrics = measureInputSheetViewport({
          innerHeight: innerH,
          visualViewport: vv
            ? { height: vv.height, offsetTop: vv.offsetTop }
            : null,
          capacitorKeyboardHeight: capKbRef.current,
          rootKeyboardInsetPx: rootKb,
          restingInnerHeight: restingInnerHRef.current || innerH,
        });
        el.style.setProperty("--rb-vv-height", `${metrics.height}px`);
        el.style.setProperty("--rb-vv-offset-top", `${metrics.offsetTop}px`);
        el.style.setProperty("--rb-keyboard-inset", `${metrics.keyboardInset}px`);
        /* تثبيت مباشر — لا يعتمد فقط على وراثة CSS إن تعطّلت المتغيرات */
        el.style.top = `${metrics.offsetTop}px`;
        el.style.height = `${metrics.height}px`;
        el.style.maxHeight = `${metrics.height}px`;
        el.style.bottom = "auto";
        el.dataset.rbKeyboard = metrics.keyboardInset > 48 ? "1" : "0";
        el.dataset.rbOverlay = metrics.overlayMode ? "1" : "0";
      });
    };

    const scheduleRemeasure = () => {
      apply();
      /* بعد انتهاء رسوم الكيبورد على iOS */
      for (const ms of [50, 120, 280]) {
        const id = window.setTimeout(apply, ms);
        timersRef.current.push(id);
      }
    };

    apply();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", scheduleRemeasure);
    vv?.addEventListener("scroll", scheduleRemeasure);
    window.addEventListener("resize", scheduleRemeasure);
    window.addEventListener("orientationchange", scheduleRemeasure);
    window.addEventListener("focusin", scheduleRemeasure);

    let disposed = false;
    const capHandles: CapHandle[] = [];
    void (async () => {
      try {
        const { isNative } = await import("@/lib/capacitor-utils");
        if (!isNative || disposed) return;
        const { Keyboard } = await import("@capacitor/keyboard");
        const onShow = (info: { keyboardHeight?: number }) => {
          capKbRef.current = Math.max(0, Math.round(info.keyboardHeight ?? 0));
          scheduleRemeasure();
        };
        const onHide = () => {
          capKbRef.current = 0;
          scheduleRemeasure();
        };
        capHandles.push(await Keyboard.addListener("keyboardWillShow", onShow));
        capHandles.push(await Keyboard.addListener("keyboardDidShow", onShow));
        capHandles.push(await Keyboard.addListener("keyboardWillHide", onHide));
        capHandles.push(await Keyboard.addListener("keyboardDidHide", onHide));
      } catch {
        /* web / plugin unavailable */
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafRef.current);
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
      vv?.removeEventListener("resize", scheduleRemeasure);
      vv?.removeEventListener("scroll", scheduleRemeasure);
      window.removeEventListener("resize", scheduleRemeasure);
      window.removeEventListener("orientationchange", scheduleRemeasure);
      window.removeEventListener("focusin", scheduleRemeasure);
      for (const h of capHandles) {
        try {
          void h.remove();
        } catch {
          /* ignore */
        }
      }
      capKbRef.current = 0;
      restingInnerHRef.current = 0;
      panel.style.removeProperty("--rb-vv-height");
      panel.style.removeProperty("--rb-vv-offset-top");
      panel.style.removeProperty("--rb-keyboard-inset");
      panel.style.removeProperty("top");
      panel.style.removeProperty("height");
      panel.style.removeProperty("max-height");
      panel.style.removeProperty("bottom");
      delete panel.dataset.rbKeyboard;
      delete panel.dataset.rbOverlay;
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

/**
 * يبقي الحقل النشط داخل جسم الشيت المرئي فوق شريط الإجراءات.
 */
export function ensureFieldVisibleInSheet(
  field: HTMLElement,
  body: HTMLElement,
  _footer?: HTMLElement | null,
): void {
  /* الـfooter صفّ شبكة شقيق للجسم — bodyRect أصلًا فوق شريط الإجراءات */
  const bodyRect = body.getBoundingClientRect();
  const fieldRect = field.getBoundingClientRect();
  const pad = 12;
  const visibleBottom = bodyRect.bottom - pad;
  if (fieldRect.bottom > visibleBottom || fieldRect.top < bodyRect.top + pad) {
    field.scrollIntoView({ block: "center", inline: "nearest" });
  }
}
