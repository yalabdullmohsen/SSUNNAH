/**
 * Web Push + Capacitor token registration.
 * - Guest OK (installation-scoped)
 * - user_id فقط من JWT موثّق — لا من body
 * - unsubscribe لا يحذف توكنات مستخدم آخر
 */
import { sendJson } from "../api/_http.mjs";
import { getSupabaseAdmin } from "../supabase-admin.mjs";
import { extractBearer, validateUserSession } from "../user-auth.mjs";
import { hashOpaqueId } from "../api-security-policy.mjs";

const MAX_BODY = 8_000;
const ENDPOINT_MAX = 2_048;

async function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.on !== "function") return {};
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) return null;
  }
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function sanitizeSubscription(body) {
  if (!body || typeof body !== "object") return null;

  const nativeToken = String(body.token || "").trim();
  const platform = String(body.platform || "").trim().toLowerCase();
  if (nativeToken && (platform === "ios" || platform === "android")) {
    if (nativeToken.length < 8 || nativeToken.length > 512) return null;
    const endpoint = `capacitor://${platform}/${nativeToken}`;
    return {
      endpoint,
      expirationTime: null,
      keys: { p256dh: "native", auth: hashOpaqueId(nativeToken) },
      platform,
      kind: "capacitor",
      tokenFingerprint: hashOpaqueId(nativeToken),
    };
  }

  const endpoint = String(body.endpoint || "").trim();
  if (!endpoint.startsWith("https://") || endpoint.length > ENDPOINT_MAX) return null;

  const keys = body.keys && typeof body.keys === "object" ? body.keys : {};
  const p256dh = String(keys.p256dh || "").trim();
  const auth = String(keys.auth || "").trim();
  if (!p256dh || !auth || p256dh.length > 512 || auth.length > 256) return null;

  const serialized = JSON.stringify(body).toLowerCase();
  if (serialized.includes("vapid_private") || serialized.includes("private_key")) return null;

  return {
    endpoint,
    expirationTime: body.expirationTime ?? null,
    keys: { p256dh, auth },
    kind: "webpush",
    platform: "web",
  };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return sendJson(res, 200, {
      ok: true,
      service: "push-subscribe",
      vapidConfigured: Boolean(process.env.VAPID_PRIVATE_KEY && process.env.VITE_VAPID_PUBLIC_KEY),
    });
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
  }

  const body = await parseBody(req);
  if (body === null) return sendJson(res, 413, { ok: false, error: "payload_too_large" });

  // رفض انتحال الملكية عبر body
  if (body.userId != null || body.user_id != null || body.role != null) {
    return sendJson(res, 400, { ok: false, error: "invalid_fields" });
  }

  const sub = sanitizeSubscription(body);
  if (!sub) return sendJson(res, 400, { ok: false, error: "invalid_subscription" });

  let userId = null;
  if (extractBearer(req)) {
    const session = await validateUserSession(req);
    if (!session.ok) {
      return sendJson(res, session.status || 401, { ok: false, error: "unauthorized" });
    }
    userId = session.user.id;
  }

  const admin = getSupabaseAdmin();

  if (body.unsubscribe === true) {
    if (admin) {
      try {
        let q = admin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        if (userId) {
          q = q.eq("user_id", userId);
        } else {
          // ضيف: احذف فقط الصفوف بلا user_id
          q = q.is("user_id", null);
        }
        await q;
      } catch {
        /* table may not exist */
      }
    }
    return sendJson(res, 200, { ok: true, removed: true });
  }

  if (admin) {
    try {
      const row = {
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        expiration_time: sub.expirationTime,
        user_agent: String(req.headers?.["user-agent"] || "").slice(0, 300),
        platform: sub.platform || null,
        app_version: String(body.appVersion || body.app_version || "").slice(0, 32) || null,
        updated_at: new Date().toISOString(),
      };
      if (userId) row.user_id = userId;
      await admin.from("push_subscriptions").upsert(row, { onConflict: "endpoint" });
    } catch {
      /* best-effort */
    }
  }

  return sendJson(res, 200, { ok: true, stored: Boolean(admin) });
}
