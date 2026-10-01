/**
 * Admin v3 native entity API — lessons / sheikhs / fawaid / categories / users / audit / status.
 * Authority: requireAdminAccess + operation permission. Never trust role from body.
 */
import { sendJson } from "../../api/_http.mjs";
import { sendSafeError } from "../../api/safe-error.mjs";
import { requireAdminAccess, hasPermission } from "../../../lib/admin-auth.mjs";
import { getSupabaseAdmin } from "../../../lib/supabase-admin.mjs";
import { logGovernanceEvent } from "../../../lib/governance/audit.mjs";
import { LEGACY_ROLE_MAP } from "../../../lib/governance/config.mjs";

const ALLOWED_LEGACY_ROLES = new Set(["user", "sheikh", "admin"]);
const MAX_PAGE = 100;
const MAX_TEXT = 8000;

function entityFromPath(req) {
  const raw =
    req.headers?.["x-vercel-original-path"] ||
    req.headers?.["x-invoke-path"] ||
    req.url ||
    "";
  const path = String(raw).split("?")[0];
  const m = path.match(/\/api\/admin\/v3\/([a-z0-9_-]+)/i);
  return (m?.[1] || "").toLowerCase();
}

function clampPage(q) {
  const page = Math.max(1, Number.parseInt(String(q?.page || "1"), 10) || 1);
  const pageSize = Math.min(
    MAX_PAGE,
    Math.max(1, Number.parseInt(String(q?.pageSize || "25"), 10) || 25),
  );
  return { page, pageSize, from: (page - 1) * pageSize, to: page * pageSize - 1 };
}

function pickFields(body, allow) {
  const out = {};
  if (!body || typeof body !== "object") return out;
  for (const key of allow) {
    if (Object.prototype.hasOwnProperty.call(body, key)) out[key] = body[key];
  }
  return out;
}

function str(v, max) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  return s.slice(0, max);
}

async function audit(admin, auth, action, resource_type, resource_id, metadata = {}) {
  try {
    await logGovernanceEvent(admin, {
      action,
      actor_id: auth.userId || auth.user?.id || "service",
      actor_role: auth.role || auth.governanceRole || null,
      resource_type,
      resource_id: resource_id || null,
      metadata: { ...metadata, source: "admin_v3" },
      source: "admin_v3",
    });
  } catch {
    /* audit must not break API */
  }
}

function deny(res, auth, permission) {
  sendJson(res, 403, {
    ok: false,
    error: "permission_denied",
    permission,
    userMessageAr: "ليس لديك صلاحية تنفيذ هذا الإجراء.",
  });
}

function need(auth, permission) {
  return hasPermission(auth, permission);
}

async function listTable(admin, table, select, order, q, filters = {}) {
  const { page, pageSize, from, to } = clampPage(q);
  let query = admin.from(table).select(select, { count: "exact" }).order(order, { ascending: false });
  for (const [k, v] of Object.entries(filters)) {
    if (v != null && v !== "") query = query.eq(k, v);
  }
  if (q?.q) {
    const term = String(q.q).trim().slice(0, 80);
    if (term) {
      if (table === "lessons") query = query.or(`title.ilike.%${term}%,speaker_name.ilike.%${term}%`);
      else if (table === "sheikhs") query = query.ilike("name", `%${term}%`);
      else if (table === "fawaid") query = query.ilike("text", `%${term}%`);
      else if (table === "profiles") query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
      else if (table === "categories") query = query.or(`name.ilike.%${term}%,slug.ilike.%${term}%`);
    }
  }
  const { data, error, count } = await query.range(from, to);
  return { data, error, count, page, pageSize };
}

