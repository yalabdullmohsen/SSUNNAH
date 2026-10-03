import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { invalidateLessonsCache } from "@/lib/lessons-service";
import {
  approveAutomationDraft,
  listAutomationReview,
  rejectAutomationDraft,
  reAnalyzeAutomationDraft,
  type AutomationAuditRecord,
} from "@/lib/lesson-automation-api";
import { adminApproveAutoContent, adminRejectAutoContent } from "@/lib/auto-content-service";
import { adminListUnifiedContent, adminSetPinned, adminDeleteUnifiedContent } from "@/lib/unified-content-service";
import type { AutoImportedContent } from "@/lib/auto-content/auto-content-utils";
import { SkeletonCardGrid } from "@/components/ui-common";
import { AdminShell, useAdminShell } from "@/views/admin/AdminShell";

const CONTENT_TYPE_LABEL: Record<string, string> = {
  course: "دورة", event: "فعالية", benefit: "فائدة", announcement: "إعلان",
};

type DraftRow = {
  id: string;
  source_id?: string;
  source_url?: string;
  image_url?: string;
  extracted_text?: string;
  parsed_payload?: Record<string, unknown>;
  confidence_score?: number;
  automation_status?: string;
  decision_reason?: string;
  warnings?: { field: string; message: string }[];
  missing_fields?: string[];
  created_at: string;
};

const DECISION_COLORS: Record<string, { bg: string; text: string }> = {
  approved: { bg: "#D1FAE5", text: "var(--majalis-emerald-deep)" },
  pending_review: { bg: "rgba(23,61,53,0.08)", text: "var(--mj-brand-deep)" },
  duplicate: { bg: "rgba(23,61,53,.10)", text: "var(--mj-brand)" },
  rejected: { bg: "#FEE2E2", text: "#991B1B" },
};

function formatDt(iso?: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("ar", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16);
  }
}

function confidenceColor(score: number) {
  const pct = Math.round(score * 100);
  if (pct >= 75) return { bg: "#D1FAE5", text: "var(--majalis-emerald-deep)" };
  if (pct >= 45) return { bg: "rgba(23,61,53,0.08)", text: "var(--mj-brand-deep)" };
  return { bg: "#FEE2E2", text: "#991B1B" };
}

