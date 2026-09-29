import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { v3List, v3Mutate } from "../../data/admin-v3-api";
import { can, resolveGovernanceRole } from "../../permissions";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminFormField,
  AdminFormLayout,
  AdminLoadGate,
  AdminPageHeader,
  AdminPermissionDenied,
  AdminStatusBadge,
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

  const [rows, setRows] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ id: "", name: "", slug: "", parent_id: "", status: "published" });
  const [busy, setBusy] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Cat | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await v3List<Cat>("categories");
      setRows(res.data || []);
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

  const byId = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);

  if (!canRead) return <AdminPermissionDenied permission="content.read" />;

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!canWrite || busy) return;
    setBusy(true);
    try {
      await v3Mutate("categories", draft.id ? "PUT" : "POST", {
        id: draft.id || undefined,
        name: draft.name,
        slug: draft.slug,
        parent_id: draft.parent_id || null,
        status: draft.status,
      });
      setDraft({ id: "", name: "", slug: "", parent_id: "", status: "published" });
      await load();
    } catch (err) {
      const e2 = err as { userMessageAr?: string };
      setError(e2.userMessageAr || "فشل الحفظ.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="av3-domain">
      <AdminPageHeader
        title="التصنيفات"
        description="شجرة أبواب العلم — منع الحلقات وأرشفة بدل الحذف النهائي."
        badge="أصلي"
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

      <AdminLoadGate loading={loading} error={error} onRetry={() => void load()}>
        <AdminDataTable
          rows={rows as unknown as Record<string, unknown>[]}
          rowKey={(r) => String(r.id)}
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
                  {canWrite ? (
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
                value={draft.parent_id}
                onChange={(e) => setDraft((d) => ({ ...d, parent_id: e.target.value }))}
              >
                <option value="">— جذر —</option>
                {rows
                  .filter((r) => r.id !== draft.id)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </select>
            </AdminFormField>
          </AdminFormLayout>
        </div>
      ) : null}

      <AdminConfirmDialog
        open={!!archiveTarget}
        title="أرشفة تصنيف"
        body={`أرشفة «${archiveTarget?.name || ""}»؟ لن يُحذف إن كان له أبناء.`}
        danger
        busy={busy}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={async () => {
          if (!archiveTarget) return;
          setBusy(true);
          try {
            await v3Mutate("categories", "DELETE", undefined, { id: archiveTarget.id });
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
