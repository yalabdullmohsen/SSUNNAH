/**
 * عمليات علامات المصحف V2 — خارج مسار الإقلاع (يُحمَّل مع القارئ/المدير فقط).
 */
import { storageGetSync, storageSetSync } from "@/lib/native-storage";
import type {
  MushafBookmarkKind,
  MushafKhatmahType,
  MushafWirdSlot,
} from "@/lib/quran-bookmark-kinds";
import {
  getBookmarkKindMeta,
  getKhatmahTypeLabel,
  kindSupportsPageRange,
} from "@/lib/quran-bookmark-kinds";
import {
  MY_BOOKMARKS_MAX,
  getMyBookmarks,
  saveBookmarks,
  type MyBookmark,
} from "@/lib/quran-my-bookmarks";
import { currentPageFirstAyah } from "@/lib/quran-ayah-page";

const LAST_USED_KEY = "myBookmarks:last-used-id";
export const MUSHAF_TOTAL_PAGES = 604;

function clampPage(n: number): number {
  return Math.min(MUSHAF_TOTAL_PAGES, Math.max(1, Math.floor(n) || 1));
}

function defaultLabel(
  kind: MushafBookmarkKind,
  ayahKey: string,
  customName?: string,
  khatmaType?: MushafKhatmahType,
): string {
  if (kind === "reading") return "آخر موضع قراءة";
  if (kind === "khatmah") return getKhatmahTypeLabel(khatmaType);
  if (kind === "custom" && customName) return customName;
  return `${getBookmarkKindMeta(kind).label} · ${ayahKey}`;
}

export type AddTypedBookmarkInput = {
  ayahKey: string;
  page: number;
  kind: MushafBookmarkKind;
  label?: string;
  note?: string;
  customColor?: string;
  customName?: string;
  wirdSlot?: MushafWirdSlot;
  khatmaId?: string;
  khatmaType?: MushafKhatmahType;
  favorite?: boolean;
  rangeFromPage?: number;
  rangeToPage?: number;
};

