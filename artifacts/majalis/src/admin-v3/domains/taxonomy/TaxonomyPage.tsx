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
  AdminPermissionDenied,
  AdminSearchInput,
  AdminStatusBadge,
  useDebouncedValue,
} from "../../ui/primitives";

type Cat = {
  id: string;
  parent_id?: string | null;
  slug?: string;
  name?: string;
  status?: string;
  sort_order?: number;
};

export function TaxonomyPage() {
  const { user } = useAuth();
  const role = resolveGovernanceRole(user);
  const canRead = can(role, "content.read") || can(role, "content.edit");
  const canWrite = can(role, "content.edit") || can(role, "content.*");

  const [allRows, setAllRows] = useState<Cat[]>([]);
  const [q, setQ] = useState("");
  const dq = useDebouncedValue(q);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [draft, setDraft] = useState({ id: "", name: "", slug: "", parent_id: "", status: "published" });
  const [busy, setBusy] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Cat | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await v3List<Cat>("categories");
      setAllRows(res.data || []);
      emitAdminV3AuditEvent("admin.center.view", "/admin/v3/taxonomy", { center: "taxonomy" });
    } catch (e) {
      const err = e as { userMessageAr?: string };
      setError(err.userMessageAr || "تعذّر تحميل التصنيفات.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canRead) void load();
  }, [canRead, load]);

  const rows = useMemo(() => {
    const term = dq.trim().toLowerCase();
    return allRows.filter((r) => {
      if (status && String(r.status || "") !== status) return false;
      if (!term) return true;
      return (
        String(r.name || "")
          .toLowerCase()
          .includes(term) ||
        String(r.slug || "")
          .toLowerCase()
          .includes(term)
      );
    });
  }, [allRows, dq, status]);

  const byId = useMemo(() => new Map(allRows.map((r) => [r.id, r])), [allRows]);

  if (!canRead) return <AdminPermissionDenied permission="content.read" />;

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!canWrite || busy) return;
    setBusy(true);
    setError(null);
    try {
      await v3Mutate("categories", draft.id ? "PUT" : "POST", {
        id: draft.id || undefined,
        name: draft.name,
        slug: draft.slug,
        parent_id: draft.parent_id || null,
        status: draft.status,
      });
      emitAdminV3AuditEvent(draft.id ? "admin.taxonomy.update" : "admin.taxonomy.create", "/admin/v3/taxonomy", {
        id: draft.id || null,
      });
      setFlash(draft.id ? "تم تحديث التصنيف." : "تم إنشاء التصنيف.");
      setDraft({ id: "", name: "", slug: "", parent_id: "", status: "published" });
      await load();
    } catch (err) {
      const e2 = err as { userMessageAr?: string };
      setError(e2.userMessageAr || "فشل الحفظ.");
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async (r: Cat) => {
    if (!canWrite || busy) return;
    setBusy(true);
    setError(null);
    try {
      await v3Mutate("categories", "PUT", {
        id: r.id,
        name: r.name,
        slug: r.slug,
        parent_id: r.parent_id || null,
        status: "published",
      });
      emitAdminV3AuditEvent("admin.taxonomy.restore", "/admin/v3/taxonomy", { id: r.id });
      setFlash(`استُعيد «${r.name || r.id}».`);
      await load();
    } catch (err) {
      const e2 = err as { userMessageAr?: string };
      setError(e2.userMessageAr || "فشلت الاستعادة.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="av3-domain" data-testid="admin-v3-taxonomy">
      <AdminPageHeader
        title="التصنيفات"
        description="شجرة أبواب العلم — منع الحلقات وأرشفة بدل الحذف النهائي · FINAL-3."
        badge="FINAL-3"
        crumbs={[
          { label: "لوحة التحكم", href: "/admin/v3" },
          { label: "التصنيف" },
        ]}
        actions={
          <Button asChild variant="secondary">
            <Link href="/admin?section=categories">Legacy</Link>
          </Button>
        }
      />

      {flash ? <AdminFlash>{flash}</AdminFlash> : null}

      <AdminFilterBar
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <AdminSearchInput value={q} onChange={setQ} label="بحث بالاسم أو slug" />
        <label className="av3-field">
          <span className="av3-sr-only">الحالة</span>
          <select
            aria-label="تصفية الحالة"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">كل الحالات</option>
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
            <option value="archived">مؤرشف</option>
          </select>
        </label>
      </AdminFilterBar>

      <AdminLoadGate loading={loading} error={error} onRetry={() => void load()}>
        <AdminDataTable
          rows={rows as unknown as Record<string, unknown>[]}
          rowKey={(r) => String(r.id)}
          emptyTitle={dq || status ? "لا نتائج مطابقة" : "لا تصنيفات بعد"}
          columns={[
            { key: "name", label: "الاسم" },
            { key: "slug", label: "slug" },
            {
              key: "parent_id",
              label: "الأب",
              render: (r) => byId.get(String(r.parent_id || ""))?.name || "—",
            },
            {
              key: "status",
              label: "الحالة",
              render: (r) => <AdminStatusBadge status={String(r.status || "")} />,
            },
            {
              key: "actions",
              label: "إجراءات",
              render: (r) => (
                <div className="av3-row-actions">
                  {canWrite ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        setDraft({
                          id: String(r.id),
                          name: String(r.name || ""),
                          slug: String(r.slug || ""),
                          parent_id: String(r.parent_id || ""),
                          status: String(r.status || "published"),
                        })
                      }
                    >
                      تعديل
                    </Button>
                  ) : null}
                  {canWrite && String(r.status || "") === "archived" ? (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => void onRestore(r as unknown as Cat)}
                    >
                      استعادة
                    </Button>
                  ) : null}
                  {canWrite && String(r.status || "") !== "archived" ? (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setArchiveTarget(r as unknown as Cat)}
                    >
                      أرشفة
                    </Button>
                  ) : null}
                </div>
              ),
            },
          ]}
        />
      </AdminLoadGate>

      {canWrite ? (
        <div className="av3-drawer">
          <h2>{draft.id ? "تعديل تصنيف" : "تصنيف جديد"}</h2>
          <AdminFormLayout
            onSubmit={onSave}
            actions={
              <Button type="submit" variant="primary" loading={busy}>
                حفظ
              </Button>
            }
          >
            <AdminFormField label="الاسم" id="cat-name">
              <input
                id="cat-name"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                required
              />
            </AdminFormField>
            <AdminFormField label="slug" id="cat-slug">
              <input
                id="cat-slug"
                value={draft.slug}
                onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                required
                dir="ltr"
              />
            </AdminFormField>
            <AdminFormField label="الأب" id="cat-parent">
              <select
                id="cat-parent"
                aria-label="التصنيف الأب"
                value={draft.parent_id}
                onChange={(e) => setDraft((d) => ({ ...d, parent_id: e.target.value }))}
              >
                <option value="">— جذر —</option>
                {allRows
                  .filter((r) => r.id !== draft.id)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </select>
            </AdminFormField>
            <AdminFormField label="الحالة" id="cat-status">
              <select
                id="cat-status"
                aria-label="حالة التصنيف"
                value={draft.status}
                onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
              >
                <option value="published">منشور</option>
                <option value="draft">مسودة</option>
                <option value="archived">مؤرشف</option>
              </select>
            </AdminFormField>
          </AdminFormLayout>
        </div>
      ) : null}

      <AdminConfirmDialog
        open={!!archiveTarget}
        title="أرشفة تصنيف"
        body={`أرشفة «${archiveTarget?.name || ""}»؟ لن يُحذف إن كان له أبناء.`}
        confirmLabel="أرشفة"
        danger
        busy={busy}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={async () => {
          if (!archiveTarget) return;
          setBusy(true);
          try {
            await v3Mutate("categories", "DELETE", undefined, { id: archiveTarget.id });
            emitAdminV3AuditEvent("admin.taxonomy.archive", "/admin/v3/taxonomy", {
              id: archiveTarget.id,
            });
            setFlash(`أُرشِف «${archiveTarget.name || ""}».`);
            setArchiveTarget(null);
            await load();
          } catch (err) {
            const e2 = err as { userMessageAr?: string };
            setError(e2.userMessageAr || "فشلت الأرشفة.");
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
