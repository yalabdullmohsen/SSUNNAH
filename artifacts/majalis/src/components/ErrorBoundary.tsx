import { Component, type ErrorInfo, type ReactNode } from "react";
import { buildErrorReport, copyErrorId, createErrorId, logClientError } from "@/lib/error-report";
import { CONTACT_EMAIL } from "@/lib/site-config";
import {
  hardRecoverStaleDeploy,
  isChunkLoadError,
  tryRecoverFromStaleChunk,
} from "@/lib/chunk-recovery";
import { clearChunkReloadGuard } from "@/lib/lazy-with-retry";
import { Button } from "@/components/ui/button";
import "@/styles/components/error-boundary.css";
import "@/styles/pages/learn-legal-v2.css";

type Props = { children: ReactNode };
type State = {
  error: Error | null;
  copied: boolean;
  errorId: string;
  componentStack: string | null;
  /** استعادة chunk جارية — لم تعد تُستخدم لواجهة حاجبة */
  recovering: boolean;
};

const ERROR_ESCAPE_LINKS = [
  { href: "/lessons", label: "الدروس" },
  { href: "/fiqh", label: "الفقه" },
  { href: "/hadith", label: "الحديث" },
  { href: "/search", label: "البحث" },
  { href: "/contact", label: "التواصل" },
] as const;

function userFacingBody(): string {
  return "حدث خلل أثناء تحميل هذا القسم. يمكنك إعادة المحاولة أو الانتقال إلى قسم آخر.";
}

