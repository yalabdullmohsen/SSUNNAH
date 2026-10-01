import { useEffect, useState } from "react";
import { adminGetMiracles, adminUpsertMiracle, adminDeleteMiracle } from "@/lib/supabase";
import { sanitizeText } from "@/lib/sanitize";
import { SkeletonCardGrid } from "@/components/ui-common";
import { AdminModal, Field } from "./AdminModal";
import { BulkImport } from "./BulkImport";
import { arabicMatchAny } from "@/lib/arabic-search";
import { useAdminConfirm, useAdminAlert } from "@/components/admin/AdminConfirmDialog";

const EMPTY: any = { title: "", category: "", body: "", status: "approved" };

export function MiraclesSection() {
  const { confirm, dialog: confirmDialog } = useAdminConfirm();
  const { alert, dialog: alertDialog } = useAdminAlert();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => { const p = new URLSearchParams(window.location.search); return p.get("q") || ""; });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminGetMiracles().then(({ data }) => {
      setItems(data ?? []);
      setLoading(false);
     }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((item) =>
    arabicMatchAny([item.title, item.category ?? "", item.body ?? item.summary ?? ""], search),
  );

  const handleSave = async () => {
    if (!form.title.trim()) {
      await alert("العنوان مطلوب");
      return;
    }
    setSaving(true);
    const { error } = await adminUpsertMiracle({
      ...form,
      title: sanitizeText(form.title, 300),
      category: sanitizeText(form.category, 120),
      body: sanitizeText(form.body ?? form.summary ?? "", 6000),
    });
    setSaving(false);
    if (error) { await alert("تعذّر الحفظ."); return; }
    setOpen(false);
    load();
  };

  return (
    <div>
      <div className="mir-header">
        <h2 className="mir-title">إشارات كونية ({items.length})</h2>
        <div className="mir-btn-group">
          <BulkImport
            title="استيراد مقالات"
            template={[{ title: "الإعجاز في خلق الإنسان", category: "الأجنة", body: "ملخص المقال...", status: "approved" }]}
            importRow={(row) => adminUpsertMiracle({ status: "approved", ...row })}
            onDone={load}
          />
          <button type="button" onClick={() => { setForm({ ...EMPTY }); setOpen(true); }} className="mir-add-btn">+ إضافة</button>
        </div>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث..." className="adm-input mir-search" />

      {loading ? <SkeletonCardGrid count={6} /> : (
        <div className="mir-table-wrap">
          <table className="mir-table">
            <thead>
              <tr className="mir-thead-row">
                {["العنوان", "التصنيف", "إجراءات"].map((h) => (
                  <th key={h} className="mir-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="mir-tr">
                  <td className="mir-td">{item.title}</td>
                  <td className="mir-td mir-td--muted">{item.category || "—"}</td>
                  <td className="mir-td">
                    <button type="button" onClick={() => { setForm({ ...EMPTY, ...item }); setOpen(true); }} className="mir-edit-btn">تعديل</button>
                    <button type="button" onClick={async () => { if ((await confirm({ title: "تأكيد", body: "حذف؟", danger: true, confirmLabel: "تأكيد" }))) adminDeleteMiracle(item.id).then(load).catch(async () => { await alert("تعذّر الحذف."); }); }}>حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={open} title={form.id ? "تعديل مقال" : "إضافة مقال"} onClose={() => setOpen(false)} onSave={handleSave} saving={saving}>
        <Field label="العنوان"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="adm-input" /></Field>
        <Field label="التصنيف"><input value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} className="adm-input" /></Field>
        <Field label="المحتوى"><textarea value={form.body || form.summary || ""} onChange={(e) => setForm({ ...form, body: e.target.value })} className="adm-textarea" rows={6} /></Field>
      </AdminModal>
          {confirmDialog}
      {alertDialog}

    </div>
  );
}
