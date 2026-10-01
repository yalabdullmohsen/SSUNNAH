import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import {
  GOVERNANCE_ROLE_IDS,
  can,
  permissionsListForRole,
  resolveGovernanceRole,
} from "../../permissions";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminPermissionDenied,
} from "../../ui/primitives";

/**
 * FINAL-3 Roles catalog — read-only permission matrix.
 * Role assignment to users is via UsersPage (users.manage); no separate roles DB table.
 */
export function RolesPage() {
  const { user } = useAuth();
  const role = resolveGovernanceRole(user);
  const canRead = can(role, "users.read") || can(role, "users.manage") || can(role, "*");

  if (!canRead) return <AdminPermissionDenied permission="users.read" />;

  const rows = GOVERNANCE_ROLE_IDS.map((id) => ({
    id,
    permissions: permissionsListForRole(id).join(" · "),
  }));

  return (
    <div className="av3-domain" data-testid="admin-v3-roles-catalog">
      <AdminPageHeader
        title="كتالوج الأدوار"
        description="أدوار الحوكمة وصلاحياتها — التعيين يتم من صفحة المستخدمين. لا جدول أدوار منفصل في قاعدة البيانات."
        badge="FINAL-3"
        crumbs={[
          { label: "لوحة التحكم", href: "/admin/v3" },
          { label: "المجتمع", href: "/admin/v3/community" },
          { label: "الأدوار" },
        ]}
        actions={
          <Button asChild variant="primary">
            <Link href="/admin/v3/community">تعيين أدوار المستخدمين</Link>
          </Button>
        }
      />

      <AdminDataTable
        rows={rows}
        rowKey={(r) => String(r.id)}
        emptyTitle="لا أدوار معرّفة"
        columns={[
          { key: "id", label: "الدور" },
          { key: "permissions", label: "الصلاحيات" },
        ]}
      />

      <p className="av3-muted" role="note">
        إنشاء/حذف حسابات المستخدمين يتم عبر مزوّد المصادقة —{" "}
        <strong>OWNER_ACTION</strong> (ليس CRUD محتوى داخل المستودع).
      </p>
    </div>
  );
}
