/**
 * Cache / query-key / realtime contract (static).
 * Run: node --import tsx src/lib/__tests__/query-cache-contract-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { queryKeys, SEARCH_STALE_MS } from "@/lib/query-keys";
import { isArabicDbRpcSearchEnabled } from "@/lib/arabic-search-feature-flag";
import { recordSearchObs, getSearchObsSnapshot, resetSearchObsForTests } from "@/lib/search-observability";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const qc = readFileSync(resolve(majalis, "src/lib/query-client.ts"), "utf8");

assert.match(qc, /staleTime:\s*300_000/);
assert.match(qc, /refetchOnWindowFocus:\s*false/);
assert.match(qc, /gcTime:\s*900_000/);
assert.match(qc, /timedQueryFn|RequestManager/);

assert.ok(queryKeys.scholars.all.length >= 2);
assert.ok(queryKeys.search.hadithRpc("q", "c").includes("hadith_rpc"));
assert.ok(SEARCH_STALE_MS <= 120_000);

// Feature flag default OFF (no Production RPC enablement from merge)
assert.equal(isArabicDbRpcSearchEnabled(), false);

resetSearchObsForTests();
recordSearchObs(
  {
    kind: "legacy_fallback",
    latencyMs: 12,
    resultCount: 0,
    zeroResult: true,
    usedFallback: true,
  },
  "نية",
);
const snap = getSearchObsSnapshot();
assert.ok((snap["search.events"] ?? 0) >= 1);
assert.ok((snap["search.fallback"] ?? 0) >= 1);
// Must not store raw query
assert.ok(!JSON.stringify(snap).includes("نية"));

// Realtime: no unbounded supabase.channel in lib services (static bound)
const arabicDb = readFileSync(resolve(majalis, "src/lib/arabic-db-search.ts"), "utf8");
assert.doesNotMatch(arabicDb, /\.channel\(/);
assert.match(arabicDb, /resolveArabicSearchPath|ARABIC_DB_RPC/);
assert.match(arabicDb, /Math\.min\(lim,\s*50\)/);
assert.match(arabicDb, /STALE_SEARCH_SUPERSEDED|searchGeneration/);

// Logout clears React Query cache (ownership-sensitive)
const auth = readFileSync(resolve(majalis, "src/components/AuthProvider.tsx"), "utf8");
assert.match(auth, /queryClient\.clear\(\)/);
assert.match(auth, /logout/);

// Entity hooks use canonical queryKeys
const scholars = readFileSync(resolve(majalis, "src/entities/scholar/hooks.ts"), "utf8");
assert.match(scholars, /queryKeys\.scholars/);
const books = readFileSync(resolve(majalis, "src/entities/book/hooks.ts"), "utf8");
assert.match(books, /queryKeys\.books/);

console.log("query-cache-contract-gate: ok");
