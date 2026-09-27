/**
 * وحدات علامات المصحف V2 — قراءة · حفظ · مراجعة · ختمة · بحث.
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
  getKhatmahProgress,
  getReadingBookmark,
  getReviewProgress,
  searchMushafBookmarksForQuery,
  setReadingBookmark,
  startKhatmah,
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
  page: 128,
  ayahKey: "3:1",
  kind: "hifz",
  rangeFromPage: 128,
  rangeToPage: 140,
  label: "موضع الحفظ الحالي",
  note: "هنا بداية الحفظ",
});
assert.equal(h.ok, true);
if (h.ok) {
  const prog = getHifzProgress(h.bookmark);
  assert.ok(prog);
  assert.equal(prog!.from, 128);
  assert.equal(prog!.to, 140);
  assert.equal(prog!.current, 128);
}

const rev = await addTypedBookmark({
  page: 480,
  ayahKey: "67:1",
  kind: "review",
  rangeFromPage: 480,
  rangeToPage: 510,
  label: "مراجعة الجزء ٢٧",
  note: "مراجعة الأسبوع القادم",
});
assert.equal(rev.ok, true);
if (rev.ok) {
  const rp = getReviewProgress(rev.bookmark);
  assert.ok(rp);
  assert.equal(rp!.from, 480);
  assert.equal(rp!.to, 510);
}

const personal = await addTypedBookmark({
  page: 100,
  ayahKey: "4:1",
  kind: "custom",
  customName: "صفحة مميزة",
});
assert.equal(personal.ok, true);

const kh = await startKhatmah(1, "ramadan", "ختمة رمضان");
assert.equal(kh.ok, true);
if (kh.ok) {
  assert.equal(kh.bookmark.khatmaType, "ramadan");
  const kp = getKhatmahProgress(kh.bookmark);
  assert.ok(kp);
  assert.equal(kp!.pagesTotal, 604);
  assert.equal(kp!.from, 1);
  assert.equal(kp!.to, 604);
}

const hifzHits = searchMushafBookmarksForQuery("الحفظ");
assert.ok(
  hifzHits.some((x) => x.summary.includes("حفظ") || x.title.includes("حفظ")),
  "بحث الحفظ يعيد علامات الحفظ",
);

const stats = getBookmarkStats();
assert.equal(stats.reading, 1);
assert.ok(stats.hifz >= 1);
assert.ok(stats.review >= 1);
assert.ok(stats.custom >= 1);
assert.ok(stats.khatmah >= 1);
assert.ok(stats.total >= 5);

console.log("mushaf-bookmark-ops-unit.test.ts: ok");
