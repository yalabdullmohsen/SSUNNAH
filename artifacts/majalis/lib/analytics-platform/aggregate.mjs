/**
 * Analytics Platform aggregations — real sources only.
 * Missing telemetry → status "no_data" (never invent numbers).
 */

import { getSearchAnalytics } from "../scholarly-intelligence/analytics.mjs";
import { getAdminLearningStats } from "../digital-learning/analytics.mjs";

const CACHE_TTL_MS = 60_000;
let cache = { at: 0, key: "", payload: null };

function noData(reason) {
  return { status: "no_data", value: null, label: "NO DATA AVAILABLE", reason: reason || null };
}

function ok(value, source) {
  return { status: "ok", value, source: source || null };
}

function startOfUtcDay(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function isoDaysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function sectionStatus(parts) {
  const statuses = parts.map((p) => p?.status || (p == null ? "no_data" : "ok"));
  const okN = statuses.filter((s) => s === "ok").length;
  const noN = statuses.filter((s) => s === "no_data").length;
  if (okN === 0) return "NO_DATA";
  if (noN === 0) return "READY";
  return "PARTIAL";
}

async function countProfiles(admin, filterFn) {
  let q = admin.from("profiles").select("id", { count: "exact", head: true });
  if (filterFn) q = filterFn(q);
  const { count, error } = await q;
  if (error) return null;
  return typeof count === "number" ? count : 0;
}

async function buildUserMetrics(admin) {
  if (!admin) {
    return {
      status: "NO_DATA",
      metrics: {},
      charts: {},
      unavailable: ["supabase_admin"],
    };
  }

  const day0 = startOfUtcDay().toISOString();
  const week0 = isoDaysAgo(7);
  const month0 = isoDaysAgo(30);

  const [total, newToday, newWeek, newMonth] = await Promise.all([
    countProfiles(admin),
    countProfiles(admin, (q) => q.gte("created_at", day0)),
    countProfiles(admin, (q) => q.gte("created_at", week0)),
    countProfiles(admin, (q) => q.gte("created_at", month0)),
  ]);

  if (total == null) {
    return {
      status: "NO_DATA",
      metrics: {},
      charts: {},
      unavailable: ["profiles_query_failed"],
    };
  }

  // Daily signups (last 30d) — created_at only, capped rows for aggregation
  let dailySeries = [];
  let monthlySeries = [];
  try {
    const { data: rows, error } = await admin
      .from("profiles")
      .select("created_at")
      .gte("created_at", isoDaysAgo(90))
      .order("created_at", { ascending: true })
      .limit(5000);
    if (!error && rows?.length) {
      const byDay = new Map();
      const byMonth = new Map();
      for (const r of rows) {
        const d = String(r.created_at || "").slice(0, 10);
        const m = String(r.created_at || "").slice(0, 7);
        if (d) byDay.set(d, (byDay.get(d) || 0) + 1);
        if (m) byMonth.set(m, (byMonth.get(m) || 0) + 1);
      }
      const last30 = [];
      for (let i = 29; i >= 0; i--) {
        const dt = new Date(Date.now() - i * 86400000);
        const key = dt.toISOString().slice(0, 10);
        last30.push({ date: key, count: byDay.get(key) || 0 });
      }
      dailySeries = last30;
      monthlySeries = [...byMonth.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, count]) => ({ month, count }));
    }
  } catch {
    /* keep empty */
  }

  const avgDailyGrowth =
    dailySeries.length >= 2
      ? Math.round(
          (dailySeries.reduce((s, p) => s + p.count, 0) / dailySeries.length) * 100,
        ) / 100
      : null;

  // Confirmed accounts require auth.users — probe via admin API once (no email dump)
  let confirmed = null;
  let unconfirmed = null;
  try {
    if (typeof admin.auth?.admin?.listUsers === "function") {
      const page = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const users = page?.data?.users || page?.users || [];
      if (Array.isArray(users) && users.length) {
        let c = 0;
        let u = 0;
        for (const user of users) {
          if (user.email_confirmed_at || user.confirmed_at) c += 1;
          else u += 1;
        }
        // Sample-only when total > page — mark partial via reason
        const totalAuth = page?.data?.total ?? page?.total ?? users.length;
        if (typeof totalAuth === "number" && totalAuth > users.length) {
          confirmed = null;
          unconfirmed = null;
        } else {
          confirmed = c;
          unconfirmed = u;
        }
      }
    }
  } catch {
    confirmed = null;
    unconfirmed = null;
  }

  const metrics = {
    total_users: ok(total, "profiles"),
    confirmed_users: confirmed == null ? noData("auth.users_not_fully_enumerable") : ok(confirmed, "auth.admin.listUsers"),
    unconfirmed_users: unconfirmed == null ? noData("auth.users_not_fully_enumerable") : ok(unconfirmed, "auth.admin.listUsers"),
    new_users_today: newToday == null ? noData("profiles") : ok(newToday, "profiles.created_at"),
    new_users_week: newWeek == null ? noData("profiles") : ok(newWeek, "profiles.created_at"),
    new_users_month: newMonth == null ? noData("profiles") : ok(newMonth, "profiles.created_at"),
    active_users: noData("no_last_seen_or_activity_table"),
    dau: noData("no_activity_telemetry"),
    wau: noData("no_activity_telemetry"),
    mau: noData("no_activity_telemetry"),
    signups_today: newToday == null ? noData("profiles") : ok(newToday, "profiles.created_at"),
    signups_week: newWeek == null ? noData("profiles") : ok(newWeek, "profiles.created_at"),
    signups_month: newMonth == null ? noData("profiles") : ok(newMonth, "profiles.created_at"),
    daily_growth_rate: avgDailyGrowth == null ? noData("insufficient_signup_series") : ok(avgDailyGrowth, "profiles.created_at"),
    retention_rate: noData("no_cohort_activity"),
  };

  const charts = {
    users_daily: dailySeries.length
      ? { status: "ok", series: dailySeries, source: "profiles.created_at" }
      : { status: "no_data", series: [], label: "NO DATA AVAILABLE" },
    monthly_growth: monthlySeries.length
      ? { status: "ok", series: monthlySeries, source: "profiles.created_at" }
      : { status: "no_data", series: [], label: "NO DATA AVAILABLE" },
    returning_users: { status: "no_data", series: [], label: "NO DATA AVAILABLE", reason: "no_activity_telemetry" },
    activity_trend: { status: "no_data", series: [], label: "NO DATA AVAILABLE", reason: "no_activity_telemetry" },
  };

  const metricStatuses = Object.values(metrics);
  return {
    status: sectionStatus(metricStatuses),
    metrics,
    charts,
    unavailable: metricStatuses.filter((m) => m.status === "no_data").map((m) => m.reason).filter(Boolean),
  };
}