export async function addTypedBookmark(
  input: AddTypedBookmarkInput,
): Promise<{ ok: true; bookmark: MyBookmark } | { ok: false; error: string }> {
  try {
    const list = getMyBookmarks();
    if (list.length >= MY_BOOKMARKS_MAX && input.kind !== "reading") {
      return { ok: false, error: `الحد الأقصى ${MY_BOOKMARKS_MAX} علامة` };
    }
    if (!/^\d{1,3}:\d{1,3}$/.test(input.ayahKey)) {
      return { ok: false, error: "مرجع آية غير صالح" };
    }
    const page = clampPage(input.page);
    const now = new Date();
    const supportsRange = kindSupportsPageRange(input.kind);
    let rangeFrom =
      input.rangeFromPage != null ? clampPage(input.rangeFromPage) : undefined;
    let rangeTo =
      input.rangeToPage != null ? clampPage(input.rangeToPage) : undefined;
    if (input.kind === "khatmah") {
      rangeFrom = rangeFrom ?? 1;
      rangeTo = rangeTo ?? MUSHAF_TOTAL_PAGES;
    }
    const bookmark: MyBookmark = {
      id: Date.now(),
      ayahKey: input.ayahKey,
      page,
      kind: input.kind,
      label: (
        input.label?.trim() ||
        defaultLabel(input.kind, input.ayahKey, input.customName, input.khatmaType)
      ).slice(0, 96),
      date: now.toLocaleDateString("ar"),
      note: input.note?.trim().slice(0, 240) || undefined,
      customColor: input.customColor,
      customName: input.customName?.trim().slice(0, 48) || undefined,
      wirdSlot: input.kind === "wird" ? input.wirdSlot ?? "any" : undefined,
      khatmaId: input.khatmaId?.trim().slice(0, 64) || undefined,
      khatmaType: input.kind === "khatmah" ? input.khatmaType ?? "general" : undefined,
      rangeFromPage: supportsRange ? rangeFrom : undefined,
      rangeToPage: supportsRange ? rangeTo : undefined,
      favorite: input.favorite === true,
      archived: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    let next: MyBookmark[];
    if (input.kind === "reading") {
      next = [bookmark, ...list.filter((b) => b.kind !== "reading")];
    } else {
      next = [
        bookmark,
        ...list.filter(
          (b) => !(b.ayahKey === bookmark.ayahKey && b.kind === bookmark.kind && !b.archived),
        ),
      ];
    }
    await saveBookmarks(next.slice(0, MY_BOOKMARKS_MAX));
    setLastUsedBookmarkId(bookmark.id);
    void import("@/lib/mushaf-bookmark-analytics")
      .then((m) => m.trackBookmarkSaved(bookmark))
      .catch(() => undefined);
    void import("@/lib/mushaf-bookmark-cloud-sync")
      .then((m) => m.scheduleMushafBookmarksSync())
      .catch(() => undefined);
    if (input.kind === "reading") {
      try {
        const { savePagePosition } = await import("@/lib/quran-api");
        savePagePosition(page, input.ayahKey);
      } catch {
        /* ignore */
      }
    }
    return { ok: true, bookmark };
  } catch (e) {
    console.error("خطأ في إضافة العلامة", e);
    return { ok: false, error: "تعذّر الحفظ" };
  }
}

/** موضع القراءة الوحيد النشط */
export function getReadingBookmark(): MyBookmark | null {
  return getMyBookmarks().find((b) => b.kind === "reading" && !b.archived) ?? null;
}

export async function setReadingBookmark(
  page: number,
  ayahKey?: string,
): Promise<{ ok: true; bookmark: MyBookmark } | { ok: false; error: string }> {
  const p = clampPage(page);
  const key = ayahKey && /^\d{1,3}:\d{1,3}$/.test(ayahKey) ? ayahKey : currentPageFirstAyah(p);
  return addTypedBookmark({
    page: p,
    ayahKey: key,
    kind: "reading",
    label: "آخر موضع قراءة",
  });
}

export type PageRangeProgress = {
  current: number;
  from: number;
  to: number;
  pct: number;
  pagesDone: number;
  pagesTotal: number;
};

function rangeProgress(
  b: MyBookmark,
  defaultFrom: number,
  defaultTo: number,
): PageRangeProgress {
  const from = b.rangeFromPage ?? defaultFrom;
  const to = b.rangeToPage ?? defaultTo;
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  const pagesTotal = Math.max(1, hi - lo + 1);
  const current = Math.min(hi, Math.max(lo, b.page));
  const pagesDone = Math.max(0, current - lo + 1);
  const pct = Math.round((pagesDone / pagesTotal) * 100);
  return { current, from: lo, to: hi, pct, pagesDone, pagesTotal };
}

/** تقدم الحفظ: بداية · الحالي · الهدف */
export function getHifzProgress(b: MyBookmark): PageRangeProgress | null {
  if (b.kind !== "hifz") return null;
  return rangeProgress(b, b.page, b.page);
}

/** نطاق المراجعة: بداية → نهاية */
export function getReviewProgress(b: MyBookmark): PageRangeProgress | null {
  if (b.kind !== "review") return null;
  if (b.rangeFromPage == null && b.rangeToPage == null) {
    return rangeProgress(b, b.page, b.page);
  }
  return rangeProgress(b, b.rangeFromPage ?? b.page, b.rangeToPage ?? b.page);
}

/** تقدم الختمة على 604 صفحة */
export function getKhatmahProgress(b: MyBookmark): PageRangeProgress | null {
  if (b.kind !== "khatmah") return null;
  return rangeProgress(b, 1, MUSHAF_TOTAL_PAGES);
}

/** حدّث الموضع الحالي لنطاق الحفظ */
export async function updateHifzCurrentPage(
  id: number,
  page: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const p = clampPage(page);
  const prev = getMyBookmarks();
  const target = prev.find((b) => b.id === id && b.kind === "hifz" && !b.archived);
  if (!target) return { ok: false, error: "علامة الحفظ غير موجودة" };
  const ayahKey = currentPageFirstAyah(p);
  await saveBookmarks(
    prev.map((b) =>
      b.id === id
        ? { ...b, page: p, ayahKey, updatedAt: new Date().toISOString() }
        : b,
    ),
  );
  void import("@/lib/mushaf-bookmark-cloud-sync")
    .then((m) => m.scheduleMushafBookmarksSync())
    .catch(() => undefined);
  return { ok: true };
}

/** حدّث موضع الختمة الحالي */
export async function updateKhatmahCurrentPage(
  id: number,
  page: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const p = clampPage(page);
  const prev = getMyBookmarks();
  const target = prev.find((b) => b.id === id && b.kind === "khatmah" && !b.archived);
  if (!target) return { ok: false, error: "الختمة غير موجودة" };
  const ayahKey = currentPageFirstAyah(p);
  await saveBookmarks(
    prev.map((b) =>
      b.id === id
        ? { ...b, page: p, ayahKey, updatedAt: new Date().toISOString() }
        : b,
    ),
  );
  void import("@/lib/mushaf-bookmark-cloud-sync")
    .then((m) => m.scheduleMushafBookmarksSync())
    .catch(() => undefined);
  return { ok: true };
}

export async function startKhatmah(
  page: number,
  khatmaType: MushafKhatmahType = "general",
  note?: string,
): Promise<{ ok: true; bookmark: MyBookmark } | { ok: false; error: string }> {
  const p = clampPage(page);
  return addTypedBookmark({
    page: p,
    ayahKey: currentPageFirstAyah(p),
    kind: "khatmah",
    khatmaType,
    label: getKhatmahTypeLabel(khatmaType),
    note,
    rangeFromPage: 1,
    rangeToPage: MUSHAF_TOTAL_PAGES,
  });
}

function bookmarkSearchHaystack(b: MyBookmark): string {
  const meta = getBookmarkKindMeta(b.kind);
  const aliases = meta.searchAliases.join(" ");
  const khatma = b.khatmaType ? getKhatmahTypeLabel(b.khatmaType) : "";
  return `${b.label} ${b.note ?? ""} ${b.customName ?? ""} ${b.ayahKey} ${meta.label} ${aliases} ${khatma}`.toLowerCase();
}

export type BookmarkListFilter = {
  kind?: MushafBookmarkKind | "all";
  surah?: number | null;
  query?: string;
  includeArchived?: boolean;
  favoritesOnly?: boolean;
};

export function listFilteredBookmarks(filter: BookmarkListFilter = {}): MyBookmark[] {
  const q = (filter.query || "").trim().toLowerCase();
  return getMyBookmarks().filter((b) => {
    if (!filter.includeArchived && b.archived) return false;
    if (filter.favoritesOnly && !b.favorite) return false;
    if (filter.kind && filter.kind !== "all" && b.kind !== filter.kind) return false;
    if (filter.surah != null && filter.surah > 0) {
      const s = Number(b.ayahKey.split(":")[0]);
      if (s !== filter.surah) return false;
    }
    if (!q) return true;
    return bookmarkSearchHaystack(b).includes(q);
  });
}

/** نتائج بحث علامات المصحف للبحث الموحّد */
export function searchMushafBookmarksForQuery(
  query: string,
  limit = 8,
): Array<{ id: string; title: string; href: string; summary: string }> {
  const q = query.trim();
  if (!q) return [];
  return listFilteredBookmarks({ query: q })
    .slice(0, limit)
    .map((b) => {
      const meta = getBookmarkKindMeta(b.kind);
      let summary = `${meta.label} · ص ${b.page}`;
      if (b.kind === "hifz") {
        const p = getHifzProgress(b);
        if (p) summary = `${meta.label} · ص ${p.current} (هدف ${p.to}) · ${p.pct}٪`;
      } else if (b.kind === "review") {
        const p = getReviewProgress(b);
        if (p) summary = `${meta.label} · ص ${p.from} → ${p.to}`;
      } else if (b.kind === "khatmah") {
        const p = getKhatmahProgress(b);
        if (p) summary = `${getKhatmahTypeLabel(b.khatmaType)} · ${p.pagesDone}/${p.pagesTotal}`;
      }
      return {
        id: `mushaf-bm:${b.id}`,
        title: b.label,
        href: bookmarkHref(b),
        summary,
      };
    });
}

export function getBookmarkStats(): Record<MushafBookmarkKind, number> & {
  total: number;
  archived: number;
  favorites: number;
} {
  const stats = {
    reading: 0,
    wird: 0,
    hifz: 0,
    review: 0,
    khatmah: 0,
    tadabbur: 0,
    lesson: 0,
    custom: 0,
    total: 0,
    archived: 0,
    favorites: 0,
  };
  for (const b of getMyBookmarks()) {
    if (b.archived) {
      stats.archived += 1;
      continue;
    }
    stats[b.kind] += 1;
    stats.total += 1;
    if (b.favorite) stats.favorites += 1;
  }
  return stats;
}

export async function archiveBookmark(id: number, archived = true): Promise<void> {
  const prev = getMyBookmarks();
  await saveBookmarks(
    prev.map((b) =>
      b.id === id ? { ...b, archived, updatedAt: new Date().toISOString() } : b,
    ),
  );
}

export async function toggleBookmarkFavorite(id: number): Promise<boolean> {
  const prev = getMyBookmarks();
  let nextFav = false;
  const next = prev.map((b) => {
    if (b.id !== id) return b;
    nextFav = !b.favorite;
    return { ...b, favorite: nextFav, updatedAt: new Date().toISOString() };
  });
  await saveBookmarks(next);
  return nextFav;
}

export function setLastUsedBookmarkId(id: number): void {
  try {
    storageSetSync(LAST_USED_KEY, String(id));
  } catch {
    /* ignore */
  }
}

export function getLastUsedBookmark(): MyBookmark | null {
  try {
    const raw = storageGetSync(LAST_USED_KEY);
    const id = raw ? Number(raw) : NaN;
    if (!Number.isFinite(id)) return null;
    return getMyBookmarks().find((b) => b.id === id && !b.archived) ?? null;
  } catch {
    return null;
  }
}

export function exportBookmarksJson(): string {
  return JSON.stringify(
    {
      version: 2,
      exportedAt: new Date().toISOString(),
      bookmarks: getMyBookmarks(),
    },
    null,
    2,
  );
}

export async function importBookmarksJson(
  raw: string,
): Promise<{ ok: true; imported: number } | { ok: false; error: string }> {
  try {
    const parsed = JSON.parse(raw) as { bookmarks?: unknown };
    if (!Array.isArray(parsed.bookmarks)) {
      return { ok: false, error: "ملف غير صالح" };
    }
    const byId = new Map(getMyBookmarks().map((b) => [b.id, b]));
    let imported = 0;
    for (const item of parsed.bookmarks) {
      if (!item || typeof item !== "object") continue;
      const b = item as MyBookmark;
      if (typeof b.id !== "number") continue;
      byId.set(b.id, b);
      imported += 1;
    }
    if (imported === 0) return { ok: false, error: "لا علامات في الملف" };
    const merged = [...byId.values()].sort((a, b) => b.id - a.id).slice(0, MY_BOOKMARKS_MAX);
    await saveBookmarks(merged);
    return { ok: true, imported };
  } catch {
    return { ok: false, error: "تعذّر الاستيراد" };
  }
}

export function bookmarkHref(b: MyBookmark): string {
  const [surah, ayah] = b.ayahKey.split(":");
  const q = new URLSearchParams({
    page: String(b.page),
    surah: String(surah || ""),
    ayah: String(ayah || ""),
    highlight: "1",
    source: "bookmarks",
  });
  return `/mushaf?${q.toString()}`;
}
