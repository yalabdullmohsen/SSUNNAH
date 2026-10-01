import { useEffect, useState } from "react";
import { arabicMatchAny } from "@/lib/arabic-search";
import {
  type KnowledgeRelationship,
  type KnowledgeRelType,
  type KnowledgeSourceType,
  getAllKnowledgeRelationshipsAdmin,
  upsertKnowledgeRelationship,
  setKnowledgeRelVerified,
  deleteKnowledgeRelationship,
} from "@/lib/supabase";
import { useAdminConfirm } from "@/components/admin/AdminConfirmDialog";
import { useAdminShell } from "./AdminShell";

const SOURCE_TYPES: { value: KnowledgeSourceType; label: string }[] = [
  { value: "scholar", label: "عالم / شيخ" },
  { value: "lesson",  label: "درس" },
  { value: "book",    label: "كتاب" },
  { value: "fawaid",  label: "فائدة" },
  { value: "question",label: "سؤال" },
];

const REL_TYPES: { value: KnowledgeRelType; label: string }[] = [
  { value: "شيخ_تلميذ",   label: "شيخ → تلميذ" },
  { value: "مؤلف_كتاب",   label: "مؤلف → كتاب" },
  { value: "شرح_لكتاب",   label: "شرح → كتاب" },
  { value: "فتوى_في_باب", label: "فتوى في باب فقهي" },
  { value: "درس_عن_كتاب", label: "درس عن كتاب" },
  { value: "مرتبط",       label: "مرتبط عمومًا" },
];

const EMPTY_FORM = {
  source_type: "scholar" as KnowledgeSourceType,
  source_id: "",
  target_type: "lesson" as KnowledgeSourceType,
  target_id: "",
  relationship_type: "مرتبط" as KnowledgeRelType,
  label: "",
  is_verified: false,
  source_reference: "",
};

