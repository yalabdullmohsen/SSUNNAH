/**
 * مزامنة علامات المصحف — محلي أولاً، ثم حزمة عبر reading_resume عند الاتصال.
 * لا يحجب رندر المصحف.
 */
import { getMyBookmarks, saveBookmarks, type MyBookmark } from "@/lib/quran-my-bookmarks";
import { storageGetSync, storageSetSync } from "@/lib/native-storage";

const DIRTY_KEY = "myBookmarks:cloud-dirty";
const LAST_SYNC_KEY = "myBookmarks:cloud-synced-at";
const BUNDLE_TYPE = "mushaf_marks_v1";
const BUNDLE_ID = "bundle";

let syncTimer: ReturnType<typeof setTimeout> | null = null;

function markDirty(): void {
  try {
    storageSetSync(DIRTY_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function scheduleMushafBookmarksSync(delayMs = 800): void {
  markDirty();
  if (typeof window === "undefined") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    void flushMushafBookmarksSync();
  }, delayMs);
}

function mergeByUpdatedAt(local: MyBookmark[], remote: MyBookmark[]): MyBookmark[] {
  const map = new Map<number, MyBookmark>();
  for (const b of [...remote, ...local]) {
    const prev = map.get(b.id);
    if (!prev) {
      map.set(b.id, b);
      continue;
    }
    const prevT = Date.parse(prev.updatedAt || prev.createdAt || "") || 0;
    const nextT = Date.parse(b.updatedAt || b.createdAt || "") || 0;
    map.set(b.id, nextT >= prevT ? b : prev);
  }
  /* reading: احتفظ بنسخة واحدة أحدث */
  const all = [...map.values()];
  const reading = all
    .filter((b) => b.kind === "reading" && !b.archived)
    .sort(
      (a, b) =>
        (Date.parse(b.updatedAt || b.createdAt || "") || 0) -
        (Date.parse(a.updatedAt || a.createdAt || "") || 0),
    );
  const keepReadingId = reading[0]?.id;
  return all
    .filter((b) => b.kind !== "reading" || b.id === keepReadingId || b.archived)
    .sort((a, b) => b.id - a.id);
}

export async function flushMushafBookmarksSync(): Promise<boolean> {
  try {
    const { isSupabaseConfigured } = await import("@/lib/supabase-config");
    if (!isSupabaseConfigured()) return false;
    const { getSupabaseClient } = await import("@/lib/supabase-bootstrap");
    const supabase = getSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) return false;

    const local = getMyBookmarks();
    const { data: remoteRow } = await supabase
      .from("reading_resume")
      .select("position,last_opened_at")
      .eq("user_id", user.id)
      .eq("content_type", BUNDLE_TYPE)
      .eq("content_id", BUNDLE_ID)
      .maybeSingle();

    const remoteBookmarks = Array.isArray(
      (remoteRow?.position as { bookmarks?: unknown } | null)?.bookmarks,
    )
      ? ((remoteRow!.position as { bookmarks: MyBookmark[] }).bookmarks ?? [])
      : [];

    const merged = mergeByUpdatedAt(local, remoteBookmarks);
    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      await saveBookmarks(merged);
    }

    const { saveResumePosition } = await import("@/lib/user-profile-service");
    await saveResumePosition(user.id, {
      content_type: BUNDLE_TYPE,
      content_id: BUNDLE_ID,
      content_title: "علامات المصحف",
      content_url: "/mushaf/bookmarks",
      thumbnail_icon: "Bookmark",
      position: {
        section: "bookmarks",
        item_index: merged.length,
        bookmarks: merged,
      } as { section: string; item_index: number; bookmarks: MyBookmark[] },
    });

    try {
      storageSetSync(DIRTY_KEY, "0");
      storageSetSync(LAST_SYNC_KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    return true;
  } catch {
    return false;
  }
}

export function isMushafBookmarksSyncDirty(): boolean {
  try {
    return storageGetSync(DIRTY_KEY) === "1";
  } catch {
    return false;
  }
}

/** يُستدعى من bootstrap عند عودة الشبكة / تسجيل الدخول */
export function bootMushafBookmarkCloudSync(): void {
  if (typeof window === "undefined") return;
  const run = () => {
    if (isMushafBookmarksSyncDirty() || getMyBookmarks().length > 0) {
      void flushMushafBookmarksSync();
    }
  };
  window.addEventListener("online", run);
  if (typeof document !== "undefined" && document.readyState === "complete") {
    setTimeout(run, 1200);
  } else {
    window.addEventListener("load", () => setTimeout(run, 1200), { once: true });
  }
}
