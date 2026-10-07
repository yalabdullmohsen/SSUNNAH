/**
 * Request guard applied in dispatch before handler invocation.
 */
import { createRateLimiter } from "./rate-limit.mjs";
import {
  getRouteSecurityClass,
  resolveClassPolicy,
  newCorrelationId,
  isAllowedOrigin,
  isProductionEnv,
  isCostSensitivePath,
  isAiFeatureEnabled,
  hashOpaqueId,
} from "./api-security-policy.mjs";
import { sendJson } from "./api/_http.mjs";
import { trackApiSecurityEvent } from "./api-security-telemetry.mjs";

const classLimiters = new Map();

function limiterFor(securityClass, policy) {
  const key = `${securityClass}:${policy.rateLimitMax}:${policy.rateLimitWindowMs}`;
  if (!classLimiters.has(key)) {
    classLimiters.set(
      key,
      createRateLimiter({
        windowMs: policy.rateLimitWindowMs,
        max: policy.rateLimitMax,
        keyPrefix: `sec:${securityClass}`,
      }),
    );
  }
  return classLimiters.get(key);
}

function applySecurityHeaders(res, policy, correlationId) {
  try {
    res.setHeader("X-Request-Id", correlationId);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    if (policy?.cacheControl) res.setHeader("Cache-Control", policy.cacheControl);
  } catch {
    /* ignore */
  }
}

function applyCors(req, res) {
  const origin = String(req.headers?.origin || "");
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Request-Id, X-Correlation-Id, X-Idempotency-Key, X-Install-Id",
  );
}

/**
 * @returns {Promise<{ ok: true, securityClass: string, policy: object, correlationId: string } | { ok: false }>}
 */
