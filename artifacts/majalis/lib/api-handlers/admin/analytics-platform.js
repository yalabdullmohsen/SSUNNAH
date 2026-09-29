/**
 * Admin Analytics Platform API — /api/admin/analytics-platform
 * Auth: JWT + requireAdminAccess + Admin/Super Admin role gate.
 */

import { sendJson } from "../../api/_http.mjs";
import { sendSafeError } from "../../api/safe-error.mjs";
import { requireAdminAccess, hasPermission } from "../../../lib/admin-auth.mjs";
import { getSupabaseAdmin } from "../../../lib/supabase-admin.mjs";
import {
  canAccessAnalyticsPlatform,
  analyticsPlatformForbiddenBody,
} from "../../../lib/analytics-platform/access.mjs";
import { buildAnalyticsPlatformPayload } from "../../../lib/analytics-platform/aggregate.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    return;
  }

  const auth = await requireAdminAccess(req, res, sendJson, { permission: "analytics.read" });
  if (!auth) return;

  if (!canAccessAnalyticsPlatform(auth)) {
    const body = analyticsPlatformForbiddenBody();
    sendJson(res, 403, body);
    return;
  }

  // Defense in depth — analytics.read already enforced; keep explicit check
  if (!hasPermission(auth, "analytics.read") && !auth.unrestricted && !auth.isOwner) {
    sendJson(res, 403, {
      ok: false,
      error: "permission_denied",
      permission: "analytics.read",
      userMessageAr: "ليس لديك صلاحية قراءة التحليلات.",
    });
    return;
  }

  const days = Number(req.query?.days || req.body?.days || 30);
  const force = req.query?.force === "1" || req.body?.force === true;

  try {
    const admin = getSupabaseAdmin();
    const payload = await buildAnalyticsPlatformPayload(admin, { days, force });
    sendJson(res, 200, {
      ...payload,
      access: {
        role: auth.effectiveRole || auth.role,
        unrestricted: !!auth.unrestricted,
      },
    });
  } catch (error) {
    sendSafeError(res, sendJson, error, { code: "analytics_platform_error" });
  }
}