async function handleLessons(req, res, admin, auth) {
  if (req.method === "GET") {
    if (!need(auth, "content.read") && !need(auth, "content.edit") && !need(auth, "content.*")) {
      return deny(res, auth, "content.read");
    }
    const status = req.query?.status || null;
    const result = await listTable(
      admin,
      "lessons",
      "id, title, speaker_name, status, activity_type, category, created_at, updated_at, description",
      "created_at",
      req.query,
      status ? { status } : {},
    );
    if (result.error) return sendSafeError(res, sendJson, result.error, { code: "admin_v3_list_failed" });
    return sendJson(res, 200, {
      ok: true,
      data: result.data || [],
      page: result.page,
      pageSize: result.pageSize,
      total: result.count ?? 0,
    });
  }

  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    const isCreate = req.method === "POST" && !req.body?.id;
    const perm = isCreate ? "content.create" : "content.edit";
    if (!need(auth, perm) && !need(auth, "content.*") && !need(auth, "content.edit")) {
      return deny(res, auth, perm);
    }
    const id = req.body?.id || null;
    if (id && req.body?.updated_at) {
      const { data: current } = await admin
        .from("lessons")
        .select("id, updated_at")
        .eq("id", id)
        .maybeSingle();
      if (current?.updated_at && current.updated_at !== req.body.updated_at) {
        return sendJson(res, 409, {
          ok: false,
          error: "conflict",
          userMessageAr: "تغيّر السجل على الخادم. أعد التحميل قبل الحفظ.",
        });
      }
    }
    const fields = pickFields(req.body, [
      "title",
      "description",
      "speaker_name",
      "status",
      "activity_type",
      "category",
      "mosque",
      "city",
      "region",
      "schedule",
      "day_of_week",
      "lesson_time",
      "delivery",
      "audience",
      "live_url",
      "book_url",
      "maps_url",
      "video_url",
      "audio_url",
      "sheikh_id",
      "external_key",
      "is_course",
      "end_date",
    ]);
    fields.title = str(fields.title, 500);
    fields.description = str(fields.description, MAX_TEXT);
    fields.speaker_name = str(fields.speaker_name, 200);
    if (!fields.title) {
      return sendJson(res, 422, { ok: false, error: "validation", userMessageAr: "العنوان مطلوب." });
    }
    fields.updated_at = new Date().toISOString();
    if (!id) fields.created_at = fields.updated_at;
    if (!fields.status) fields.status = "draft";

    const result = id
      ? await admin.from("lessons").update(fields).eq("id", id).select("id, updated_at").maybeSingle()
      : await admin.from("lessons").insert(fields).select("id, updated_at").maybeSingle();
    if (result.error) return sendSafeError(res, sendJson, result.error, { code: "admin_v3_upsert_failed" });
    await audit(admin, auth, id ? "content.update" : "content.create", "lessons", result.data?.id || id, {
      title: fields.title,
    });
    return sendJson(res, 200, { ok: true, data: result.data });
  }

  if (req.method === "DELETE") {
    if (!need(auth, "content.delete") && !need(auth, "content.*") && !need(auth, "archive")) {
      return deny(res, auth, "content.delete");
    }
    const id = req.query?.id || req.body?.id;
    if (!id) return sendJson(res, 400, { ok: false, error: "bad_request" });
    // Soft-archive when possible
    const { data: row } = await admin.from("lessons").select("id, title, status").eq("id", id).maybeSingle();
    if (!row) return sendJson(res, 404, { ok: false, error: "not_found" });
    const { error } = await admin
      .from("lessons")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return sendSafeError(res, sendJson, error, { code: "admin_v3_archive_failed" });
    await audit(admin, auth, "content.archive", "lessons", id, { title: row.title });
    return sendJson(res, 200, { ok: true, message: "archived" });
  }

  sendJson(res, 405, { ok: false, error: "method_not_allowed" });
}

async function handleSheikhs(req, res, admin, auth) {
  if (req.method === "GET") {
    if (!need(auth, "content.read") && !need(auth, "content.edit") && !need(auth, "content.*")) {
      return deny(res, auth, "content.read");
    }
    const { page, pageSize, from, to } = clampPage(req.query);
    let query = admin
      .from("sheikhs")
      .select("id, name, bio, image_url, created_at, updated_at", { count: "exact" })
      .order("name", { ascending: true });
    if (req.query?.q) {
      const term = String(req.query.q).trim().slice(0, 80);
      if (term) query = query.ilike("name", `%${term}%`);
    }
    const { data, error, count } = await query.range(from, to);
    if (error) return sendSafeError(res, sendJson, error, { code: "admin_v3_list_failed" });
    return sendJson(res, 200, {
      ok: true,
      data: data || [],
      page,
      pageSize,
      total: count ?? 0,
    });
  }

  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    if (!need(auth, "content.edit") && !need(auth, "content.create") && !need(auth, "content.*")) {
      return deny(res, auth, "content.edit");
    }
    const id = req.body?.id || null;
    const fields = pickFields(req.body, ["name", "bio", "image_url"]);
    fields.name = str(fields.name, 200);
    fields.bio = str(fields.bio, MAX_TEXT);
    fields.image_url = str(fields.image_url, 2048);
    if (!fields.name) {
      return sendJson(res, 422, { ok: false, error: "validation", userMessageAr: "اسم الشيخ مطلوب." });
    }
    const result = id
      ? await admin.from("sheikhs").update(fields).eq("id", id).select("id").maybeSingle()
      : await admin.from("sheikhs").insert(fields).select("id").maybeSingle();
    if (result.error) return sendSafeError(res, sendJson, result.error, { code: "admin_v3_upsert_failed" });
    await audit(admin, auth, id ? "content.update" : "content.create", "sheikhs", result.data?.id || id, {
      name: fields.name,
    });
    return sendJson(res, 200, { ok: true, data: result.data });
  }

  if (req.method === "DELETE") {
    if (!need(auth, "content.delete") && !need(auth, "content.*")) {
      return deny(res, auth, "content.delete");
    }
    const id = req.query?.id || req.body?.id;
    if (!id) return sendJson(res, 400, { ok: false, error: "bad_request" });
    const { error } = await admin.from("sheikhs").delete().eq("id", id);
    if (error) return sendSafeError(res, sendJson, error, { code: "admin_v3_delete_failed" });
    await audit(admin, auth, "content.delete", "sheikhs", id, {});
    return sendJson(res, 200, { ok: true });
  }

  sendJson(res, 405, { ok: false, error: "method_not_allowed" });
}

