/**
 * وحدات علامات المصحف — قراءة واحدة · نطاق حفظ · إحصاء.
 * Run: node --import tsx src/lib/__tests__/mushaf-bookmark-ops-unit.test.ts
 */
import assert from "node:assert/strict";

const mem = new Map<string, string>();
const localStorageMock = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => {
    mem.set(k, String(v));
  },
  removeItem: (k: string) => {
    mem.delete(k);
  },
  clear: () => mem.clear(),
  key: () => null,
  get length() {
    return mem.size;
  },
};
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  configurable: true,
});
Object.defineProperty(globalThis, "window", {
  value: { localStorage: localStorageMock },
  configurable: true,
});

const {
  getMyBookmarks,
  resetMyBookmarksCacheForTests,
  saveBookmarks,
} = await import("@/lib/quran-my-bookmarks");
const {
  addTypedBookmark,
  getBookmarkStats,
  getHifzProgress,
  getReadingBookmark,
  setReadingBookmark,
} = await import("@/lib/quran-my-bookmarks-ops");

resetMyBookmarksCacheForTests();
mem.clear();
await saveBookmarks([]);

const r1 = await setReadingBookmark(10, "2:1");
assert.equal(r1.ok, true);
assert.equal(getReadingBookmark()?.page, 10);

const r2 = await setReadingBookmark(20, "2:50");
assert.equal(r2.ok, true);
assert.equal(getReadingBookmark()?.page, 20);
assert.equal(getMyBookmarks().filter((b) => b.kind === "reading" && !b.archived).length, 1);

const h = await addTypedBookmark({
  page: 50,
  ayahKey: "3:1",
  kind: "hifz",
  rangeFromPage: 40,
  rangeToPage: 60,
  label: "موضع الحفظ الحالي",
});
assert.equal(h.ok, true);
if (h.ok) {
  const prog = getHifzProgress(h.bookmark);
  assert.ok(prog);
  assert.equal(prog!.from, 40);
  assert.equal(prog!.to, 60);
  assert.equal(prog!.current, 50);
}

const rev = await addTypedBookmark({
  page: 540,
  ayahKey: "67:1",
  kind: "review",
  label: "مراجعة الجزء ٢٧",
});
assert.equal(rev.ok, true);

const personal = await addTypedBookmark({
  page: 100,
  ayahKey: "4:1",
  kind: "custom",
  customName: "صفحة مميزة",
});
assert.equal(personal.ok, true);

const stats = getBookmarkStats();
assert.equal(stats.reading, 1);
assert.ok(stats.hifz >= 1);
assert.ok(stats.review >= 1);
assert.ok(stats.custom >= 1);
assert.ok(stats.total >= 4);

console.log("mushaf-bookmark-ops-unit.test.ts: ok");
