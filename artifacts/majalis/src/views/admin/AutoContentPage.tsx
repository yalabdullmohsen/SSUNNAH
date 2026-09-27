import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { arabicMatchAny } from "@/lib/arabic-search";
import { AdminShell, useAdminShell } from "@/views/admin/AdminShell";
import { SkeletonCardGrid } from "@/components/ui-common";
import {
  adminApproveAutoContent,
  adminGetAutoImportedContent,
  adminGetAutoImportLogs,
  adminGetAutoImportRuns,
  adminGetTrustedSources,
  adminRejectAutoContent,
  triggerAutoContentSync,
} from "@/lib/auto-content-service";
import type {
  AutoImportedContent,
  AutoImportLog,
  AutoImportRun,
  TrustedSource,
} from "@/lib/auto-content/auto-content-utils";

const STATUS_FILTERS = [
  ["all", "الكل"],
  ["needs_review", "قيد المراجعة"],
  ["published", "منشور"],
  ["rejected", "مرفوض"],
] as const;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  needs_review: { bg: "rgba(23,61,53,0.08)", text: "var(--mj-brand-deep)" },
  published: { bg: "#D1FAE5", text: "var(--majalis-emerald-deep)" },
  rejected: { bg: "#FEE2E2", text: "#991B1B" },
  running: { bg: "#DBEAFE", text: "#1D4ED8" },
  completed: { bg: "#D1FAE5", text: "var(--majalis-emerald-deep)" },
  failed: { bg: "#FEE2E2", text: "#991B1B" },
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("ar", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16);
  }
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="acp-stat">
      <p className="acp-stat__label">{label}</p>
      <p className="acp-stat__value">{value}</p>
    </div>
  );
}