async function handleFawaid(req, res, admin, auth) {
  if (req.method === "GET") {
    if (!need(auth, "content.read") && !need(auth, "content.edit") && !need(auth, "content.*")) {
      return deny(res, auth, "content.read");
    }
    const status = req.query?.status || null;
    const result = await listTable(
      admin,
      "fawaid",
      "id, text, author_name, source_name, status, created_at, updated_at",
      "created_at",
      req.query,
      status ? { status } : {},
    );
    if (result.error) return sendSafeError(res, sendJson, result.error, { code: "admin_v3_list_failed" });
    return sendJson(res, 200, {
      ok: true,
      data: result.data || [],
      page: result.page,
      pageSize: result.pageSize,
      total: result.count ?? 0,
    });
  }

  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    if (!need(auth, "content.edit") && !need(auth, "content.create") && !need(auth, "content.*")) {
      return deny(res, auth, "content.edit");
    }
    const id = req.body?.id || null;
    const fields = pickFields(req.body, ["text", "author_name", "source_name", "status", "source"]);
    if (fields.source && !fields.source_name) {
      fields.source_name = fields.source;
    }
    delete fields.source;
    fields.text = str(fields.text, MAX_TEXT);
    fields.author_name = str(fields.author_name, 200);
    fields.source_name = str(fields.source_name, 400);
    fields.status = str(fields.status, 40) || "draft";
    if (!fields.text) {
      return sendJson(res, 422, { ok: false, error: "validation", userMessageAr: "نص الفائدة مطلوب." });
    }
    // Do not invent provenance
    if (fields.status === "approved" && !fields.source_name && !fields.author_name) {
      // allow but do not auto-verify
    }
    const result = id
      ? await admin.from("fawaid").update(fields).eq("id", id).select("id").maybeSingle()
      : await admin.from("fawaid").insert(fields).select("id").maybeSingle();
    if (result.error) return sendSafeError(res, sendJson, result.error, { code: "admin_v3_upsert_failed" });
    await audit(admin, auth, id ? "content.update" : "content.create", "fawaid", result.data?.id || id, {
      status: fields.status,
    });
    return sendJson(res, 200, { ok: true, data: result.data });
  }

  if (req.method === "DELETE") {
    if (!need(auth, "content.delete") && !need(auth, "archive") && !need(auth, "content.*")) {
      return deny(res, auth, "content.delete");
    }
    const id = req.query?.id || req.body?.id;
    if (!id) return sendJson(res, 400, { ok: false, error: "bad_request" });
    const { error } = await admin.from("fawaid").update({ status: "archived" }).eq("id", id);
    if (error) return sendSafeError(res, sendJson, error, { code: "admin_v3_archive_failed" });
    await audit(admin, auth, "content.archive", "fawaid", id, {});
    return sendJson(res, 200, { ok: true, message: "archived" });
  }

  sendJson(res, 405, { ok: false, error: "method_not_allowed" });
}

