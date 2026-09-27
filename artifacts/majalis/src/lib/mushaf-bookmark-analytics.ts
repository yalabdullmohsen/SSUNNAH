/**
 * تحليلات علامات المصحف — محلية فورية + غير حاجزة للرندر.
 */
import { storageGetSync, storageSetSync } from "@/lib/native-storage";
import type { MyBookmark } from "@/lib/quran-my-bookmarks";
import { getMyBookmarks } from "@/lib/quran-my-bookmarks";
import {
  getHifzProgress,
  getKhatmahProgress,
  getReadingBookmark,
  MUSHAF_TOTAL_PAGES,
} from "@/lib/quran-my-bookmarks-ops";
import { loadLastPageSync } from "@/lib/quran-last-page";

const ANALYTICS_KEY = "myBookmarks:analytics-v1";

export type MushafBookmarkAnalytics = {
  lastReadingPage: number | null;
  currentPage: number | null;
  memorizationPage: number | null;
  revisionPage: number | null;
  khatmaProgressPct: number | null;
  khatmaPagesDone: number | null;
  totalBookmarks: number;
  readingCount: number;
  hifzCount: number;
  reviewCount: number;
  khatmahCount: number;
  personalCount: number;
  memorizationProgressPct: number | null;
  revisionActivity: number;
  readingStreakDays: number;
  lastSavedAt: string | null;
};

type Store = {
  revisionEvents: number;
  lastSavedAt: string | null;
  /** أيام قراءة YYYY-MM-DD */
  readingDays: string[];
};

function dayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function readStore(): Store {
  try {
    const raw = storageGetSync(ANALYTICS_KEY);
    if (!raw) return { revisionEvents: 0, lastSavedAt: null, readingDays: [] };
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      revisionEvents: typeof parsed.revisionEvents === "number" ? parsed.revisionEvents : 0,
      lastSavedAt: typeof parsed.lastSavedAt === "string" ? parsed.lastSavedAt : null,
      readingDays: Array.isArray(parsed.readingDays)
        ? parsed.readingDays.filter((x): x is string => typeof x === "string").slice(-120)
        : [],
    };
  } catch {
    return { revisionEvents: 0, lastSavedAt: null, readingDays: [] };
  }
}

function writeStore(s: Store): void {
  try {
    storageSetSync(ANALYTICS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function computeStreak(days: string[]): number {
  if (days.length === 0) return 0;
  const set = new Set(days);
  let streak = 0;
  const cursor = new Date();
  /* اسمح ببدء العد من اليوم أو الأمس */
  if (!set.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(dayKey(cursor))) return 0;
  }
  while (set.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function trackBookmarkSaved(b: MyBookmark): void {
  const s = readStore();
  s.lastSavedAt = new Date().toISOString();
  if (b.kind === "review") s.revisionEvents += 1;
  if (b.kind === "reading" || b.kind === "khatmah" || b.kind === "hifz") {
    const today = dayKey();
    if (!s.readingDays.includes(today)) s.readingDays = [...s.readingDays, today].slice(-120);
  }
  writeStore(s);
}

export function getMushafBookmarkAnalytics(): MushafBookmarkAnalytics {
  const list = getMyBookmarks().filter((b) => !b.archived);
  const reading = getReadingBookmark();
  const hifz = list.filter((b) => b.kind === "hifz");
  const review = list.filter((b) => b.kind === "review");
  const khatmah = list.filter((b) => b.kind === "khatmah");

  let memorizationProgressPct: number | null = null;
  let memorizationPage: number | null = null;
  if (hifz.length > 0) {
    const active = hifz[0]!;
    memorizationPage = active.page;
    const prog = getHifzProgress(active);
    memorizationProgressPct = prog?.pct ?? null;
  }

  let revisionPage: number | null = null;
  if (review.length > 0) {
    revisionPage = review[0]!.page;
  }

  let khatmaProgressPct: number | null = null;
  let khatmaPagesDone: number | null = null;
  if (khatmah.length > 0) {
    const active = khatmah[0]!;
    const prog = getKhatmahProgress(active);
    if (prog) {
      khatmaProgressPct = prog.pct;
      khatmaPagesDone = prog.pagesDone;
    }
  }

  const s = readStore();
  const currentPage = reading?.page ?? loadLastPageSync();

  return {
    lastReadingPage: reading?.page ?? loadLastPageSync(),
    currentPage,
    memorizationPage,
    revisionPage,
    khatmaProgressPct,
    khatmaPagesDone,
    totalBookmarks: list.length,
    readingCount: list.filter((b) => b.kind === "reading").length,
    hifzCount: hifz.length,
    reviewCount: review.length,
    khatmahCount: khatmah.length,
    personalCount: list.filter((b) => b.kind === "custom").length,
    memorizationProgressPct,
    revisionActivity: s.revisionEvents,
    readingStreakDays: computeStreak(s.readingDays),
    lastSavedAt: s.lastSavedAt,
  };
}

export { MUSHAF_TOTAL_PAGES };

/** للاختبارات */
export function __resetBookmarkAnalyticsForTests(): void {
  writeStore({ revisionEvents: 0, lastSavedAt: null, readingDays: [] });
}
