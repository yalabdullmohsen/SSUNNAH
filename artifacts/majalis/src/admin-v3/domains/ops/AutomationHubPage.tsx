import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { AppCard } from "@/components/design-system/AppCard";
import { v3Get } from "../../data/admin-v3-api";
import {
  AdminLoadGate,
  AdminPageHeader,
  AdminLegacyChip,
  AdminPermissionDenied,
} from "../../ui/primitives";
import { useAuth } from "@/components/AuthProvider";
import { can, resolveGovernanceRole } from "../../permissions";

type Surface = { id: string; classification: string; note: string };
type Overview = {
  phase?: string;
  telegramConfigured?: boolean;
  instagramConfigured?: boolean;
  surfaces?: Surface[];
};
type SourceRow = {
  id: string;
  name: string;
  source_type?: string | null;
  platform?: string | null;
  active?: boolean;
  trust_level?: string | null;
  failure_count?: number;
  last_error?: string | null;
  last_checked_at?: string | null;
};
type AutoContentPayload = {
  stats?: Record<string, unknown>;
  health?: Record<string, unknown>;
  mutations?: string;
  runLegacyHref?: string;
};
type IntegrationsPayload = {
  telegram?: { configured?: boolean; mutations?: string };
  instagram?: {
    configured?: boolean;
    manualAssistMode?: boolean;
    status?: string | null;
    mutations?: string;
    ownerAction?: boolean;
  };
};

function automationView(path: string): "hub" | "sources" | "auto-content" | "integrations" {
  if (path.endsWith("/sources")) return "sources";
  if (path.endsWith("/auto-content")) return "auto-content";
  if (path.endsWith("/integrations")) return "integrations";
  return "hub";
}

export function AutomationHubPage() {
  const [location] = useLocation();
  const path = (location.split("?")[0] || "").replace(/\/+$/, "");
  const view = automationView(path);
  const { user } = useAuth();
  const role = resolveGovernanceRole(user);

  if (!can(role, "content.read") && !can(role, "*")) {
    return <AdminPermissionDenied permission="content.read" />;
  }

  if (view === "sources") return <AutomationSourcesPanel />;
  if (view === "auto-content") return <AutomationAutoContentPanel />;
  if (view === "integrations") return <AutomationIntegrationsPanel />;
  return <AutomationOverviewPanel />;
}