function AutoContentAdmin() {
  const { showSuccess, showError } = useAdminShell();
  const [items, setItems] = useState<AutoImportedContent[]>([]);
  const [sources, setSources] = useState<TrustedSource[]>([]);
  const [logs, setLogs] = useState<AutoImportLog[]>([]);
  const [runs, setRuns] = useState<AutoImportRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [contentRes, sourcesRes, logsRes, runsRes] = await Promise.all([
        adminGetAutoImportedContent(filter === "all" ? undefined : filter),
        adminGetTrustedSources(),
        adminGetAutoImportLogs(50),
        adminGetAutoImportRuns(10),
      ]);
      setItems(contentRes.data || []);
      setSources(sourcesRes.data || []);
      setLogs(logsRes.data || []);
      setRuns(runsRes.data || []);
    } catch {
      showError("تعذر تحميل المحتوى المستورد.");
    } finally {
      setLoading(false);
    }
  }, [filter, showError]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = useMemo(
    () => items.filter((i) => arabicMatchAny([i.title ?? "", i.source_name ?? "", i.category ?? ""], search)),
    [items, search],
  );

  const errorLogs = useMemo(
    () => logs.filter((l) => l.status === "failed" || l.error_details),
    [logs],
  );

  const displayedLogs = showErrorsOnly ? errorLogs : logs;

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await triggerAutoContentSync();
      showSuccess(
        `تمت المزامنة: ${result.imported ?? 0} جديد، ${result.skipped ?? 0} متخطى، ${result.failed ?? 0} فشل (${Math.round((result.durationMs || 0) / 1000)}ث)`,
      );
      await load();
    } catch (err) {
      showError(err instanceof Error ? err.message : "فشل تشغيل المزامنة.");
    } finally {
      setSyncing(false);
    }
  };

  const handleApprove = async (id: string) => {
    const { error } = await adminApproveAutoContent(id);
    if (error) return showError(error.message);
    showSuccess("تم اعتماد المادة ونشرها — ستظهر في /updates فوراً.");
    load();
  };

  const handleReject = async (id: string) => {
    if (!confirm("رفض هذه المادة؟")) return;
    const { error } = await adminRejectAutoContent(id);
    if (error) return showError(error.message);
    showSuccess("تم رفض المادة.");
    load();
  };

  const reviewCount = items.filter((i) => i.status === "needs_review").length;
  const lastRun = runs[0];

  return (
    <div>
      <div className="acp-header">
        <div>
          <h2 className="acp-title">الاستيراد التلقائي للمحتوى</h2>
          <p className="acp-subtitle">
            خط أنابيب: إزالة التكرار → التحقق من المصدر → التصنيف → تحليل AI → slug → SEO → needs_review
            · Cron كل 6 ساعات
          </p>
        </div>
        <button type="button" onClick={handleSync} disabled={syncing} className="acp-sync-btn">
          {syncing ? "جارِ المزامنة..." : "▶ تشغيل المزامنة الآن"}
        </button>
      </div>

      <div className="acp-stats-grid">
        <Stat label="قيد المراجعة" value={reviewCount} />
        <Stat label="مصادر نشطة" value={sources.filter((s) => s.is_active).length} />
        <Stat label="إجمالي المواد" value={items.length} />
        <Stat label="منشور" value={items.filter((i) => i.status === "published").length} />
        <Stat label="أخطاء السجل" value={errorLogs.length} />
      </div>

      {lastRun && (
        <div className="acp-last-run">
          <strong>آخر تشغيل:</strong>{" "}
          {formatDate(lastRun.started_at)} —{" "}
          <span
            className="acp-last-run-status"
            style={{ "--acp-lrs-color": STATUS_COLORS[lastRun.status]?.text } as React.CSSProperties}
          >
            {lastRun.status}
          </span>
          {" · "}
          {lastRun.imported_count} مستورد، {lastRun.skipped_count} متخطى، {lastRun.failed_count} فشل
          {lastRun.duration_ms ? ` · ${Math.round(lastRun.duration_ms / 1000)}ث` : ""}
        </div>
      )}

      {sources.length > 0 && (
        <div className="acp-sources">
          <h3 className="acp-sources-h3">حالة المصادر</h3>
          <div className="acp-sources-list">
            {sources.map((s) => (
              <div key={s.id} className="acp-source-item">
                <span className="acp-source-dot" style={{ "--acp-dot-color": s.is_active ? "var(--majalis-emerald-deep)" : "#991B1B" } as React.CSSProperties}>
                  {s.is_active ? "●" : "○"}
                </span>
                <span>{s.name}</span>
                <span>· ثقة {s.trust_level}%</span>
                <span>· آخر مزامنة: {formatDate(s.last_synced_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="بحث..."
        className="acp-search"
      />

      <div className="acp-filter-row">
        {STATUS_FILTERS.map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setFilter(v)}
            className="acp-filter-btn"
            style={filter === v ? {
              "--acp-fb-border": "var(--majalis-emerald)",
              "--acp-fb-bg": "var(--majalis-sage)",
              "--acp-fb-color": "var(--majalis-emerald-deep)",
            } as React.CSSProperties : undefined}
          >
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : filtered.length === 0 ? (
        <p className="acp-empty">لا توجد مواد مستوردة. شغّل المزامنة أو أضف مصادر RSS في Supabase.</p>
      ) : (
        <div className="acp-list">
          {filtered.map((item) => (
            <article key={item.id} className="acp-card">
              <div className="acp-card-body">
                <div className="acp-card-info">
                  <p className="acp-card-title">{item.title}</p>
                  <p className="acp-card-meta">
                    {item.source_name} · {item.content_type} · {item.category || "—"}
                    {item.pipeline_stage ? ` · ${item.pipeline_stage}` : ""}
                  </p>
                  {item.summary && (
                    <p className="acp-card-summary">
                      {item.summary.slice(0, 200)}{item.summary.length > 200 ? "…" : ""}
                    </p>
                  )}
                </div>
                <div className="acp-card-badge-area">
                  <span
                    className="acp-card-badge"
                    style={{
                      "--acp-cb-bg": STATUS_COLORS[item.status]?.bg,
                      "--acp-cb-color": STATUS_COLORS[item.status]?.text,
                    } as React.CSSProperties}
                  >
                    {item.status}
                  </span>
                  <p className="acp-card-quality">
                    جودة: {item.quality_score}%
                    {item.source_verified ? " · ✓ مصدر" : ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="acp-expand-btn"
              >
                {expandedId === item.id ? "▲ إخفاء SEO" : "▼ SEO & slug"}
              </button>

              {expandedId === item.id && (
                <div className="acp-seo-box">
                  <p><strong>Slug:</strong> {item.slug}</p>
                  <p><strong>SEO Title:</strong> {item.seo_title || "—"}</p>
                  <p><strong>SEO Description:</strong> {item.seo_description || "—"}</p>
                  {item.tags && item.tags.length > 0 && <p><strong>Tags:</strong> {item.tags.join("، ")}</p>}
                </div>
              )}

              <div className="acp-card-actions">
                {item.status === "needs_review" && (
                  <>
                    <button type="button" onClick={() => handleApprove(item.id)} className="acp-approve-btn">اعتماد</button>
                    <button type="button" onClick={() => handleReject(item.id)} className="acp-reject-btn">رفض</button>
                  </>
                )}
                {item.status === "published" && item.slug && (
                  <Link href={`/updates/auto/${item.slug}`} className="acp-view-link">معاينة عامة</Link>
                )}
                {item.original_url && (
                  <a href={item.original_url} target="_blank" rel="noopener noreferrer" className="acp-view-link">
                    فتح المصدر
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {runs.length > 0 && (
        <div className="acp-runs-section">
          <h3 className="acp-section-h3">سجل تشغيلات Pipeline</h3>
          {runs.map((run) => (
            <div key={run.id} className="acp-run-item">
              {formatDate(run.started_at)} — {run.trigger_type} —{" "}
              <span
                className="acp-run-status"
                style={{ "--acp-rs-color": STATUS_COLORS[run.status]?.text } as React.CSSProperties}
              >
                {run.status}
              </span>
              {" · "}
              {run.imported_count} مستورد، {run.skipped_count} متخطى، {run.failed_count} فشل
              {run.error_summary ? ` · ${run.error_summary}` : ""}
            </div>
          ))}
        </div>
      )}

      {displayedLogs.length > 0 && (
        <div className="acp-logs-wrap">
          <div className="acp-logs-header">
            <h3 className="acp-section-h3 acp-section-h3--flush">
              سجل العمليات {showErrorsOnly ? "(أخطاء فقط)" : ""}
            </h3>
            <button type="button" onClick={() => setShowErrorsOnly(!showErrorsOnly)} className="acp-logs-toggle">
              {showErrorsOnly ? "عرض الكل" : "أخطاء فقط"}
            </button>
          </div>
          {displayedLogs.map((log) => (
            <div key={log.id} className="acp-log-item">
              <span
                className="acp-log-status"
                style={{ "--acp-ls-color": log.status === "failed" ? "#991B1B" : "var(--majalis-emerald-deep)" } as React.CSSProperties}
              >
                {log.status}
              </span>
              {log.pipeline_stage ? ` · ${log.pipeline_stage}` : ""}
              {" · "}
              {log.imported_count} مستورد، {log.skipped_count} متخطى
              {log.item_title ? ` · ${log.item_title.slice(0, 40)}` : ""}
              {log.message ? ` — ${log.message}` : ""}
              {log.error_details && (
                <pre className="acp-log-err">
                  {JSON.stringify(log.error_details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AutoContentPage() {
  return (
    <AdminShell section="dashboard" onSectionChange={() => {}}>
      <Link href="/admin" className="acp-back-link">
        ← العودة للوحة التحكم
      </Link>
      <AutoContentAdmin />
    </AdminShell>
  );
}
