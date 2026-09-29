import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { fetchAnalyticsPlatform } from "../../data/admin-v3-api";
import { canAccessAnalyticsPlatform, resolveGovernanceRole } from "../../permissions";
import {
  AdminLoadGate,
  AdminPageHeader,
  AdminPermissionDenied,
} from "../../ui/primitives";
import { AreaChart, BarChart, HeatmapPlaceholder, LineChart, PieChart } from "./charts";
import { exportAnalyticsCsv, exportAnalyticsExcel, exportAnalyticsJson } from "./export-report";
import type { AnalyticsPlatformPayload, MetricCell } from "./types";

const SECTION_TABS: Array<{ id: string; label: string }> = [
  { id: "executive", label: "تنفيذي" },
  { id: "auth", label: "المصادقة" },
  { id: "content", label: "المحتوى" },
  { id: "quran", label: "القرآن" },
  { id: "learning", label: "التعلم" },
  { id: "search", label: "البحث" },
  { id: "prayer", label: "الصلاة" },
  { id: "technical", label: "تقني" },
  { id: "api", label: "API" },
  { id: "device", label: "الأجهزة" },
  { id: "geo", label: "جغرافي" },
  { id: "retention", label: "الاحتفاظ" },
  { id: "realtime", label: "لحظي" },
  { id: "alerts", label: "تنبيهات" },
];

function MetricCard({ title, cell }: { title: string; cell?: MetricCell }) {
  if (!cell || cell.status === "no_data") {
    return (
      <article className="av3-an-metric av3-an-metric--empty">
        <h4>{title}</h4>
        <p className="av3-an-nodata">NO DATA AVAILABLE</p>
      </article>
    );
  }
  return (
    <article className="av3-an-metric">
      <h4>{title}</h4>
      <p className="av3-an-metric__value">{formatNumber(cell.value)}</p>
    </article>
  );
}

function formatNumber(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("ar-SA").format(n);
}

function StatusBadge({ status }: { status?: string }) {
  const s = status || "NO_DATA";
  return <span className={`av3-an-badge av3-an-badge--${s.toLowerCase()}`}>{s}</span>;
}

function seriesValues(series: Array<Record<string, string | number>> | undefined, key: string): number[] {
  if (!series?.length) return [];
  return series.map((r) => Number(r[key] ?? 0));
}

function seriesLabels(series: Array<Record<string, string | number>> | undefined, key: string): string[] {
  if (!series?.length) return [];
  return series.map((r) => String(r[key] ?? ""));
}

