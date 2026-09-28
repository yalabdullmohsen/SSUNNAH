import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { v3List, v3Mutate } from "../../data/admin-v3-api";
import { can, resolveGovernanceRole } from "../../permissions";
import {
  AdminConfirmDialog,
  AdminDataTable,
  AdminFilterBar,
  AdminLoadGate,
  AdminPageHeader,
  AdminPagination,
  AdminPermissionDenied,
  AdminSearchInput,
  useDebouncedValue,
} from "../../ui/primitives";

type UserRow = {
  id: string;
  full_name?: string | null;
  role?: string | null;
  governance_hint?: string | null;
  is_owner?: boolean;
  status?: string | null;
};

export function UsersPage() {
  const { user } = useAuth();
  const role = resolveGovernanceRole(user);
  const canRead = can(role, "users.read") || can(role, "users.manage") || can(role, "*");
  const canManage = can(role, "users.manage");

  const [q, setQ] = useState("");
  const dq = useDebouncedValue(q);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<{ id: string; role: string; name: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const res = await v3List<UserRow>("users", { q: dq || undefined, page, pageSize: 20 }, signal);
        setRows(res.data || []);
        setTotal(res.total || 0);
      } catch (e) {
        const err = e as { userMessageAr?: string };
        setError(err.userMessageAr || "تعذّر تحميل المستخدمين.");
      } finally {
        setLoading(false);
      }
    },
    [dq, page],
  );

  useEffect(() => {
    if (!canRead) return;
    const ac = new AbortController();
    void load(ac.signal);
    return () => ac.abort();
  }, [canRead, load]);

  if (!canRead) return <AdminPermissionDenied permission="users.read" />;

  return (
    <div className="av3-domain">
      <AdminPageHeader
        title="المستخدمون"
        description="قائمة آمنة للأدوار — تغيير الدور عبر users.manage فقط، دون تعديل الذات أو المالك."
        badge="أصلي"
        crumbs={[
          { label: "لوحة التحكم", href: "/admin/v3" },
          { label: "المجتمع" },
        ]}
        actions={
          <Link href="/admin?section=users" className="av3-btn">
            Legacy
          </Link>
        }
      />

      <AdminFilterBar
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
        }}
      >
        <AdminSearchInput value={q} onChange={setQ} label="بحث بالاسم" />
      </AdminFilterBar>

      <AdminLoadGate loading={loading} error={error} onRetry={() => void load()}>
        <AdminDataTable
          rows={rows as unknown as Record<string, unknown>[]}
          rowKey={(r) => String(r.id)}
          columns={[
            { key: "full_name", label: "الاسم" },
            { key: "role", label: "الدور (legacy)" },
            { key: "governance_hint", label: "حوكمة" },
            { key: "status", label: "الحالة" },
            {
              key: "actions",
              label: "دور",
              render: (r) =>
                canManage && !r.is_owner && r.id !== user?.id ? (
                  <select
                    aria-label="تغيير الدور"
                    defaultValue={String(r.role || "user")}
                    onChange={(e) =>
                      setPendingRole({
                        id: String(r.id),
                        role: e.target.value,
                        name: String(r.full_name || r.id),
                      })
                    }
                  >
                    <option value="user">user</option>
                    <option value="sheikh">sheikh</option>
                    <option value="admin">admin</option>
                  </select>
                ) : (
                  "—"
                ),
            },
          ]}
        />
        <AdminPagination
          page={page}
          pageCount={Math.max(1, Math.ceil(total / 20))}
          onChange={setPage}
        />
      </AdminLoadGate>

      <AdminConfirmDialog
        open={!!pendingRole}
        title="تغيير دور المستخدم"
        body={`تعيين دور «${pendingRole?.role}» للمستخدم «${pendingRole?.name}»؟`}
        confirmLabel="تأكيد"
        busy={busy}
        onCancel={() => setPendingRole(null)}
        onConfirm={async () => {
          if (!pendingRole) return;
          setBusy(true);
          try {
            await v3Mutate("users", "PUT", { id: pendingRole.id, role: pendingRole.role });
            setPendingRole(null);
            await load();
          } catch (err) {
            const e2 = err as { userMessageAr?: string };
            setError(e2.userMessageAr || "فشل تغيير الدور.");
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