export async function enforceApiSecurity(req, res, route) {
  const correlationId = newCorrelationId(req);
  req.correlationId = correlationId;
  req.requestId = req.requestId || correlationId;

  const securityClass = route.securityClass || getRouteSecurityClass(route.prefix);
  if (!securityClass) {
    applySecurityHeaders(res, { cacheControl: "no-store" }, correlationId);
    trackApiSecurityEvent({
      routeId: route.prefix,
      securityClass: "UNCLASSIFIED",
      method: req.method,
      status: isProductionEnv() ? 404 : 500,
      authType: "none",
      rateLimit: "n/a",
      correlationId,
      errorCode: "unclassified_route",
    });
    if (isProductionEnv()) {
      sendJson(res, 404, { ok: false, message: "المسار غير موجود.", requestId: correlationId });
    } else {
      sendJson(res, 500, {
        ok: false,
        message: "مسار بلا تصنيف أمني.",
        requestId: correlationId,
        prefix: route.prefix,
      });
    }
    return { ok: false };
  }

  const methodOverride = Array.isArray(route.methods)
    ? route.methods
    : undefined;
  let policy = resolveClassPolicy(securityClass, {
    ...route,
    methods: methodOverride,
  });
  if (!policy) {
    sendJson(res, 500, { ok: false, message: "تعذر تنفيذ الطلب.", requestId: correlationId });
    return { ok: false };
  }
  // allowGet على المسار يوسّع methods دون إسقاط POST
  if (route.allowGet) {
    const set = new Set(policy.methods);
    set.add("GET");
    set.add("HEAD");
    set.add("OPTIONS");
    policy = { ...policy, methods: [...set] };
  }
  // allowGet:false صراحةً لمسارات الكتابة فقط
  if (route.allowGet === false) {
    policy = {
      ...policy,
      methods: policy.methods.filter((m) => m !== "GET" && m !== "HEAD"),
    };
  }

  applyCors(req, res);
  applySecurityHeaders(res, policy, correlationId);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return { ok: false };
  }

  if (securityClass === "DISABLED_IN_PRODUCTION" && isProductionEnv()) {
    sendJson(res, 404, { ok: false, message: "غير متاح.", requestId: correlationId });
    trackApiSecurityEvent({
      routeId: route.prefix,
      securityClass,
      method: req.method,
      status: 404,
      authType: "none",
      correlationId,
      errorCode: "disabled_in_production",
    });
    return { ok: false };
  }

  if (!policy.methods.includes(req.method)) {
    res.setHeader("Allow", policy.methods.filter((m) => m !== "OPTIONS").join(", "));
    sendJson(res, 405, { ok: false, message: "الطريقة غير مدعومة.", requestId: correlationId });
    trackApiSecurityEvent({
      routeId: route.prefix,
      securityClass,
      method: req.method,
      status: 405,
      authType: "none",
      correlationId,
      errorCode: "method_not_allowed",
    });
    return { ok: false };
  }

  // Origin check for browser writes (skip native Capacitor without Origin)
  if (
    (securityClass === "PUBLIC_WRITE" || securityClass === "AUTHENTICATED_USER") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
  ) {
    const origin = String(req.headers?.origin || "");
    if (origin && !isAllowedOrigin(origin)) {
      sendJson(res, 403, { ok: false, message: "مصدر غير مسموح.", requestId: correlationId });
      trackApiSecurityEvent({
        routeId: route.prefix,
        securityClass,
        method: req.method,
        status: 403,
        authType: "none",
        correlationId,
        errorCode: "origin_denied",
      });
      return { ok: false };
    }
  }

  // Content-Type for JSON mutations
  if (
    policy.requireJson &&
    ["POST", "PUT", "PATCH"].includes(req.method) &&
    securityClass !== "CRON"
  ) {
    const ct = String(req.headers?.["content-type"] || "").toLowerCase();
    if (ct && !ct.includes("application/json") && !ct.includes("text/plain")) {
      sendJson(res, 415, { ok: false, message: "نوع المحتوى غير مدعوم.", requestId: correlationId });
      return { ok: false };
    }
  }

  // Content-Length hard cap before body read
  const len = Number(req.headers?.["content-length"] || 0);
  if (policy.maxBodyBytes > 0 && Number.isFinite(len) && len > policy.maxBodyBytes) {
    sendJson(res, 413, { ok: false, message: "الطلب أكبر من الحد المسموح.", requestId: correlationId });
    return { ok: false };
  }

  // Cost kill-switch
  if (isCostSensitivePath(route.prefix) && !isAiFeatureEnabled()) {
    sendJson(res, 503, {
      ok: false,
      message: "الميزة متوقفة مؤقتًا.",
      code: "ai_disabled",
      requestId: correlationId,
    });
    trackApiSecurityEvent({
      routeId: route.prefix,
      securityClass,
      method: req.method,
      status: 503,
      authType: "none",
      correlationId,
      errorCode: "ai_disabled",
      providerCategory: "ai",
    });
    return { ok: false };
  }

  // Class-level rate limit when route has no dedicated limiter
  if (!route.rateLimit) {
    const limiter = limiterFor(securityClass, policy);
    let proceeded = false;
    await limiter(req, res, () => {
      proceeded = true;
    });
    if (!proceeded || res.headersSent || res.writableEnded) {
      trackApiSecurityEvent({
        routeId: route.prefix,
        securityClass,
        method: req.method,
        status: 429,
        authType: "none",
        rateLimit: "deny",
        correlationId,
        errorCode: "rate_limited",
      });
      return { ok: false };
    }
  }

  // Class auth gates (domain/RBAC remains in handlers)
  if (securityClass === "CRON" || securityClass === "INTERNAL_ONLY") {
    const { validateCronAuth } = await import("./env-config.mjs");
    if (!validateCronAuth(req)) {
      sendJson(res, 401, { ok: false, message: "غير مصرح.", requestId: correlationId });
      trackApiSecurityEvent({
        routeId: route.prefix,
        securityClass,
        method: req.method,
        status: 401,
        authType: "cron",
        correlationId,
        errorCode: "cron_auth_failed",
      });
      return { ok: false };
    }
    req.authType = "cron";
  } else if (securityClass === "AUTHENTICATED_USER") {
    const { requireUser } = await import("./user-auth.mjs");
    const session = await requireUser(req, res, sendJson);
    if (!session) {
      trackApiSecurityEvent({
        routeId: route.prefix,
        securityClass,
        method: req.method,
        status: 401,
        authType: "user",
        correlationId,
        errorCode: "user_auth_failed",
      });
      return { ok: false };
    }
    req.authUser = session.user;
    req.authType = "user";
  } else if (securityClass === "WEBHOOK") {
    // Telegram: fail-closed in production without secret
    const expected = String(process.env.TELEGRAM_WEBHOOK_SECRET || "").trim();
    if (!expected && isProductionEnv()) {
      sendJson(res, 503, { ok: false, message: "التكامل غير مهيأ.", requestId: correlationId });
      return { ok: false };
    }
    if (expected) {
      const { safeSecretEqual } = await import("./api-security-policy.mjs");
      const provided = String(req.headers?.["x-telegram-bot-api-secret-token"] || "").trim();
      if (!safeSecretEqual(provided, expected)) {
        sendJson(res, 403, { ok: false, requestId: correlationId });
        return { ok: false };
      }
    }
    req.authType = "webhook";
  }

  // Hashed install id (never trusted as identity)
  const installRaw = String(req.headers?.["x-install-id"] || "").trim();
  if (installRaw) req.installIdHash = hashOpaqueId(installRaw);

  req.securityClass = securityClass;
  req.securityPolicy = policy;

  return { ok: true, securityClass, policy, correlationId };
}

export async function readJsonBodyLimited(req, maxBytes) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return { ok: true, body: req.body };
  }
  if (typeof req.on !== "function") return { ok: true, body: {} };

  // ارفض قبل قراءة أي بايت إن أعلن العميل حجمًا يتجاوز الحد
  const declared = Number(req.headers?.["content-length"]);
  if (maxBytes > 0 && Number.isFinite(declared) && declared > maxBytes) {
    return { ok: false, error: "payload_too_large" };
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (maxBytes > 0 && size > maxBytes) {
      return { ok: false, error: "payload_too_large" };
    }
    chunks.push(buf);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return { ok: true, body: {} };
  try {
    return { ok: true, body: JSON.parse(raw) };
  } catch {
    return { ok: false, error: "invalid_json" };
  }
}