/** يمنع فهرسة شاشة الخطأ/الاستعادة كصفحة محتوى أساسية في Google. */
function applyErrorBoundaryRobots(active: boolean): void {
  if (typeof document === "undefined") return;
  let el = document.querySelector('meta[name="robots"]');
  if (active) {
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", "robots");
      document.head.appendChild(el);
    }
    el.setAttribute("content", "noindex, follow");
    el.setAttribute("data-error-boundary", "1");
    return;
  }
  if (el?.getAttribute("data-error-boundary") === "1") {
    el.removeAttribute("data-error-boundary");
  }
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    error: null,
    copied: false,
    errorId: "",
    componentStack: null,
    recovering: false,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    // لا واجهة حاجبة للاستعادة — خطأ قابل للاسترداد فقط
    return {
      error,
      copied: false,
      errorId: createErrorId("MJL"),
      componentStack: null,
      recovering: false,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const errorId = this.state.errorId || createErrorId("MJL");
    this.setState({ componentStack: info.componentStack ?? null, errorId });
    applyErrorBoundaryRobots(true);

    void import("@/lib/startup-safe-mode")
      .then(({ recordStartupFailure }) => {
        recordStartupFailure(error.message || error.name || "root_boundary");
      })
      .catch(() => {});

    void logClientError(
      buildErrorReport(error, {
        errorId,
        componentStack: info.componentStack,
        component: "ErrorBoundary",
      }),
    );

    if (isChunkLoadError(error)) {
      // استعادة هادئة (purge قشرة) — بلا reload تلقائي وبلا UI تحديث
      void tryRecoverFromStaleChunk("boundary-catch", error);
      void import("@/lib/app-update-manager")
        .then(({ markUpdateFailed }) => markUpdateFailed("chunk-load"))
        .catch(() => {});
    }
  }

  componentDidUpdate(_prev: Readonly<Props>, prevState: Readonly<State>) {
    if (this.state.error && !prevState.error) applyErrorBoundaryRobots(true);
    if (!this.state.error && prevState.error) applyErrorBoundaryRobots(false);
  }

  reset = () => {
    clearChunkReloadGuard();
    applyErrorBoundaryRobots(false);
    this.setState({
      error: null,
      copied: false,
      errorId: "",
      componentStack: null,
      recovering: false,
    });
  };

  goTo = (path: string) => {
    this.reset();
    window.history.pushState(null, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  goHome = () => {
    this.goTo("/");
  };

  copyId = async () => {
    const ok = await copyErrorId(this.state.errorId);
    if (ok) this.setState({ copied: true });
  };

  report = () => {
    const detail = encodeURIComponent(
      `Error ID: ${this.state.errorId}\nURL: ${typeof window !== "undefined" ? window.location.href : ""}\nMessage: ${this.state.error?.message || "unknown"}`,
    );
    window.open(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`ملاحظة تقنية — MJL Error ${this.state.errorId}`)}&body=${detail}`, "_blank", "noopener,noreferrer");
    this.setState({ copied: true });
  };

  hardRecover = () => {
    void hardRecoverStaleDeploy();
  };

  render() {
    if (this.state.error) {
      const isDev = import.meta.env.DEV;
      const chunkError = isChunkLoadError(this.state.error);

      return (
        <div role="alert" className="error-boundary-page" data-nosnippet dir="rtl" lang="ar">
          <p className="error-boundary-page__title">حدث خلل مؤقت في العرض</p>
          <p className="error-boundary-page__body">
            {chunkError
              ? "تعذّر تحميل جزء من الصفحة. أعد المحاولة أو ارجع للرئيسية. التطبيق يبقى على آخر نسخة صالحة."
              : userFacingBody()}
          </p>
          <p className="error-boundary-page__id">
            رقم التتبع: <code>{this.state.errorId}</code>
          </p>
          <div className="error-boundary-page__actions">
            <Button type="button" variant="primary" onClick={this.reset} className="error-boundary-btn error-boundary-btn--primary">
              إعادة المحاولة
            </Button>
            {chunkError ? (
              <Button type="button" variant="secondary" onClick={this.hardRecover} className="error-boundary-btn error-boundary-btn--secondary">
                إعادة تشغيل العرض
              </Button>
            ) : null}
            <Button type="button" variant="secondary" onClick={this.goHome} className="error-boundary-btn error-boundary-btn--secondary">
              العودة للرئيسية
            </Button>
            <Button type="button" variant="ghost" onClick={this.copyId} className="error-boundary-btn error-boundary-btn--ghost">
              {this.state.copied ? "تم النسخ" : "نسخ رقم الخطأ"}
            </Button>
            <Button type="button" variant="ghost" onClick={this.report} className="error-boundary-btn error-boundary-btn--ghost">
              الإبلاغ عن الخطأ
            </Button>
          </div>

          <nav className="error-boundary-page__nav" aria-label="أقسام مفيدة">
            <p className="error-boundary-page__nav-label">أقسام مفيدة</p>
            <ul className="error-boundary-page__nav-list">
              {ERROR_ESCAPE_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="error-boundary-btn error-boundary-btn--ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      this.goTo(item.href);
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {this.state.copied && (
            <p className="error-boundary-page__copied">تم تجهيز تقرير الخطأ.</p>
          )}

          {isDev && (
            <details className="error-boundary-page__dev">
              <summary>تفاصيل للمطور</summary>
              <pre>
                {`name: ${this.state.error.name}\nmessage: ${this.state.error.message}\nroute: ${typeof window !== "undefined" ? window.location.pathname : ""}\nuserAgent: ${typeof navigator !== "undefined" ? navigator.userAgent : ""}\n\ncomponentStack:${this.state.componentStack || ""}\n\nstack:\n${this.state.error.stack || ""}`}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

type SectionBoundaryProps = {
  name: string;
  children: ReactNode;
};

type SectionBoundaryState = {
  error: Error | null;
  errorId: string;
  /** Bumps on retry so failed React.lazy factories are not reused. */
  remountKey: number;
  recovering: boolean;
};

/**
 * Lazy-section boundary: one chunk reload max, then Arabic retry that remounts children.
 */
export class SectionErrorBoundary extends Component<SectionBoundaryProps, SectionBoundaryState> {
  state: SectionBoundaryState = { error: null, errorId: "", remountKey: 0, recovering: false };

  static getDerivedStateFromError(error: Error): Partial<SectionBoundaryState> {
    return {
      error,
      errorId: createErrorId("SEC"),
      recovering: false,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void logClientError(
      buildErrorReport(error, {
        errorId: this.state.errorId || createErrorId("SEC"),
        componentStack: info.componentStack,
        section: this.props.name,
        component: this.props.name,
      }),
    );

    if (isChunkLoadError(error)) {
      void tryRecoverFromStaleChunk(`section:${this.props.name}`, error);
    }
  }

  reset = () => {
    this.setState((s) => ({
      error: null,
      errorId: "",
      remountKey: s.remountKey + 1,
      recovering: false,
    }));
  };

  hardRecover = () => {
    void hardRecoverStaleDeploy();
  };

  render() {
    if (this.state.error) {
      const chunkError = isChunkLoadError(this.state.error);
      return (
        <div className="adv-error-state adv-error-state--section" role="alert" aria-live="assertive" dir="rtl">
          <p className="adv-error-state__msg">
            {chunkError
              ? `تعذّر تحميل قسم «${this.props.name}». أعد المحاولة أو أعد تشغيل العرض.`
              : `تعذّر عرض قسم «${this.props.name}». يمكنك إعادة المحاولة.`}
          </p>
          <Button
            type="button"
            variant="secondary"
            className="adv-error-state__retry"
            onClick={this.reset}
            aria-label="إعادة المحاولة"
          >
            إعادة المحاولة
          </Button>
          {chunkError ? (
            <Button
              type="button"
              variant="secondary"
              className="adv-error-state__retry"
              onClick={this.hardRecover}
              aria-label="إعادة تشغيل العرض"
            >
              إعادة تشغيل العرض
            </Button>
          ) : null}
        </div>
      );
    }

    return <div key={this.state.remountKey}>{this.props.children}</div>;
  }
}
