import { AdminStatCard } from "@/components/admin/AdminLayout";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SkeletonCardGrid } from "@/components/ui-common";
import { useAdminShell } from "@/views/admin/AdminShell";
import {
  fetchScholarlyDashboard,
  runScholarlyScan,
  searchScholarly,
  type ScholarlyDashboard,
  type ScholarlyVerificationReport,
} from "@/lib/scholarly-verification-service";


export function ScholarlyVerificationSection() {
  const { showSuccess, showError } = useAdminShell();
  const [data, setData] = useState<ScholarlyDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<Array<Record<string, unknown>>>([]);

  const report = data?.report as ScholarlyVerificationReport | undefined;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchScholarlyDashboard();
      setData(result);
    } catch {
      showError("تعذر تحميل لوحة التوثيق العلمي.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleScan = async (checkLinks = false) => {
    setScanning(true);
    try {
      await runScholarlyScan({ checkLinks, persist: false });
      showSuccess("اكتمل فحص التوثيق.");
      await load();
    } catch {
      showError("فشل فحص التوثيق.");
    } finally {
      setScanning(false);
    }
  };

  const handleSearch = async () => {
    try {
      const result = await searchScholarly({ query: searchQ, limit: 20 });
      setSearchResults(result.results ?? []);
    } catch {
      showError("فشل البحث العلمي.");
    }
  };

  if (loading && !data) return <SkeletonCardGrid count={6} />;

  const sectionStats = report?.section_stats ?? {};

  return (
    <div>
      <div className="svs-header">
        <div>
          <h2 className="svs-title">التوثيق والتحقق العلمي</h2>
          <p className="svs-subtitle">
            لا نشر بدون مصدر — مراجعة شاملة قبل الظهور العام
          </p>
        </div>
        <div className="svs-btn-group">
          <Button type="button" variant="primary" disabled={scanning} onClick={() => handleScan(false)} className="svs-btn--primary">
            {scanning ? "جاري الفحص…" : "فحص التوثيق"}
          </Button>
          <Button type="button" variant="outline" disabled={scanning} onClick={() => handleScan(true)} className="svs-btn">
            فحص + روابط
          </Button>
        </div>
      </div>

      <div className="svs-stats-grid">
        <AdminStatCard label="اكتمال التوثيق" value={`${report?.documentation_completeness_percent ?? 0}%`} />
        <AdminStatCard label="موثّق" value={report?.verified_count ?? 0} />
        <AdminStatCard label="يحتاج مراجعة" value={report?.needs_review_count ?? 0} />
        <AdminStatCard label="مرفوض" value={report?.rejected_count ?? 0} />
        <AdminStatCard label="مكرر" value={report?.duplicate_count ?? 0} />
        <AdminStatCard label="روابط معطلة" value={report?.broken_links_count ?? 0} />
        <AdminStatCard label="جاهزية المرجع" value={`${report?.readiness_score ?? 0}%`} sub={`${report?.items_scanned ?? 0} عنصر`} />
      </div>

      <h3 className="svs-section-h3">جودة كل قسم</h3>
      <div className="svs-table-wrap">
        <table className="svs-table">
          <thead>
            <tr className="svs-thead-row">
              <th className="svs-th">القسم</th>
              <th className="svs-th">الإجمالي</th>
              <th className="svs-th">موثّق</th>
              <th className="svs-th">مراجعة</th>
              <th className="svs-th">مرفوض</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(sectionStats).map(([type, stats]) => (
              <tr key={type}>
                <td className="svs-td">{type}</td>
                <td className="svs-td">{stats.total}</td>
                <td className="svs-td svs-td--accent">{stats.verified}</td>
                <td className="svs-td">{stats.needs_review}</td>
                <td className="svs-td svs-td--red">{stats.rejected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="svs-section-h3">بحث علمي متقدم</h3>
      <div className="svs-search-row">
        <input
          type="search"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="مصدر، مؤلف، عنوان…"
          className="svs-search-input"
        />
        <Button type="button" variant="primary" onClick={handleSearch} className="svs-search-btn">
          بحث
        </Button>
      </div>
      {searchResults.length > 0 && (
        <ul className="svs-results">
          {searchResults.map((r, i) => (
            <li key={`${r.content_id}-${i}`}>
              <strong>{String(r.title ?? r.content_id)}</strong> — {String(r.source_name)} ({String(r.verification_status)})
            </li>
          ))}
        </ul>
      )}

      {report?.next_priorities && report.next_priorities.length > 0 && (
        <div className="svs-priorities">
          <h3 className="svs-priorities-h3">أولويات التطوير</h3>
          <ul className="svs-priorities-ul">
            {report.next_priorities.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