async function buildGeo(admin) {
  if (!admin) return { status: "NO_DATA", top_cities: [], top_countries: [], heatmap: null };
  try {
    const { data, error } = await admin
      .from("profiles")
      .select("city")
      .not("city", "is", null)
      .limit(5000);
    if (error || !data?.length) {
      return {
        status: "NO_DATA",
        top_cities: [],
        top_countries: [],
        heatmap: null,
        label: "NO DATA AVAILABLE",
        reason: error ? "profiles_city_query_failed" : "no_city_values",
      };
    }
    const counts = new Map();
    for (const row of data) {
      const city = String(row.city || "").trim();
      if (!city) continue;
      counts.set(city, (counts.get(city) || 0) + 1);
    }
    const top_cities = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([city, count]) => ({ city, count }));
    return {
      status: top_cities.length ? "PARTIAL" : "NO_DATA",
      top_cities,
      top_countries: [],
      heatmap: null,
      note: "cities_from_profiles_only_no_country_field",
      label: top_cities.length ? null : "NO DATA AVAILABLE",
    };
  } catch {
    return { status: "NO_DATA", top_cities: [], top_countries: [], heatmap: null, label: "NO DATA AVAILABLE" };
  }
}

async function buildSearch(admin, days) {
  const analytics = await getSearchAnalytics(admin, days);
  const has = (analytics?.total_searches || 0) > 0 || (analytics?.top_queries || []).length > 0;
  if (!has) {
    return {
      status: "NO_DATA",
      label: "NO DATA AVAILABLE",
      metrics: {
        total_searches: noData("search_analytics_events_empty"),
        success_rate: noData("search_analytics_events_empty"),
        exit_rate: noData("no_search_exit_telemetry"),
        content_conversion: noData("partial_click_only"),
      },
      top_queries: [],
      zero_result_queries: [],
      charts: { success_vs_failure: { status: "no_data", series: [], label: "NO DATA AVAILABLE" } },
    };
  }
  const zero = (analytics.zero_result_queries || []).reduce((s, q) => s + (q.count || 0), 0);
  const total = analytics.total_searches || 0;
  const successRate = total ? Math.round(((total - zero) / total) * 1000) / 10 : null;
  return {
    status: "PARTIAL",
    metrics: {
      total_searches: ok(total, "search_analytics_events"),
      success_rate: successRate == null ? noData("no_searches") : ok(successRate, "search_analytics_events"),
      exit_rate: noData("no_search_exit_telemetry"),
      content_conversion: ok(analytics.click_through_rate, "search_analytics_events.click"),
      avg_response_ms: ok(analytics.avg_response_ms, "search_analytics_events"),
    },
    top_queries: analytics.top_queries || [],
    zero_result_queries: analytics.zero_result_queries || [],
    top_topics: analytics.top_topics || [],
    charts: {
      success_vs_failure: {
        status: "ok",
        series: [
          { label: "success", count: Math.max(0, total - zero) },
          { label: "zero_results", count: zero },
        ],
        source: "search_analytics_events",
      },
    },
  };
}

