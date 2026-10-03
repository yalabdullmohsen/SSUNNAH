/**
 * غلاف عميل لطبقة البحث العربي الهجينة (FTS + trigram) على Supabase.
 * v4: search_hadiths / search_sources مع فلاتر + صلة + keyset cursor.
 * لا يستبدل البحث المحلي الموحّد (/data/search) — مسار DB للجداول.
 * Feature flag default OFF until Production migration + owner approval.
 */
import { supabase } from "@/lib/supabase";
import { resolveArabicSearchPath } from "@/lib/arabic-search-feature-flag";
import { recordSearchObs } from "@/lib/search-observability";

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

/** بحث كيان واحد عبر RPC الهجين. */
export async function searchArabicDbEntity(
  entity: Exclude<ArabicDbSearchEntity, "content">,
  q: string,
  lim = 20,
): Promise<{ data: unknown[] | null; error: Error | null }> {
  const trimmed = q.trim();
  if (!trimmed) return { data: [], error: null };
  const { data, error } = await supabase.rpc(RPC[entity], { q: trimmed, lim });
  return { data: (data as unknown[]) ?? null, error: error ? new Error(error.message) : null };
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
  const rows = (data as unknown[]) ?? null;
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
  const rows = (data as unknown[]) ?? null;
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
): Promise<{ data: unknown[] | null; error: Error | null }> {
  const trimmed = q.trim();
  if (!trimmed) return { data: [], error: null };
  const { data, error } = await supabase.rpc("search_content", {
    p_query: trimmed,
    p_types: types ?? undefined,
    p_limit: limit,
    p_offset: offset,
  });
  return { data: (data as unknown[]) ?? null, error: error ? new Error(error.message) : null };
}
