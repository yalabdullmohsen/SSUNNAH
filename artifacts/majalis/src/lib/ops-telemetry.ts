/**
 * مرصدية محلية موحّدة — حلقة محدودة في الذاكرة (+ اختياري sessionStorage).
 * فشل التسجيل لا يعطّل التطبيق أبدًا. لا يُسجَّل محتوى حسّاس.
 */

export type OpsTelemetryEventName =
  | "startup.phase"
  | "splash.cleared"
  | "chunk.load_failure"
  | "chunk.recovery_attempted"
  | "chunk.recovery_result"
  | "route.lazy_load"
  | "mushaf.first_usable_paint"
  | "storage.hydrate"
  | "bookmark.migration"
  | "last_page.restored"
  | "uncaught.error";

export type OpsTelemetryEvent = {
  name: OpsTelemetryEventName;
  ts: number;
  /** مدة بالميلي ثانية عند الاقتضاء */
  durationMs?: number;
  /** حقول آمنة فقط — أرقام/رموز قصيرة */
  data?: Record<string, string | number | boolean | null>;
};

const MAX_EVENTS = 80;
const SESSION_KEY = "mj.ops-telemetry.v1";
const ring: OpsTelemetryEvent[] = [];

function safePush(event: OpsTelemetryEvent): void {
  ring.push(event);
  while (ring.length > MAX_EVENTS) ring.shift();
  try {
    if (typeof sessionStorage === "undefined") return;
    const slim = ring.slice(-40);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(slim));
  } catch {
    /* quota / private mode */
  }
}

/** سجّل حدثًا — يبتلع كل الأخطاء. */
export function trackOps(
  name: OpsTelemetryEventName,
  data?: OpsTelemetryEvent["data"],
  durationMs?: number,
): void {
  try {
    safePush({
      name,
      ts: Date.now(),
      durationMs,
      data: data ? sanitizeData(data) : undefined,
    });
  } catch {
    /* never throw */
  }
}

const BLOCKED_KEY_RE =
  /token|password|secret|email|phone|ayah.?text|query|search|authorization|refresh|anon.?key/i;

function sanitizeData(
  data: Record<string, string | number | boolean | null>,
): Record<string, string | number | boolean | null> {
  const out: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(data)) {
    if (BLOCKED_KEY_RE.test(k)) continue;
    if (typeof v === "string" && v.length > 120) {
      out[k] = `${v.slice(0, 117)}…`;
      continue;
    }
    out[k] = v;
  }
  return out;
}

export function getOpsTelemetrySnapshot(): readonly OpsTelemetryEvent[] {
  return ring.slice();
}

export function clearOpsTelemetryForTests(): void {
  ring.length = 0;
  try {
    sessionStorage?.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
