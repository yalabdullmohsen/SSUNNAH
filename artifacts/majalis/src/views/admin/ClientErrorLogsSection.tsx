import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SkeletonCardGrid } from "@/components/ui-common";
import {
  fetchRecentErrorLogs, groupErrorsByRoute,
  type ClientErrorLogRow,
} from "@/lib/client-error-logs-service";
import "@/styles/components/topic-page.css";

export function ClientErrorLogsSection() {
  const [logs, setLogs] = useState<ClientErrorLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [routeFilter, setRouteFilter] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchRecentErrorLogs(200).then(setLogs).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const byRoute = groupErrorsByRoute(logs);
  const filtered = routeFilter ? logs.filter((l) => (l.route || "غير معروف") === routeFilter) : logs;

  if (loading) return <SkeletonCardGrid count={6} />;

  return (
    <div>
      <div className="mir-header">
        <h2 className="mir-title">سجل أخطاء العميل ({logs.length} من آخر 200)</h2>
        <Button type="button" variant="outline" className="mir-add-btn" onClick={load}>↻ تحديث</Button>
      </div>

      <p className="adm-empty-msg" style={{ marginBottom: "0.75rem" }}>
        هذا السجل يعرض أعطال JavaScript الفعلية المُبلَّغة من متصفحات الزوّار
        (لا يشمل أي محتوى شخصي أو تسجيلات صوتية أو نصوصًا حسّاسة).
      </p>

      {byRoute.length > 0 && (
        <div className="fiqh-review-filters">
          <Button type="button" variant="ghost" className={!routeFilter ? "fiqh-review-filter--active" : ""} onClick={() => setRouteFilter(null)}>
            الكل ({logs.length})
          </Button>
          {byRoute.slice(0, 10).map((r) => (
            <Button
              key={r.route}
              type="button"
              variant="ghost"
              className={routeFilter === r.route ? "fiqh-review-filter--active" : ""}
              onClick={() => setRouteFilter(r.route)}
            >
              {r.route} ({r.count})
            </Button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="adm-empty-msg">لا توجد أخطاء مسجَّلة — سليم.</p>
      ) : (
        <div className="fiqh-review-list">
          {filtered.map((log) => (
            <article key={log.id} className="fiqh-review-card ui-card">
              <div className="fiqh-review-card-head">
                <div>
                  <h2>{log.name || "خطأ"}: {log.message.slice(0, 100)}</h2>
                  <p className="fiqh-review-meta">
                    {log.route || "—"} · {log.component || "—"} · {log.device_type || "—"} · {new Date(log.created_at).toLocaleString("ar-KW")}
                  </p>
                </div>
              </div>
              <p className="fiqh-review-meta">إصدار: {log.build_version || "—"} · commit: {(log.commit_hash || "—").slice(0, 8)} · معرّف: {log.error_id}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
