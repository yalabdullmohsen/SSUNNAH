/**
 * Privacy-safe search observability — no full query text, tokens, or user PII.
 */

export type SearchLatencyBucket = "lt50" | "lt150" | "lt400" | "lt1000" | "gte1000";

export type SearchObsEvent = {
  kind: "hadith_rpc" | "source_rpc" | "unified_local" | "legacy_fallback" | "rpc_error";
  latencyMs: number;
  resultCount: number;
  zeroResult: boolean;
  usedFallback: boolean;
  errorClass?: string;
  paginationOk?: boolean;
  timedOut?: boolean;
};

function latencyBucket(ms: number): SearchLatencyBucket {
  if (ms < 50) return "lt50";
  if (ms < 150) return "lt150";
  if (ms < 400) return "lt400";
  if (ms < 1000) return "lt1000";
  return "gte1000";
}

/** Hash query length + bucket only — never store raw query. */
function queryShape(raw: string): { lenBucket: string; hasDigits: boolean } {
  const t = raw.trim();
  const len = t.length;
  const lenBucket = len === 0 ? "0" : len === 1 ? "1" : len < 4 ? "2-3" : len < 12 ? "4-11" : "12+";
  return { lenBucket, hasDigits: /\d/.test(t) };
}

type CounterMap = Record<string, number>;

const counters: CounterMap = Object.create(null);

function bump(key: string, n = 1): void {
  counters[key] = (counters[key] ?? 0) + n;
}

export function recordSearchObs(event: SearchObsEvent, rawQueryForShapeOnly = ""): void {
  const bucket = latencyBucket(event.latencyMs);
  const shape = queryShape(rawQueryForShapeOnly);
  bump(`search.events`);
  bump(`search.kind.${event.kind}`);
  bump(`search.latency.${bucket}`);
  bump(`search.len.${shape.lenBucket}`);
  if (event.zeroResult) bump("search.zero_result");
  if (event.usedFallback) bump("search.fallback");
  if (event.errorClass) bump(`search.error.${event.errorClass}`);
  if (event.paginationOk === false) bump("search.pagination_fail");
  if (event.timedOut) bump("search.timeout");
  bump(`search.results.${event.resultCount === 0 ? "0" : event.resultCount < 5 ? "1-4" : "5+"}`);
}

export function getSearchObsSnapshot(): Readonly<CounterMap> {
  return { ...counters };
}

export function resetSearchObsForTests(): void {
  for (const k of Object.keys(counters)) delete counters[k];
}
