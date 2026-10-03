import { normalizeArabic } from "@/shared/arabic-normalize";
import {
  compareTolerantMatches,
  scoreTolerantMatch,
  type TolerantMatch,
} from "@/features/search/tolerant-match";
import { kindPriority } from "@/features/search/kind-priority";
import { SEARCH_INDEX_SCHEMA_VERSION } from "@/features/search/search-index-version";
import { expandSearchTerms } from "@/lib/search-synonyms";
import { yieldToMain } from "@/lib/yield-to-main";

export type UnifiedSearchDoc = {
  id: string;
  kind: string;
  titleAr: string;
  href: string;
  /** نص مطبّع مسبقًا عند توليد الفهرس — لا تُعاد تطبيعه في كل ضغطة */
  norm: string;
  meta?: string;
};

export type UnifiedSearchHit = {
  id: string;
  kind: string;
  titleAr: string;
  href: string;
  meta?: string;
  match?: TolerantMatch;
};

type IndexPayload = {
  version: number;
  docs: UnifiedSearchDoc[];
};

let cache: IndexPayload | null = null;

function isCompatibleSearchIndex(json: IndexPayload | null | undefined): json is IndexPayload {
  return Boolean(
    json &&
      Array.isArray(json.docs) &&
      json.docs.length > 0 &&
      Number(json.version) >= SEARCH_INDEX_SCHEMA_VERSION,
  );
}

/** للاختبارات أو الحقن المسبق دون شبكة. */
export function primeUnifiedSearchIndex(payload: IndexPayload): void {
  cache = payload;
}

export function clearUnifiedSearchIndexCache(): void {
  cache = null;
}

export async function loadUnifiedSearchIndex(): Promise<IndexPayload> {
  if (isCompatibleSearchIndex(cache)) return cache;
  cache = null;
  const empty: IndexPayload = { version: 0, docs: [] };
  const url = "/data/search/index.json";
  const fromWorker = await loadIndexViaWorker(url);
  if (isCompatibleSearchIndex(fromWorker)) {
    cache = fromWorker;
    return cache;
  }
  const { fetchStaticJsonCached, purgeStaticJsonCache } = await import("@/lib/static-json-cache");
  const json = await fetchStaticJsonCached<IndexPayload>(url, empty, { timeoutMs: 8_000 });
  if (!isCompatibleSearchIndex(json)) {
    // فهرس قديم في IndexedDB — امسحه حتى لا يُعاد تقديم نتائج بروابط مكسورة.
    await purgeStaticJsonCache(url).catch(() => undefined);
    throw new Error("search index unavailable or incompatible version");
  }
  cache = json;
  return cache;
}

const shardCache = new Map<string, IndexPayload>();

/**
 * تحميل شظية مجال واحد من /data/search/shards/<kind>.json
 * للبحث المضيّق — البحث الشامل يبقى على index.json.
 */
export async function loadUnifiedSearchShard(kind: string): Promise<IndexPayload> {
  const key = kind.trim();
  if (!key) return { version: 0, docs: [] };
  const hit = shardCache.get(key);
  if (isCompatibleSearchIndex(hit)) return hit!;
  const url = `/data/search/shards/${encodeURIComponent(key)}.json`;
  const fromWorker = await loadIndexViaWorker(url);
  if (isCompatibleSearchIndex(fromWorker)) {
    shardCache.set(key, fromWorker);
    return fromWorker;
  }
  const { fetchStaticJsonCached, purgeStaticJsonCache } = await import("@/lib/static-json-cache");
  const empty: IndexPayload = { version: 0, docs: [] };
  const json = await fetchStaticJsonCached<IndexPayload>(url, empty, { timeoutMs: 8_000 });
  if (!isCompatibleSearchIndex(json)) {
    await purgeStaticJsonCache(url).catch(() => undefined);
    throw new Error(`search shard unavailable: ${key}`);
  }
  shardCache.set(key, json);
  return json;
}

function loadIndexViaWorker(url: string): Promise<IndexPayload | null> {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: IndexPayload | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    try {
      const worker = new Worker(new URL("./search-index.worker.ts", import.meta.url), {
        type: "module",
      });
      const timer = window.setTimeout(() => {
        worker.terminate();
        finish(null);
      }, 8_000);
      worker.onmessage = (event: MessageEvent<{ ok?: boolean; json?: IndexPayload }>) => {
        window.clearTimeout(timer);
        worker.terminate();
        const payload = event.data?.json;
        if (event.data?.ok && payload && Array.isArray(payload.docs) && payload.docs.length > 0) {
          finish(payload);
          return;
        }
        finish(null);
      };
      worker.onerror = () => {
        window.clearTimeout(timer);
        worker.terminate();
        finish(null);
      };
      worker.postMessage({ url });
    } catch {
      finish(null);
    }
  });
}

const SYNC_SCAN_BUDGET = 2_500;

/**
 * مطابقة على الاستعلام الأصلي أولاً — المرادفات فقط إن لم يُصب شيء
 * (تفادي غرق «أشخاص القرآن» بنتائج سور بسبب توسيع «قرآن»).
 */
