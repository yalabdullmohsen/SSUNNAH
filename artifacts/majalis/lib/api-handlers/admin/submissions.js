import { sendJson } from "../../api/_http.mjs";
import { sendSafeError } from "../../api/safe-error.mjs";
import { requireAdminAccess, hasPermission } from "../../../lib/admin-auth.mjs";
import { getSupabaseAdmin } from "../../../lib/supabase-admin.mjs";
import { logGovernanceEvent } from "../../../lib/governance/audit.mjs";
import { sendMessage } from "../../../lib/telegram/bot.mjs";

async function notifyTelegramNewLesson(title, speaker, lessonId) {
  const chatId = String(process.env.TELEGRAM_ADMIN_CHAT_ID || "").trim();
  if (!chatId) return;
  const who = speaker ? `\nالشيخ: <b>${speaker}</b>` : "";
  const text = `📚 درس جديد (قُبل يدوياً)\n<b>${title || "بدون عنوان"}</b>${who}\n\n🔗 <a href="https://majlisilm.com/lessons/${lessonId}">عرض الدرس</a>`;
  try {
    await sendMessage(chatId, text, { parse_mode: "HTML", disable_web_page_preview: true });
  } catch {
    /* best-effort */
  }
}

async function audit(admin, auth, action, resource_id, metadata) {
  try {
    await logGovernanceEvent(admin, {
      action,
      actor_id: auth.userId || auth.user?.id || "service",
      actor_role: auth.role || auth.governanceRole || null,
      resource_type: "submissions",
      resource_id,
      metadata: { ...metadata, source: "admin_v3_reviews" },
      source: "admin_v3",
    });
  } catch {
    /* ignore */
  }
}

