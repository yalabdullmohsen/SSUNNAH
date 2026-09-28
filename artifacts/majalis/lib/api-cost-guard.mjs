/**
 * AI / TTS cost protection — quotas + input limits + model allowlist.
 * Uses Upstash rate-limit backend (fail-closed in production via checkRateLimit).
 */
import { checkRateLimit } from "./rate-limit.mjs";
import {
  getAiModelAllowlist,
  hashOpaqueId,
  isAiFeatureEnabled,
  isProductionEnv,
} from "./api-security-policy.mjs";
import { extractBearer, validateUserSession } from "./user-auth.mjs";
import { sendJson } from "./api/_http.mjs";
import { trackApiSecurityEvent } from "./api-security-telemetry.mjs";

const GUEST_MAX_PER_HOUR = 8;
const USER_MAX_PER_HOUR = 40;
const GLOBAL_MAX_PER_MIN = 120;
const MAX_PROMPT_CHARS = 4_000;
const MAX_TTS_CHARS = 2_000;

export function stripClientCostOverrides(body) {
  if (!body || typeof body !== "object") return {};
  const out = { ...body };
  delete out.model;
  delete out.provider;
  delete out.max_tokens;
  delete out.maxTokens;
  delete out.tokenBudget;
  delete out.temperature;
  return out;
}

export function assertModelAllowed(model) {
  if (!model) return true;
  return getAiModelAllowlist().includes(String(model));
}

export function enforcePromptLength(text, { tts = false } = {}) {
  const s = String(text || "");
  const max = tts ? MAX_TTS_CHARS : MAX_PROMPT_CHARS;
  if (s.length > max) return { ok: false, max };
  return { ok: true, length: s.length };
}

/**
 * Apply cost gate before expensive provider calls.
 * @returns {Promise<null | { userId?: string, authType: string }>} null if response already sent
 */
export async function enforceAiCostGate(req, res, { routeId, tts = false } = {}) {
  const correlationId = req.correlationId || req.requestId || "";

  if (!isAiFeatureEnabled()) {
    sendJson(res, 503, {
      ok: false,
      message: "الميزة متوقفة مؤقتًا.",
      code: "ai_disabled",
      requestId: correlationId,
    });
    return null;
  }

  if (isProductionEnv()) {
    const hasKey = Boolean(
      (process.env.ANTHROPIC_API_KEY || "").trim() || (process.env.OPENAI_API_KEY || "").trim(),
    );
    if (!hasKey) {
      sendJson(res, 503, {
        ok: false,
        message: "الخدمة غير مهيأة.",
        code: "provider_unconfigured",
        requestId: correlationId,
      });
      return null;
    }
  }

  // Reject client-forced model/provider budgets
  if (req.body && typeof req.body === "object") {
    if (
      req.body.model != null ||
      req.body.provider != null ||
      req.body.max_tokens != null ||
      req.body.maxTokens != null ||
      req.body.tokenBudget != null
    ) {
      sendJson(res, 400, {
        ok: false,
        message: "معاملات غير مسموحة.",
        code: "cost_override_forbidden",
        requestId: correlationId,
      });
      return null;
    }
  }

  const prompt =
    req.body?.message || req.body?.prompt || req.body?.text || req.body?.q || "";
  const lenCheck = enforcePromptLength(prompt, { tts });
  if (!lenCheck.ok) {
    sendJson(res, 400, {
      ok: false,
      message: "النص أطول من الحد المسموح.",
      code: "input_too_long",
      requestId: correlationId,
    });
    return null;
  }

  let authType = "guest";
  let userId = null;
  const bearer = extractBearer(req);
  if (bearer) {
    const session = await validateUserSession(req);
    if (session.ok) {
      authType = "user";
      userId = session.user.id;
    } else if (session.status === 401) {
      // invalid token — reject rather than fall through as guest
      sendJson(res, 401, {
        ok: false,
        message: "جلسة غير صالحة.",
        requestId: correlationId,
      });
      return null;
    }
  }

  const subject =
    userId ||
    req.installIdHash ||
    hashOpaqueId(
      String(req.headers?.["x-forwarded-for"] || "").split(",")[0]?.trim() || "anon",
    );

  const global = await checkRateLimit(`ai:global`, {
    windowMs: 60_000,
    max: GLOBAL_MAX_PER_MIN,
  });
  if (!global.allowed) {
    res.setHeader("Retry-After", "60");
    sendJson(res, 429, {
      ok: false,
      message: "الحصة العامة ممتلئة. حاول لاحقًا.",
      code: "global_quota",
      requestId: correlationId,
    });
    trackApiSecurityEvent({
      routeId,
      securityClass: req.securityClass,
      method: req.method,
      status: 429,
      authType,
      quota: "global_deny",
      correlationId,
      providerCategory: "ai",
      errorCode: "global_quota",
    });
    return null;
  }

  const max = authType === "user" ? USER_MAX_PER_HOUR : GUEST_MAX_PER_HOUR;
  const personal = await checkRateLimit(`ai:${authType}:${subject}`, {
    windowMs: 3_600_000,
    max,
  });
  if (!personal.allowed) {
    res.setHeader("Retry-After", "3600");
    sendJson(res, 429, {
      ok: false,
      message: "تم استهلاك حصتك. حاول لاحقًا أو سجّل الدخول.",
      code: "user_quota",
      requestId: correlationId,
    });
    trackApiSecurityEvent({
      routeId,
      securityClass: req.securityClass,
      method: req.method,
      status: 429,
      authType,
      quota: "user_deny",
      correlationId,
      providerCategory: "ai",
      errorCode: "user_quota",
    });
    return null;
  }

  return { userId: userId || undefined, authType };
}
