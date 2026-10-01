/**
 * Admin v3 permissions — aligned with server RBAC (lib/governance/config.mjs).
 * UI may hide controls; API remains the authority.
 */
import { LEGACY_ROLE_MAP } from "@/lib/governance-roles";

/** Server permission names used by Admin v3 */
export type AdminServerPermission =
  | "content.read"
  | "content.create"
  | "content.edit"
  | "content.delete"
  | "content.*"
  | "content.moderate"
  | "review.approve"
  | "review.reject"
  | "review.editorial"
  | "review.scientific"
  | "publish"
  | "archive"
  | "users.read"
  | "users.manage"
  | "analytics.read"
  | "audit.read"
  | "import"
  | "*";

/** Catalog of governance roles (FINAL-3 Roles entity — read-only matrix; assignment via Users). */
export const ROLE_PERMS: Record<string, readonly AdminServerPermission[]> = {
  super_admin: ["*"],
  system_admin: ["users.manage", "audit.read", "analytics.read", "content.read"],
  content_manager: [
    "content.*",
    "content.read",
    "content.create",
    "content.edit",
    "content.delete",
    "publish",
    "archive",
    "import",
    "analytics.read",
    "review.approve",
    "review.reject",
  ],
  scientific_reviewer: [
    "review.scientific",
    "review.approve",
    "review.reject",
    "content.read",
    "audit.read",
  ],
  editor: [
    "content.edit",
    "content.create",
    "content.read",
    "review.editorial",
  ],
  moderator: ["content.moderate", "review.editorial", "content.read", "users.read"],
  analytics_viewer: ["analytics.read", "content.read"],
  read_only: ["content.read", "audit.read"],
  author: ["content.create", "content.read"],
  translator: ["content.read"],
};

export const GOVERNANCE_ROLE_IDS = Object.keys(ROLE_PERMS) as readonly string[];

export function permissionsListForRole(role: string): readonly AdminServerPermission[] {
  return ROLE_PERMS[role] || ROLE_PERMS.read_only!;
}

function expand(perms: readonly AdminServerPermission[]): Set<string> {
  const set = new Set<string>(perms);
  if (set.has("*") || set.has("content.*")) {
    set.add("content.read");
    set.add("content.create");
    set.add("content.edit");
    set.add("content.delete");
    set.add("publish");
    set.add("archive");
  }
  return set;
}

export function resolveGovernanceRole(user: {
  governance_role?: string | null;
  profile?: { role?: string | null; is_super_admin?: boolean | null; is_owner?: boolean | null } | null;
  is_owner?: boolean;
} | null | undefined): string {
  if (!user) return "read_only";
  if (user.is_owner || user.profile?.is_owner || user.profile?.is_super_admin) return "super_admin";
  if (user.governance_role) return user.governance_role;
  return LEGACY_ROLE_MAP[user.profile?.role || "user"] || "read_only";
}

export function permissionsForRole(role: string): Set<string> {
  const perms = ROLE_PERMS[role] || ROLE_PERMS.read_only!;
  return expand(perms);
}

export function can(role: string, permission: AdminServerPermission): boolean {
  const set = permissionsForRole(role);
  if (set.has("*")) return true;
  if (set.has(permission)) return true;
  if (permission.startsWith("content.") && set.has("content.*")) return true;
  return false;
}

/** Analytics Platform (/admin/v3/analytics) — Admin + Super Admin only (not analytics_viewer / content_manager). */
export function canAccessAnalyticsPlatform(
  role: string,
  user?: {
    is_owner?: boolean;
    profile?: { is_owner?: boolean | null; is_super_admin?: boolean | null } | null;
  } | null,
): boolean {
  if (user?.is_owner || user?.profile?.is_owner || user?.profile?.is_super_admin) return true;
  return role === "super_admin" || role === "system_admin";
}

/** Map old catalog labels → server checks (compat) */
export function catalogLabelToServer(label: string): AdminServerPermission | null {
  const map: Record<string, AdminServerPermission> = {
    "admin.read": "content.read",
    "content.read": "content.read",
    "content.write": "content.edit",
    "review.read": "content.read",
    "review.decide": "review.approve",
    "users.read": "users.read",
    "users.roles": "users.manage",
    "analytics.read": "analytics.read",
    "audit.read": "audit.read",
    "notifications.read": "content.read",
    "automation.read": "content.read",
    "system.read": "audit.read",
    "settings.read": "content.read",
  };
  return map[label] || null;
}
