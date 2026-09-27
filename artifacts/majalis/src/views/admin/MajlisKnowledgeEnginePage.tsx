import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { getMkeDashboard, runMkeEngine } from "@/lib/majlis-knowledge-engine-api";
import { SkeletonCardGrid } from "@/components/ui-common";
import { AdminShell } from "@/views/admin/AdminShell";

type AkpStats = {
  platformVersion?: string;
  readinessPct?: number;
  health?: { score?: number; database?: string };
  avgDurationMs?: number;
  retryQueue?: { total?: number; pending?: number };
  sourceStatuses?: Array<{ slug: string; name: string; status: string; lastError?: string }>;
  counts?: {
    today?: { items?: number; mkeRuns?: number };
    sources?: number;
    sourcesHealthy?: number;
    sourcesDead?: number;
    queuePending?: number;
    queueFailed?: number;
    retryQueue?: number;
    published?: number;
    rejected?: number;
    duplicates?: number;
    dlq?: number;
    reviewPending?: number;
    alerts?: number;
  };
  pipelines?: Record<string, { label?: string; quota?: number; publishedToday?: number }>;
  productionVelocity?: { itemsToday?: number; pctOfQuota?: number };
  lastRun?: { started_at?: string; status?: string } | null;
  lastError?: { message?: string; created_at?: string } | null;
  services?: Record<string, { status?: string }>;
};

type MkeStats = {
  engineVersion?: string;
  health?: { score?: number; status?: string };
  intelligenceLayers?: Array<{ id: string; label: string }>;
  subsystems?: Record<string, unknown>;
  counts?: Record<string, number>;
  sourcesTotal?: number;
  platformsSupported?: number;
  drafts?: number;
  pendingReview?: number;
  publishedToday?: number;
  duplicates?: number;
  rejected?: number;
  vision?: { visionEnabled?: boolean; capabilities?: string[]; fallback?: string };
  instagram?: { configured?: boolean; manualAssistMode?: boolean };
  database?: { status?: string };
  search?: { status?: string; embeddings?: boolean };
  queue?: { pending?: number; failed?: number };
  extractionMetrics?: {
    visionAccuracy?: number | null;
    duplicateDetectionRate?: number | null;
    sheikhMatchRate?: number | null;
  };
  sourcesByType?: Record<string, number>;
};

function StatCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="mke-stat" style={color ? { "--mke-val-color": color } as React.CSSProperties : undefined}>
      <div className="mke-stat__value">{value}</div>
      <div className="mke-stat__label">{label}</div>
    </div>
  );
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className="mke-service-badge"
      style={{
        "--mke-sb-bg": ok ? "#D1FAE5" : "#FEE2E2",
        "--mke-sb-color": ok ? "var(--majalis-emerald-deep)" : "#991B1B",
      } as React.CSSProperties}
    >
      {label}: {ok ? "✓" : "✗"}
    </span>
  );
}