async function buildLearning(admin) {
  const stats = await getAdminLearningStats(admin);
  // Seed catalog sizes are inventory, not user telemetry — expose separately
  const hasRpcTelemetry =
    (stats?.enrollments_count || 0) > 0 ||
    (stats?.certificates_count || 0) > 0 ||
    (Array.isArray(stats?.top_lessons) && stats.top_lessons.length > 0);

  return {
    status: hasRpcTelemetry ? "PARTIAL" : "NO_DATA",
    catalog: {
      paths_count: ok(stats.paths_count ?? 0, "learning_paths_catalog"),
      modules_count: ok(stats.modules_count ?? 0, "learning_paths_catalog"),
      quizzes_count: ok(stats.quizzes_count ?? 0, "learning_paths_catalog"),
    },
    metrics: {
      enrollments: hasRpcTelemetry ? ok(stats.enrollments_count, "learning_platform_stats") : noData("learning_rpc_empty"),
      completion_rate: hasRpcTelemetry ? ok(stats.completion_rate, "learning_platform_stats") : noData("learning_rpc_empty"),
      certificates: hasRpcTelemetry ? ok(stats.certificates_count, "learning_platform_stats") : noData("learning_rpc_empty"),
    },
    top_lessons: hasRpcTelemetry ? stats.top_lessons || [] : [],
    top_paths: [],
    top_sheikhs: [],
    funnel: {
      status: "no_data",
      steps: [
        { id: "start", label: "Start", value: null },
        { id: "continue", label: "Continue", value: null },
        { id: "complete", label: "Complete", value: null },
      ],
      label: "NO DATA AVAILABLE",
      reason: "no_learning_funnel_events",
    },
    label: hasRpcTelemetry ? null : "NO DATA AVAILABLE",
  };
}

function noDataSection(reason, extra = {}) {
  return {
    status: "NO_DATA",
    label: "NO DATA AVAILABLE",
    reason,
    ...extra,
  };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient | null} admin
 * @param {{ days?: number, force?: boolean }} [opts]
 */
