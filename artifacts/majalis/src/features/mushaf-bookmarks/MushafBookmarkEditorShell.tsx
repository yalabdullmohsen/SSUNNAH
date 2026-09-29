import {
  memo,
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  blurActiveTextField,
  ensureFieldVisibleInSheet,
  lockDocumentScrollForSheet,
  useInputSheetViewport,
} from "@/hooks/useInputSheetViewport";
import "@/styles/reader-bookmarks.css";

type Props = {
  title: string;
  subtitle?: string;
  ariaLabel: string;
  testId: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  /** يسمح بالإغلاق بالضغط على الخلفية — افتراضي true */
  dismissOnBackdrop?: boolean;
};

/**
 * غلاف محرر فاصل/علامة المصحف — Portal إلى body، مرتبط بـ VisualViewport،
 * ترويسة/أزرار ثابتة ومحتوى قابل للتمرير. لا يُركَّب داخل `.nm-root`.
 */
export const MushafBookmarkEditorShell = memo(function MushafBookmarkEditorShell({
  title,
  subtitle,
  ariaLabel,
  testId,
  onClose,
  children,
  footer,
  dismissOnBackdrop = true,
}: Props) {
  const titleId = useId();
  const shellRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closingRef = useRef(false);
  const historyPushed = useRef(false);

  useInputSheetViewport(shellRef, true);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    blurActiveTextField();
    onCloseRef.current();
  }, []);

  useEffect(() => {
    const unlock = lockDocumentScrollForSheet();
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        requestClose();
      }
    };

    const onPop = () => {
      historyPushed.current = false;
      requestClose();
    };
    if (!historyPushed.current) {
      try {
        window.history.pushState({ mushafBookmarkEditor: true }, "");
        historyPushed.current = true;
      } catch {
        /* ignore quota / security */
      }
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPop);

    const frame = window.requestAnimationFrame(() => {
      shellRef.current?.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPop);
      if (historyPushed.current) {
        historyPushed.current = false;
        if (window.history.state?.mushafBookmarkEditor) {
          try {
            window.history.back();
          } catch {
            /* ignore */
          }
        }
      }
      unlock();
      blurActiveTextField();
      previouslyFocused?.focus?.({ preventScroll: true });
      closingRef.current = false;
    };
  }, [requestClose]);

  /* إبقاء الحقل + شريط الإجراءات مرئيين داخل VisualViewport — لا تمرير للمستند/المصحف */
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const reveal = (target: HTMLElement) => {
      window.requestAnimationFrame(() => {
        ensureFieldVisibleInSheet(target, body, footerRef.current);
        window.setTimeout(() => {
          ensureFieldVisibleInSheet(target, body, footerRef.current);
        }, 280);
      });
    };
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (!body.contains(target)) return;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
      reveal(target);
    };
    body.addEventListener("focusin", onFocusIn);
    return () => body.removeEventListener("focusin", onFocusIn);
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={shellRef}
      className="rb-editor-shell"
      data-testid={`${testId}-shell`}
      data-rb-editor-shell="1"
    >
      <button
        type="button"
        className="rb-editor-shell__backdrop"
        aria-label="إغلاق"
        tabIndex={-1}
        onClick={() => {
          if (dismissOnBackdrop) requestClose();
        }}
      />
      <div
        className="rb-editor-shell__panel"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={titleId}
        data-testid={testId}
        tabIndex={-1}
      >
        <header className="rb-editor-shell__head">
          <button
            type="button"
            className="rb-editor-shell__close"
            onClick={requestClose}
            aria-label="إغلاق"
            data-testid={`${testId}-close`}
          >
            إغلاق
          </button>
          <div className="rb-editor-shell__titles">
            <span className="rb-editor-shell__eyebrow" id={titleId}>
              {title}
            </span>
            {subtitle ? <strong className="rb-editor-shell__subtitle">{subtitle}</strong> : null}
          </div>
        </header>
        <div ref={bodyRef} className="rb-editor-shell__body">
          {children}
        </div>
        <footer ref={footerRef} className="rb-editor-shell__footer" data-rb-editor-footer="1">
          {footer}
        </footer>
      </div>
    </div>,
    document.body,
  );
});