export default async function handler(req, res) {
  const auth = await requireAdminAccess(req, res, sendJson);
  if (!auth) return;

  const admin = getSupabaseAdmin();
  if (!admin) {
    sendJson(res, 503, { ok: false, error: "supabase_admin_not_configured" });
    return;
  }

  if (req.method === "GET") {
    if (
      !hasPermission(auth, "content.read") &&
      !hasPermission(auth, "review.approve") &&
      !hasPermission(auth, "review.editorial") &&
      !hasPermission(auth, "content.moderate") &&
      !hasPermission(auth, "content.*") &&
      !auth.unrestricted &&
      !auth.isOwner
    ) {
      sendJson(res, 403, {
        ok: false,
        error: "permission_denied",
        permission: "content.read",
        userMessageAr: "ليس لديك صلاحية عرض صندوق المراجعة.",
      });
      return;
    }

    const status = String(req.query?.status || "pending").slice(0, 40);
    const type = req.query?.type ? String(req.query.type).slice(0, 40) : null;
    const page = Math.max(1, Number.parseInt(String(req.query?.page || "1"), 10) || 1);
    const pageSize = Math.min(50, Math.max(1, Number.parseInt(String(req.query?.pageSize || "25"), 10) || 25));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = admin
      .from("submissions")
      .select(
        "id, type, title, content, author, status, created_at, updated_at, rejection_reason",
        { count: "exact" },
      )
      .eq("status", status)
      .order("created_at", { ascending: true });
    if (type) query = query.eq("type", type);
    if (req.query?.q) {
      const term = String(req.query.q).trim().slice(0, 80);
      if (term) query = query.or(`title.ilike.%${term}%,author.ilike.%${term}%`);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) {
      // rejection_reason column may be absent
      if (/rejection_reason/i.test(error.message || "")) {
        const fallback = await admin
          .from("submissions")
          .select("id, type, title, content, author, status, created_at, updated_at", { count: "exact" })
          .eq("status", status)
          .order("created_at", { ascending: true })
          .range(from, to);
        if (fallback.error) {
          sendSafeError(res, sendJson, fallback.error, { code: "admin_handler_error" });
          return;
        }
        sendJson(res, 200, {
          ok: true,
          data: fallback.data || [],
          page,
          pageSize,
          total: fallback.count ?? 0,
        });
        return;
      }
      sendSafeError(res, sendJson, error, { code: "admin_handler_error" });
      return;
    }
    sendJson(res, 200, { ok: true, data: data || [], page, pageSize, total: count ?? 0 });
    return;
  }

  if (req.method === "POST") {
    const { id, action, reason, expectedUpdatedAt } = req.body || {};
    if (!id || !["approve", "reject"].includes(action)) {
      sendJson(res, 400, {
        ok: false,
        error: "bad_request",
        message: "مطلوب id وaction (approve أو reject).",
      });
      return;
    }

    const needed =
      action === "approve"
        ? ["review.approve", "publish", "content.*", "content.edit"]
        : ["review.reject", "content.moderate", "review.editorial", "content.*"];
    const allowed = needed.some((p) => hasPermission(auth, p)) || auth.unrestricted || auth.isOwner;
    if (!allowed) {
      sendJson(res, 403, {
        ok: false,
        error: "permission_denied",
        permission: action === "approve" ? "review.approve" : "review.reject",
        userMessageAr: "ليس لديك صلاحية اتخاذ قرار المراجعة.",
      });
      return;
    }

    if (action === "reject" && (!reason || String(reason).trim().length < 3)) {
      sendJson(res, 422, {
        ok: false,
        error: "validation",
        userMessageAr: "سبب الرفض مطلوب (٣ أحرف على الأقل).",
      });
      return;
    }

    const { data: rows, error: fetchErr } = await admin
      .from("submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !rows) {
      sendJson(res, 404, { ok: false, error: "not_found" });
      return;
    }

    const submission = rows;
    if (submission.status !== "pending") {
      sendJson(res, 409, {
        ok: false,
        error: "already_reviewed",
        userMessageAr: "تمت مراجعة هذا العنصر مسبقاً.",
        currentStatus: submission.status,
      });
      return;
    }

    if (expectedUpdatedAt && submission.updated_at && submission.updated_at !== expectedUpdatedAt) {
      sendJson(res, 409, {
        ok: false,
        error: "conflict",
        userMessageAr: "تغيّر العنصر على الخادم. أعد التحميل.",
      });
      return;
    }

    if (action === "reject") {
      const patch = {
        status: "rejected",
        rejection_reason: String(reason).trim().slice(0, 500),
        updated_at: new Date().toISOString(),
      };
      let { error } = await admin.from("submissions").update(patch).eq("id", id).eq("status", "pending");
      if (error && /rejection_reason/i.test(error.message || "")) {
        ({ error } = await admin
          .from("submissions")
          .update({ status: "rejected", updated_at: patch.updated_at })
          .eq("id", id)
          .eq("status", "pending"));
      }
      if (error) {
        sendSafeError(res, sendJson, error, { code: "admin_handler_error" });
        return;
      }
      await audit(admin, auth, "review.reject", id, { type: submission.type, reason: patch.rejection_reason });
      sendJson(res, 200, { ok: true, message: "تم رفض الإضافة." });
      return;
    }

    // approve — publish to the relevant table (publish permission already checked)
    let publishError = null;

    if (submission.type === "درس") {
      const { data: lessonRow, error } = await admin
        .from("lessons")
        .insert({
          title: submission.title,
          description: submission.content,
          status: "approved",
          activity_type: "درس",
          speaker_name: submission.author || "مجتمع المنصة",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id, title, speaker_name")
        .single();
      publishError = error;
      if (!error && lessonRow) {
        notifyTelegramNewLesson(lessonRow.title, lessonRow.speaker_name, lessonRow.id).catch(() => {});
      }
    } else if (submission.type === "فائدة") {
      const { error } = await admin.from("fawaid").insert({
        text: `${submission.title}\n${submission.content}`.trim(),
        author_name: submission.author || null,
        status: "approved",
      });
      publishError = error;
    } else if (submission.type === "سؤال لعبة") {
      const { error } = await admin.from("qa_questions").insert({
        question: submission.title,
        answer: submission.content,
        reference: submission.author ? `مُرسَل من: ${submission.author}` : null,
        status: "published",
        review_status: "approved",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      publishError = error;
    }

    if (publishError) {
      sendSafeError(res, sendJson, publishError, { code: "publish_failed" });
      return;
    }

    const { data: updatedRows, error: statusErr } = await admin
      .from("submissions")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "pending")
      .select("id");
    if (statusErr) {
      sendSafeError(res, sendJson, statusErr, { code: "submission_update_failed" });
      return;
    }
    if (!updatedRows?.length) {
      sendJson(res, 409, {
        ok: false,
        error: "already_reviewed",
        userMessageAr: "تمت مراجعة هذا العنصر مسبقاً.",
      });
      return;
    }

    await audit(admin, auth, "review.approve", id, { type: submission.type, title: submission.title });
    sendJson(res, 200, { ok: true, message: "تمت الموافقة ونُشر المحتوى." });
    return;
  }

  sendJson(res, 405, { ok: false, error: "method_not_allowed" });
}
