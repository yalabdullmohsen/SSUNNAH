/**
 * غلاف عميل لطبقة البحث العربي الهجينة (FTS + trigram) على Supabase.
 * v4: search_hadiths / search_sources مع فلاتر + صلة + keyset cursor.
 * لا يستبدل البحث المحلي الموحّد (/data/search) — مسار DB للجداول.
 */
import { supabase } from "@/lib/supabase";

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
): Promise<{ data: unknown[] | null; error: Error | null }> {
  const trimmed = q.trim();
  if (!trimmed && !filters.collection && !filters.chapter && !filters.authenticityClass) {
    return { data: [], error: null };
  }
  const { data, error } = await supabase.rpc("search_hadiths", {
    q: trimmed || null,
    lim,
    p_collection: filters.collection ?? null,
    p_chapter: filters.chapter ?? null,
    p_authenticity_class: filters.authenticityClass ?? null,
    p_source_name: filters.sourceName ?? null,
    p_narrator: filters.narrator ?? null,
    p_cursor_score: filters.cursorScore ?? null,
    p_cursor_id: filters.cursorId ?? null,
  });
  return { data: (data as unknown[]) ?? null, error: error ? new Error(error.message) : null };
}

/** بحث مصادر موثوقة مرتّب مع فلاتر + cursor. */
export async function searchSourcesDb(
  q: string,
  lim = 20,
  filters: SourceSearchFilters = {},
): Promise<{ data: unknown[] | null; error: Error | null }> {
  const trimmed = q.trim();
  if (!trimmed && !filters.category && !filters.sourceType) {
    return { data: [], error: null };
  }
  const { data, error } = await supabase.rpc("search_sources", {
    q: trimmed || null,
    lim,
    p_category: filters.category ?? null,
    p_source_type: filters.sourceType ?? null,
    p_cursor_score: filters.cursorScore ?? null,
    p_cursor_id: filters.cursorId ?? null,
  });
  return { data: (data as unknown[]) ?? null, error: error ? new Error(error.message) : null };
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
