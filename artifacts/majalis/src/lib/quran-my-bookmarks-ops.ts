/**
 * عمليات فواصل المصحف المتقدمة — خارج مسار الإقلاع (يُحمَّل مع القارئ/المدير فقط).
 */
import { storageGetSync, storageSetSync } from "@/lib/native-storage";
import type { MushafBookmarkKind, MushafWirdSlot } from "@/lib/quran-bookmark-kinds";
import { getBookmarkKindMeta } from "@/lib/quran-bookmark-kinds";
import {
  MY_BOOKMARKS_MAX,
  getMyBookmarks,
  saveBookmarks,
  type MyBookmark,
} from "@/lib/quran-my-bookmarks";
import { currentPageFirstAyah } from "@/lib/quran-ayah-page";

const LAST_USED_KEY = "myBookmarks:last-used-id";

function defaultLabel(kind: MushafBookmarkKind, ayahKey: string, customName?: string): string {
  if (kind === "reading") return "آخر موضع قراءة";
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
      return { ok: false, error: `الحد الأقصى ${MY_BOOKMARKS_MAX} فاصل` };
    }
    if (!/^\d{1,3}:\d{1,3}$/.test(input.ayahKey)) {
      return { ok: false, error: "مرجع آية غير صالح" };
    }
    const page = Math.min(604, Math.max(1, Math.floor(input.page) || 1));
    const now = new Date();
    const rangeFrom =
      input.rangeFromPage != null
        ? Math.min(604, Math.max(1, Math.floor(input.rangeFromPage)))
        : undefined;
    const rangeTo =
      input.rangeToPage != null
        ? Math.min(604, Math.max(1, Math.floor(input.rangeToPage)))
        : undefined;
    const bookmark: MyBookmark = {
      id: Date.now(),
      ayahKey: input.ayahKey,
      page,
      kind: input.kind,
      label: (input.label?.trim() || defaultLabel(input.kind, input.ayahKey, input.customName)).slice(
        0,
        96,
      ),
      date: now.toLocaleDateString("ar"),
      note: input.note?.trim().slice(0, 240) || undefined,
      customColor: input.customColor,
      customName: input.customName?.trim().slice(0, 48) || undefined,
      wirdSlot: input.kind === "wird" ? input.wirdSlot ?? "any" : undefined,
      khatmaId: input.khatmaId?.trim().slice(0, 64) || undefined,
      rangeFromPage: input.kind === "hifz" ? rangeFrom : undefined,
      rangeToPage: input.kind === "hifz" ? rangeTo : undefined,
      favorite: input.favorite === true,
      archived: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    let next: MyBookmark[];
    if (input.kind === "reading") {
      /* موضع قراءة واحد نشط — يستبدل السابق */
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
    console.error("خطأ في إضافة الفاصل", e);
    return { ok: false, error: "تعذّر الحفظ" };
  }
}

/** موضع القراءة الوحيد النشط */
export function getReadingBookmark(): MyBookmark | null {
  return getMyBookmarks().find((b) => b.kind === "reading" && !b.archived) ?? null;
}

export async function setReadingBookmark(page: number, ayahKey?: string): Promise<
  { ok: true; bookmark: MyBookmark } | { ok: false; error: string }
> {
  const p = Math.min(604, Math.max(1, Math.floor(page) || 1));
  const key = ayahKey && /^\d{1,3}:\d{1,3}$/.test(ayahKey) ? ayahKey : currentPageFirstAyah(p);
  return addTypedBookmark({
    page: p,
    ayahKey: key,
    kind: "reading",
    label: "آخر موضع قراءة",
  });
}

export function getHifzProgress(b: MyBookmark): { current: number; from: number; to: number; pct: number } | null {
  if (b.kind !== "hifz") return null;
  const from = b.rangeFromPage ?? b.page;
  const to = b.rangeToPage ?? b.page;
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  const span = Math.max(1, hi - lo);
  const current = Math.min(hi, Math.max(lo, b.page));
  const pct = Math.round(((current - lo) / span) * 100);
  return { current, from: lo, to: hi, pct };
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
    const hay = `${b.label} ${b.note ?? ""} ${b.customName ?? ""} ${b.ayahKey}`.toLowerCase();
    return hay.includes(q);
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
      version: 1,
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
    if (imported === 0) return { ok: false, error: "لا فواصل في الملف" };
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
