/**
 * تحليلات علامات المصحف — محلية فورية + غير حاجزة للرندر.
 */
import { storageGetSync, storageSetSync } from "@/lib/native-storage";
import type { MyBookmark } from "@/lib/quran-my-bookmarks";
import { getMyBookmarks } from "@/lib/quran-my-bookmarks";
import { getReadingBookmark } from "@/lib/quran-my-bookmarks-ops";
import { loadLastPageSync } from "@/lib/quran-last-page";

const ANALYTICS_KEY = "myBookmarks:analytics-v1";

export type MushafBookmarkAnalytics = {
  lastReadingPage: number | null;
  totalBookmarks: number;
  readingCount: number;
  hifzCount: number;
  reviewCount: number;
  personalCount: number;
  memorizationProgressPct: number | null;
  revisionActivity: number;
  lastSavedAt: string | null;
};

type Store = {
  revisionEvents: number;
  lastSavedAt: string | null;
};

function readStore(): Store {
  try {
    const raw = storageGetSync(ANALYTICS_KEY);
    if (!raw) return { revisionEvents: 0, lastSavedAt: null };
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      revisionEvents: typeof parsed.revisionEvents === "number" ? parsed.revisionEvents : 0,
      lastSavedAt: typeof parsed.lastSavedAt === "string" ? parsed.lastSavedAt : null,
    };
  } catch {
    return { revisionEvents: 0, lastSavedAt: null };
  }
}

function writeStore(s: Store): void {
  try {
    storageSetSync(ANALYTICS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function trackBookmarkSaved(b: MyBookmark): void {
  const s = readStore();
  s.lastSavedAt = new Date().toISOString();
  if (b.kind === "review") s.revisionEvents += 1;
  writeStore(s);
}

export function getMushafBookmarkAnalytics(): MushafBookmarkAnalytics {
  const list = getMyBookmarks().filter((b) => !b.archived);
  const reading = getReadingBookmark();
  const hifz = list.filter((b) => b.kind === "hifz");
  let memorizationProgressPct: number | null = null;
  if (hifz.length > 0) {
    const active = hifz[0]!;
    const from = active.rangeFromPage ?? active.page;
    const to = active.rangeToPage ?? active.page;
    const lo = Math.min(from, to);
    const hi = Math.max(from, to);
    const span = Math.max(1, hi - lo);
    memorizationProgressPct = Math.round(((active.page - lo) / span) * 100);
  }
  const s = readStore();
  return {
    lastReadingPage: reading?.page ?? loadLastPageSync(),
    totalBookmarks: list.length,
    readingCount: list.filter((b) => b.kind === "reading").length,
    hifzCount: hifz.length,
    reviewCount: list.filter((b) => b.kind === "review").length,
    personalCount: list.filter((b) => b.kind === "custom").length,
    memorizationProgressPct,
    revisionActivity: s.revisionEvents,
    lastSavedAt: s.lastSavedAt,
  };
}