export async function buildAnalyticsPlatformPayload(admin, opts = {}) {
  const days = Math.min(90, Math.max(1, Number(opts.days) || 30));
  const cacheKey = `d${days}`;
  if (!opts.force && cache.payload && cache.key === cacheKey && Date.now() - cache.at < CACHE_TTL_MS) {
    return { ...cache.payload, meta: { ...cache.payload.meta, cache: "hit" } };
  }

  const [executive, search, learning, geo] = await Promise.all([
    buildUserMetrics(admin),
    buildSearch(admin, days),
    buildLearning(admin),
    buildGeo(admin),
  ]);

  const auth = {
    status: "NO_DATA",
    label: "NO DATA AVAILABLE",
    reason: "no_auth_event_log",
    metrics: {
      new_accounts: executive.metrics?.new_users_month || noData("profiles"),
      email_activations: noData("no_auth_confirm_events"),
      unconfirmed_accounts: executive.metrics?.unconfirmed_users || noData("auth.users"),
      failed_signups: noData("no_auth_failure_log"),
      weak_password: noData("no_auth_failure_log"),
      email_not_confirmed: noData("no_auth_failure_log"),
      rate_limit: noData("no_auth_failure_log"),
      already_registered: noData("no_auth_failure_log"),
    },
    charts: {
      success_vs_failure: { status: "no_data", series: [], label: "NO DATA AVAILABLE" },
    },
    funnel: {
      status: "no_data",
      steps: [
        { id: "visit", label: "Visit", value: null },
        { id: "register", label: "Register", value: executive.metrics?.total_users?.status === "ok" ? executive.metrics.total_users.value : null },
        { id: "confirm_email", label: "Confirm Email", value: null },
        { id: "first_login", label: "First Login", value: null },
        { id: "active_user", label: "Active User", value: null },
      ],
      label: "NO DATA AVAILABLE",
      note: "register_step_uses_profiles_total_when_available",
    },
  };
  if (executive.metrics?.total_users?.status === "ok") {
    auth.status = "PARTIAL";
    auth.label = null;
  }

  const content = noDataSection("no_pageview_or_content_telemetry", {
    top_pages: [],
    top_sections: [],
    top_content: [],
    metrics: {
      avg_dwell: noData("no_pageview_telemetry"),
      bounce_rate: noData("no_pageview_telemetry"),
      return_rate: noData("no_pageview_telemetry"),
      opens: noData("no_pageview_telemetry"),
    },
    known_routes: [
      { path: "/", label: "الرئيسية" },
      { path: "/mushaf", label: "المصحف" },
      { path: "/prayer", label: "الصلاة" },
      { path: "/hadith", label: "الحديث" },
      { path: "/fiqh", label: "الفقه" },
      { path: "/lessons", label: "الدروس" },
      { path: "/search", label: "البحث" },
      { path: "/learn", label: "التعلم" },
    ],
  });

  const payload = {
    ok: true,
    generatedAt: new Date().toISOString(),
    days,
    sections: {
      executive,
      auth,
      content,
      quran: noDataSection("quran_telemetry_is_client_local_no_admin_aggregate", {
        metrics: {
          top_surahs: noData("no_server_quran_reads"),
          top_pages: noData("no_server_quran_reads"),
          top_juz: noData("no_server_quran_reads"),
          top_searches: noData("no_server_quran_search"),
          bookmarks: noData("client_local_bookmarks"),
          markers: noData("client_local_marks"),
          reading_progress: noData("no_server_progress_aggregate"),
          avg_session_minutes: noData("no_quran_session_telemetry"),
        },
        charts: {
          daily: { status: "no_data", series: [], label: "NO DATA AVAILABLE" },
          weekly: { status: "no_data", series: [], label: "NO DATA AVAILABLE" },
          monthly: { status: "no_data", series: [], label: "NO DATA AVAILABLE" },
        },
      }),
      learning,
      search,
      prayer: noDataSection("no_prayer_usage_telemetry", {
        metrics: {
          top_cities: noData("no_prayer_city_events"),
          prayer_page_opens: noData("no_prayer_page_events"),
          adhan_plays: noData("no_adhan_telemetry"),
          local_notifications: noData("no_notification_telemetry"),
          notification_permission_rate: noData("no_notification_permission_telemetry"),
        },
        usage_hours: { status: "no_data", series: [], label: "NO DATA AVAILABLE" },
      }),
      technical: noDataSection("rum_and_web_vitals_are_logs_only_not_queryable", {
        metrics: {
          page_load: noData("rum_logs_only"),
          lcp: noData("rum_logs_only"),
          cls: noData("rum_logs_only"),
          inp: noData("rum_logs_only"),
          fcp: noData("rum_logs_only"),
          chunk_errors: noData("client_error_logs_only"),
          runtime_errors: noData("client_error_logs_only"),
          error_rate: noData("no_aggregated_error_store"),
        },
        top_failing_routes: [],
        top_slow_routes: [],
        top_client_errors: [],
        top_api_errors: [],
      }),
      api: noDataSection("no_persistent_api_telemetry_store", {
        endpoints: [],
        slow_endpoints: [],
        most_used: [],
        rate_limited: [],
      }),
      device: noDataSection("no_device_analytics_store"),
      geo,
      retention: noDataSection("no_cohort_or_activity_tables", {
        d1: noData("no_retention_events"),
        d7: noData("no_retention_events"),
        d30: noData("no_retention_events"),
        churn: noData("no_retention_events"),
        returning_users: noData("no_retention_events"),
        cohorts: [],
      }),
      realtime: noDataSection("no_live_session_presence", {
        active_users_now: noData("no_presence"),
        active_sessions: noData("no_presence"),
        route_distribution: [],
        current_errors: [],
        current_api_load: noData("no_live_api_metrics"),
        auto_refresh_sec: 30,
      }),
      alerts: {
        status: "PARTIAL",
        items: [],
        rules: [
          { id: "error_spike", label: "ارتفاع الأخطاء", armed: true, state: "no_data_source" },
          { id: "activity_drop", label: "هبوط النشاط", armed: true, state: "no_data_source" },
          { id: "api_failure", label: "فشل API", armed: true, state: "no_data_source" },
          { id: "runtime_errors", label: "Runtime Errors", armed: true, state: "no_data_source" },
          { id: "chunk_failures", label: "Chunk Failures", armed: true, state: "no_data_source" },
        ],
        note: "rules_defined_awaiting_queryable_telemetry",
      },
    },
    meta: {
      cache: "miss",
      cacheTtlSec: CACHE_TTL_MS / 1000,
      sources: [
        "profiles",
        "search_analytics_events",
        "learning_platform_stats|catalog",
        "auth.admin.listUsers(sample)",
      ],
      noDataAreas: [
        "dau_wau_mau",
        "auth_failure_codes",
        "pageviews_content",
        "quran_server_aggregate",
        "prayer_usage",
        "rum_web_vitals_store",
        "api_latency_store",
        "device_analytics",
        "countries_heatmap",
        "retention_cohorts",
        "realtime_presence",
        "alerting_evaluation",
      ],
      security: {
        pii: "stripped",
        emails: "never",
        passwords: "never",
        tokens: "never",
        aggregation_only: true,
      },
      platformStatus: "PARTIAL",
    },
  };

  const sectionStatuses = Object.values(payload.sections).map((s) => s.status);
  const ready = sectionStatuses.filter((s) => s === "READY").length;
  const partial = sectionStatuses.filter((s) => s === "PARTIAL").length;
  payload.meta.platformStatus = ready && !partial && sectionStatuses.every((s) => s === "READY")
    ? "READY"
    : partial || ready
      ? "PARTIAL"
      : "BLOCKED";

  cache = { at: Date.now(), key: cacheKey, payload };
  return payload;
}

export function __resetAnalyticsPlatformCacheForTests() {
  cache = { at: 0, key: "", payload: null };
}