async function handleCategories(req, res, admin, auth) {
  if (req.method === "GET") {
    if (!need(auth, "content.read") && !need(auth, "content.edit") && !need(auth, "content.*")) {
      return deny(res, auth, "content.read");
    }
    const { data, error } = await admin
      .from("categories")
      .select("id, parent_id, slug, name, description, icon, sort_order, status")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .limit(2000);
    if (error) return sendSafeError(res, sendJson, error, { code: "admin_v3_list_failed" });
    return sendJson(res, 200, { ok: true, data: data || [] });
  }

  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    if (!need(auth, "content.edit") && !need(auth, "content.*")) {
      return deny(res, auth, "content.edit");
    }
    const id = req.body?.id || null;
    const fields = pickFields(req.body, [
      "parent_id",
      "slug",
      "name",
      "description",
      "icon",
      "sort_order",
      "status",
    ]);
    fields.name = str(fields.name, 200);
    fields.slug = str(fields.slug, 120);
    fields.description = str(fields.description, 2000);
    if (!fields.name || !fields.slug) {
      return sendJson(res, 422, {
        ok: false,
        error: "validation",
        userMessageAr: "الاسم والـ slug مطلوبان.",
      });
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(fields.slug)) {
      return sendJson(res, 422, {
        ok: false,
        error: "validation",
        userMessageAr: "صيغة slug غير صالحة.",
      });
    }
    // Prevent circular parent
    if (id && fields.parent_id && fields.parent_id === id) {
      return sendJson(res, 422, {
        ok: false,
        error: "validation",
        userMessageAr: "لا يمكن أن يكون التصنيف أباً لنفسه.",
      });
    }
    if (id && fields.parent_id) {
      let walk = fields.parent_id;
      for (let i = 0; i < 32 && walk; i++) {
        if (walk === id) {
          return sendJson(res, 422, {
            ok: false,
            error: "validation",
            userMessageAr: "تسلسل دائري في شجرة التصنيفات.",
          });
        }
        const { data: parent } = await admin
          .from("categories")
          .select("parent_id")
          .eq("id", walk)
          .maybeSingle();
        walk = parent?.parent_id || null;
      }
    }
    const result = id
      ? await admin.from("categories").update(fields).eq("id", id).select("id").maybeSingle()
      : await admin.from("categories").insert(fields).select("id").maybeSingle();
    if (result.error) return sendSafeError(res, sendJson, result.error, { code: "admin_v3_upsert_failed" });
    await audit(admin, auth, id ? "taxonomy.update" : "taxonomy.create", "categories", result.data?.id || id, {
      slug: fields.slug,
    });
    return sendJson(res, 200, { ok: true, data: result.data });
  }

  if (req.method === "DELETE") {
    if (!need(auth, "content.delete") && !need(auth, "content.*")) {
      return deny(res, auth, "content.delete");
    }
    const id = req.query?.id || req.body?.id;
    if (!id) return sendJson(res, 400, { ok: false, error: "bad_request" });
    const { count } = await admin
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("parent_id", id);
    if ((count || 0) > 0) {
      return sendJson(res, 409, {
        ok: false,
        error: "has_children",
        userMessageAr: "انقل أو احذف الأبناء قبل حذف التصنيف.",
      });
    }
    const { error } = await admin.from("categories").update({ status: "archived" }).eq("id", id);
    if (error) return sendSafeError(res, sendJson, error, { code: "admin_v3_archive_failed" });
    await audit(admin, auth, "taxonomy.archive", "categories", id, {});
    return sendJson(res, 200, { ok: true, message: "archived" });
  }

  sendJson(res, 405, { ok: false, error: "method_not_allowed" });
}

async function handleUsers(req, res, admin, auth) {
  if (req.method === "GET") {
    if (!need(auth, "users.read") && !need(auth, "users.manage") && !need(auth, "content.read")) {
      // content_manager may lack users.read — still allow admins who passed requireAdminAccess with users.manage OR analytics
      if (!need(auth, "*") && !auth.unrestricted && !auth.isOwner) {
        return deny(res, auth, "users.read");
      }
    }
    const { page, pageSize, from, to } = clampPage(req.query);
    let query = admin
      .from("profiles")
      .select("id, full_name, role, is_admin, is_super_admin, is_owner, status, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false });
    if (req.query?.q) {
      const term = String(req.query.q).trim().slice(0, 80);
      if (term) query = query.ilike("full_name", `%${term}%`);
    }
    const { data, error, count } = await query.range(from, to);
    if (error) return sendSafeError(res, sendJson, error, { code: "admin_v3_list_failed" });
    // Strip sensitive fields — never email dump in list unless already selected (we don't select email)
    const safe = (data || []).map((u) => ({
      id: u.id,
      full_name: u.full_name,
      role: u.role,
      governance_hint: LEGACY_ROLE_MAP[u.role] || null,
      is_admin: !!u.is_admin,
      is_super_admin: !!u.is_super_admin,
      is_owner: !!u.is_owner,
      status: u.status || null,
      created_at: u.created_at,
    }));
    return sendJson(res, 200, { ok: true, data: safe, page, pageSize, total: count ?? 0 });
  }

  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    if (!need(auth, "users.manage")) {
      return deny(res, auth, "users.manage");
    }
    const userId = req.body?.id || req.body?.userId;
    const role = String(req.body?.role || "").trim();
    if (!userId || !ALLOWED_LEGACY_ROLES.has(role)) {
      return sendJson(res, 422, {
        ok: false,
        error: "validation",
        userMessageAr: "معرّف المستخدم ودور صالح (user|sheikh|admin) مطلوبان.",
      });
    }
    if (userId === auth.userId) {
      return sendJson(res, 403, {
        ok: false,
        error: "self_role_change_forbidden",
        userMessageAr: "لا يمكنك تغيير دورك بنفسك من هذه الواجهة.",
      });
    }
    const { data: target } = await admin
      .from("profiles")
      .select("id, is_owner, role")
      .eq("id", userId)
      .maybeSingle();
    if (!target) return sendJson(res, 404, { ok: false, error: "not_found" });
    if (target.is_owner) {
      return sendJson(res, 403, {
        ok: false,
        error: "owner_protected",
        userMessageAr: "لا يمكن تعديل دور المالك الأساسي من هنا.",
      });
    }
    const { error } = await admin.from("profiles").update({ role }).eq("id", userId);
    if (error) return sendSafeError(res, sendJson, error, { code: "admin_v3_role_failed" });
    await audit(admin, auth, "users.role_update", "profiles", userId, {
      from: target.role,
      to: role,
    });
    return sendJson(res, 200, { ok: true });
  }

  sendJson(res, 405, { ok: false, error: "method_not_allowed" });
}

