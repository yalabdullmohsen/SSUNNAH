import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { v3List, v3Mutate } from "../../data/admin-v3-api";
import { can, resolveGovernanceRole } from "../../permissions";
import { emitAdminV3AuditEvent } from "../../audit-events";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminFilterBar,
  AdminFlash,
  AdminFormField,
  AdminFormLayout,
  AdminLoadGate,
  AdminPageHeader,
  AdminPagination,
  AdminPermissionDenied,
  AdminSearchInput,
  AdminStatusBadge,
  useDebouncedValue,
  useUnsavedWarning,
} from "../../ui/primitives";

/** ADMIN-FINAL-4 remaining Supabase-backed content entities */
export type RemainingEntityKind = "library" | "islamic-stories" | "prophet-stories" | "arbaeen";

const META: Record<
  RemainingEntityKind,
  {
    title: string;
    description: string;
    legacy: string;
    labelField: string;
    createLabel: string;
    api: string;
    statusMode: "status" | "approved" | "review";
  }
> = {
  library: {
    title: "المكتبة",
    description: "كتب ومراجع — CRUD أصلي عبر API محمي (FINAL-4).",
    legacy: "/admin?section=library",
    labelField: "title",
    createLabel: "مادة جديدة",
    api: "library",
    statusMode: "status",
  },
  "islamic-stories": {
    title: "القصص الإسلامية",
    description: "قائمة وتحرير واعتماد — عبر API محمي (FINAL-4).",
    legacy: "/admin?section=islamic-stories",
    labelField: "title",
    createLabel: "قصة جديدة",
    api: "islamic-stories",
    statusMode: "approved",
  },
  "prophet-stories": {
    title: "قصص الأنبياء",
    description: "محتوى واعتماد — محرر الاستشهادات يبقى في Legacy حتى تكافؤ كامل.",
    legacy: "/admin?section=prophet-stories",
    labelField: "arabic_name",
    createLabel: "قصة جديدة",
    api: "prophet-stories",
    statusMode: "approved",
  },
  arbaeen: {
    title: "الأربعون في محبة الله",
    description: "أحاديث محبة الله — حالات مراجعة تحريرية عبر API (FINAL-4).",
    legacy: "/admin?section=arbaeen-love",
    labelField: "title",
    createLabel: "حديث جديد",
    api: "arbaeen",
    statusMode: "review",
  },
};

function emptyDraft(kind: RemainingEntityKind): Record<string, string> {
  if (kind === "library") {
    return { title: "", author_name: "", type: "كتاب", category: "", description: "", status: "draft" };
  }
  if (kind === "islamic-stories") {
    return {
      title: "",
      slug: "",
      category: "",
      era: "",
      summary: "",
      full_content: "",
      is_approved: "false",
    };
  }
  if (kind === "prophet-stories") {
    return { arabic_name: "", slug: "", content: "", is_approved: "false" };
  }
  return {
    title: "",
    hadith_text: "",
    source: "",
    hadith_number: "",
    grade: "",
    order_number: "",
    review_status: "draft",
    editor_notes: "",
  };
}