export function RelationshipsSection() {
  const { confirm, dialog: confirmDialog } = useAdminConfirm();

  const { showSuccess, showError } = useAdminShell();
  const [rows, setRows] = useState<KnowledgeRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editId, setEditId] = useState<string | null>(null);
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "pending">("all");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await getAllKnowledgeRelationshipsAdmin();
      setRows(data ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
  }

  function startEdit(r: KnowledgeRelationship) {
    setEditId(r.id);
    setForm({
      source_type: r.source_type,
      source_id: r.source_id,
      target_type: r.target_type,
      target_id: r.target_id,
      relationship_type: r.relationship_type,
      label: r.label ?? "",
      is_verified: r.is_verified,
      source_reference: r.source_reference ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave() {
    if (!form.source_id.trim() || !form.target_id.trim()) {
      showError("يجب إدخال معرّف المصدر والهدف");
      return;
    }
    setSaving(true);
    const result = await upsertKnowledgeRelationship({
      source_type: form.source_type,
      source_id: form.source_id.trim(),
      target_type: form.target_type,
      target_id: form.target_id.trim(),
      relationship_type: form.relationship_type,
      label: form.label.trim() || null,
      is_verified: form.is_verified,
      source_reference: form.source_reference.trim() || null,
    });
    setSaving(false);
    if (result.ok) {
      showSuccess(editId ? "تم تحديث العلاقة" : "تم إضافة العلاقة");
      resetForm();
      await load();
    } else {
      showError(`فشل الحفظ: ${result.error ?? "خطأ غير معروف"}`);
    }
  }

  async function handleToggleVerified(r: KnowledgeRelationship) {
    const ok = await setKnowledgeRelVerified(r.id, !r.is_verified);
    if (ok) {
      showSuccess(r.is_verified ? "تم إلغاء التحقق" : "تم التحقق من العلاقة");
      await load();
    } else {
      showError("فشل تغيير حالة التحقق");
    }
  }

  async function handleDelete(r: KnowledgeRelationship) {
    if (!(await confirm({ title: "تأكيد", body: `حذف العلاقة: ${r.source_id} → ${r.target_id}?`, danger: true, confirmLabel: "تأكيد" }))) return;
    const ok = await deleteKnowledgeRelationship(r.id);
    if (ok) { showSuccess("تم الحذف"); await load(); }
    else showError("فشل الحذف");
  }

  const filtered = rows.filter((r) => {
    if (filterVerified === "verified" && !r.is_verified) return false;
    if (filterVerified === "pending" && r.is_verified) return false;
    if (search) {
      return arabicMatchAny([r.source_id, r.target_id, r.label ?? ""], search);
    }
    return true;
  });

  const stats = {
    total: rows.length,
    verified: rows.filter((r) => r.is_verified).length,
    pending: rows.filter((r) => !r.is_verified).length,
  };

  const F = form;

  return (
    <div className="rel-page">
      <h2 className="rel-title">
        الرسم البياني المعرفي — العلاقات
      </h2>

      <div className="rel-stats-row">
        {[
          { label: "الإجمالي", value: stats.total },
          { label: "محققة", value: stats.verified },
          { label: "قيد المراجعة", value: stats.pending },
        ].map((s) => (
          <div key={s.label} className="rel-stat">
            <div className="rel-stat__value">{s.value}</div>
            <div className="rel-stat__label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rel-form">
        <h3 className="rel-form-h3">
          {editId ? "تعديل العلاقة" : "إضافة علاقة جديدة"}
        </h3>
        <div className="rel-form-grid">
          <div className="rel-field">
            <label className="rel-label" htmlFor="rel-source-type">نوع المصدر</label>
            <select id="rel-source-type" className="rel-select" value={F.source_type}
              onChange={(e) => setForm((p) => ({ ...p, source_type: e.target.value as KnowledgeSourceType }))}>
              {SOURCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="rel-field">
            <label className="rel-label" htmlFor="rel-source-id">معرّف المصدر (ID)</label>
            <input id="rel-source-id" className="rel-input" value={F.source_id} placeholder="uuid أو external_key..."
              onChange={(e) => setForm((p) => ({ ...p, source_id: e.target.value }))} />
          </div>
          <div className="rel-field">
            <label className="rel-label" htmlFor="rel-target-type">نوع الهدف</label>
            <select id="rel-target-type" className="rel-select" value={F.target_type}
              onChange={(e) => setForm((p) => ({ ...p, target_type: e.target.value as KnowledgeSourceType }))}>
              {SOURCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="rel-field">
            <label className="rel-label" htmlFor="rel-target-id">معرّف الهدف (ID)</label>
            <input id="rel-target-id" className="rel-input" value={F.target_id} placeholder="uuid أو external_key..."
              onChange={(e) => setForm((p) => ({ ...p, target_id: e.target.value }))} />
          </div>
          <div className="rel-field">
            <label className="rel-label" htmlFor="rel-relationship-type">نوع العلاقة</label>
            <select id="rel-relationship-type" className="rel-select" value={F.relationship_type}
              onChange={(e) => setForm((p) => ({ ...p, relationship_type: e.target.value as KnowledgeRelType }))}>
              {REL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="rel-field">
            <label className="rel-label" htmlFor="rel-label-input">تسمية مختصرة (اختياري)</label>
            <input id="rel-label-input" className="rel-input" value={F.label} placeholder="شرح ابن عثيمين..."
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} />
          </div>
          <div className="rel-field rel-full-col">
            <label className="rel-label" htmlFor="rel-source-reference">المصدر والمرجع (اختياري)</label>
            <input id="rel-source-reference" className="rel-input" value={F.source_reference} placeholder="كتاب السير / الطبقات الكبرى..."
              onChange={(e) => setForm((p) => ({ ...p, source_reference: e.target.value }))} />
          </div>
          <div className="rel-verified-row">
            <input type="checkbox" id="is_verified_chk" checked={F.is_verified}
              onChange={(e) => setForm((p) => ({ ...p, is_verified: e.target.checked }))} />
            <label htmlFor="is_verified_chk" className="rel-verified-lbl">
              محققة ومعتمدة
            </label>
          </div>
        </div>
        <div className="rel-form-actions">
          <button type="button" disabled={saving} onClick={handleSave} className="rel-save-btn">
            {saving ? "جارِ الحفظ..." : editId ? "تحديث" : "إضافة"}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="rel-cancel-btn">
              إلغاء
            </button>
          )}
        </div>
      </div>

      <div className="rel-filters">
        <input className="rel-search" value={search} placeholder="بحث بالمعرّف أو التسمية..."
          onChange={(e) => setSearch(e.target.value)} />
        {(["all", "verified", "pending"] as const).map((v) => (
          <button key={v} type="button" onClick={() => setFilterVerified(v)}
            className="rel-filter-btn"
            style={filterVerified === v ? { "--rel-fb-bg": "var(--mj-brand)", "--rel-fb-color": "#fff" } as React.CSSProperties : undefined}>
            {v === "all" ? "الكل" : v === "verified" ? "محققة" : "قيد المراجعة"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="rel-empty">جارِ التحميل...</p>
      ) : filtered.length === 0 ? (
        <p className="rel-empty">
          {rows.length === 0
            ? "لا توجد علاقات بعد — أضف أول علاقة أعلاه."
            : "لا نتائج للفلتر المحدد."}
        </p>
      ) : (
        <div className="rel-list">
          {filtered.map((r) => (
            <div key={r.id} className="rel-card">
              <div className="rel-card-body">
                <div className="rel-card-info">
                  <div className="rel-card-tags">
                    <span className="rel-source-tag">
                      {SOURCE_TYPES.find((t) => t.value === r.source_type)?.label ?? r.source_type}
                    </span>
                    <code className="rel-code">{r.source_id.slice(0, 20)}{r.source_id.length > 20 ? "…" : ""}</code>
                    <span className="rel-rel-type">
                      {REL_TYPES.find((t) => t.value === r.relationship_type)?.label ?? r.relationship_type}
                    </span>
                    <span className="rel-target-tag">
                      {SOURCE_TYPES.find((t) => t.value === r.target_type)?.label ?? r.target_type}
                    </span>
                    <code className="rel-code">{r.target_id.slice(0, 20)}{r.target_id.length > 20 ? "…" : ""}</code>
                  </div>
                  {r.label && <span className="rel-label-text">{r.label}</span>}
                  {r.source_reference && <span className="rel-ref-text">المرجع: {r.source_reference}</span>}
                </div>
                <div className="rel-card-actions">
                  <span
                    className="rel-verified-badge"
                    style={{
                      "--rel-vb-bg": r.is_verified ? "#d1fae5" : "#E6EDE9",
                      "--rel-vb-color": r.is_verified ? "var(--mj-brand)" : "var(--mj-brand-deep)",
                    } as React.CSSProperties}
                  >
                    {r.is_verified ? "محققة" : "قيد المراجعة"}
                  </span>
                  <button type="button" onClick={() => handleToggleVerified(r)}
                    className="rel-toggle-btn"
                    style={{ "--rel-tb-bg": r.is_verified ? "rgba(23,61,53,0.08)" : "#d1fae5" } as React.CSSProperties}>
                    {r.is_verified ? "إلغاء التحقق" : "تحقق"}
                  </button>
                  <button type="button" onClick={() => startEdit(r)} className="rel-edit-btn">
                    تعديل
                  </button>
                  <button type="button" onClick={() => handleDelete(r)} className="rel-del-btn">
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
          {confirmDialog}

    </div>
  );
}
