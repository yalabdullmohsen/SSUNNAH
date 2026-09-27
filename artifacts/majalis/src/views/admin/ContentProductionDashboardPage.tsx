import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import {
  getContentProductionDashboard,
  runContentProductionJob,
  type ContentProductionDashboard,
} from "@/lib/content-production-api";
import { SkeletonCardGrid } from "@/components/ui-common";
import { AdminShell } from "@/views/admin/AdminShell";

function StatCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="cpd-stat" style={color ? { "--cpd-val-color": color } as React.CSSProperties : undefined}>
      <div className="cpd-stat__value">{value}</div>
      <div className="cpd-stat__label">{label}</div>
    </div>
  );
}

function ContentProductionDashboardContent() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ContentProductionDashboard | null>(null);
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    getContentProductionDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const triggerJob = async (jobId: string) => {
    setRunningJob(jobId);
    setJobError(null);
    try {
      await runContentProductionJob(jobId);
      load();
    } catch {
      setJobError("تعذّر تشغيل المهمة.");
    } finally {
      setRunningJob(null);
    }
  };

  const prod = data?.production;
  const obs = data?.observability;
  const lastRun = obs?.runs?.[0] as { job_id?: string; started_at?: string; status?: string; duration_ms?: number } | undefined;

  return (
    <div>
      <div className="cpd-header">
        <div>
          <h2 className="cpd-title">إنتاج المحتوى الذاتي — Phase 4</h2>
          <p className="cpd-subtitle">
            Source → Validation → Dedup → Classification → Quality → Publishing → Indexing → Search → Statistics
          </p>
        </div>
        <div className="cpd-links">
          <Link href="/admin/automation/review" className="cpd-link">مركز المراجعة</Link>
          <Link href="/admin/automation/dashboard" className="cpd-link">أتمتة الدروس</Link>
          <Link href="/admin/auto-content" className="cpd-link">المقالات RSS</Link>
        </div>
      </div>

      {jobError && (
        <p role="alert" className="cpd-error">{jobError}</p>
      )}

      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : (
        <>
          <div className="cpd-stats-row">
            <StatCard label="جاهزية النظام" value={`${data?.readiness?.score ?? 0}%`} />
            <StatCard label="إنتاج اليوم" value={prod?.today?.published ?? 0} />
            <StatCard label="إنتاج الأسبوع" value={prod?.week?.published ?? 0} />
            <StatCard label="إنتاج الشهر" value={prod?.month?.published ?? 0} />
            <StatCard label="مرفوض اليوم" value={prod?.today?.rejected ?? 0} color="var(--mj-brand-deep)" />
            <StatCard label="مكرر اليوم" value={prod?.today?.duplicate ?? 0} />
            <StatCard label="مصادر نشطة" value={data?.readiness?.activeSources ?? 0} />
            <StatCard label="تنبيهات" value={data?.readiness?.openAlerts ?? 0} color="#991B1B" />
          </div>

          <section className="cpd-section">
            <h3 className="cpd-section-h3">Cron Jobs</h3>
            <div className="cpd-jobs-list">
              {(data?.jobs || []).map((job: NonNullable<ContentProductionDashboard["jobs"]>[number]) => (
                <div key={job.id} className="cpd-job-row">
                  <div>
                    <strong>{job.name_ar}</strong> · {job.interval_label}
                    {job.last_run_at && (
                      <span className="cpd-job-time">
                        {" "}
                        — آخر تشغيل: {new Date(job.last_run_at).toLocaleString("ar-EG")}
                        {job.last_duration_ms ? ` (${job.last_duration_ms}ms)` : ""}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={runningJob === job.id}
                    onClick={() => triggerJob(job.id)}
                    className="cpd-job-btn"
                  >
                    {runningJob === job.id ? "..." : "تشغيل"}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="cpd-section">
            <h3 className="cpd-section-h3">Pipelines ({Object.keys(data?.pipelines || {}).length})</h3>
            <div className="cpd-pipelines">
              {Object.entries(data?.pipelines || {}).map(([id, p]) => {
                const pipe = p as { labelAr?: string; dailyQuota?: number; weeklyQuota?: number };
                return (
                  <span key={id} className="cpd-pipeline-tag">
                    {pipe.labelAr || id}
                    {pipe.dailyQuota ? ` · ${pipe.dailyQuota}/يوم` : ""}
                    {pipe.weeklyQuota ? ` · ${pipe.weeklyQuota}/أسبوع` : ""}
                  </span>
                );
              })}
            </div>
          </section>

          <section className="cpd-section">
            <h3 className="cpd-section-h3">Monitoring</h3>
            <div className="cpd-monitor-row">
              <StatCard label="Retry Queue" value={obs?.retries?.length ?? 0} />
              <StatCard label="Dead Letter" value={obs?.dlq?.length ?? 0} />
              <StatCard label="سجلات" value={obs?.logs?.length ?? 0} />
            </div>
            {lastRun && (
              <p className="cpd-last-run">
                آخر Cron: {lastRun.job_id} — {lastRun.status} — {lastRun.duration_ms ?? "?"}ms
              </p>
            )}
            <div className="cpd-logs-list">
              {(obs?.logs || []).slice(0, 12).map((log: { id?: string; stage?: string; message?: string; level?: string }) => (
                <div key={log.id} className="cpd-log-item">
                  [{log.level}] {log.stage}: {log.message}
                </div>
              ))}
            </div>
          </section>

          <section className="cpd-section">
            <h3 className="cpd-section-h3">المصادر الموثقة ({data?.sources?.length ?? 0})</h3>
            <div className="cpd-sources-list">
              {(data?.sources || []).map((s: NonNullable<ContentProductionDashboard["sources"]>[number]) => (
                <div key={s.slug} className="cpd-source-item">
                  <strong>{s.name}</strong> · {s.pipeline} · ثقة {s.trust_level}%
                  {!s.active && " (معطّل)"}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default function ContentProductionDashboardPage() {
  return (
    <AdminShell section="knowledge-engine" onSectionChange={() => {}}>
      <ContentProductionDashboardContent />
    </AdminShell>
  );
}

export function ContentProductionSection() {
  return <ContentProductionDashboardContent />;
}
