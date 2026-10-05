/**
 * وكيل خادم لـ Quran Foundation Content API (إنتاج) — ملف السورة + توقيت الآيات.
 * GET /api/qf-chapter-audio?recitation=7&chapter=112
 *
 * مفاتيح QF لا تدخل الحزمة ولا المستودع: تُقرأ من بيئة الخادم فقط
 *   QF_CLIENT_ID, QF_CLIENT_SECRET   (Vercel env / GitHub secret)
 *   QF_ENV=prelive                    (اختياري؛ الافتراضي production)
 * OAuth2 client_credentials (scope=content) ثم الرأسان x-auth-token و x-client-id.
 * بلا مفاتيح ⇒ 503 فيرجع العميل إلى mp3quran + التقدير النسبي.
 * شروط QF: تخزين المحتوى ≤ أسبوع ⇒ Cache-Control يوم واحد فقط.
 */
import { sendJson } from "../api/_http.mjs";

const HOSTS = {
  production: { oauth: "https://oauth2.quran.foundation", api: "https://apis.quran.foundation" },
  prelive: { oauth: "https://prelive-oauth2.quran.foundation", api: "https://apis-prelive.quran.foundation" },
};

/** @type {{ token: string; expiresAt: number } | null} */
let tokenCache = null;

async function getAccessToken(hosts, clientId, clientSecret, force = false) {
  if (!force && tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.token;
  const res = await fetch(`${hosts.oauth}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials&scope=content",
  });
  if (!res.ok) throw new Error(`qf_oauth_${res.status}`);
  const json = await res.json();
  const ttl = Number(json.expires_in) || 3600;
  tokenCache = { token: json.access_token, expiresAt: Date.now() + (ttl - 60) * 1000 };
  return tokenCache.token;
}

export default async function handler(req, res) {
  if (req.method && req.method !== "GET" && req.method !== "HEAD") {
    sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    return;
  }
  const clientId = String(process.env.QF_CLIENT_ID || "").trim();
  const clientSecret = String(process.env.QF_CLIENT_SECRET || "").trim();
  if (!clientId || !clientSecret) {
    sendJson(res, 503, { ok: false, error: "qf_not_configured" });
    return;
  }

  const recitation = Number(req.query?.recitation);
  const chapter = Number(req.query?.chapter);
  if (!Number.isInteger(recitation) || recitation < 1 || recitation > 10000 || !Number.isInteger(chapter) || chapter < 1 || chapter > 114) {
    sendJson(res, 400, { ok: false, error: "bad_params" });
    return;
  }

  const hosts = process.env.QF_ENV === "prelive" ? HOSTS.prelive : HOSTS.production;
  const target = `${hosts.api}/content/api/v4/chapter_recitations/${recitation}/${chapter}?segments=true`;
  try {
    let upstream;
    for (const force of [false, true]) {
      const token = await getAccessToken(hosts, clientId, clientSecret, force);
      upstream = await fetch(target, { headers: { "x-auth-token": token, "x-client-id": clientId } });
      if (upstream.status !== 401) break; // رمز منتهٍ ⇒ إعادة واحدة برمز جديد
    }
    if (!upstream.ok) {
      sendJson(res, 502, { ok: false, error: `qf_upstream_${upstream.status}` });
      return;
    }
    sendJson(res, 200, await upstream.json(), {
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    });
  } catch {
    sendJson(res, 502, { ok: false, error: "qf_unreachable" });
  }
}
