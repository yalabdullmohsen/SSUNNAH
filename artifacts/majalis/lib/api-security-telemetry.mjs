/**
 * Structured API security telemetry — never logs secrets or PII payloads.
 * Failures here must never break the request path.
 */

const RING_MAX = 100;
const ring = [];

const BLOCKED =
  /authorization|token|password|secret|cookie|service.?role|api.?key|prompt|email|audio|jwt|bearer/i;

export function trackApiSecurityEvent(event) {
  try {
    const safe = {
      routeId: String(event.routeId || "").slice(0, 120),
      securityClass: String(event.securityClass || ""),
      method: String(event.method || ""),
      status: Number(event.status) || 0,
      durationMs: event.durationMs != null ? Number(event.durationMs) : undefined,
      authType: String(event.authType || "none").slice(0, 32),
      rateLimit: event.rateLimit != null ? String(event.rateLimit).slice(0, 24) : undefined,
      quota: event.quota != null ? String(event.quota).slice(0, 24) : undefined,
      correlationId: String(event.correlationId || "").slice(0, 64),
      providerCategory: event.providerCategory
        ? String(event.providerCategory).slice(0, 32)
        : undefined,
      errorCode: event.errorCode ? String(event.errorCode).slice(0, 64) : undefined,
      ts: Date.now(),
    };
    for (const k of Object.keys(safe)) {
      if (BLOCKED.test(k)) delete safe[k];
    }
    ring.push(safe);
    while (ring.length > RING_MAX) ring.shift();

    if (process.env.API_SECURITY_LOG === "1") {
      console.info(JSON.stringify({ level: "info", msg: "api.security", ...safe }));
    }
  } catch {
    /* never throw */
  }
}

export function getApiSecurityTelemetrySnapshot() {
  return ring.slice();
}

export function clearApiSecurityTelemetryForTests() {
  ring.length = 0;
}
