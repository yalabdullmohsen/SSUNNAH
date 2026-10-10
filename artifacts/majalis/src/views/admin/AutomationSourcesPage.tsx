import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  listTrustedLessonSources,
  runLessonAutomationMonitor,
  toggleAutoPublish,
  toggleTrustedSource,
  upsertTrustedLessonSource,
  TRUST_LEVELS,
  SOURCE_TYPES,
  type TrustedLessonSource,
} from "@/lib/lesson-automation-api";
import { SkeletonCardGrid } from "@/design-system";
import { AdminShell, useAdminShell } from "@/views/admin/AdminShell";
import { InstagramManualAssistPanel } from "@/views/admin/InstagramManualAssistPanel";

const EMPTY: TrustedLessonSource = {
  name: "",
  platform: "website",
  url: "",
  source_type: "website",
  trust_level: "unknown",
  auto_publish_allowed: false,
  country: "الكويت",
  city: "العاصمة",
  category: "دروس",
  active: true,
};

function formatDt(iso?: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("ar", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16);
  }
}

function AutomationSourcesContent() {
  const { showError } = useAdminShell();
  const [sources, setSources] = useState<TrustedLessonSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<TrustedLessonSource>({ ...EMPTY });
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    listTrustedLessonSources()
      .then((r) => setSources((r.sources as TrustedLessonSource[]) || []))
      .catch(() => setSources([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSave = async () => {
    if (!form.name.trim() || !form.url.trim()) return;
    setBusy(true);
    try {
      await upsertTrustedLessonSource(form);
      setShowForm(false);
      setForm({ ...EMPTY });
      load();
    } catch (e) {
      showError(e instanceof Error ? e.message : "تعذر حفظ المصدر.");
    } finally {
      setBusy(false);
    }
  };

  const onRunMonitor = async (sourceId?: string) => {
    setBusy(true);
    try {
      await runLessonAutomationMonitor({ sourceId });
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="asp-header">
        <div>
          <h2 className="asp-title">مصادر المحتوى — أضف وانسَ</h2>
          <p className="asp-subtitle">
            أضف مصدرًا واحدًا (إنستغرام، موقع، RSS، تيليجرام، يوتيوب، X…) — النظام يتابعه كل 15 دقيقة ويستخرج وينشر تلقائيًا.
          </p>
        </div>
        <div className="asp-links">
          <Link href="/admin/integrations/instagram" className="asp-link">Instagram API</Link>
          <Link href="/admin/automation/center" className="asp-link">Automation Center</Link>
          <Link href="/admin/automation/dashboard" className="asp-link">لوحة المراقبة</Link>
          <Link href="/admin/review-center" className="asp-link">مركز المراجعة</Link>
          <Link href="/admin" className="asp-link">← لوحة الإدارة</Link>
        </div>
      </div>

      <div className="asp-notice">
        <strong>Phase 5:</strong> بعد الحفظ يُنشأ Job تلقائي (كل 15 دقيقة) — Vision AI + Matching + SEO بدون build جديد.{" "}
        <strong>Instagram:</strong> يتطلب Graph API للجلب الكامل؛ بدونه تُنشأ مسودات للمراجعة.
      </div>

      <div className="asp-actions">
        <Button variant="secondary" size="small" type="button" disabled={busy} onClick={() => { setForm({ ...EMPTY }); setShowForm(true); }} className="asp-add-btn">
          + إضافة مصدر
        </Button>
        <Button variant="secondary" size="small" type="button" disabled={busy} onClick={() => onRunMonitor()} className="asp-run-btn">
          فحص الآن (كل المصادر)
        </Button>
      </div>

      {showForm && (
        <section className="asp-form">
          <h3 className="asp-form-h3">{form.id ? "تعديل مصدر" : "مصدر جديد"}</h3>
          <div className="asp-form-grid">
            <input placeholder="اسم المصدر" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="adm-input" />
            <input placeholder="الرابط" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="adm-input" dir="ltr" />
            <select value={form.source_type} onChange={(e) => setForm({ ...form, source_type: e.target.value, platform: e.target.value })} className="adm-input">
              {SOURCE_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input placeholder="الدولة" value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })} className="adm-input" />
            <input placeholder="المدينة" value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} className="adm-input" />
            <select value={form.trust_level} onChange={(e) => setForm({ ...form, trust_level: e.target.value })} className="adm-input">
              {TRUST_LEVELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input placeholder="feed URL (RSS)" value={form.feed_url || ""} onChange={(e) => setForm({ ...form, feed_url: e.target.value })} className="adm-input" dir="ltr" />
            <label className="asp-checkbox-label">
              <input type="checkbox" checked={form.auto_publish_allowed} onChange={(e) => setForm({ ...form, auto_publish_allowed: e.target.checked })} />
              Auto-Publish
            </label>
            <label className="asp-checkbox-label">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              نشط
            </label>
          </div>
          <div className="asp-form-actions">
            <Button variant="secondary" size="small" type="button" disabled={busy} onClick={onSave} className="asp-save-btn">حفظ</Button>
            <Button variant="secondary" size="small" type="button" onClick={() => setShowForm(false)} className="asp-cancel-btn">إلغاء</Button>
          </div>
        </section>
      )}

      {loading ? <SkeletonCardGrid count={6} /> : (
        <div className="asp-list">
          {sources.map((s) => (
            <article key={s.id} className="asp-card">
              <div className="asp-card-body">
                <div>
                  <strong className="asp-card-name">{s.name}</strong>
                  <p className="asp-card-meta">
                    {(s as TrustedLessonSource & { config?: { source_subtype?: string; handle?: string } }).config?.handle || s.source_type}
                    {" · "}
                    {(s as TrustedLessonSource & { config?: { source_subtype?: string } }).config?.source_subtype || s.category}
                    {" · "}
                    {s.trust_level} · {s.active ? "نشط" : "معطّل"}
                    {s.auto_publish_allowed ? " · Auto-Publish ✓" : ""}
                  </p>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="asp-card-url">{s.url}</a>
                  <p className="asp-card-dates">
                    آخر فحص: {formatDt(s.last_checked_at)} · نجاح: {formatDt(s.last_success_at)} · أخطاء: {s.failure_count ?? 0}
                  </p>
                  {s.last_error && <p className="asp-card-error">{s.last_error}</p>}
                  {Boolean(s.content_types_allowed?.length) && (
                    <p className="asp-card-meta">
                      أنواع مسموحة: {(s.content_types_allowed || []).join("، ")}
                      {s.default_attribution_name ? ` · ينسب لـ: ${s.default_attribution_name}` : ""}
                      {s.default_organization_name ? ` · الجهة: ${s.default_organization_name}` : ""}
                    </p>
                  )}
                  <InstagramManualAssistPanel source={s} onDone={load} />
                </div>
                <div className="asp-card-actions">
                  <Button variant="secondary" size="small" type="button" disabled={busy} onClick={() => toggleTrustedSource(s.id!, !s.active).then(load).catch(() => showError("تعذر تحديث حالة المصدر."))} className="asp-small-btn">
                    {s.active ? "تعطيل" : "تفعيل"}
                  </Button>
                  <Button variant="secondary" size="small" type="button" disabled={busy} onClick={() => toggleAutoPublish(s.id!).then(load).catch(() => showError("تعذر تحديث النشر التلقائي."))} className="asp-small-btn">
                    Auto-Publish
                  </Button>
                  <Button variant="secondary" size="small" type="button" disabled={busy} onClick={() => { setForm(s); setShowForm(true); }} className="asp-small-btn">تعديل</Button>
                  <Button variant="secondary" size="small" type="button" disabled={busy} onClick={() => onRunMonitor(s.id)} className="asp-small-btn asp-small-btn--accent">
                    فحص الآن
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AutomationSourcesPage() {
  return (
    <AdminShell section="lessons" onSectionChange={() => {}}>
      <AutomationSourcesContent />
    </AdminShell>
  );
}

export { AutomationSourcesContent };
