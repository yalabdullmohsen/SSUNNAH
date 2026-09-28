/**
 * مستودع واحد لقراءة/كتابة بيانات المصحف الحي.
 * الواجهات تستورد من هنا — لا كتابة localStorage مباشرة من طبقات العرض.
 */
import { storageGetSync, storageRemoveSync, storageSetSync } from "@/lib/native-storage";
import {
  clampMushafPage,
  invalidateLastPageMemCache,
  LAST_PAGE_KEY,
  loadLastPageSync,
  MUSHAF_PAGE_MIN,
} from "@/lib/quran-last-page";
import {
  MUSHAF_AYAH_MARKS_KEY,
  MUSHAF_BOOKMARKS_KEY,
  MUSHAF_LAST_PAGE_KEY,
} from "./keys";
import { runMushafPersistenceMigration } from "./migration";
import { trackOps } from "@/lib/ops-telemetry";

export const MushafPersistenceRepository = {
  /** قراءة متزامنة مبكرة لأول إطار — من LS فقط */
  getLastPageSync(): number | null {
    return loadLastPageSync();
  },

  async getLastPage(): Promise<number | null> {
    const { loadLastPage } = await import("@/lib/quran-last-page");
    const page = await loadLastPage();
    trackOps("last_page.restored", {
      source: page == null ? "none" : "repository",
      page: page ?? 0,
    });
    return page;
  },

  async setLastPage(page: number): Promise<void> {
    const { saveLastPage } = await import("@/lib/quran-last-page");
    await saveLastPage(page);
  },

  getAyahMarksSync(): boolean {
    const raw = storageGetSync(MUSHAF_AYAH_MARKS_KEY);
    if (raw == null) return true;
    return raw === "1" || raw === "true";
  },

  setAyahMarks(on: boolean): void {
    storageSetSync(MUSHAF_AYAH_MARKS_KEY, on ? "1" : "0");
  },

  async getBookmarks() {
    const { getMyBookmarks } = await import("@/lib/quran-my-bookmarks");
    return getMyBookmarks();
  },

  async setBookmarks(list: unknown): Promise<void> {
    const { saveBookmarks } = await import("@/lib/quran-my-bookmarks");
    await saveBookmarks(list as Parameters<typeof saveBookmarks>[0]);
  },

  readRaw(key: string): string | null {
    return storageGetSync(key);
  },

  writeRaw(key: string, value: string): void {
    storageSetSync(key, value);
  },

  removeRaw(key: string): void {
    storageRemoveSync(key);
  },

  runMigrations() {
    return runMushafPersistenceMigration();
  },

  invalidateCaches(): void {
    invalidateLastPageMemCache();
  },

  clampPage(page: number): number {
    return clampMushafPage(page);
  },

  defaults: {
    lastPage: MUSHAF_PAGE_MIN,
    ayahMarks: true,
  },

  keys: {
    lastPage: MUSHAF_LAST_PAGE_KEY,
    bookmarks: MUSHAF_BOOKMARKS_KEY,
    ayahMarks: MUSHAF_AYAH_MARKS_KEY,
    legacyLastPageAlias: LAST_PAGE_KEY,
  },
} as const;
