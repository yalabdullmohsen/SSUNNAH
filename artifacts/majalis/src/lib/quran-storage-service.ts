/**
 * Façade توافقية لـ RN AsyncStorage `storageService`.
 * السلطة الرسمية لـ `/mushaf`: `@/lib/mushaf-persistence` (MushafPersistenceRepository).
 * Web: مفاتيح حية `lastPage` + `myBookmarks` عبر native-storage — ليست متجرًا ثانيًا.
 */

import {
  LAST_PAGE_KEY,
  clampMushafPage,
  loadLastPage,
  loadLastPageSync,
  saveLastPage as persistLastPage,
} from "@/lib/quran-last-page";
import type { MyBookmark } from "@/lib/quran-my-bookmarks";

export type { MyBookmark };

export const storageService = {
  // ── حفظ واستعادة آخر صفحة ──────────────────────────────────────────────
  saveLastPage: async (page: number): Promise<void> => {
    await persistLastPage(page);
  },

  /** مثل AsyncStorage.getItem — يعيد النص أو null. */
  getLastPage: async (): Promise<string | null> => {
    try {
      const raw = localStorage.getItem(LAST_PAGE_KEY);
      if (raw == null) return null;
      const n = Number.parseInt(raw, 10);
      if (!Number.isFinite(n)) return null;
      return clampMushafPage(n).toString();
    } catch {
      return null;
    }
  },

  getLastPageNumber: async (): Promise<number | null> => loadLastPage(),
  getLastPageNumberSync: (): number | null => loadLastPageSync(),

  // ── إدارة الفواصل المتعددة (كسول — خارج مسار الإقلاع) ───────────────────
  saveBookmarks: async (bookmarks: MyBookmark[]): Promise<void> => {
    const { saveBookmarks } = await import("@/lib/quran-my-bookmarks");
    await saveBookmarks(bookmarks);
  },

  getBookmarks: async (): Promise<MyBookmark[]> => {
    try {
      const { getMyBookmarks } = await import("@/lib/quran-my-bookmarks");
      return getMyBookmarks();
    } catch {
      return [];
    }
  },
} as const;

export default storageService;
