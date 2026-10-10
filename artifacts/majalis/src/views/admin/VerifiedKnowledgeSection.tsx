import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SkeletonCardGrid } from "@/design-system";
import { useAdminShell } from "@/views/admin/AdminShell";
import {
  bootstrapVerifiedKnowledge,
  fetchVerifiedKnowledgeDashboard,
  runVerifiedKnowledgeCycle,
  type QualityGap,
  type QualityReport,
  type VerifiedKnowledgeDashboard,
} from "@/lib/verified-knowledge-service";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="svs-stat">
      <p className="svs-stat__label">{label}</p>
      <p className="svs-stat__value">{value}</p>
      {sub && <p className="svs-stat__sub">{sub}</p>}
    </div>
  );
}

function gapLabel(reason: string) {
  if (reason === "empty_section") return "قسم فارغ";
  if (reason === "unverified_content") return "محتوى غير موثّق";
  return reason;
}

function priorityColor(priority: QualityGap["priority"]) {
  if (priority === "high") return "#991B1B";
  if (priority === "medium") return "var(--mj-brand-deep)";
  return "var(--majalis-ink-soft)";
}

export function VerifiedKnowledgeSection() {
  const { showSuccess, showError } = useAdminShell();
  const [data, setData] = useState<VerifiedKnowledgeDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  const report = data?.report as QualityReport | undefined;
  const sources = data?.sources;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchVerifiedKnowledgeDashboard();
      setData(result);
    } catch {
      showError("تعذر تحميل لوحة المعرفة الموثقة.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRun = async (checkLinks = false) => {
    setRunning(true);
    try {
      await runVerifiedKnowledgeCycle({ checkLinks, persistVerification: true });
      showSuccess("اكتملت دورة الاستيراد والتحقق.");
      await load();
    } catch {
      showError("فشلت دورة المعرفة الموثقة.");
    } finally {
      setRunning(false);
    }
  };

  const handleBootstrap = async () => {
    setBootstrapping(true);
    try {
      await bootstrapVerifiedKnowledge({ persistProvenance: true });
      showSuccess("اكتملت تهيئة الأذكار والأحاديث.");
      await load();
    } catch {
      showError("فشلت تهيئة المحتوى الموثق.");
    } finally {
      setBootstrapping(false);
    }
  };

  if (loading && !data) return <SkeletonCardGrid count={6} />;

  const totals = report?.totals ?? {};
  const gaps = report?.gaps ?? [];
  const sections = report?.sections ?? {};

  return (
    <div>
      <div className="svs-header">
        <div>
          <h2 className="svs-title">قاعدة المعرفة الموثقة</h2>
          <p className="svs-subtitle">
            استيراد ذكي — مصادر رسمية — نشر تلقائي عند ثقة ≥ 90%
          </p>
        </div>
        <div className="svs-btn-group">
          <Button type="button" variant="primary" disabled={running} onClick={() => handleRun(false)} className="svs-btn--primary">
            {running ? "جاري التشغيل…" : "تشغيل الدورة"}
          </Button>
          <Button type="button" variant="outline" disabled={running} onClick={() => handleRun(true)} className="svs-btn">
            دورة + فحص روابط
          </Button>
          <Button type="button" variant="outline" disabled={bootstrapping} onClick={handleBootstrap} className="svs-btn">
            {bootstrapping ? "جاري التهيئة…" : "تهيئة الأذكار/الأحاديث"}
          </Button>
        </div>
      </div>

      <div className="svs-stats-grid">
        <StatCard label="المصادر" value={sources?.total ?? totals.sources_total ?? 0} sub={`${sources?.active ?? totals.sources_active ?? 0} نشط`} />
        <StatCard label="أذكار موثّقة" value={totals.verified_adhkar ?? 0} />
        <StatCard label="أحاديث موثّقة" value={totals.verified_hadith ?? 0} />
        <StatCard label="سجل المصادر" value={totals.provenance_verified ?? 0} />
        <StatCard label="فجوات" value={totals.gaps_count ?? gaps.length} />
        <StatCard label="Seed corpus" value={totals.seed_corpus_total ?? 0} />
      </div>

      {(report?.recommendations?.length ?? 0) > 0 && (
        <div className="vks-recs">
          <p className="vks-recs-title">توصيات</p>
          <ul className="vks-recs-list">
            {report?.recommendations?.map((rec) => (
              <li key={rec}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      <h3 className="svs-section-h3">فجوات المحتوى</h3>
      <div className="svs-table-wrap">
        <table className="svs-table">
          <thead>
            <tr className="svs-thead-row">
              <th className="svs-th">القسم</th>
              <th className="svs-th">السبب</th>
              <th className="svs-th">الأولوية</th>
            </tr>
          </thead>
          <tbody>
            {gaps.length === 0 ? (
              <tr>
                <td colSpan={3} className="svs-td svs-td--center">
                  لا توجد فجوات — جميع الأقسام تحتوي على محتوى
                </td>
              </tr>
            ) : (
              gaps.map((gap) => (
                <tr key={`${gap.section}-${gap.reason}`}>
                  <td className="svs-td">{gap.section}</td>
                  <td className="svs-td">{gapLabel(gap.reason)}</td>
                  <td
                    className="vks-td--priority"
                    style={{ "--vks-priority-color": priorityColor(gap.priority) } as React.CSSProperties}
                  >
                    {gap.priority}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h3 className="svs-section-h3">جودة الأقسام</h3>
      <div className="svs-table-wrap">
        <table className="svs-table">
          <thead>
            <tr className="svs-thead-row">
              <th className="svs-th">القسم</th>
              <th className="svs-th">Seed</th>
              <th className="svs-th">DB</th>
              <th className="svs-th">موثّق</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(sections).map(([key, stats]) => (
              <tr key={key}>
                <td className="svs-td">{key}</td>
                <td className="svs-td">
                  {stats.seed ?? stats.seed_items ?? stats.seed_categories ?? "—"}
                </td>
                <td className="svs-td">{stats.db?.total ?? 0}</td>
                <td className="svs-td svs-td--accent">{stats.db?.verified ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="svs-section-h3">سجل المصادر الرسمية</h3>
      <div className="svs-table-wrap">
        <table className="svs-table">
          <thead>
            <tr className="svs-thead-row">
              <th className="svs-th">المصدر</th>
              <th className="svs-th">النوع</th>
              <th className="svs-th">الثقة</th>
              <th className="svs-th">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {(sources?.sources ?? []).slice(0, 30).map((src) => (
              <tr key={src.slug}>
                <td className="svs-td">{src.name_ar ?? src.name}</td>
                <td className="svs-td">{src.import_method ?? src.source_type}</td>
                <td className="svs-td">{src.trust_level}%</td>
                <td
                  className="vks-td--active"
                  style={{ "--vks-src-color": src.is_active ? "var(--majalis-emerald-deep)" : "var(--majalis-ink-soft)" } as React.CSSProperties}
                >
                  {src.is_active ? "نشط" : "معطّل"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
