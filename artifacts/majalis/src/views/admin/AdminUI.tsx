import { Component, type ErrorInfo, type ReactNode } from "react";
import { buildErrorReport, createErrorId, logClientError } from "@/lib/error-report";
import { Button } from "@/components/ui/button";

/* ─── شارة الحالة الموحّدة ──────────────────────────────────────────────
   تفويض إلى سلطة التخطيط (components/admin/AdminLayout → lib/admin-status). */
export { AdminStatusPill as StatusBadge } from "@/components/admin/AdminLayout";

/* ─── حاجز أخطاء على مستوى القسم ─────────────────────────────────────────
   يعزل انهيار أي قسم عن بقية اللوحة ويعرض بطاقة إعادة محاولة بدل
   إسقاط لوحة التحكم بالكامل. يُعاد ضبطه تلقائياً عند تغيّر resetKey. */

type BoundaryProps = { name: string; resetKey?: string; children: ReactNode };
type BoundaryState = { error: Error | null; errorId: string };

export class AdminSectionBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null, errorId: "" };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error, errorId: createErrorId("ADM") };
  }

  componentDidUpdate(prev: BoundaryProps) {
    // تغيّر القسم → امسح الخطأ حتى لا يبقى عالقاً عند التنقّل
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null, errorId: "" });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void logClientError(
      buildErrorReport(error, {
        errorId: this.state.errorId || createErrorId("ADM"),
        componentStack: info.componentStack,
        section: this.props.name,
        component: this.props.name,
      }),
    );
  }

  reset = () => this.setState({ error: null, errorId: "" });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="admin-section-error" role="alert">
        <h2>تعذّر عرض هذا القسم</h2>
        <p>
          حدث خلل أثناء تحميل القسم. يمكنك إعادة المحاولة أو الانتقال لقسم آخر.
          {this.state.errorId && <><br />رقم التتبع: <code>{this.state.errorId}</code></>}
        </p>
        <Button type="button" variant="secondary" onClick={this.reset}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }
}
