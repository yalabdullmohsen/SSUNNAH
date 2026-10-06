import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "./primitives";
import { S } from "@/design-system/strings";

/** نافذة تُسحب من الأسفل: Esc/نقر الخلفية/سحب المقبض للإغلاق، وتُعاد البؤرة للعنصر السابق. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const startY = useRef<number | null>(null);

  const requestClose = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      onClose();
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 250);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && requestClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus?.();
    };
  }, [open, requestClose]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <>
      <div className="sn-sheet-scrim" onClick={requestClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="sn-sheet"
        data-closing={closing}
        onPointerDown={(e) => { if ((e.target as HTMLElement).closest(".sn-sheet__grabber")) startY.current = e.clientY; }}
        onPointerMove={(e) => { if (startY.current != null && panel.current) panel.current.style.transform = `translateY(${Math.max(0, e.clientY - startY.current)}px)`; }}
        onPointerUp={(e) => {
          if (startY.current == null || !panel.current) return;
          const dy = e.clientY - startY.current;
          startY.current = null;
          panel.current.style.transform = "";
          if (dy > 80) requestClose();
        }}
      >
        <div className="sn-sheet__grabber" />
        <div className="sn-sheet__header">
          <h2 className="sn-sheet__title">{title}</h2>
          <IconButton icon="close" label={S.overlays_01} tone="tinted" size={20} onClick={requestClose} />
        </div>
        <div className="sn-sheet__body">{children}</div>
      </div>
    </>,
    document.body,
  );
}

type ToastItem = { id: number; message: string; tone: "default" | "danger" };
const ToastCtx = createContext<(message: string, tone?: ToastItem["tone"]) => void>(() => undefined);
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((message: string, tone: ToastItem["tone"] = "default") => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="sn-toast-region" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={t.tone === "danger" ? "sn-toast sn-toast--danger" : "sn-toast"}>{t.message}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