function bestTolerantMatch(
  titleAr: string,
  norm: string,
  originalQuery: string,
  variants: string[],
): TolerantMatch | null {
  const primary = scoreTolerantMatch(titleAr, originalQuery, norm);
  if (primary) return primary;
  let best: TolerantMatch | null = null;
  for (const v of variants) {
    if (v === originalQuery) continue;
    const m = scoreTolerantMatch(titleAr, v, norm);
    if (!m) continue;
    if (!best || compareTolerantMatches(m, best) < 0) best = m;
  }
  return best;
}

/** بحث محلي مجمّع حسب النوع — بلا شبكة، مع ترتيب التسامح. */
export function searchUnifiedIndex(
  docs: UnifiedSearchDoc[],
  query: string,
  limit = 40,
): Record<string, UnifiedSearchHit[]> {
  const q = normalizeArabic(query);
  const out: Record<string, UnifiedSearchHit[]> = {};
  if (!q) return out;

  // توسيع المرادفات للاستعلام المفرد فقط — العبارات متعددة الكلمات
  // تتضرر من مرادفات قصيرة (قرآن→سور يغرق النتائج بكل سورة).
  const tokenCount = query.trim().split(/\s+/).filter(Boolean).length;
  const variants = tokenCount <= 1 ? expandSearchTerms(query) : [query];
  if (!variants.includes(query)) variants.unshift(query);

  type Scored = UnifiedSearchHit & { _m: TolerantMatch };
  const scored: Scored[] = [];

  const scan = (from: number, to: number) => {
    for (let i = from; i < to; i++) {
      const d = docs[i]!;
      const m = bestTolerantMatch(d.titleAr, d.norm, query, variants);
      if (!m) continue;
      scored.push({
        id: d.id,
        kind: d.kind,
        titleAr: d.titleAr,
        href: d.href,
        meta: d.meta,
        match: m,
        _m: m,
      });
    }
  };

  if (docs.length <= SYNC_SCAN_BUDGET) {
    scan(0, docs.length);
  } else {
    // فهرس كبير: امسح على دفعات متزامنة قصيرة (واجهة الاختبار/العقدة);
    // في المتصفح يُفضّل استدعاء searchUnifiedIndexAsync.
    scan(0, docs.length);
  }

  scored.sort((a, b) => {
    const c = compareTolerantMatches(a._m, b._m);
    if (c !== 0) return c;
    const pk = kindPriority(a.kind) - kindPriority(b.kind);
    if (pk !== 0) return pk;
    return a.titleAr.localeCompare(b.titleAr, "ar");
  });

  // حدّ ضوضاء الاستعلام القصير
  const maxTotal = q.replace(/\s+/g, "").length <= 2 ? 12 : limit;
  let total = 0;
  for (const s of scored) {
    const bucket = (out[s.kind] ??= []);
    if (bucket.length >= 12) continue;
    bucket.push({
      id: s.id,
      kind: s.kind,
      titleAr: s.titleAr,
      href: s.href,
      meta: s.meta,
      match: s._m,
    });
    total += 1;
    if (total >= maxTotal) break;
  }
  return out;
}

/** بحث في الخلفية عند كبر الفهرس — يُلغي عبر AbortSignal. */
export async function searchUnifiedIndexAsync(
  docs: UnifiedSearchDoc[],
  query: string,
  limit = 40,
  signal?: AbortSignal,
): Promise<Record<string, UnifiedSearchHit[]>> {
  const q = normalizeArabic(query);
  if (!q) return {};
  if (docs.length <= SYNC_SCAN_BUDGET) {
    return searchUnifiedIndex(docs, query, limit);
  }

  const tokenCount = query.trim().split(/\s+/).filter(Boolean).length;
  const variants = tokenCount <= 1 ? expandSearchTerms(query) : [query];
  if (!variants.includes(query)) variants.unshift(query);

  type Scored = UnifiedSearchHit & { _m: TolerantMatch };
  const scored: Scored[] = [];
  const chunk = 400;
  for (let i = 0; i < docs.length; i += chunk) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const end = Math.min(docs.length, i + chunk);
    for (let j = i; j < end; j++) {
      const d = docs[j]!;
      const m = bestTolerantMatch(d.titleAr, d.norm, query, variants);
      if (!m) continue;
      scored.push({
        id: d.id,
        kind: d.kind,
        titleAr: d.titleAr,
        href: d.href,
        meta: d.meta,
        match: m,
        _m: m,
      });
    }
    await yieldToMain();
  }

  scored.sort((a, b) => {
    const c = compareTolerantMatches(a._m, b._m);
    if (c !== 0) return c;
    const pk = kindPriority(a.kind) - kindPriority(b.kind);
    if (pk !== 0) return pk;
    return a.titleAr.localeCompare(b.titleAr, "ar");
  });
  const out: Record<string, UnifiedSearchHit[]> = {};
  const maxTotal = q.replace(/\s+/g, "").length <= 2 ? 12 : limit;
  let total = 0;
  for (const s of scored) {
    const bucket = (out[s.kind] ??= []);
    if (bucket.length >= 12) continue;
    bucket.push({
      id: s.id,
      kind: s.kind,
      titleAr: s.titleAr,
      href: s.href,
      meta: s.meta,
      match: s._m,
    });
    total += 1;
    if (total >= maxTotal) break;
  }
  return out;
}