function AutomationReviewContent() {
  const { showSuccess, showError } = useAdminShell();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [autoPublished, setAutoPublished] = useState<AutomationAuditRecord[]>([]);
  const [duplicates, setDuplicates] = useState<AutomationAuditRecord[]>([]);
  const [rejected, setRejected] = useState<AutomationAuditRecord[]>([]);
  const [unified, setUnified] = useState<AutoImportedContent[]>([]);
  const [tab, setTab] = useState<"pending" | "auto" | "duplicate" | "rejected" | "unified">("pending");

  const load = useCallback(() => {
    setLoading(true);
    listAutomationReview()
      .then((r) => {
        setDrafts((r.drafts as DraftRow[]) || []);
        setPendingCount(Number(r.pendingCount) || (r.drafts as DraftRow[])?.length || 0);
        setAutoPublished((r.autoPublished as AutomationAuditRecord[]) || []);
        setDuplicates((r.duplicates as AutomationAuditRecord[]) || []);
        setRejected((r.rejected as AutomationAuditRecord[]) || []);
      })
      .catch(() => {
        setDrafts([]);
        setAutoPublished([]);
      })
      .finally(() => setLoading(false));
    adminListUnifiedContent("needs_review").then((r) => setUnified(r.data)).catch(() => setUnified([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onApprove = async (draft: DraftRow) => {
    setBusy(true);
    try {
      const res = await approveAutomationDraft(draft.id, draft.parsed_payload);
      if (!res.ok) {
        showError(res.error || res.validation?.errors?.[0]?.message || "تعذر الاعتماد");
        return;
      }
      invalidateLessonsCache();
      showSuccess("تم اعتماد الدرس — يظهر الآن في المنصة");
      load();
    } catch {
      showError("تعذر الاعتماد");
    } finally {
      setBusy(false);
    }
  };

  const onReject = async (draftId: string) => {
    setBusy(true);
    try {
      const res = await rejectAutomationDraft(draftId);
      if (res && res.ok === false) {
        showError(res.error || "تعذر الرفض");
        return;
      }
      showSuccess("تم الرفض");
      load();
    } catch {
      showError("تعذر الرفض");
    } finally {
      setBusy(false);
    }
  };

  const onReAnalyze = async (draftId: string) => {
    setBusy(true);
    try {
      const res = await reAnalyzeAutomationDraft(draftId);
      if (!res.ok) {
        showError(res.error || "تعذر إعادة التحليل");
        return;
      }
      showSuccess("تم إعادة التحليل من المصدر");
      load();
    } catch {
      showError("تعذر إعادة التحليل");
    } finally {
      setBusy(false);
    }
  };

  const onApproveUnified = async (id: string) => {
    setBusy(true);
    try {
      const { error } = await adminApproveAutoContent(id);
      if (error) { showError(error.message); return; }
      showSuccess("تم الاعتماد — سيظهر الآن في القسم المناسب");
      setUnified((prev) => prev.filter((u) => u.id !== id));
    } finally { setBusy(false); }
  };

  const onRejectUnified = async (id: string) => {
    setBusy(true);
    try {
      const { error } = await adminRejectAutoContent(id);
      if (error) { showError(error.message); return; }
      showSuccess("تم الرفض");
      setUnified((prev) => prev.filter((u) => u.id !== id));
    } finally { setBusy(false); }
  };

  const onPinUnified = async (id: string, pinned: boolean) => {
    setBusy(true);
    try {
      await adminSetPinned(id, pinned);
      setUnified((prev) => prev.map((u) => (u.id === id ? { ...u, pinned } : u)));
    } finally { setBusy(false); }
  };

  const onDeleteUnified = async (id: string) => {
    setBusy(true);
    try {
      const { ok, error } = await adminDeleteUnifiedContent(id);
      if (!ok) { showError(error?.message || "تعذّر الحذف"); return; }
      setUnified((prev) => prev.filter((u) => u.id !== id));
    } finally { setBusy(false); }
  };

  const tabs = [
    ["pending", `مسودات (${drafts.length})`],
    ["auto", `منشور تلقائيًا (${autoPublished.length})`],
    ["duplicate", `مكرر (${duplicates.length})`],
    ["rejected", `مرفوض (${rejected.length})`],
    ["unified", `دورات/فعاليات/فوائد (${unified.length})`],
  ] as const;

  return (
    <div>
      <div className="arp-header">
        <div>
          <h2 className="arp-title">مركز مراجعة المحتوى</h2>
          <p className="arp-subtitle">
            مسودات مكتشفة تلقائيًا من المصادر الموثوقة — لا نشر بدون مراجعة بشرية.
          </p>
        </div>
        <div className="arp-links">
          <Link href="/admin/sources" className="arp-link">المصادر</Link>
          <Link href="/admin" className="arp-link">← لوحة الإدارة</Link>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="arp-notice">
          تم العثور على <strong>{pendingCount}</strong> {pendingCount === 1 ? "درس جديد" : "دروس جديدة"} بحاجة للمراجعة.
        </div>
      )}

      <div className="arp-tabs">
        {tabs.map(([key, label]) => (
          <Button variant="secondary" size="small"
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className="arp-tab"
            style={tab === key ? {
              "--arp-tab-border": "var(--majalis-emerald)",
              "--arp-tab-bg": "#E8F5E9",
              "--arp-tab-color": "var(--majalis-emerald-deep)",
            } as React.CSSProperties : undefined}
          >
            {label}
          </Button>
        ))}
      </div>

      {loading ? <SkeletonCardGrid count={6} /> : (
        <div className="arp-list">
          {tab === "pending" && drafts.map((d) => {
            const title = String(d.parsed_payload?.title || "بدون عنوان");
            const sc = DECISION_COLORS.pending_review;
            const conf = confidenceColor(d.confidence_score ?? 0);
            const speaker = String(d.parsed_payload?.speaker_name || d.parsed_payload?.sheikh_name || "—");
            const mosque = String(d.parsed_payload?.mosque || d.parsed_payload?.location || "—");
            return (
              <article key={d.id} className="arp-card">
                <div className="arp-card-grid">
                  {d.image_url ? (
                    <img src={d.image_url} alt="إعلان" loading="lazy" decoding="async" className="arp-card-thumb" />
                  ) : (
                    <div className="arp-card-placeholder">بدون صورة</div>
                  )}
                  <div>
                    <div className="arp-card-meta-row">
                      <div>
                        <strong>{title}</strong>
                        <span
                          className="arp-decision-badge"
                          style={{ "--arp-db-bg": sc.bg, "--arp-db-color": sc.text } as React.CSSProperties}
                        >
                          مراجعة
                        </span>
                        <span
                          className="arp-conf-badge"
                          style={{ "--arp-cb-bg": conf.bg, "--arp-cb-color": conf.text } as React.CSSProperties}
                        >
                          ثقة {Math.round((d.confidence_score ?? 0) * 100)}%
                        </span>
                        <p className="arp-card-subtext">
                          {speaker} · {mosque} · {formatDt(d.created_at)}
                        </p>
                        {d.decision_reason && <p className="arp-card-reason">{d.decision_reason}</p>}
                        {d.missing_fields && d.missing_fields.length > 0 && (
                          <p className="arp-card-missing">
                            حقول ناقصة: {d.missing_fields.join("، ")}
                          </p>
                        )}
                        {d.source_url && <a href={d.source_url} target="_blank" rel="noopener noreferrer" className="arp-card-url">{d.source_url}</a>}
                      </div>
                      <div className="arp-card-actions">
                        <Button variant="secondary" size="small" type="button" disabled={busy} onClick={() => onApprove(d)} className="arp-approve-btn">اعتماد</Button>
                        <Link href={`/admin/content-import/url?draft=${d.id}`} className="arp-edit-link">تعديل</Link>
                        {d.source_id && (
                          <Button variant="secondary" size="small" type="button" disabled={busy} onClick={() => onReAnalyze(d.id)} className="arp-small-btn">إعادة التحليل</Button>
                        )}
                        <Button variant="secondary" size="small" type="button" disabled={busy} onClick={() => onReject(d.id)} className="arp-small-btn">رفض</Button>
                      </div>
                    </div>
                    {d.extracted_text && (
                      <details className="arp-card-text">
                        <summary>النص المستخرج</summary>
                        <pre>{d.extracted_text.slice(0, 800)}</pre>
                      </details>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {tab === "pending" && drafts.length === 0 && <p className="arp-empty">لا توجد مسودات بانتظار المراجعة.</p>}

          {tab === "auto" && autoPublished.map((a) => <AuditCard key={a.id} record={a} />)}
          {tab === "auto" && autoPublished.length === 0 && <p className="arp-empty">لا توجد عناصر منشورة تلقائيًا بعد — تظهر هنا عند اجتياز شروط Phase 4.</p>}

          {tab === "duplicate" && duplicates.map((a) => <AuditCard key={a.id} record={a} />)}
          {tab === "duplicate" && duplicates.length === 0 && <p className="arp-empty">لا تكرارات مسجّلة.</p>}

          {tab === "rejected" && rejected.map((a) => <AuditCard key={a.id} record={a} />)}
          {tab === "rejected" && rejected.length === 0 && <p className="arp-empty">لا عناصر مرفوضة.</p>}

          {tab === "unified" && unified.map((u) => (
            <article key={u.id} className="arp-card">
              <div className="arp-card-grid">
                {u.image_url ? (
                  <img src={u.image_url} alt="" loading="lazy" decoding="async" className="arp-card-thumb" />
                ) : (
                  <div className="arp-card-placeholder">بدون صورة</div>
                )}
                <div>
                  <div className="arp-card-meta-row">
                    <div>
                      <strong>{u.title}</strong>
                      <span className="arp-decision-badge" style={{ "--arp-db-bg": "rgba(23,61,53,0.08)", "--arp-db-color": "var(--mj-brand-deep)" } as React.CSSProperties}>
                        {CONTENT_TYPE_LABEL[u.content_type] || u.content_type}
                      </span>
                      {u.review_status === "needs_date_review" && (
                        <span className="arp-decision-badge" style={{ "--arp-db-bg": "#FEF3C7", "--arp-db-color": "#92400E" } as React.CSSProperties}>
                          يحتاج مراجعة التاريخ
                        </span>
                      )}
                      <p className="arp-card-subtext">
                        {u.attribution_name || u.organization_name || u.source_name} · {formatDt(u.source_published_at || u.created_at)}
                      </p>
                      {u.summary && <p className="arp-card-reason">{u.summary.slice(0, 220)}</p>}
                      {u.original_url && <a href={u.original_url} target="_blank" rel="noopener noreferrer" className="arp-card-url">{u.original_url}</a>}
                    </div>
                    <div className="arp-card-actions">
                      <Button variant="secondary" size="small" type="button" disabled={busy} onClick={() => onApproveUnified(u.id)} className="arp-approve-btn">اعتماد</Button>
                      <Button variant="secondary" size="small" type="button" disabled={busy} onClick={() => onPinUnified(u.id, !u.pinned)} className="arp-small-btn">{u.pinned ? "إلغاء التثبيت" : "تثبيت"}</Button>
                      <Button variant="secondary" size="small" type="button" disabled={busy} onClick={() => onRejectUnified(u.id)} className="arp-small-btn">رفض</Button>
                      <Button variant="secondary" size="small" type="button" disabled={busy} onClick={() => onDeleteUnified(u.id)} className="arp-small-btn">حذف</Button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {tab === "unified" && unified.length === 0 && <p className="arp-empty">لا مواد بانتظار المراجعة (دورات/فعاليات/فوائد/إعلانات).</p>}
        </div>
      )}
    </div>
  );
}

function AuditCard({ record }: { record: AutomationAuditRecord }) {
  const sc = DECISION_COLORS[record.decision] || { bg: "var(--majalis-parchment-deep)", text: "var(--majalis-ink-soft)" };
  const title = String(record.parsed_payload?.title || record.source_url?.slice(0, 60) || "—");
  return (
    <article className="arp-audit-card">
      <strong>{title}</strong>
      <span
        className="arp-audit-badge"
        style={{ "--arp-ab-bg": sc.bg, "--arp-ab-color": sc.text } as React.CSSProperties}
      >
        {record.decision}
      </span>
      <p className="arp-audit-meta">
        ثقة: {Math.round((record.confidence_score ?? 0) * 100)}% · {formatDt(record.created_at)}
      </p>
      {record.reason && <p className="arp-audit-reason">{record.reason}</p>}
      <a href={record.source_url} target="_blank" rel="noopener noreferrer" className="arp-audit-url">{record.source_url}</a>
    </article>
  );
}

export default function AutomationReviewPage() {
  return (
    <AdminShell section="lessons" onSectionChange={() => {}}>
      <AutomationReviewContent />
    </AdminShell>
  );
}

export { AutomationReviewContent };