function MajlisKnowledgeEngineContent() {
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [engineVersion, setEngineVersion] = useState("2.0.0");
  const [stats, setStats] = useState<MkeStats | null>(null);
  const [akp, setAkp] = useState<AkpStats | null>(null);
  const [platforms, setPlatforms] = useState<Array<{ type: string; adapter: string }>>([]);
  const [intelligenceLayers, setIntelligenceLayers] = useState<Array<{ id: string; label: string }>>([]);
  const [pipelineStages, setPipelineStages] = useState<Array<{ id: string; label: string }>>([]);
  const [runResult, setRunResult] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    getMkeDashboard()
      .then((r) => {
        setEngineVersion(r.engineVersion || "2.0.0");
        setStats((r.stats as MkeStats) || null);
        setAkp((r.akp as AkpStats) || null);
        setPlatforms(r.platforms || []);
        setIntelligenceLayers(r.intelligenceLayers || []);
        setPipelineStages(r.pipelineStages || []);
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const r = await runMkeEngine("full");
      setRunResult(r.ok
        ? `✓ ${r.published ?? 0} منشور · ${r.pendingReview ?? 0} مراجعة · ${r.duplicates ?? 0} مكرر`
        : `✗ ${r.error || "فشل"}`);
      load();
    } catch {
      setRunResult("✗ خطأ في التشغيل");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div className="mke-header">
        <div>
          <h2 className="mke-title">
            Majlis Autonomous Platform v{engineVersion}
          </h2>
          <p className="mke-subtitle">
            نظام تشغيل ذاتي 24/7 — اكتشاف · جودة · قرار · نشر · شفاء · تعلم
          </p>
        </div>
        <div className="mke-actions">
          <Link href="/admin/automation/dashboard" className="mke-link">Phase 5</Link>
          <Link href="/admin/automation/center" className="mke-link">Phase 6</Link>
          <Link href="/admin/sources" className="mke-link">المصادر</Link>
          <button type="button" onClick={handleRun} disabled={running} className="mke-run-btn">
            {running ? "جاري التشغيل…" : "تشغيل المحرك"}
          </button>
        </div>
      </div>

      {runResult && <p className="mke-run-result">{runResult}</p>}

      {loading ? <SkeletonCardGrid count={6} /> : (
        <>
          <div className="mke-stats-row">
            <StatCard label="صحة النظام" value={stats?.health?.score ?? "—"} color={stats?.health?.status === "healthy" ? "var(--majalis-emerald-deep)" : "var(--mj-brand-deep)"} />
            <StatCard label="المصادر" value={stats?.counts?.sources ?? (stats?.subsystems as { sources?: { total?: number } } | undefined)?.sources?.total ?? stats?.sourcesTotal ?? 0} />
            <StatCard label="المنصات" value={stats?.platformsSupported ?? platforms.length} />
            <StatCard label="مسودات" value={stats?.counts?.drafts ?? stats?.drafts ?? 0} />
            <StatCard label="بانتظار المراجعة" value={stats?.counts?.pendingReview ?? stats?.pendingReview ?? 0} color="var(--mj-brand-deep)" />
            <StatCard label="منشور اليوم" value={stats?.counts?.publishedToday ?? stats?.publishedToday ?? 0} />
            <StatCard label="Queue" value={stats?.subsystems?.queue ? (stats.subsystems.queue as { pending?: number }).pending ?? 0 : stats?.queue?.pending ?? 0} />
            <StatCard label="Self-Heal" value={stats?.counts?.self_heal_log ?? "—"} />
            {akp && (
              <>
                <StatCard label="AKP جاهزية %" value={akp.readinessPct ?? "—"} />
                <StatCard label="منشور AKP اليوم" value={akp.counts?.published ?? akp.productionVelocity?.itemsToday ?? 0} />
                <StatCard label="DLQ" value={akp.counts?.dlq ?? 0} color="#991B1B" />
                <StatCard label="مراجعة AKP" value={akp.counts?.reviewPending ?? 0} color="var(--mj-brand-deep)" />
              </>
            )}
          </div>

          {akp?.pipelines && (
            <section className="mke-section">
              <h3 className="mke-section-h3">خطوط الإنتاج (Phase 2)</h3>
              <div className="mke-row-wrap">
                {Object.entries(akp.pipelines).map(([key, p]) => (
                  <StatCard
                    key={key}
                    label={`${p.label || key} (${p.publishedToday ?? 0}/${p.quota ?? "—"})`}
                    value={p.publishedToday ?? 0}
                  />
                ))}
              </div>
              {akp.lastRun && (
                <p className="mke-small-info">
                  آخر Run: {akp.lastRun.status} — {akp.lastRun.started_at ? new Date(akp.lastRun.started_at).toLocaleString("ar-KW") : "—"}
                </p>
              )}
              {akp.lastError && (
                <p className="mke-small-err">
                  آخر خطأ: {akp.lastError.message}
                </p>
              )}
              {akp.health?.score != null && (
                <p className="mke-small-info">
                  Health Score: {akp.health.score}% · متوسط التنفيذ: {akp.avgDurationMs ?? "—"}ms · Retry Queue: {akp.retryQueue?.total ?? akp.counts?.retryQueue ?? 0}
                </p>
              )}
              {akp.sourceStatuses && akp.sourceStatuses.length > 0 && (
                <div className="mke-source-statuses">
                  {akp.sourceStatuses.map((s) => (
                    <span
                      key={s.slug}
                      className="mke-source-status"
                      style={{
                        "--mke-ss-bg": s.status === "available" || s.status === "slow" ? "#ecfdf5" : "#fef2f2",
                        "--mke-ss-color": s.status === "available" || s.status === "slow" ? "var(--majalis-emerald-deep)" : "#991B1B",
                      } as React.CSSProperties}
                      title={s.lastError || s.status}
                    >
                      {s.name}: {s.status}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          {intelligenceLayers.length > 0 && (
            <section className="mke-section">
              <h3 className="mke-section-h3">Intelligence Layers ({intelligenceLayers.length})</h3>
              <div className="mke-row-wrap">
                {intelligenceLayers.map((l) => (
                  <span key={l.id} className="mke-tag">{l.label}</span>
                ))}
              </div>
            </section>
          )}

          <section className="mke-section">
            <h3 className="mke-section-h3">حالة الخدمات</h3>
            <div className="mke-service-badges">
              <StatusBadge ok={stats?.vision?.visionEnabled ?? false} label="Vision AI" />
              <StatusBadge ok={(stats?.subsystems?.vision as { visionEnabled?: boolean })?.visionEnabled ?? stats?.vision?.visionEnabled ?? false} label="Vision AI v2" />
              <StatusBadge ok={stats?.database?.status === "connected"} label="قاعدة البيانات" />
              <StatusBadge ok={stats?.search?.embeddings ?? stats?.search?.status === "embeddings_ready"} label="البحث الدلالي" />
              <StatusBadge ok={Boolean(stats?.subsystems?.notifications)} label="الإشعارات" />
            </div>
          </section>

          {stats?.extractionMetrics && (
            <section className="mke-section">
              <h3 className="mke-section-h3">دقة الاستخراج</h3>
              <div className="mke-row-wrap">
                <StatCard label="Vision AI %" value={stats.extractionMetrics.visionAccuracy ?? "—"} />
                <StatCard label="كشف التكرار %" value={stats.extractionMetrics.duplicateDetectionRate ?? "—"} />
                <StatCard label="ربط الشيوخ %" value={stats.extractionMetrics.sheikhMatchRate ?? "—"} />
              </div>
            </section>
          )}

          <section className="mke-section">
            <h3 className="mke-section-h3">Pipeline ({pipelineStages.length} مراحل)</h3>
            <p className="mke-pipeline-text">
              {pipelineStages.map((s) => s.label).join(" → ")}
            </p>
          </section>

          <section className="mke-section">
            <h3 className="mke-section-h3">المنصات المدعومة ({platforms.length})</h3>
            <p className="mke-pipeline-text mke-pipeline-text--spaced">
              {platforms.slice(0, 30).map((p) => p.type).join(" · ")}
              {platforms.length > 30 ? " …" : ""}
            </p>
          </section>

          {stats?.sourcesByType && Object.keys(stats.sourcesByType).length > 0 && (
            <section className="mke-section">
              <h3 className="mke-section-h3">المصادر حسب النوع</h3>
              <div className="mke-row-wrap">
                {Object.entries(stats.sourcesByType).map(([type, count]) => (
                  <span key={type} className="mke-tag-tiny">
                    {type}: {count}
                  </span>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default function MajlisKnowledgeEnginePage() {
  return (
    <AdminShell section="knowledge-engine" onSectionChange={() => {}}>
      <MajlisKnowledgeEngineContent />
    </AdminShell>
  );
}

export { MajlisKnowledgeEngineContent };