function AutomationOverviewPanel() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await v3Get<Overview>("automation", { view: "overview" });
        if (!cancelled) setData(res.data || null);
      } catch (e) {
        if (!cancelled) setError((e as { userMessageAr?: string }).userMessageAr || "تعذّر جلب حالة الأتمتة.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const natives = [
    { href: "/admin/v3/automation/sources", title: "مصادر الاستيراد", desc: "قراءة حالة المصادر (FINAL-6)" },
    { href: "/admin/v3/automation/auto-content", title: "المحتوى الآلي", desc: "إحصاءات وصحة — بلا تشغيل من هنا" },
    { href: "/admin/v3/automation/integrations", title: "التكاملات", desc: "Telegram / Instagram — حالة بلا أسرار" },
  ] as const;

  const legacyOps = [
    { href: "/admin/automation/center", title: "مركز الأتمتة", note: "LEGACY_REQUIRED" },
    { href: "/admin/automation/dashboard", title: "لوحة الأتمتة", note: "LEGACY_REQUIRED" },
    { href: "/admin/auto-content", title: "تشغيل المحتوى الآلي", note: "LEGACY_REQUIRED · mutating" },
    { href: "/admin/sources", title: "إدارة المصادر", note: "LEGACY_REQUIRED · upsert/toggle" },
    { href: "/admin?section=telegram", title: "Telegram تشغيل", note: "LEGACY_REQUIRED" },
    { href: "/admin/integrations/instagram", title: "إنستغرام تشغيل", note: "LEGACY / OWNER secrets" },
    { href: "/admin/content-production", title: "إنتاج المحتوى", note: "LEGACY_REQUIRED" },
    { href: "/admin/feature-status", title: "مراقبة الميزات", note: "LEGACY_REQUIRED" },
  ] as const;

  return (
    <div className="av3-domain" data-admin-final6-automation="hub">
      <AdminPageHeader
        title="مركز الأتمتة والتكاملات"
        description="حالة وتصنيف صادق (ADMIN-FINAL-6) — القراءة عبر v3؛ التشغيل mutating يبقى Legacy أو OWNER."
        badge="FINAL-6"
        crumbs={[
          { label: "لوحة التحكم", href: "/admin/v3" },
          { label: "الأتمتة" },
        ]}
      />
      <AdminLoadGate loading={loading} error={error}>
        <dl className="av3-kv">
          <div>
            <dt>Telegram</dt>
            <dd>{data?.telegramConfigured ? "مُهيأ" : "غير مُهيأ"}</dd>
          </div>
          <div>
            <dt>Instagram</dt>
            <dd>{data?.instagramConfigured ? "مُهيأ" : "غير مُهيأ / يحتاج OWNER"}</dd>
          </div>
          <div>
            <dt>المرحلة</dt>
            <dd>{data?.phase || "ADMIN-FINAL-6"}</dd>
          </div>
        </dl>
        {data?.surfaces?.length ? (
          <section aria-label="مصفوفة التصنيف">
            <h3>تصنيف الأسطح</h3>
            <ul className="av3-audit-list">
              {data.surfaces.map((s) => (
                <li key={s.id}>
                  <code>{s.id}</code>
                  <strong>{s.classification}</strong>
                  <span>{s.note}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </AdminLoadGate>

      <div className="av3-tool-grid">
        {natives.map((n) => (
          <AppCard key={n.href} className="av3-tool-card av3-tool-card--native" data-ss-surface="admin-tool">
            <h3 className="av3-tool-card__title">{n.title}</h3>
            <p className="av3-tool-card__desc">{n.desc}</p>
            <Button asChild variant="primary">
              <Link href={n.href}>فتح</Link>
            </Button>
          </AppCard>
        ))}
      </div>

      <section className="av3-legacy-block" aria-label="تشغيل Legacy">
        <h3>
          تشغيل وواجهات توافق <AdminLegacyChip />
        </h3>
        <p className="av3-muted">وجود رابط Legacy لا يُعد ترحيلًا كاملًا.</p>
        <div className="av3-tool-grid">
          {legacyOps.map((t) => (
            <AppCard key={t.href} className="av3-tool-card" data-ss-surface="admin-tool">
              <h3 className="av3-tool-card__title">{t.title}</h3>
              <p className="av3-tool-card__desc">{t.note}</p>
              <Button asChild variant="secondary">
                <Link href={t.href}>فتح (Legacy)</Link>
              </Button>
            </AppCard>
          ))}
        </div>
      </section>
    </div>
  );
}

function AutomationSourcesPanel() {
  const [rows, setRows] = useState<SourceRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await v3Get<{ sources: SourceRow[] }>("automation", { view: "sources" });
        if (!cancelled) setRows(res.data?.sources || []);
      } catch (e) {
        if (!cancelled) setError((e as { userMessageAr?: string }).userMessageAr || "تعذّر جلب المصادر.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="av3-domain" data-admin-final6-automation="sources">
      <AdminPageHeader
        title="مصادر الاستيراد"
        description="قراءة فقط عبر /api/admin/v3/automation?view=sources — التعديل/التشغيل في Legacy."
        badge="V3_PARTIAL"
        crumbs={[
          { label: "لوحة التحكم", href: "/admin/v3" },
          { label: "الأتمتة", href: "/admin/v3/automation" },
          { label: "المصادر" },
        ]}
      />
      <p className="av3-muted">
        للإدارة:{" "}
        <Link href="/admin/sources">
          /admin/sources <AdminLegacyChip />
        </Link>
      </p>
      <AdminLoadGate loading={loading} error={error}>
        {rows.length === 0 ? (
          <p className="av3-muted">لا مصادر ظاهرة أو الجدول غير متاح.</p>
        ) : (
          <ul className="av3-audit-list">
            {rows.map((s) => (
              <li key={s.id}>
                <strong>{s.name}</strong>
                <code>{s.source_type || s.platform || "—"}</code>
                <span>{s.active ? "نشط" : "موقوف"}</span>
                <span>{s.trust_level || "—"}</span>
                <span>فشل: {s.failure_count ?? 0}</span>
                {s.last_error ? <span title={s.last_error}>{s.last_error}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </AdminLoadGate>
    </div>
  );
}

function AutomationAutoContentPanel() {
  const [data, setData] = useState<AutoContentPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await v3Get<AutoContentPayload>("automation", { view: "auto-content" });
        if (!cancelled) setData(res.data || null);
      } catch (e) {
        if (!cancelled) setError((e as { userMessageAr?: string }).userMessageAr || "تعذّر جلب المحتوى الآلي.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="av3-domain" data-admin-final6-automation="auto-content">
      <AdminPageHeader
        title="المحتوى الآلي"
        description="إحصاءات وصحة فقط — تشغيل المزامنة يبقى في المسار Legacy المحمي."
        badge="V3_PARTIAL"
        crumbs={[
          { label: "لوحة التحكم", href: "/admin/v3" },
          { label: "الأتمتة", href: "/admin/v3/automation" },
          { label: "المحتوى الآلي" },
        ]}
      />
      <AdminLoadGate loading={loading} error={error}>
        <pre className="av3-muted" style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem" }}>
          {JSON.stringify(
            {
              health: data?.health ?? null,
              stats: data?.stats ?? null,
            },
            null,
            2,
          )}
        </pre>
      </AdminLoadGate>
      <Button asChild variant="secondary">
        <Link href={data?.runLegacyHref || "/admin/auto-content"}>تشغيل / إدارة (Legacy)</Link>
      </Button>
    </div>
  );
}

function AutomationIntegrationsPanel() {
  const [data, setData] = useState<IntegrationsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await v3Get<IntegrationsPayload>("automation", { view: "integrations" });
        if (!cancelled) setData(res.data || null);
      } catch (e) {
        if (!cancelled) setError((e as { userMessageAr?: string }).userMessageAr || "تعذّر جلب التكاملات.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="av3-domain" data-admin-final6-automation="integrations">
      <AdminPageHeader
        title="التكاملات"
        description="حالة إعداد بلا كشف أسرار — الإرسال والويب هوك في Legacy / OWNER."
        badge="حماية أسرار"
        crumbs={[
          { label: "لوحة التحكم", href: "/admin/v3" },
          { label: "الأتمتة", href: "/admin/v3/automation" },
          { label: "التكاملات" },
        ]}
      />
      <AdminLoadGate loading={loading} error={error}>
        <dl className="av3-kv">
          <div>
            <dt>Telegram</dt>
            <dd>
              {data?.telegram?.configured ? "مُهيأ" : "غير مُهيأ"} · {data?.telegram?.mutations || "LEGACY_REQUIRED"}
            </dd>
          </div>
          <div>
            <dt>Instagram</dt>
            <dd>
              {data?.instagram?.configured ? "مُهيأ" : "غير مُهيأ"} · {data?.instagram?.mutations || "—"}
              {data?.instagram?.ownerAction ? " · OWNER_ACTION للأسرار" : ""}
            </dd>
          </div>
        </dl>
      </AdminLoadGate>
      <div className="av3-tool-grid">
        <AppCard className="av3-tool-card" data-ss-surface="admin-tool">
          <h3 className="av3-tool-card__title">Telegram</h3>
          <p className="av3-tool-card__desc">تشغيل webhook/بث/مراجعة</p>
          <Button asChild variant="secondary">
            <Link href="/admin?section=telegram">
              فتح Legacy <AdminLegacyChip />
            </Link>
          </Button>
        </AppCard>
        <AppCard className="av3-tool-card" data-ss-surface="admin-tool">
          <h3 className="av3-tool-card__title">إنستغرام</h3>
          <p className="av3-tool-card__desc">Graph / مساعدة يدوية</p>
          <Button asChild variant="secondary">
            <Link href="/admin/integrations/instagram">
              فتح Legacy <AdminLegacyChip />
            </Link>
          </Button>
        </AppCard>
      </div>
    </div>
  );
}