export function AnalyticsPlatformPage() {
  const { user } = useAuth();
  const role = resolveGovernanceRole(user);
  const allowed = canAccessAnalyticsPlatform(role, user);

  const [tab, setTab] = useState("executive");
  const [payload, setPayload] = useState<AnalyticsPlatformPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const load = useCallback(
    async (opts?: { force?: boolean; signal?: AbortSignal }) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAnalyticsPlatform({ days, force: opts?.force }, opts?.signal);
        setPayload(data);
      } catch (e) {
        const err = e as { status?: number; userMessageAr?: string; message?: string };
        if (err.status === 403) {
          setError("403 — منصة التحليلات للمدير والمشرف الأعلى فقط.");
        } else {
          setError(err.userMessageAr || err.message || "تعذّر جلب التحليلات.");
        }
        setPayload(null);
      } finally {
        setLoading(false);
      }
    },
    [days],
  );

  useEffect(() => {
    if (!allowed) {
      setLoading(false);
      return;
    }
    const ac = new AbortController();
    void load({ signal: ac.signal });
    return () => ac.abort();
  }, [allowed, load]);

  // Realtime tab soft refresh when that section exists with auto_refresh_sec
  useEffect(() => {
    if (!allowed || tab !== "realtime" || !payload) return;
    const sec = Number((payload.sections.realtime as { auto_refresh_sec?: number })?.auto_refresh_sec || 30);
    const id = window.setInterval(() => {
      void load({ force: true });
    }, Math.max(15, sec) * 1000);
    return () => window.clearInterval(id);
  }, [allowed, tab, payload, load]);

  if (!allowed) {
    return <AdminPermissionDenied permission="analytics.read" />;
  }

  const section = payload?.sections?.[tab];

  return (
    <div className="av3-domain av3-analytics">
      <AdminPageHeader
        title="منصة التحليلات"
        description="المرجع الرسمي لإحصاءات سُنّة — بيانات حقيقية فقط، بلا تقديرات."
        badge={payload?.meta?.platformStatus || "PARTIAL"}
        crumbs={[
          { label: "لوحة التحكم", href: "/admin/v3" },
          { label: "التحليلات" },
        ]}
      />

      <div className="av3-an-toolbar">
        <label className="av3-an-toolbar__days">
          الفترة
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="أيام التحليل">
            <option value={7}>7 أيام</option>
            <option value={30}>30 يومًا</option>
            <option value={90}>90 يومًا</option>
          </select>
        </label>
        <Button type="button" variant="secondary" onClick={() => void load({ force: true })}>
          تحديث
        </Button>
        <Button type="button" variant="secondary" disabled={!payload} onClick={() => payload && exportAnalyticsCsv(payload, tab)}>
          CSV
        </Button>
        <Button type="button" variant="secondary" disabled={!payload} onClick={() => payload && exportAnalyticsExcel(payload, tab)}>
          Excel
        </Button>
        <Button type="button" variant="secondary" disabled={!payload} onClick={() => payload && exportAnalyticsJson(payload, tab)}>
          JSON
        </Button>
        <Button type="button" variant="primary" disabled={!payload} onClick={() => payload && exportAnalyticsJson(payload)}>
          تصدير الكل
        </Button>
      </div>

      <nav className="av3-an-tabs" aria-label="أقسام التحليلات">
        {SECTION_TABS.map((t) => (
          <Button
            key={t.id}
            type="button"
            variant={tab === t.id ? "secondary" : "ghost"}
            className={`av3-an-tab${tab === t.id ? " is-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {payload?.sections?.[t.id] ? (
              <StatusBadge status={String(payload.sections[t.id]?.status)} />
            ) : null}
          </Button>
        ))}
      </nav>

      <AdminLoadGate loading={loading} error={error}>
        {payload && section ? (
          <SectionBody tab={tab} section={section} payload={payload} />
        ) : null}
      </AdminLoadGate>

      {payload?.meta ? (
        <footer className="av3-an-meta">
          <p>
            الحالة: <StatusBadge status={payload.meta.platformStatus} /> · تولّد:{" "}
            {payload.generatedAt || "—"} · كاش: {payload.meta.cache || "—"}
          </p>
          <p className="av3-muted">المصادر: {(payload.meta.sources || []).join(" · ") || "—"}</p>
          <p className="av3-muted">
            لا بيانات: {(payload.meta.noDataAreas || []).slice(0, 8).join(" · ")}
            {(payload.meta.noDataAreas || []).length > 8 ? "…" : ""}
          </p>
        </footer>
      ) : null}
    </div>
  );
}

function SectionBody({
  tab,
  section,
  payload,
}: {
  tab: string;
  section: NonNullable<AnalyticsPlatformPayload["sections"][string]>;
  payload: AnalyticsPlatformPayload;
}) {
  const metrics = section.metrics || {};
  const charts = section.charts || {};

  return (
    <div className="av3-an-section">
      <header className="av3-an-section__head">
        <h2>{SECTION_TABS.find((t) => t.id === tab)?.label || tab}</h2>
        <StatusBadge status={String(section.status)} />
      </header>
      {section.label === "NO DATA AVAILABLE" || section.status === "NO_DATA" ? (
        <p className="av3-an-nodata av3-an-nodata--banner" role="status">
          NO DATA AVAILABLE
          {section.reason ? <span className="av3-muted"> — {String(section.reason)}</span> : null}
        </p>
      ) : null}

      {tab === "executive" ? (
        <>
          <div className="av3-an-grid">
            <MetricCard title="إجمالي المستخدمين" cell={metrics.total_users} />
            <MetricCard title="المؤكدون" cell={metrics.confirmed_users} />
            <MetricCard title="الجدد (اليوم)" cell={metrics.new_users_today} />
            <MetricCard title="النشطون" cell={metrics.active_users} />
            <MetricCard title="DAU" cell={metrics.dau} />
            <MetricCard title="WAU" cell={metrics.wau} />
            <MetricCard title="MAU" cell={metrics.mau} />
            <MetricCard title="تسجيلات اليوم" cell={metrics.signups_today} />
            <MetricCard title="تسجيلات الأسبوع" cell={metrics.signups_week} />
            <MetricCard title="تسجيلات الشهر" cell={metrics.signups_month} />
            <MetricCard title="معدل النمو اليومي" cell={metrics.daily_growth_rate} />
            <MetricCard title="معدل الاحتفاظ" cell={metrics.retention_rate} />
          </div>
          <div className="av3-an-charts">
            <AreaChart
              title="مستخدمون يوميًا (تسجيلات)"
              values={seriesValues(charts.users_daily?.series, "count")}
            />
            <BarChart
              title="نمو شهري"
              items={(charts.monthly_growth?.series || []).map((r) => ({
                label: String(r.month),
                count: Number(r.count || 0),
              }))}
            />
            <LineChart
              title="عودة المستخدمين"
              values={seriesValues(charts.returning_users?.series, "count")}
              labels={seriesLabels(charts.returning_users?.series, "date")}
            />
            <LineChart
              title="اتجاه النشاط"
              values={seriesValues(charts.activity_trend?.series, "count")}
            />
          </div>
        </>
      ) : null}

      {tab === "auth" ? (
        <>
          <div className="av3-an-grid">
            <MetricCard title="حسابات جديدة" cell={metrics.new_accounts} />
            <MetricCard title="تفعيل البريد" cell={metrics.email_activations} />
            <MetricCard title="غير مؤكدة" cell={metrics.unconfirmed_accounts} />
            <MetricCard title="فشل التسجيل" cell={metrics.failed_signups} />
            <MetricCard title="weak_password" cell={metrics.weak_password} />
            <MetricCard title="email_not_confirmed" cell={metrics.email_not_confirmed} />
            <MetricCard title="rate_limit" cell={metrics.rate_limit} />
            <MetricCard title="already_registered" cell={metrics.already_registered} />
          </div>
          <div className="av3-an-charts">
            <PieChart
              title="Success vs Failure"
              items={(charts.success_vs_failure?.series || []).map((r) => ({
                label: String(r.label),
                count: Number(r.count || 0),
              }))}
            />
          </div>
          <FunnelView funnel={section.funnel as { steps?: Array<{ id: string; label: string; value: number | null }>; label?: string }} />
        </>
      ) : null}

      {tab === "content" ? (
        <>
          <div className="av3-an-grid">
            <MetricCard title="متوسط البقاء" cell={metrics.avg_dwell} />
            <MetricCard title="معدل الخروج" cell={metrics.bounce_rate} />
            <MetricCard title="معدل العودة" cell={metrics.return_rate} />
            <MetricCard title="الفتحات" cell={metrics.opens} />
          </div>
          <KnownRoutesList routes={section.known_routes as Array<{ path: string; label: string }> | undefined} />
        </>
      ) : null}

      {tab === "quran" ? (
        <>
          <div className="av3-an-grid">
            <MetricCard title="أكثر السور" cell={metrics.top_surahs} />
            <MetricCard title="أكثر الصفحات" cell={metrics.top_pages} />
            <MetricCard title="الأجزاء" cell={metrics.top_juz} />
            <MetricCard title="البحث القرآني" cell={metrics.top_searches} />
            <MetricCard title="الفواصل" cell={metrics.bookmarks} />
            <MetricCard title="العلامات" cell={metrics.markers} />
            <MetricCard title="تقدم القراءة" cell={metrics.reading_progress} />
            <MetricCard title="متوسط الجلسة (د)" cell={metrics.avg_session_minutes} />
          </div>
          <div className="av3-an-charts">
            <LineChart title="Daily Quran Activity" values={seriesValues(charts.daily?.series, "count")} />
            <LineChart title="Weekly Quran Activity" values={seriesValues(charts.weekly?.series, "count")} />
            <LineChart title="Monthly Quran Activity" values={seriesValues(charts.monthly?.series, "count")} />
          </div>
        </>
      ) : null}

      {tab === "learning" ? (
        <>
          <div className="av3-an-grid">
            <MetricCard title="Enrollment" cell={metrics.enrollments} />
            <MetricCard title="Completion" cell={metrics.completion_rate} />
            <MetricCard title="Certificates" cell={metrics.certificates} />
          </div>
          <BarChart
            title="أكثر الدروس"
            items={((section.top_lessons as Array<{ title?: string; id?: string; count?: number }>) || []).map((l) => ({
              label: String(l.title || l.id || "—"),
              count: Number(l.count || 0),
            }))}
          />
          <FunnelView funnel={section.funnel as { steps?: Array<{ id: string; label: string; value: number | null }>; label?: string }} />
        </>
      ) : null}

      {tab === "search" ? (
        <>
          <div className="av3-an-grid">
            <MetricCard title="إجمالي البحث" cell={metrics.total_searches} />
            <MetricCard title="Success Rate %" cell={metrics.success_rate} />
            <MetricCard title="Exit Rate" cell={metrics.exit_rate} />
            <MetricCard title="Search → Content" cell={metrics.content_conversion} />
            <MetricCard title="متوسط الاستجابة (ms)" cell={metrics.avg_response_ms} />
          </div>
          <div className="av3-an-charts">
            <BarChart
              title="Top Queries"
              items={((section.top_queries as Array<{ query: string; count: number }>) || []).map((q) => ({
                label: q.query,
                count: q.count,
              }))}
            />
            <BarChart
              title="استعلامات بلا نتائج"
              items={((section.zero_result_queries as Array<{ query: string; count: number }>) || []).map((q) => ({
                label: q.query,
                count: q.count,
              }))}
            />
            <PieChart
              title="Success vs Failure"
              items={(charts.success_vs_failure?.series || []).map((r) => ({
                label: String(r.label),
                count: Number(r.count || 0),
              }))}
            />
          </div>
        </>
      ) : null}

      {tab === "prayer" ? (
        <div className="av3-an-grid">
          <MetricCard title="أكثر المدن" cell={metrics.top_cities} />
          <MetricCard title="فتح صفحة الصلاة" cell={metrics.prayer_page_opens} />
          <MetricCard title="تشغيل الأذان" cell={metrics.adhan_plays} />
          <MetricCard title="تنبيهات محلية" cell={metrics.local_notifications} />
          <MetricCard title="السماح بالإشعارات %" cell={metrics.notification_permission_rate} />
        </div>
      ) : null}

      {tab === "technical" ? (
        <div className="av3-an-grid">
          <MetricCard title="Page Load" cell={metrics.page_load} />
          <MetricCard title="LCP" cell={metrics.lcp} />
          <MetricCard title="CLS" cell={metrics.cls} />
          <MetricCard title="INP" cell={metrics.inp} />
          <MetricCard title="FCP" cell={metrics.fcp} />
          <MetricCard title="Chunk Errors" cell={metrics.chunk_errors} />
          <MetricCard title="Runtime Errors" cell={metrics.runtime_errors} />
          <MetricCard title="Error Rate" cell={metrics.error_rate} />
        </div>
      ) : null}

      {tab === "api" || tab === "device" ? (
        <p className="av3-an-nodata av3-an-nodata--banner">NO DATA AVAILABLE</p>
      ) : null}

      {tab === "geo" ? (
        <>
          <BarChart
            title="Top Cities"
            items={((section.top_cities as Array<{ city: string; count: number }>) || []).map((c) => ({
              label: c.city,
              count: c.count,
            }))}
          />
          <BarChart title="Top Countries" items={[]} />
          <HeatmapPlaceholder />
        </>
      ) : null}

      {tab === "retention" ? (
        <div className="av3-an-grid">
          <MetricCard title="D1" cell={section.d1 as MetricCell | undefined} />
          <MetricCard title="D7" cell={section.d7 as MetricCell | undefined} />
          <MetricCard title="D30" cell={section.d30 as MetricCell | undefined} />
          <MetricCard title="Churn" cell={section.churn as MetricCell | undefined} />
          <MetricCard title="Returning Users" cell={section.returning_users as MetricCell | undefined} />
        </div>
      ) : null}

      {tab === "realtime" ? (
        <div className="av3-an-grid">
          <MetricCard title="نشطون الآن" cell={(section as { active_users_now?: MetricCell }).active_users_now} />
          <MetricCard title="الجلسات" cell={(section as { active_sessions?: MetricCell }).active_sessions} />
          <MetricCard title="حمل API" cell={(section as { current_api_load?: MetricCell }).current_api_load} />
        </div>
      ) : null}

      {tab === "alerts" ? (
        <ul className="av3-an-alerts">
          {((section.rules as Array<{ id: string; label: string; state: string }>) || []).map((r) => (
            <li key={r.id}>
              <strong>{r.label}</strong>
              <span className="av3-muted">{r.state}</span>
            </li>
          ))}
          {((section.items as unknown[]) || []).length === 0 ? (
            <li className="av3-an-nodata">NO DATA AVAILABLE — لا تنبيهات قابلة للتقييم بعد</li>
          ) : null}
        </ul>
      ) : null}

      <p className="av3-muted av3-an-section__export-hint">
        التصدير للقسم الحالي أو للكل من الشريط أعلاه — تجميعي بلا بريد أو أسرار.
        {payload.access?.role ? ` · دورك: ${payload.access.role}` : ""}
      </p>
    </div>
  );
}

function FunnelView({
  funnel,
}: {
  funnel?: { steps?: Array<{ id: string; label: string; value: number | null }>; label?: string };
}) {
  if (!funnel?.steps?.length) return null;
  const any = funnel.steps.some((s) => s.value != null);
  return (
    <section className="av3-an-funnel" aria-label="Conversion Funnel">
      <h3>Conversion Funnel</h3>
      {!any || funnel.label === "NO DATA AVAILABLE" ? (
        <p className="av3-an-nodata">NO DATA AVAILABLE</p>
      ) : null}
      <ol>
        {funnel.steps.map((s) => (
          <li key={s.id}>
            <span>{s.label}</span>
            <strong>{s.value == null ? "—" : formatNumber(s.value)}</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}

function KnownRoutesList({ routes }: { routes?: Array<{ path: string; label: string }> }) {
  if (!routes?.length) return null;
  return (
    <section className="av3-an-known-routes">
      <h3>مسارات المحتوى المعروفة (بلا عدّاد زيارات)</h3>
      <ul>
        {routes.map((r) => (
          <li key={r.path}>
            <code>{r.path}</code>
            <span>{r.label}</span>
            <span className="av3-an-nodata">NO DATA AVAILABLE</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
