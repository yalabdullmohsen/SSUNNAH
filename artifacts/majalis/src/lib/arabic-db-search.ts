/**
 * غلاف عميل لطبقة البحث العربي الهجينة (FTS + trigram) على Supabase.
 * v4: search_hadiths / search_sources مع فلاتر + صلة + keyset cursor.
 * لا يستبدل البحث المحلي الموحّد (/data/search) — مسار DB للجداول.
 * Feature flag default OFF until Production migration + owner approval.
 */
import { supabase } from "@/lib/supabase";
import { resolveArabicSearchPath, type ArabicSearchPath } from "@/lib/arabic-search-feature-flag";
import { recordSearchObs } from "@/lib/search-observability";

/** Monotonic generation — drop stale RPC responses when a newer request started. */
let searchGeneration = 0;
export function __resetSearchGenerationForTests(): void {
  searchGeneration = 0;
}
export function getSearchGeneration(): number {
  return searchGeneration;
}

export type ArabicDbSearchEntity =
  | "lessons"
  | "sheikhs"
  | "scholars"
  | "library_items"
  | "hadith_items"
  | "hadiths"
  | "sources"
  | "content";

const RPC: Record<Exclude<ArabicDbSearchEntity, "content">, string> = {
  lessons: "search_lessons",
  sheikhs: "search_sheikhs",
  scholars: "search_scholars",
  library_items: "search_library_items",
  hadith_items: "search_hadith_items",
  hadiths: "search_hadiths",
  sources: "search_sources",
};

export type HadithSearchFilters = {
  collection?: string | null;
  chapter?: string | null;
  authenticityClass?: "sahih" | "daif" | "mawdu" | null;
  sourceName?: string | null;
  narrator?: string | null;
  cursorScore?: number | null;
  cursorId?: string | null;
};

export type SourceSearchFilters = {
  category?: string | null;
  sourceType?: string | null;
  cursorScore?: number | null;
  cursorId?: string | null;
};

/** Row shape returned by `search_hadiths` v4 RPC (PostgREST JSON). */
export type HadithRpcSearchRow = {
  id: string;
  title: string | null;
  text_snippet: string | null;
  narrator: string | null;
  source_name: string | null;
  collection: string | null;
  chapter: string | null;
  hadith_number: string | null;
  grade: string | null;
  authenticity_class: string | null;
  matched_field: string | null;
  relevance_score: number | null;
  cursor_score: number | null;
  cursor_id: string | null;
};

/** Row shape returned by `search_sources` v4 RPC. */
export type SourceRpcSearchRow = {
  id: string;
  name: string | null;
  category: string | null;
  source_type: string | null;
  url: string | null;
  trust_level: string | null;
  matched_field: string | null;
  relevance_score: number | null;
  cursor_score: number | null;
  cursor_id: string | null;
};

/** Map v4 RPC row → legacy searchEverything hadith card fields (no ranking change). */
export function mapHadithRpcRowToSearchHit(row: HadithRpcSearchRow): {
  id: string;
  title: string | null;
  text: string | null;
  narrator: string | null;
  collection: string | null;
  grade: string | null;
} {
  return {
    id: row.id,
    title: row.title,
    text: row.text_snippet,
    narrator: row.narrator,
    collection: row.collection,
    grade: row.grade ?? row.authenticity_class,
  };
}

/** True when live DB has not applied Arabic search RPCs yet (safe ILIKE emergency path). */
export function isArabicSearchRpcMissingError(error: unknown): boolean {
  if (!error) return false;
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: string }).message ?? "")
        : String(error);
  const lower = msg.toLowerCase();
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: string }).code ?? "")
      : "";
  return (
    code === "42883" ||
    code === "42702" ||
    code === "PGRST202" ||
    lower.includes("could not find the function") ||
    lower.includes("function public.search_hadiths") ||
    lower.includes("function search_hadiths") ||
    (lower.includes("function") && lower.includes("does not exist"))
  );
}

/** بحث كيان واحد عبر RPC الهجين. */
export async function searchArabicDbEntity(
  entity: Exclude<ArabicDbSearchEntity, "content">,
  q: string,
  lim = 20,
): Promise<{ data: unknown[] | null; error: Error | null; path?: ArabicSearchPath }> {
  const trimmed = q.trim();
  if (!trimmed) return { data: [], error: null, path: "legacy_fallback" };
  if (resolveArabicSearchPath() !== "rpc") {
    return {
      data: null,
      error: new Error("ARABIC_DB_RPC_SEARCH_DISABLED — apply Production migration + owner approval first"),
      path: "legacy_fallback",
    };
  }
  const { data, error } = await supabase.rpc(RPC[entity], { q: trimmed, lim });
  return {
    data: (data as unknown[]) ?? null,
    error: error ? new Error(error.message) : null,
    path: "rpc",
  };
}

