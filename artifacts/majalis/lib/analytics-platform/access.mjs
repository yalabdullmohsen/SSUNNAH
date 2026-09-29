/**
 * Analytics Platform access — Admin / Super Admin only.
 * UI hiding is not authority; API must enforce the same rule.
 */

export const ANALYTICS_PLATFORM_ROLES = Object.freeze(["super_admin", "system_admin"]);

/**
 * @param {{ unrestricted?: boolean, isOwner?: boolean, effectiveRole?: string, role?: string, governanceRole?: string } | null | undefined} auth
 */
export function canAccessAnalyticsPlatform(auth) {
  if (!auth) return false;
  if (auth.unrestricted === true || auth.isOwner === true) return true;
  const role = auth.effectiveRole || auth.role || auth.governanceRole || "";
  return ANALYTICS_PLATFORM_ROLES.includes(role);
}

export function analyticsPlatformForbiddenBody() {
  return {
    ok: false,
    error: "forbidden",
    status: 403,
    userMessage: "Analytics platform is restricted to Admin and Super Admin.",
    userMessageAr: "منصة التحليلات متاحة لمدير النظام والمشرف الأعلى فقط.",
  };
}
