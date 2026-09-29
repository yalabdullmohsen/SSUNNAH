import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AppCard } from "@/components/design-system/AppCard";
import { useAuth } from "@/components/AuthProvider";
import { v3Get, v3List } from "../../data/admin-v3-api";
import { can, resolveGovernanceRole } from "../../permissions";
import { listAdminV3AuditEvents } from "../../audit-events";
import {
  AdminLoadGate,
  AdminPageHeader,
  AdminPermissionDenied,
  AdminLegacyChip,
} from "../../ui/primitives";
import { listCenterTools } from "../../centers/catalog";

/** @deprecated Use AnalyticsPlatformPage — kept for any residual imports. */
export { AnalyticsPlatformPage as AnalyticsPage } from "../analytics/AnalyticsPlatformPage";

export function SettingsOpsPage() {
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await v3Get<Record<string, unknown>>("status");
        if (!cancelled) setStatus(res.data || null);
      } catch (e) {
        if (!cancelled) setError((e as { userMessageAr?: string }).userMessageAr || "تعذّر جلب الحالة.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="av3-domain">
      <AdminPageHeader
        title="الإعدادات والتكاملات"
        description="حالة آمنة بلا أسرار — الإرسال الجماعي وإدارة الـwebhook تبقى في مسارات محمية/Legacy."
        crumbs={[
          { label: "لوحة التحكم", href: "/admin/v3" },
          { label: "الإعدادات" },
        ]}
      />
      <AdminLoadGate loading={loading} error={error}>
        {status ? (
          <dl className="av3-kv">
            <div>
              <dt>البيئة</dt>
              <dd>{String(status.environment || "UNKNOWN")}</dd>
            </div>
            <div>
              <dt>دورك</dt>
              <dd>{String(status.role || "—")}</dd>
            </div>
            <div>
              <dt>AI</dt>
              <dd>{status.aiEnabled ? "مفعّل" : "معطّل"}</dd>
            </div>
            <div>
              <dt>Telegram</dt>
              <dd>{status.telegramConfigured ? "مُهيأ" : "غير مُهيأ"}</dd>
            </div>
            <div>
              <dt>Upstash</dt>
              <dd>{status.upstashConfigured ? "مُهيأ" : "غير مُهيأ"}</dd>
            </div>
          </dl>
        ) : null}
      </AdminLoadGate>
      <p className="av3-dash__sub">
        لا يُعرض أي سر. لا إرسال جماعي افتراضي من هذه الصفحة.
      </p>
      <section className="av3-legacy-block">
        <h3>
          أدوات التشغيل <AdminLegacyChip />
        </h3>
        <div className="av3-tool-grid">
          {listCenterTools("settings").map((t) => (
            <AppCard key={t.id} className="av3-tool-card" data-ss-surface="admin-tool">
              <h3 className="av3-tool-card__title">{t.title}</h3>
              <p className="av3-tool-card__desc">{t.description}</p>
              <Button asChild variant="secondary">
                <Link href={t.href}>فتح</Link>
              </Button>
            </AppCard>
          ))}
        </div>
      </section>
    </div>
  );
}

export function AuditPage() {
  const { user } = useAuth();
  const role = resolveGovernanceRole(user);
  const [serverRows, setServerRows] = useState<Record<string, unknown>[]>([]);
  const [incomplete, setIncomplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const local = listAdminV3AuditEvents().slice().reverse().slice(0, 30);

  useEffect(() => {
    if (!can(role, "audit.read") && !can(role, "*")) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await v3List<Record<string, unknown>>("audit", { limit: 50 });
        setServerRows(res.data || []);
        setIncomplete(!!res.incomplete);
      } catch (e) {
        setError((e as { userMessageAr?: string }).userMessageAr || "تعذّر جلب التدقيق.");
      } finally {
        setLoading(false);
      }
    })();
  }, [role]);

  if (!can(role, "audit.read") && !can(role, "*") && !can(role, "content.read")) {
    return <AdminPermissionDenied permission="audit.read" />;
  }

  return (
    <div className="av3-domain">
      <AdminPageHeader
        title="سجل التدقيق"
        description="أحداث الخادم (إن توفرت) + أحداث واجهة الجلسة المحلية. للقراءة فقط."
        badge="أصلي"
        crumbs={[
          { label: "لوحة التحكم", href: "/admin/v3" },
          { label: "التدقيق" },
        ]}
      />
      {incomplete ? (
        <p className="av3-muted" role="status">
          التسجيل الجزئي: جدول التدقيق غير مكتمل أو غير متاح — الحالة UNKNOWN جزئيًا.
        </p>
      ) : null}
      <AdminLoadGate loading={loading} error={error}>
        <h3>الخادم</h3>
        {serverRows.length === 0 ? (
          <p className="av3-muted">لا سجلات خادم متاحة.</p>
        ) : (
          <ul className="av3-audit-list">
            {serverRows.map((e) => (
              <li key={String(e.id)}>
                <time dateTime={String(e.created_at || "")}>{String(e.created_at || "")}</time>
                <code>{String(e.action || "")}</code>
                <span>
                  {String(e.resource_type || "")}:{String(e.resource_id || "")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminLoadGate>
      <h3>واجهة الجلسة</h3>
      <ul className="av3-audit-list">
        {local.map((e) => (
          <li key={`${e.at}-${e.type}`}>
            <time dateTime={e.at}>{e.at}</time>
            <code>{e.type}</code>
            <span>{e.path}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
