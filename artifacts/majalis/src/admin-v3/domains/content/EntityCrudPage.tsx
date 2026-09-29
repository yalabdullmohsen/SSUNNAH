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

export type EntityKind = "lessons" | "sheikhs" | "fawaid";

const META: Record<
  EntityKind,
  { title: string; description: string; legacy: string; labelField: string; createLabel: string }
> = {
  lessons: {
    title: "الدروس",
    description: "إدارة الدروس بحالات المسودة/النشر والأرشفة — عبر API محمي.",
    legacy: "/admin?section=lessons",
    labelField: "title",
    createLabel: "درس جديد",
  },
  sheikhs: {
    title: "المشايخ",
    description: "ملفات المشايخ — إنشاء وتعديل وحذف بصلاحية المحتوى.",
    legacy: "/admin?section=sheikhs",
    labelField: "name",
    createLabel: "شيخ جديد",
  },
  fawaid: {
    title: "الفوائد",
    description: "فوائد مختصرة مع مصدر/مؤلف عند التوفر — بلا اختراع مصدر.",
    legacy: "/admin?section=fawaid",
    labelField: "text",
    createLabel: "فائدة جديدة",
  },
};

export function EntityCrudPage({ kind }: { kind: EntityKind }) {
  const meta = META[kind];
  const { user } = useAuth();
  const role = resolveGovernanceRole(user);
  const canRead = can(role, "content.read") || can(role, "content.edit");
  const canWrite = can(role, "content.edit") || can(role, "content.create");
  const canArchive = can(role, "content.delete") || can(role, "archive") || can(role, "content.*");

  const [q, setQ] = useState("");
  const dq = useDebouncedValue(q);
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
          kind,
          { q: dq || undefined, page, pageSize: 20 },
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
    [kind, dq, page],
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
    setDraft(
      kind === "lessons"
        ? { title: "", description: "", speaker_name: "", status: "draft" }
        : kind === "sheikhs"
          ? { name: "", bio: "" }
          : { text: "", author_name: "", source_name: "", status: "draft" },
    );
    setDirty(false);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditing(row);
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      if (v == null || typeof v === "object") continue;
      next[k] = String(v);
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
      if (editing?.id) {
        body.id = editing.id;
        if (editing.updated_at) body.updated_at = editing.updated_at;
      }
      await v3Mutate(kind, editing?.id ? "PUT" : "POST", body);
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
      await v3Mutate(kind, "DELETE", undefined, { id: String(confirmDelete.id) });
      setFlash(`تم أرشفة «${String(confirmDelete[meta.labelField] || confirmDelete.id).slice(0, 40)}».`);
      setConfirmDelete(null);
      await load();
    } catch (err) {
      const e2 = err as { userMessageAr?: string };
      setError(e2.userMessageAr || "فشلت الأرشفة.");
    } finally {
      setBusy(false);
    }
  };

  const columns = useMemo(() => {
    if (kind === "lessons") {
      return [
        { key: "title", label: "العنوان" },
        { key: "speaker_name", label: "المتحدث" },
        {
          key: "status",
          label: "الحالة",
          render: (r: Record<string, unknown>) => <AdminStatusBadge status={String(r.status || "")} />,
        },
        { key: "category", label: "التصنيف" },
      ];
    }
    if (kind === "sheikhs") {
      return [
        { key: "name", label: "الاسم" },
        {
          key: "bio",
          label: "نبذة",
          render: (r: Record<string, unknown>) => String(r.bio || "—").slice(0, 80),
        },
      ];
    }
    return [
      {
        key: "text",
        label: "النص",
        render: (r: Record<string, unknown>) => String(r.text || "—").slice(0, 100),
      },
      { key: "author_name", label: "القائل" },
      { key: "source_name", label: "المصدر" },
      {
        key: "status",
        label: "الحالة",
        render: (r: Record<string, unknown>) => <AdminStatusBadge status={String(r.status || "")} />,
      },
    ];
  }, [kind]);

  if (!canRead) return <AdminPermissionDenied permission="content.read" />;

  const pageCount = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="av3-domain">
      <AdminPageHeader
        title={meta.title}
        description={meta.description}
        badge="أصلي"
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
        <AdminSearchInput value={q} onChange={setQ} />
      </AdminFilterBar>

      <AdminLoadGate loading={loading} error={error} onRetry={() => void load()}>
        <AdminDataTable
          rows={rows}
          rowKey={(r) => String(r.id)}
          columns={[
            ...columns,
            {
              key: "actions",
              label: "إجراءات",
              render: (r) => (
                <div className="av3-row-actions">
                  {canWrite ? (
                    <Button type="button" variant="secondary" onClick={() => openEdit(r)}>
                      تعديل
                    </Button>
                  ) : null}
                  {canArchive ? (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setConfirmDelete(r)}
                    >
                      أرشفة
                    </Button>
                  ) : null}
                </div>
              ),
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
            {kind === "lessons" ? (
              <>
                <AdminFormField label="العنوان" id="lesson-title">
                  <input
                    id="lesson-title"
                    value={draft.title || ""}
                    onChange={(e) => onField("title", e.target.value)}
                    required
                  />
                </AdminFormField>
                <AdminFormField label="المتحدث" id="lesson-speaker">
                  <input
                    id="lesson-speaker"
                    value={draft.speaker_name || ""}
                    onChange={(e) => onField("speaker_name", e.target.value)}
                  />
                </AdminFormField>
                <AdminFormField label="الوصف" id="lesson-desc">
                  <textarea
                    id="lesson-desc"
                    rows={5}
                    value={draft.description || ""}
                    onChange={(e) => onField("description", e.target.value)}
                  />
                </AdminFormField>
                <AdminFormField label="الحالة" id="lesson-status">
                  <select
                    id="lesson-status"
                    value={draft.status || "draft"}
                    onChange={(e) => onField("status", e.target.value)}
                  >
                    <option value="draft">مسودة</option>
                    <option value="approved">منشور</option>
                    <option value="archived">مؤرشف</option>
                  </select>
                </AdminFormField>
              </>
            ) : null}
            {kind === "sheikhs" ? (
              <>
                <AdminFormField label="الاسم" id="sheikh-name">
                  <input
                    id="sheikh-name"
                    value={draft.name || ""}
                    onChange={(e) => onField("name", e.target.value)}
                    required
                  />
                </AdminFormField>
                <AdminFormField label="نبذة" id="sheikh-bio">
                  <textarea
                    id="sheikh-bio"
                    rows={5}
                    value={draft.bio || ""}
                    onChange={(e) => onField("bio", e.target.value)}
                  />
                </AdminFormField>
              </>
            ) : null}
            {kind === "fawaid" ? (
              <>
                <AdminFormField label="النص" id="fawaid-text">
                  <textarea
                    id="fawaid-text"
                    rows={5}
                    value={draft.text || ""}
                    onChange={(e) => onField("text", e.target.value)}
                    required
                  />
                </AdminFormField>
                <AdminFormField label="القائل" id="fawaid-author">
                  <input
                    id="fawaid-author"
                    value={draft.author_name || ""}
                    onChange={(e) => onField("author_name", e.target.value)}
                  />
                </AdminFormField>
                <AdminFormField label="المصدر" id="fawaid-source">
                  <input
                    id="fawaid-source"
                    value={draft.source_name || ""}
                    onChange={(e) => onField("source_name", e.target.value)}
                  />
                </AdminFormField>
                <AdminFormField label="الحالة" id="fawaid-status">
                  <select
                    id="fawaid-status"
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
          </AdminFormLayout>
        </div>
      ) : null}

      <AdminConfirmDialog
        open={!!confirmDelete}
        title="تأكيد الأرشفة"
        body={`هل تريد أرشفة «${String(confirmDelete?.[meta.labelField] || "").slice(0, 60)}»؟`}
        confirmLabel="أرشفة"
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