export function RemainingEntityCrudPage({ kind }: { kind: RemainingEntityKind }) {
  const meta = META[kind];
  const { user } = useAuth();
  const role = resolveGovernanceRole(user);
  const canRead = can(role, "content.read") || can(role, "content.edit");
  const canWrite = can(role, "content.edit") || can(role, "content.create");
  const canArchive = can(role, "content.delete") || can(role, "archive") || can(role, "content.*");

  const [q, setQ] = useState("");
  const dq = useDebouncedValue(q);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Record<string, unknown> | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  useUnsavedWarning(dirty);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const res = await v3List<Record<string, unknown>>(
          meta.api,
          {
            q: dq || undefined,
            page,
            pageSize: 20,
            status: status || undefined,
          },
          signal,
        );
        setRows(res.data || []);
        setTotal(res.total || 0);
      } catch (e) {
        const err = e as { userMessageAr?: string; correlationId?: string };
        setError(
          `${err.userMessageAr || "تعذّر التحميل."}${err.correlationId ? ` [${err.correlationId}]` : ""}`,
        );
      } finally {
        setLoading(false);
      }
    },
    [meta.api, dq, page, status],
  );

  useEffect(() => {
    if (!canRead) return;
    const ac = new AbortController();
    void load(ac.signal);
    emitAdminV3AuditEvent("admin.center.view", `/admin/v3/content/${kind}`, { center: "content", kind });
    return () => ac.abort();
  }, [load, canRead, kind]);

  const openCreate = () => {
    setEditing({});
    setDraft(emptyDraft(kind));
    setDirty(false);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditing(row);
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      if (v == null || typeof v === "object") continue;
      if (typeof v === "boolean") next[k] = v ? "true" : "false";
      else next[k] = String(v);
    }
    setDraft(next);
    setDirty(false);
  };

  const closeEditor = () => {
    setEditing(null);
    setDirty(false);
    setConfirmDiscard(false);
  };

  const requestCloseEditor = () => {
    if (dirty) {
      setConfirmDiscard(true);
      return;
    }
    closeEditor();
  };

  const onField = (key: string, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!canWrite || busy) return;
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { ...draft };
      if (kind === "islamic-stories" || kind === "prophet-stories") {
        body.is_approved = draft.is_approved === "true";
      }
      if (editing?.id) body.id = editing.id;
      await v3Mutate(meta.api, editing?.id ? "PUT" : "POST", body);
      emitAdminV3AuditEvent(editing?.id ? "admin.content.update" : "admin.content.create", `/admin/v3/content/${kind}`, {
        kind,
        id: editing?.id ? String(editing.id) : null,
      });
      setFlash("تم الحفظ.");
      setEditing(null);
      setDirty(false);
      await load();
    } catch (err) {
      const e2 = err as { userMessageAr?: string };
      setError(e2.userMessageAr || "فشل الحفظ.");
    } finally {
      setBusy(false);
    }
  };

  const onArchive = async () => {
    if (!confirmDelete?.id || !canArchive || busy) return;
    setBusy(true);
    try {
      await v3Mutate(meta.api, "DELETE", undefined, { id: String(confirmDelete.id) });
      emitAdminV3AuditEvent("admin.content.archive", `/admin/v3/content/${kind}`, {
        kind,
        id: String(confirmDelete.id),
      });
      setFlash(`تمت العملية على «${String(confirmDelete[meta.labelField] || confirmDelete.id).slice(0, 40)}».`);
      setConfirmDelete(null);
      await load();
    } catch (err) {
      const e2 = err as { userMessageAr?: string };
      setError(e2.userMessageAr || "فشلت العملية.");
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async (row: Record<string, unknown>) => {
    if (!row.id || !canWrite || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (kind === "library") {
        await v3Mutate(meta.api, "PUT", {
          id: row.id,
          title: row.title,
          author_name: row.author_name || row.author,
          type: row.type,
          category: row.category,
          description: row.description,
          status: "draft",
        });
      } else if (kind === "arbaeen") {
        await v3Mutate(meta.api, "PUT", {
          id: row.id,
          title: row.title,
          hadith_text: row.hadith_text,
          source: row.source,
          review_status: "draft",
        });
      } else {
        await v3Mutate(meta.api, "PUT", {
          id: row.id,
          slug: row.slug,
          ...(kind === "islamic-stories"
            ? { title: row.title, category: row.category, era: row.era, summary: row.summary, full_content: row.full_content }
            : { arabic_name: row.arabic_name, content: row.content }),
          is_approved: false,
        });
      }
      emitAdminV3AuditEvent("admin.content.restore", `/admin/v3/content/${kind}`, {
        kind,
        id: String(row.id),
      });
      setFlash("تمت الاستعادة إلى مسودة/غير معتمد.");
      await load();
    } catch (err) {
      const e2 = err as { userMessageAr?: string };
      setError(e2.userMessageAr || "فشلت الاستعادة.");
    } finally {
      setBusy(false);
    }
  };

  const columns = useMemo(() => {
    if (kind === "library") {
      return [
        { key: "title", label: "العنوان" },
        {
          key: "author_name",
          label: "المؤلف",
          render: (r: Record<string, unknown>) => String(r.author_name || r.author || "—"),
        },
        { key: "type", label: "النوع" },
        {
          key: "status",
          label: "الحالة",
          render: (r: Record<string, unknown>) => <AdminStatusBadge status={String(r.status || "")} />,
        },
      ];
    }
    if (kind === "islamic-stories") {
      return [
        { key: "title", label: "العنوان" },
        { key: "category", label: "التصنيف" },
        { key: "era", label: "العصر" },
        {
          key: "is_approved",
          label: "الاعتماد",
          render: (r: Record<string, unknown>) => (
            <AdminStatusBadge status={r.is_approved ? "approved" : "draft"} />
          ),
        },
      ];
    }
    if (kind === "prophet-stories") {
      return [
        { key: "arabic_name", label: "الاسم" },
        { key: "slug", label: "slug" },
        {
          key: "is_approved",
          label: "الاعتماد",
          render: (r: Record<string, unknown>) => (
            <AdminStatusBadge status={r.is_approved ? "approved" : "draft"} />
          ),
        },
      ];
    }
    return [
      { key: "order_number", label: "#" },
      { key: "title", label: "العنوان" },
      { key: "source", label: "المصدر" },
      {
        key: "review_status",
        label: "المراجعة",
        render: (r: Record<string, unknown>) => <AdminStatusBadge status={String(r.review_status || "")} />,
      },
    ];
  }, [kind]);

  if (!canRead) return <AdminPermissionDenied permission="content.read" />;

  const pageCount = Math.max(1, Math.ceil(total / 20));
  const archiveLabel =
    kind === "arbaeen" ? "رفض" : kind === "library" ? "أرشفة" : "إلغاء الاعتماد";

  return (
    <div className="av3-domain" data-admin-final4-entity={kind}>
      <AdminPageHeader
        title={meta.title}
        description={meta.description}
        badge="أصلي FINAL-4"
        crumbs={[
          { label: "لوحة التحكم", href: "/admin/v3" },
          { label: "المحتوى", href: "/admin/v3/content" },
          { label: meta.title },
        ]}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={meta.legacy}>Legacy</Link>
            </Button>
            {canWrite ? (
              <Button type="button" variant="primary" onClick={openCreate}>
                {meta.createLabel}
              </Button>
            ) : null}
          </>
        }
      />

      {flash ? <AdminFlash>{flash}</AdminFlash> : null}

      <AdminFilterBar
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
        }}
      >
        <AdminSearchInput value={q} onChange={setQ} label="بحث" />
        <label className="av3-field">
          <span className="av3-sr-only">الحالة</span>
          <select
            aria-label="تصفية الحالة"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">كل الحالات</option>
            {meta.statusMode === "status" ? (
              <>
                <option value="draft">مسودة</option>
                <option value="approved">معتمد</option>
                <option value="archived">مؤرشف</option>
              </>
            ) : null}
            {meta.statusMode === "approved" ? (
              <>
                <option value="approved">معتمد</option>
                <option value="draft">غير معتمد</option>
              </>
            ) : null}
            {meta.statusMode === "review" ? (
              <>
                <option value="draft">مسودة</option>
                <option value="in_review">قيد المراجعة</option>
                <option value="verified">موثّق</option>
                <option value="published">منشور</option>
                <option value="rejected">مرفوض</option>
              </>
            ) : null}
          </select>
        </label>
      </AdminFilterBar>

      <AdminLoadGate loading={loading} error={error} onRetry={() => void load()}>
        <AdminDataTable
          rows={rows}
          rowKey={(r) => String(r.id)}
          emptyTitle={dq || status ? "لا نتائج مطابقة" : "لا عناصر بعد"}
          columns={[
            ...columns,
            {
              key: "actions",
              label: "إجراءات",
              render: (r) => {
                const archived =
                  (kind === "library" && String(r.status || "") === "archived") ||
                  (kind === "arbaeen" && String(r.review_status || "") === "rejected") ||
                  ((kind === "islamic-stories" || kind === "prophet-stories") && !r.is_approved);
                return (
                  <div className="av3-row-actions">
                    {canWrite ? (
                      <Button type="button" variant="secondary" onClick={() => openEdit(r)}>
                        تعديل
                      </Button>
                    ) : null}
                    {canWrite && archived && kind === "library" ? (
                      <Button type="button" variant="secondary" disabled={busy} onClick={() => void onRestore(r)}>
                        استعادة
                      </Button>
                    ) : null}
                    {canWrite && archived && kind === "arbaeen" ? (
                      <Button type="button" variant="secondary" disabled={busy} onClick={() => void onRestore(r)}>
                        استعادة
                      </Button>
                    ) : null}
                    {canArchive && !archived ? (
                      <Button type="button" variant="destructive" onClick={() => setConfirmDelete(r)}>
                        {archiveLabel}
                      </Button>
                    ) : null}
                  </div>
                );
              },
            },
          ]}
        />
        <AdminPagination page={page} pageCount={pageCount} onChange={setPage} />
      </AdminLoadGate>

      {editing ? (
        <div className="av3-drawer" role="dialog" aria-modal="true" aria-label="نموذج التحرير">
          <AdminFormLayout
            onSubmit={onSave}
            actions={
              <>
                <Button type="button" variant="secondary" onClick={requestCloseEditor}>
                  إلغاء
                </Button>
                <Button type="submit" variant="primary" disabled={!canWrite} loading={busy}>
                  حفظ
                </Button>
              </>
            }
          >
            {kind === "library" ? (
              <>
                <AdminFormField label="العنوان" id="lib-title">
                  <input id="lib-title" value={draft.title || ""} onChange={(e) => onField("title", e.target.value)} required />
                </AdminFormField>
                <AdminFormField label="المؤلف" id="lib-author">
                  <input
                    id="lib-author"
                    value={draft.author_name || ""}
                    onChange={(e) => onField("author_name", e.target.value)}
                  />
                </AdminFormField>
                <AdminFormField label="النوع" id="lib-type">
                  <input id="lib-type" value={draft.type || ""} onChange={(e) => onField("type", e.target.value)} />
                </AdminFormField>
                <AdminFormField label="التصنيف" id="lib-cat">
                  <input
                    id="lib-cat"
                    value={draft.category || ""}
                    onChange={(e) => onField("category", e.target.value)}
                  />
                </AdminFormField>
                <AdminFormField label="الوصف" id="lib-desc">
                  <textarea
                    id="lib-desc"
                    rows={4}
                    value={draft.description || ""}
                    onChange={(e) => onField("description", e.target.value)}
                  />
                </AdminFormField>
                <AdminFormField label="الحالة" id="lib-status">
                  <select
                    id="lib-status"
                    aria-label="حالة المادة"
                    value={draft.status || "draft"}
                    onChange={(e) => onField("status", e.target.value)}
                  >
                    <option value="draft">مسودة</option>
                    <option value="approved">معتمد</option>
                    <option value="archived">مؤرشف</option>
                  </select>
                </AdminFormField>
              </>
            ) : null}
            {kind === "islamic-stories" ? (
              <>
                <AdminFormField label="العنوان" id="is-title">
                  <input id="is-title" value={draft.title || ""} onChange={(e) => onField("title", e.target.value)} required />
                </AdminFormField>
                <AdminFormField label="slug" id="is-slug">
                  <input id="is-slug" value={draft.slug || ""} onChange={(e) => onField("slug", e.target.value)} required />
                </AdminFormField>
                <AdminFormField label="التصنيف" id="is-cat">
                  <input
                    id="is-cat"
                    value={draft.category || ""}
                    onChange={(e) => onField("category", e.target.value)}
                  />
                </AdminFormField>
                <AdminFormField label="العصر" id="is-era">
                  <input id="is-era" value={draft.era || ""} onChange={(e) => onField("era", e.target.value)} />
                </AdminFormField>
                <AdminFormField label="الملخص" id="is-sum">
                  <textarea
                    id="is-sum"
                    rows={3}
                    value={draft.summary || ""}
                    onChange={(e) => onField("summary", e.target.value)}
                  />
                </AdminFormField>
                <AdminFormField label="المحتوى" id="is-body">
                  <textarea
                    id="is-body"
                    rows={6}
                    value={draft.full_content || ""}
                    onChange={(e) => onField("full_content", e.target.value)}
                  />
                </AdminFormField>
                <AdminFormField label="الاعتماد" id="is-appr">
                  <select
                    id="is-appr"
                    aria-label="اعتماد القصة"
                    value={draft.is_approved || "false"}
                    onChange={(e) => onField("is_approved", e.target.value)}
                  >
                    <option value="false">غير معتمد</option>
                    <option value="true">معتمد</option>
                  </select>
                </AdminFormField>
              </>
            ) : null}
            {kind === "prophet-stories" ? (
              <>
                <AdminFormField label="الاسم العربي" id="ps-name">
                  <input
                    id="ps-name"
                    value={draft.arabic_name || ""}
                    onChange={(e) => onField("arabic_name", e.target.value)}
                    required
                  />
                </AdminFormField>
                <AdminFormField label="slug" id="ps-slug">
                  <input id="ps-slug" value={draft.slug || ""} onChange={(e) => onField("slug", e.target.value)} required />
                </AdminFormField>
                <AdminFormField label="المحتوى" id="ps-body">
                  <textarea
                    id="ps-body"
                    rows={6}
                    value={draft.content || ""}
                    onChange={(e) => onField("content", e.target.value)}
                  />
                </AdminFormField>
                <AdminFormField label="الاعتماد" id="ps-appr">
                  <select
                    id="ps-appr"
                    aria-label="اعتماد القصة"
                    value={draft.is_approved || "false"}
                    onChange={(e) => onField("is_approved", e.target.value)}
                  >
                    <option value="false">غير معتمد</option>
                    <option value="true">معتمد</option>
                  </select>
                </AdminFormField>
                <p className="av3-field-hint">محرر الاستشهادات القرآنية يبقى في Legacy حتى V3_COMPLETE.</p>
              </>
            ) : null}
            {kind === "arbaeen" ? (
              <>
                <AdminFormField label="الترتيب" id="ab-ord">
                  <input
                    id="ab-ord"
                    value={draft.order_number || ""}
                    onChange={(e) => onField("order_number", e.target.value)}
                    inputMode="numeric"
                  />
                </AdminFormField>
                <AdminFormField label="العنوان" id="ab-title">
                  <input id="ab-title" value={draft.title || ""} onChange={(e) => onField("title", e.target.value)} required />
                </AdminFormField>
                <AdminFormField label="نص الحديث" id="ab-text">
                  <textarea
                    id="ab-text"
                    rows={5}
                    value={draft.hadith_text || ""}
                    onChange={(e) => onField("hadith_text", e.target.value)}
                    required
                  />
                </AdminFormField>
                <AdminFormField label="المصدر" id="ab-src">
                  <input id="ab-src" value={draft.source || ""} onChange={(e) => onField("source", e.target.value)} required />
                </AdminFormField>
                <AdminFormField label="رقم الحديث" id="ab-num">
                  <input
                    id="ab-num"
                    value={draft.hadith_number || ""}
                    onChange={(e) => onField("hadith_number", e.target.value)}
                  />
                </AdminFormField>
                <AdminFormField label="الدرجة" id="ab-grade">
                  <select
                    id="ab-grade"
                    aria-label="درجة الحديث"
                    value={draft.grade || ""}
                    onChange={(e) => onField("grade", e.target.value)}
                  >
                    <option value="">—</option>
                    <option value="صحيح">صحيح</option>
                    <option value="حسن">حسن</option>
                    <option value="ضعيف">ضعيف</option>
                  </select>
                </AdminFormField>
                <AdminFormField label="حالة المراجعة" id="ab-status">
                  <select
                    id="ab-status"
                    aria-label="حالة المراجعة"
                    value={draft.review_status || "draft"}
                    onChange={(e) => onField("review_status", e.target.value)}
                  >
                    <option value="draft">مسودة</option>
                    <option value="in_review">قيد المراجعة</option>
                    <option value="verified">موثّق</option>
                    <option value="published">منشور</option>
                    <option value="rejected">مرفوض</option>
                  </select>
                </AdminFormField>
                <AdminFormField label="ملاحظات المحرر" id="ab-notes">
                  <textarea
                    id="ab-notes"
                    rows={3}
                    value={draft.editor_notes || ""}
                    onChange={(e) => onField("editor_notes", e.target.value)}
                  />
                </AdminFormField>
              </>
            ) : null}
          </AdminFormLayout>
        </div>
      ) : null}

      <AdminConfirmDialog
        open={!!confirmDelete}
        title="تأكيد العملية"
        body={`هل تريد ${archiveLabel} «${String(confirmDelete?.[meta.labelField] || "").slice(0, 60)}»؟`}
        confirmLabel={archiveLabel}
        danger
        busy={busy}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => void onArchive()}
      />

      <AdminConfirmDialog
        open={confirmDiscard}
        title="تغييرات غير محفوظة"
        body="هناك تغييرات غير محفوظة. هل تريد الإغلاق دون حفظ؟"
        confirmLabel="إغلاق دون حفظ"
        danger
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={closeEditor}
      />
    </div>
  );
}
