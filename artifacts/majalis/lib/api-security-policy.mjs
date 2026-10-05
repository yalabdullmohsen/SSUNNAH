/**
 * Central API security policy — classification + class defaults.
 * Fail-closed in production when a route lacks an explicit class.
 */
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { ROUTE_SECURITY_CLASS, COST_SENSITIVE_PREFIXES } from "./api-security-registry.mjs";

export const SECURITY_CLASSES = Object.freeze([
  "PUBLIC_READ",
  "PUBLIC_WRITE",
  "AUTHENTICATED_USER",
  "ADMIN",
  "CRON",
  "WEBHOOK",
  "INTERNAL_ONLY",
  "DISABLED_IN_PRODUCTION",
]);

/** Per-class defaults (overridable per route later). */
export const CLASS_POLICY = Object.freeze({
  PUBLIC_READ: {
    methods: ["GET", "HEAD", "OPTIONS"],
    maxBodyBytes: 0,
    requireJson: false,
    rateLimitMax: 120,
    rateLimitWindowMs: 60_000,
    timeoutMs: 20_000,
    cacheControl: "public, max-age=30",
    requireAuth: false,
  },
  PUBLIC_WRITE: {
    methods: ["POST", "OPTIONS"],
    maxBodyBytes: 32_768,
    requireJson: true,
    rateLimitMax: 20,
    rateLimitWindowMs: 60_000,
    timeoutMs: 25_000,
    cacheControl: "no-store",
    requireAuth: false,
  },
  AUTHENTICATED_USER: {
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    maxBodyBytes: 65_536,
    requireJson: true,
    rateLimitMax: 40,
    rateLimitWindowMs: 60_000,
    timeoutMs: 25_000,
    cacheControl: "no-store",
    requireAuth: true,
  },
  ADMIN: {
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    maxBodyBytes: 1_048_576,
    requireJson: true,
    rateLimitMax: 60,
    rateLimitWindowMs: 60_000,
    timeoutMs: 58_000,
    cacheControl: "no-store",
    requireAuth: true,
  },
  CRON: {
    methods: ["GET", "POST", "OPTIONS"],
    maxBodyBytes: 16_384,
    requireJson: false,
    rateLimitMax: 30,
    rateLimitWindowMs: 60_000,
    timeoutMs: 12_000,
    cacheControl: "no-store",
    requireAuth: true,
  },
  WEBHOOK: {
    methods: ["POST", "OPTIONS"],
    maxBodyBytes: 262_144,
    requireJson: true,
    rateLimitMax: 60,
    rateLimitWindowMs: 60_000,
    timeoutMs: 15_000,
    cacheControl: "no-store",
    requireAuth: true,
  },
  INTERNAL_ONLY: {
    methods: ["GET", "OPTIONS"],
    maxBodyBytes: 0,
    requireJson: false,
    rateLimitMax: 20,
    rateLimitWindowMs: 60_000,
    timeoutMs: 10_000,
    cacheControl: "no-store",
    requireAuth: true,
  },
  DISABLED_IN_PRODUCTION: {
    methods: ["GET", "POST", "OPTIONS"],
    maxBodyBytes: 4_096,
    requireJson: false,
    rateLimitMax: 5,
    rateLimitWindowMs: 60_000,
    timeoutMs: 15_000,
    cacheControl: "no-store",
    requireAuth: true,
  },
});

export function isProductionEnv() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

export function getRouteSecurityClass(prefix) {
  return ROUTE_SECURITY_CLASS[prefix] || null;
}

export function isCostSensitivePath(prefix) {
  return COST_SENSITIVE_PREFIXES.some((p) => prefix === p || prefix.startsWith(`${p}/`));
}

export function resolveClassPolicy(securityClass, routeOpts = {}) {
  const base = CLASS_POLICY[securityClass];
  if (!base) return null;
  return {
    ...base,
    methods: routeOpts.methods || base.methods,
    maxBodyBytes: routeOpts.maxBodyBytes ?? base.maxBodyBytes,
    timeoutMs: routeOpts.timeoutMs ?? base.timeoutMs,
  };
}

export function newCorrelationId(req) {
  const incoming = String(req.headers?.["x-request-id"] || req.headers?.["x-correlation-id"] || "").trim();
  if (incoming && /^[A-Za-z0-9._-]{8,64}$/.test(incoming)) return incoming;
  try {
    return randomUUID();
  } catch {
    return `req_${Date.now().toString(36)}`;
  }
}

export function hashOpaqueId(value) {
  return createHash("sha256").update(String(value || "")).digest("hex").slice(0, 32);
}

export function safeSecretEqual(a, b) {
  const aa = String(a || "");
  const bb = String(b || "");
  if (!aa || !bb) return false;
  const ba = Buffer.from(aa);
  const bbuf = Buffer.from(bb);
  if (ba.length !== bbuf.length) return false;
  try {
    return timingSafeEqual(ba, bbuf);
  } catch {
    return false;
  }
}

/** Official web + Capacitor origins. No wildcard with credentials. */
export function isAllowedOrigin(origin) {
  if (!origin) return false;
  const o = String(origin);
  if (o === "capacitor://localhost" || o === "http://localhost" || o.startsWith("http://localhost:")) return true;
  if (o === "https://localhost" || o.startsWith("https://localhost:")) return true;
  if (o.startsWith("http://127.0.0.1:") || o.startsWith("https://127.0.0.1:")) return true;
  if (o === "https://majalis.vercel.app" || o === "https://www.majalis.vercel.app") return true;
  if (o === "https://ssunnah.app" || o === "https://www.ssunnah.app") return true;
  // الدومين الإنتاجي الحالي — غيابه كان يردّ كل طلبات الكتابة من المتصفح بـ403 (ومنها client-error)
  if (o === "https://ssunnah.com" || o === "https://www.ssunnah.com") return true;
  if (o === "https://majlisilm.com" || o === "https://www.majlisilm.com") return true;
  if (o.endsWith(".vercel.app") && o.startsWith("https://")) return true;
  if (!isProductionEnv() && (o.startsWith("http://192.168.") || o.startsWith("http://10."))) return true;
  return false;
}

export function assertRegistryComplete(routePrefixes) {
  const missing = [];
  for (const p of routePrefixes) {
    if (!ROUTE_SECURITY_CLASS[p]) missing.push(p);
  }
  return missing;
}

/** Kill switch — server-side only. */
export function isAiFeatureEnabled() {
  const raw = String(process.env.AI_FEATURE_ENABLED ?? "1").trim().toLowerCase();
  if (raw === "0" || raw === "false" || raw === "off") return false;
  if (String(process.env.AI_EMERGENCY_KILL_SWITCH || "").trim() === "1") return false;
  return true;
}

export function getAiModelAllowlist() {
  return Object.freeze([
    "claude-haiku-4-5-20251001",
    "claude-sonnet-4-20250514",
    "gpt-4o-mini",
  ]);
}
