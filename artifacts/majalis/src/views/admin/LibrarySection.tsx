import { useEffect, useState } from "react";
import { arabicMatchAny } from "@/lib/arabic-search";
import { adminGetLibrary, adminUpsertLibraryItem, adminDeleteLibraryItem } from "@/lib/supabase";
import { sanitizeText } from "@/lib/sanitize";
import { Button } from "@/components/ui/button";
import { SkeletonCardGrid } from "@/design-system";
import { AdminModal, Field } from "./AdminModal";
import { BulkImport } from "./BulkImport";
import { useAdminConfirm, useAdminAlert } from "@/components/admin/AdminConfirmDialog";

const TYPES = ["كتاب", "متن", "تفريغ", "ملخص", "صوت", "مرئي"];
const EMPTY: any = { title: "", author: "", category: "", item_type: "كتاب", description: "", status: "approved" };

export function LibrarySection() {
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
    adminGetLibrary().then(({ data }) => {
      setItems(data ?? []);
      setLoading(false);
     }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((item) =>
    arabicMatchAny([item.title, item.author ?? "", item.category ?? ""], search),
  );

  const handleSave = async () => {
    if (!form.title.trim()) {
      await alert("عنوان المادة مطلوب");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      title: sanitizeText(form.title, 300),
      author: sanitizeText(form.author, 200),
      description: sanitizeText(form.description, 4000),
      category: sanitizeText(form.category, 120),
    };
    await adminUpsertLibraryItem(payload);
    setSaving(false);
    setOpen(false);
    load();
  };

  return (
    <div>
      <div className="mir-header">
        <h2 className="mir-title">المكتبة ({items.length})</h2>
        <div className="mir-btn-group">
          <BulkImport
            title="استيراد المكتبة"
            template={[{ title: "كتاب العلم", author: "ابن القيم", category: "عقيدة", item_type: "كتاب", status: "approved" }]}
            importRow={(row) => adminUpsertLibraryItem({ status: "approved", ...row })}
            onDone={load}
          />
          <Button type="button" variant="primary" size="small" onClick={() => { setForm({ ...EMPTY }); setOpen(true); }} className="mir-add-btn">+ إضافة</Button>
        </div>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث..." className="adm-input mir-search" />

      {loading ? <SkeletonCardGrid count={6} /> : (
        <div className="mir-table-wrap">
          <table className="mir-table">
            <thead>
              <tr className="mir-thead-row">
                {["العنوان", "المؤلف", "التصنيف", "النوع", "إجراءات"].map((h) => (
                  <th key={h} className="mir-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="mir-tr">
                  <td className="mir-td">{item.title}</td>
                  <td className="mir-td mir-td--muted">{item.author || "—"}</td>
                  <td className="mir-td mir-td--muted">{item.category || "—"}</td>
                  <td className="mir-td mir-td--muted">{item.item_type || "—"}</td>
                  <td className="mir-td">
                    <Button type="button" variant="secondary" size="small" onClick={() => { setForm({ ...EMPTY, ...item }); setOpen(true); }} className="mir-edit-btn">تعديل</Button>
                    <Button type="button" variant="destructive" size="small" onClick={async () => { if ((await confirm({ title: "تأكيد", body: "حذف؟", danger: true, confirmLabel: "تأكيد" }))) adminDeleteLibraryItem(item.id).then(load); }}>حذف</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={open} title={form.id ? "تعديل مادة" : "إضافة مادة"} onClose={() => setOpen(false)} onSave={handleSave} saving={saving}>
        <Field label="العنوان"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="adm-input" /></Field>
        <Field label="المؤلف"><input value={form.author || ""} onChange={(e) => setForm({ ...form, author: e.target.value })} className="adm-input" /></Field>
        <Field label="التصنيف"><input value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} className="adm-input" /></Field>
        <Field label="النوع">
          <select value={form.item_type || "كتاب"} onChange={(e) => setForm({ ...form, item_type: e.target.value })} className="adm-select">
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="الوصف"><textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="adm-textarea" rows={4} /></Field>
      </AdminModal>
          {confirmDialog}
      {alertDialog}

    </div>
  );
}
