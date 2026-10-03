/**
 * غلاف عميل لطبقة البحث العربي الهجينة (FTS + trigram) على Supabase.
 * يستدعي RPCs من arabic_search_infrastructure_v2.sql.
 * لا يستبدل البحث المحلي الموحّد (/data/search) — مسار DB للجداول.
 */
import { supabase } from "@/lib/supabase";

export type ArabicDbSearchEntity =
  | "lessons"
  | "sheikhs"
  | "scholars"
  | "library_items"
  | "hadith_items"
  | "content";

const RPC: Record<Exclude<ArabicDbSearchEntity, "content">, string> = {
  lessons: "search_lessons",
  sheikhs: "search_sheikhs",
  scholars: "search_scholars",
  library_items: "search_library_items",
  hadith_items: "search_hadith_items",
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
