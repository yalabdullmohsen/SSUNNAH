import { useEffect, useState } from "react";
import { arabicMatchAny } from "@/lib/arabic-search";
import { adminGetUsers } from "@/lib/supabase";
import { v3Mutate } from "@/admin-v3/data/admin-v3-api";
import { syncLegacyRoles } from "@/lib/governance-service";
import { SkeletonCardGrid } from "@/components/ui-common";
import { Button } from "@/components/ui/button";
import { useAdminShell } from "./AdminShell";

const ROLES: Record<string, { label: string; bg: string; text: string }> = {
  admin:  { label: "مشرف",    bg: "rgba(23,61,53,0.08)", text: "var(--mj-brand-deep)" },
  sheikh: { label: "شيخ",     bg: "var(--mj-success-soft)", text: "var(--majalis-emerald-deep)" },
  user:   { label: "مستخدم",  bg: "var(--majalis-parchment-deep)", text: "var(--majalis-ink-soft)" },
};
const ROLE_OPTIONS = ["user", "sheikh", "admin"];
const ROLE_AR: Record<string, string> = { user: "مستخدم", sheikh: "شيخ", admin: "مشرف" };

const FILTERS: [string, string][] = [
  ["all", "الكل"], ["admin", "المشرفون"], ["sheikh", "المشايخ"], ["user", "المستخدمون"],
];

export function UsersSection() {
  const { showSuccess, showError } = useAdminShell();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminGetUsers().then(({ data }) => {  setUsers(data ?? []); setLoading(false);  }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    syncLegacyRoles().catch(() => undefined);
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      // Server authority only: /api/admin/v3/users + requireAdminAccess + users.manage
      await v3Mutate("users", "PUT", { id: userId, role: newRole });
      showSuccess("تم تحديث الصلاحية.");
    } catch (err) {
      const e = err as { userMessageAr?: string };
      showError(e.userMessageAr || "تعذّر تغيير الصلاحية.");
    } finally {
      setUpdatingId(null);
      load();
    }
  };

  const filtered = users
    .filter(u => filter === "all" || u.role === filter)
    .filter(u => arabicMatchAny([u.full_name ?? "", u.city ?? ""], search));

  const counts = {
    all: users.length,
    admin: users.filter(u => u.role === "admin").length,
    sheikh: users.filter(u => u.role === "sheikh").length,
    user: users.filter(u => u.role === "user").length,
  };

  return (
    <div>
      <div className="usr-header">
        <h2 className="usr-title">المستخدمون ({users.length})</h2>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو المحافظة..."
          className="usr-search"
        />
      </div>

      <div className="usr-filter-row">
        {FILTERS.map(([v, l]) => (
          <Button
            type="button"
            variant={filter === v ? "secondary" : "ghost"}
            size="small"
            key={v}
            onClick={() => setFilter(v)}
            className={`usr-filter-btn${filter === v ? " usr-filter-btn--active" : ""}`}
          >
            {l} ({counts[v as keyof typeof counts]})
          </Button>
        ))}
      </div>

      {loading ? <SkeletonCardGrid count={6} /> : (
        <div className="usr-table-wrap">
          <table className="usr-table">
            <thead>
              <tr className="usr-thead-row">
                {["الاسم الكامل", "المحافظة", "النقاط", "المستوى", "تاريخ الانضمام", "الدور", "تغيير الدور"].map(h => (
                  <th key={h} className="usr-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const role = ROLES[u.role] || ROLES.user;
                return (
                  <tr key={u.id} className="usr-tr">
                    <td className="usr-td usr-td--name">
                      {u.full_name || <span className="usr-noname">بدون اسم</span>}
                    </td>
                    <td className="usr-td usr-td--muted">{u.city || "—"}</td>
                    <td className="usr-td usr-td--points">{u.points ?? 0}</td>
                    <td className="usr-td usr-td--center">{u.level ?? 1}</td>
                    <td className="usr-td usr-td--nowrap">
                      {new Date(u.created_at).toLocaleDateString("ar-KW")}
                    </td>
                    <td className="usr-td">
                      <span
                        className="usr-role-badge"
                        style={{ "--usr-role-bg": role.bg, "--usr-role-color": role.text } as React.CSSProperties}
                      >
                        {role.label}
                      </span>
                    </td>
                    <td className="usr-td">
                      <select
                        value={u.role}
                        disabled={updatingId === u.id}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="usr-role-select"
                      >
                        {ROLE_OPTIONS.map(r => <option key={r} value={r}>{ROLE_AR[r]}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="usr-empty">
              {search ? "لا يوجد مستخدمون يطابقون البحث" : "لا يوجد مستخدمون مسجّلون"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