async function handleAudit(req, res, admin, auth) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
  }
  if (!need(auth, "audit.read") && !need(auth, "content.read") && !auth.unrestricted && !auth.isOwner) {
    return deny(res, auth, "audit.read");
  }
  const limit = Math.min(100, Math.max(1, Number.parseInt(String(req.query?.limit || "50"), 10) || 50));
  try {
    const { data, error } = await admin
      .from("governance_audit_log")
      .select("id, action, actor_id, actor_role, resource_type, resource_id, outcome, created_at, source, reason")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      return sendJson(res, 200, { ok: true, data: [], incomplete: true, note: "audit_unavailable" });
    }
    return sendJson(res, 200, { ok: true, data: data || [], incomplete: false });
  } catch {
    return sendJson(res, 200, { ok: true, data: [], incomplete: true, note: "audit_unavailable" });
  }
}

async function handleStatus(req, res, auth) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
  }
  const env =
    process.env.VERCEL_ENV ||
    process.env.NODE_ENV ||
    "unknown";
  return sendJson(res, 200, {
    ok: true,
    data: {
      environment: env === "production" ? "production" : env === "preview" ? "preview" : "development",
      role: auth.role || auth.governanceRole || null,
      aiEnabled: process.env.AI_FEATURE_ENABLED !== "0" && process.env.AI_EMERGENCY_KILL_SWITCH !== "1",
      telegramConfigured: Boolean(String(process.env.TELEGRAM_WEBHOOK_SECRET || "").trim()),
      upstashConfigured: Boolean(
        String(process.env.UPSTASH_REDIS_REST_URL || "").trim() &&
          String(process.env.UPSTASH_REDIS_REST_TOKEN || "").trim(),
      ),
      // never expose secret values
    },
  });
}

async function handleLibrary(req, res, admin, auth) {
  if (req.method === "GET") {
    if (!need(auth, "content.read") && !need(auth, "content.edit") && !need(auth, "content.*")) {
      return deny(res, auth, "content.read");
    }
    const status = req.query?.status || null;
    const { page, pageSize, from, to } = clampPage(req.query);
    let query = admin
      .from("library_items")
      .select(
        "id, title, author_name, author, type, category, description, status, file_url, external_url, created_at, updated_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    if (req.query?.q) {
      const term = String(req.query.q).trim().slice(0, 80);
      if (term) {
        query = query.or(
          `title.ilike.%${term}%,author_name.ilike.%${term}%,author.ilike.%${term}%,category.ilike.%${term}%`,
        );
      }
    }
    const { data, error, count } = await query.range(from, to);
    if (error) return sendSafeError(res, sendJson, error, { code: "admin_v3_list_failed" });
    return sendJson(res, 200, {
      ok: true,
      data: data || [],
      page,
      pageSize,
      total: count ?? 0,
    });
  }

  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    if (!need(auth, "content.edit") && !need(auth, "content.create") && !need(auth, "content.*")) {
      return deny(res, auth, "content.edit");
    }
    const id = req.body?.id || null;
    const fields = pickFields(req.body, [
      "title",
      "author_name",
      "author",
      "type",
      "category",
      "description",
      "status",
      "file_url",
      "external_url",
    ]);
    fields.title = str(fields.title, 500);
    fields.author_name = str(fields.author_name || fields.author, 200);
    delete fields.author;
    fields.type = str(fields.type, 80) || "كتاب";
    fields.category = str(fields.category, 120);
    fields.description = str(fields.description, MAX_TEXT);
    fields.file_url = str(fields.file_url, 2048);
    fields.external_url = str(fields.external_url, 2048);
    fields.status = str(fields.status, 40) || "draft";
    if (!fields.title) {
      return sendJson(res, 422, { ok: false, error: "validation", userMessageAr: "عنوان المادة مطلوب." });
    }
    fields.updated_at = new Date().toISOString();
    if (!id) fields.created_at = fields.updated_at;
    const result = id
      ? await admin.from("library_items").update(fields).eq("id", id).select("id, updated_at").maybeSingle()
      : await admin.from("library_items").insert(fields).select("id, updated_at").maybeSingle();
    if (result.error) return sendSafeError(res, sendJson, result.error, { code: "admin_v3_upsert_failed" });
    await audit(admin, auth, id ? "content.update" : "content.create", "library_items", result.data?.id || id, {
      title: fields.title,
    });
    return sendJson(res, 200, { ok: true, data: result.data });
  }

  if (req.method === "DELETE") {
    if (!need(auth, "content.delete") && !need(auth, "archive") && !need(auth, "content.*")) {
      return deny(res, auth, "content.delete");
    }
    const id = req.query?.id || req.body?.id;
    if (!id) return sendJson(res, 400, { ok: false, error: "bad_request" });
    const { data: row } = await admin.from("library_items").select("id, title").eq("id", id).maybeSingle();
    if (!row) return sendJson(res, 404, { ok: false, error: "not_found" });
    const { error } = await admin
      .from("library_items")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return sendSafeError(res, sendJson, error, { code: "admin_v3_archive_failed" });
    await audit(admin, auth, "content.archive", "library_items", id, { title: row.title });
    return sendJson(res, 200, { ok: true, message: "archived" });
  }

  sendJson(res, 405, { ok: false, error: "method_not_allowed" });
}