/** بحث أحاديث مرتّب مع فلاتر المخطط الحقيقي + cursor. */
export async function searchHadithsDb(
  q: string,
  lim = 20,
  filters: HadithSearchFilters = {},
): Promise<{ data: unknown[] | null; error: Error | null; path?: "rpc" | "legacy_fallback" }> {
  const trimmed = q.trim();
  if (!trimmed && !filters.collection && !filters.chapter && !filters.authenticityClass) {
    return { data: [], error: null, path: "legacy_fallback" };
  }
  const path = resolveArabicSearchPath();
  if (path !== "rpc") {
    recordSearchObs(
      {
        kind: "legacy_fallback",
        latencyMs: 0,
        resultCount: 0,
        zeroResult: true,
        usedFallback: true,
      },
      trimmed,
    );
    return {
      data: null,
      error: new Error("ARABIC_DB_RPC_SEARCH_DISABLED — use unified/local search until Production migration"),
      path: "legacy_fallback",
    };
  }
  const gen = ++searchGeneration;
  const started = Date.now();
  const safeLim = Math.max(1, Math.min(lim, 50));
  const { data, error } = await supabase.rpc("search_hadiths", {
    q: trimmed || null,
    lim: safeLim,
    p_collection: filters.collection ?? null,
    p_chapter: filters.chapter ?? null,
    p_authenticity_class: filters.authenticityClass ?? null,
    p_source_name: filters.sourceName ?? null,
    p_narrator: filters.narrator ?? null,
    p_cursor_score: filters.cursorScore ?? null,
    p_cursor_id: filters.cursorId ?? null,
  });
  if (gen !== searchGeneration) {
    return { data: null, error: new Error("STALE_SEARCH_SUPERSEDED"), path: "rpc" };
  }
  const rows = (data as HadithRpcSearchRow[] | null) ?? null;
  recordSearchObs(
    {
      kind: error ? "rpc_error" : "hadith_rpc",
      latencyMs: Date.now() - started,
      resultCount: rows?.length ?? 0,
      zeroResult: !rows?.length,
      usedFallback: false,
      errorClass: error ? "rpc" : undefined,
      paginationOk: true,
    },
    trimmed,
  );
  return { data: rows, error: error ? new Error(error.message) : null, path: "rpc" };
}

/** بحث مصادر موثوقة مرتّب مع فلاتر + cursor. */
export async function searchSourcesDb(
  q: string,
  lim = 20,
  filters: SourceSearchFilters = {},
): Promise<{ data: unknown[] | null; error: Error | null; path?: "rpc" | "legacy_fallback" }> {
  const trimmed = q.trim();
  if (!trimmed && !filters.category && !filters.sourceType) {
    return { data: [], error: null, path: "legacy_fallback" };
  }
  const path = resolveArabicSearchPath();
  if (path !== "rpc") {
    recordSearchObs(
      {
        kind: "legacy_fallback",
        latencyMs: 0,
        resultCount: 0,
        zeroResult: true,
        usedFallback: true,
      },
      trimmed,
    );
    return {
      data: null,
      error: new Error("ARABIC_DB_RPC_SEARCH_DISABLED — use unified/local search until Production migration"),
      path: "legacy_fallback",
    };
  }
  const gen = ++searchGeneration;
  const started = Date.now();
  const safeLim = Math.max(1, Math.min(lim, 50));
  const { data, error } = await supabase.rpc("search_sources", {
    q: trimmed || null,
    lim: safeLim,
    p_category: filters.category ?? null,
    p_source_type: filters.sourceType ?? null,
    p_cursor_score: filters.cursorScore ?? null,
    p_cursor_id: filters.cursorId ?? null,
  });
  if (gen !== searchGeneration) {
    return { data: null, error: new Error("STALE_SEARCH_SUPERSEDED"), path: "rpc" };
  }
  const rows = (data as SourceRpcSearchRow[] | null) ?? null;
  recordSearchObs(
    {
      kind: error ? "rpc_error" : "source_rpc",
      latencyMs: Date.now() - started,
      resultCount: rows?.length ?? 0,
      zeroResult: !rows?.length,
      usedFallback: false,
      errorClass: error ? "rpc" : undefined,
      paginationOk: true,
    },
    trimmed,
  );
  return { data: rows, error: error ? new Error(error.message) : null, path: "rpc" };
}

/** بحث موحّد عبر search_content (دروس/مكتبة/… حسب الأنواع). */
export async function searchArabicDbContent(
  q: string,
  types?: string[],
  limit = 20,
  offset = 0,
): Promise<{ data: unknown[] | null; error: Error | null; path?: ArabicSearchPath }> {
  const trimmed = q.trim();
  if (!trimmed) return { data: [], error: null, path: "legacy_fallback" };
  if (resolveArabicSearchPath() !== "rpc") {
    return {
      data: null,
      error: new Error("ARABIC_DB_RPC_SEARCH_DISABLED — search_content RPC gated until migration apply"),
      path: "legacy_fallback",
    };
  }
  const { data, error } = await supabase.rpc("search_content", {
    p_query: trimmed,
    p_types: types ?? undefined,
    p_limit: limit,
    p_offset: offset,
  });
  return {
    data: (data as unknown[]) ?? null,
    error: error ? new Error(error.message) : null,
    path: "rpc",
  };
}