async function handleIslamicStories(req, res, admin, auth) {
  if (req.method === "GET") {
    if (!need(auth, "content.read") && !need(auth, "content.edit") && !need(auth, "content.*")) {
      return deny(res, auth, "content.read");
    }
    const { page, pageSize, from, to } = clampPage(req.query);
    let query = admin
      .from("islamic_stories")
      .select(
        "id, slug, title, category, era, summary, full_content, is_approved, verified_by, created_at, updated_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false });
    if (req.query?.status === "approved") query = query.eq("is_approved", true);
    if (req.query?.status === "draft" || req.query?.status === "pending") query = query.eq("is_approved", false);
    if (req.query?.q) {
      const term = String(req.query.q).trim().slice(0, 80);
      if (term) {
        query = query.or(`title.ilike.%${term}%,slug.ilike.%${term}%,category.ilike.%${term}%,era.ilike.%${term}%`);
      }
    }
    const { data, error, count } = await query.range(from, to);
    if (error) return sendSafeError(res, sendJson, error, { code: "admin_v3_list_failed" });
    return sendJson(res, 200, {
      ok: true,
      data: data || [],
      page,
      pageSize,
      total: count ?? 0,
    });
  }

  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    if (!need(auth, "content.edit") && !need(auth, "content.create") && !need(auth, "content.*")) {
      return deny(res, auth, "content.edit");
    }
    const id = req.body?.id || null;
    const fields = pickFields(req.body, [
      "slug",
      "title",
      "category",
      "era",
      "summary",
      "full_content",
      "is_approved",
    ]);
    fields.title = str(fields.title, 500);
    fields.slug = str(fields.slug, 160);
    fields.category = str(fields.category, 120);
    fields.era = str(fields.era, 120);
    fields.summary = str(fields.summary, MAX_TEXT);
    fields.full_content = str(fields.full_content, MAX_TEXT);
    if (typeof fields.is_approved === "string") {
      fields.is_approved = fields.is_approved === "true" || fields.is_approved === "1";
    } else if (fields.is_approved == null) {
      fields.is_approved = false;
    } else {
      fields.is_approved = !!fields.is_approved;
    }
    if (!fields.title || !fields.slug) {
      return sendJson(res, 422, {
        ok: false,
        error: "validation",
        userMessageAr: "العنوان والـ slug مطلوبان.",
      });
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(fields.slug)) {
      return sendJson(res, 422, {
        ok: false,
        error: "validation",
        userMessageAr: "صيغة slug غير صالحة.",
      });
    }
    fields.updated_at = new Date().toISOString();
    const result = id
      ? await admin.from("islamic_stories").update(fields).eq("id", id).select("id").maybeSingle()
      : await admin.from("islamic_stories").insert(fields).select("id").maybeSingle();
    if (result.error) return sendSafeError(res, sendJson, result.error, { code: "admin_v3_upsert_failed" });
    await audit(admin, auth, id ? "content.update" : "content.create", "islamic_stories", result.data?.id || id, {
      slug: fields.slug,
      is_approved: fields.is_approved,
    });
    return sendJson(res, 200, { ok: true, data: result.data });
  }

  if (req.method === "DELETE") {
    if (!need(auth, "content.delete") && !need(auth, "archive") && !need(auth, "content.*")) {
      return deny(res, auth, "content.delete");
    }
    const id = req.query?.id || req.body?.id;
    if (!id) return sendJson(res, 400, { ok: false, error: "bad_request" });
    const { data: row } = await admin.from("islamic_stories").select("id, title").eq("id", id).maybeSingle();
    if (!row) return sendJson(res, 404, { ok: false, error: "not_found" });
    const { error } = await admin
      .from("islamic_stories")
      .update({ is_approved: false, verified_by: null, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return sendSafeError(res, sendJson, error, { code: "admin_v3_archive_failed" });
    await audit(admin, auth, "content.archive", "islamic_stories", id, { title: row.title });
    return sendJson(res, 200, { ok: true, message: "unapproved" });
  }

  sendJson(res, 405, { ok: false, error: "method_not_allowed" });
}

async function handleProphetStories(req, res, admin, auth) {
  if (req.method === "GET") {
    if (!need(auth, "content.read") && !need(auth, "content.edit") && !need(auth, "content.*")) {
      return deny(res, auth, "content.read");
    }
    const { page, pageSize, from, to } = clampPage(req.query);
    let query = admin
      .from("prophet_stories")
      .select("id, slug, arabic_name, content, is_approved, verified_by, approved_at, created_at", {
        count: "exact",
      })
      .order("id", { ascending: true });
    if (req.query?.status === "approved") query = query.eq("is_approved", true);
    if (req.query?.status === "draft" || req.query?.status === "pending") query = query.eq("is_approved", false);
    if (req.query?.q) {
      const term = String(req.query.q).trim().slice(0, 80);
      if (term) {
        query = query.or(`slug.ilike.%${term}%,arabic_name.ilike.%${term}%`);
      }
    }
    const { data, error, count } = await query.range(from, to);
    if (error) return sendSafeError(res, sendJson, error, { code: "admin_v3_list_failed" });
    return sendJson(res, 200, {
      ok: true,
      data: data || [],
      page,
      pageSize,
      total: count ?? 0,
    });
  }

  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    if (!need(auth, "content.edit") && !need(auth, "content.create") && !need(auth, "content.*")) {
      return deny(res, auth, "content.edit");
    }
    const id = req.body?.id || null;
    // Citations JSON editor remains Legacy — v3 edits content + approval + names only
    const fields = pickFields(req.body, ["slug", "arabic_name", "content", "is_approved"]);
    fields.slug = str(fields.slug, 160);
    fields.arabic_name = str(fields.arabic_name, 200);
    fields.content = str(fields.content, MAX_TEXT);
    if (typeof fields.is_approved === "string") {
      fields.is_approved = fields.is_approved === "true" || fields.is_approved === "1";
    } else if (fields.is_approved == null && !id) {
      fields.is_approved = false;
    } else if (fields.is_approved != null) {
      fields.is_approved = !!fields.is_approved;
    } else {
      delete fields.is_approved;
    }
    if (!fields.slug || !fields.arabic_name) {
      return sendJson(res, 422, {
        ok: false,
        error: "validation",
        userMessageAr: "الاسم العربي والـ slug مطلوبان.",
      });
    }
    if (fields.is_approved === true) {
      fields.approved_at = new Date().toISOString();
      fields.verified_by = "admin_v3";
    } else if (fields.is_approved === false) {
      fields.approved_at = null;
      fields.verified_by = null;
    }
    const result = id
      ? await admin.from("prophet_stories").update(fields).eq("id", id).select("id").maybeSingle()
      : await admin.from("prophet_stories").insert(fields).select("id").maybeSingle();
    if (result.error) return sendSafeError(res, sendJson, result.error, { code: "admin_v3_upsert_failed" });
    await audit(admin, auth, id ? "content.update" : "content.create", "prophet_stories", result.data?.id || id, {
      slug: fields.slug,
      is_approved: fields.is_approved,
    });
    return sendJson(res, 200, { ok: true, data: result.data });
  }

  if (req.method === "DELETE") {
    if (!need(auth, "content.delete") && !need(auth, "archive") && !need(auth, "content.*")) {
      return deny(res, auth, "content.delete");
    }
    const id = req.query?.id || req.body?.id;
    if (!id) return sendJson(res, 400, { ok: false, error: "bad_request" });
    const { data: row } = await admin.from("prophet_stories").select("id, slug").eq("id", id).maybeSingle();
    if (!row) return sendJson(res, 404, { ok: false, error: "not_found" });
    const { error } = await admin
      .from("prophet_stories")
      .update({ is_approved: false, approved_at: null, verified_by: null })
      .eq("id", id);
    if (error) return sendSafeError(res, sendJson, error, { code: "admin_v3_archive_failed" });
    await audit(admin, auth, "content.archive", "prophet_stories", id, { slug: row.slug });
    return sendJson(res, 200, { ok: true, message: "unapproved" });
  }

  sendJson(res, 405, { ok: false, error: "method_not_allowed" });
}

const ARBAEEN_STATUSES = new Set(["draft", "in_review", "verified", "published", "rejected"]);

async function handleArbaeen(req, res, admin, auth) {
  if (req.method === "GET") {
    if (!need(auth, "content.read") && !need(auth, "content.edit") && !need(auth, "content.*")) {
      return deny(res, auth, "content.read");
    }
    const { page, pageSize, from, to } = clampPage(req.query);
    let query = admin
      .from("arbaeen_love_of_allah")
      .select(
        "id, order_number, title, hadith_text, source, hadith_number, grade, verified_by, review_status, editor_notes, created_at, updated_at",
        { count: "exact" },
      )
      .order("order_number", { ascending: true });
    if (req.query?.status && ARBAEEN_STATUSES.has(String(req.query.status))) {
      query = query.eq("review_status", String(req.query.status));
    }
    if (req.query?.q) {
      const term = String(req.query.q).trim().slice(0, 80);
      if (term) {
        query = query.or(`title.ilike.%${term}%,source.ilike.%${term}%,hadith_text.ilike.%${term}%`);
      }
    }
    const { data, error, count } = await query.range(from, to);
    if (error) return sendSafeError(res, sendJson, error, { code: "admin_v3_list_failed" });
    return sendJson(res, 200, {
      ok: true,
      data: data || [],
      page,
      pageSize,
      total: count ?? 0,
    });
  }

  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    if (!need(auth, "content.edit") && !need(auth, "content.create") && !need(auth, "content.*")) {
      return deny(res, auth, "content.edit");
    }
    const id = req.body?.id || null;
    const fields = pickFields(req.body, [
      "order_number",
      "title",
      "hadith_text",
      "source",
      "hadith_number",
      "grade",
      "review_status",
      "editor_notes",
      "verified_by",
    ]);
    fields.title = str(fields.title, 500);
    fields.hadith_text = str(fields.hadith_text, MAX_TEXT);
    fields.source = str(fields.source, 400);
    fields.hadith_number = str(fields.hadith_number, 80);
    fields.grade = str(fields.grade, 40);
    fields.editor_notes = str(fields.editor_notes, 2000);
    fields.verified_by = str(fields.verified_by, 200);
    fields.review_status = str(fields.review_status, 40) || "draft";
    if (!ARBAEEN_STATUSES.has(fields.review_status)) {
      return sendJson(res, 422, {
        ok: false,
        error: "validation",
        userMessageAr: "حالة المراجعة غير صالحة.",
      });
    }
    if (fields.order_number != null && fields.order_number !== "") {
      const n = Number.parseInt(String(fields.order_number), 10);
      fields.order_number = Number.isFinite(n) ? n : null;
    } else {
      fields.order_number = null;
    }
    if (!fields.title || !fields.hadith_text || !fields.source) {
      return sendJson(res, 422, {
        ok: false,
        error: "validation",
        userMessageAr: "العنوان ونص الحديث والمصدر مطلوبة.",
      });
    }
    fields.updated_at = new Date().toISOString();
    if (!id) fields.created_at = fields.updated_at;
    const result = id
      ? await admin.from("arbaeen_love_of_allah").update(fields).eq("id", id).select("id, updated_at").maybeSingle()
      : await admin.from("arbaeen_love_of_allah").insert(fields).select("id, updated_at").maybeSingle();
    if (result.error) return sendSafeError(res, sendJson, result.error, { code: "admin_v3_upsert_failed" });
    await audit(admin, auth, id ? "content.update" : "content.create", "arbaeen_love_of_allah", result.data?.id || id, {
      review_status: fields.review_status,
    });
    return sendJson(res, 200, { ok: true, data: result.data });
  }

  if (req.method === "DELETE") {
    if (!need(auth, "content.delete") && !need(auth, "archive") && !need(auth, "content.*")) {
      return deny(res, auth, "content.delete");
    }
    const id = req.query?.id || req.body?.id;
    if (!id) return sendJson(res, 400, { ok: false, error: "bad_request" });
    const { data: row } = await admin
      .from("arbaeen_love_of_allah")
      .select("id, title")
      .eq("id", id)
      .maybeSingle();
    if (!row) return sendJson(res, 404, { ok: false, error: "not_found" });
    const { error } = await admin
      .from("arbaeen_love_of_allah")
      .update({ review_status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return sendSafeError(res, sendJson, error, { code: "admin_v3_archive_failed" });
    await audit(admin, auth, "content.archive", "arbaeen_love_of_allah", id, { title: row.title });
    return sendJson(res, 200, { ok: true, message: "rejected" });
  }

  sendJson(res, 405, { ok: false, error: "method_not_allowed" });
}

export default async function handler(req, res) {
  const auth = await requireAdminAccess(req, res, sendJson);
  if (!auth) return;

  const entity = entityFromPath(req);
  if (!entity) {
    sendJson(res, 404, { ok: false, error: "not_found", userMessageAr: "كيان غير معروف." });
    return;
  }

  const admin = getSupabaseAdmin();
  if (!admin && entity !== "status") {
    sendJson(res, 503, { ok: false, error: "supabase_admin_not_configured" });
    return;
  }

  try {
    if (entity === "lessons") return await handleLessons(req, res, admin, auth);
    if (entity === "sheikhs") return await handleSheikhs(req, res, admin, auth);
    if (entity === "fawaid") return await handleFawaid(req, res, admin, auth);
    if (entity === "library") return await handleLibrary(req, res, admin, auth);
    if (entity === "islamic-stories") return await handleIslamicStories(req, res, admin, auth);
    if (entity === "prophet-stories") return await handleProphetStories(req, res, admin, auth);
    if (entity === "arbaeen") return await handleArbaeen(req, res, admin, auth);
    if (entity === "categories") return await handleCategories(req, res, admin, auth);
    if (entity === "users") return await handleUsers(req, res, admin, auth);
    if (entity === "audit") return await handleAudit(req, res, admin, auth);
    if (entity === "status") return await handleStatus(req, res, auth);
    sendJson(res, 404, { ok: false, error: "not_found" });
  } catch (err) {
    sendSafeError(res, sendJson, err, { code: "admin_v3_error" });
  }
}
