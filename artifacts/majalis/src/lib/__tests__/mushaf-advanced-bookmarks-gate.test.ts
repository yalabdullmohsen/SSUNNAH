/**
 * بوابة نظام علامات المصحف V2 (قراءة · حفظ · مراجعة · شخصي · ختمة).
 * Run: node --import tsx src/lib/__tests__/mushaf-advanced-bookmarks-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const majalisRoot = resolve(here, "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const kinds = read("src/lib/quran-bookmark-kinds.ts");
const store = read("src/lib/quran-my-bookmarks.ts");
const ops = read("src/lib/quran-my-bookmarks-ops.ts");
const composer = read("src/features/mushaf-bookmarks/MushafBookmarkComposer.tsx");
const sheet = read("src/features/mushaf-bookmarks/MushafPageBookmarkSheet.tsx");
const markers = read("src/features/mushaf-bookmarks/MushafBookmarkMarkers.tsx");
const manager = read("src/pages/quran/ui/MushafBookmarksView.tsx");
const css = read("src/styles/reader-bookmarks.css");
const managerCss = read("src/styles/reader-bookmarks-manager.css");
const reader = read("src/features/mushaf-reader/NewMushafReader.tsx");
const controls = read("src/features/mushaf-reader/MushafControlsLayer.tsx");
const nav = read("src/features/mushaf-reader/mushaf-reader-nav-contract.ts");
const routes = read("src/AppRoutes.tsx");
const sync = read("src/lib/mushaf-bookmark-cloud-sync.ts");
const analytics = read("src/lib/mushaf-bookmark-analytics.ts");
const resumeCard = read("src/components/quran/LastReadingBookmarkCard.tsx");
const hub = read("src/pages/quran/ui/QuranHubView.tsx");
const home = read("src/components/home/HomeContinueLearning.tsx");
const search = read("src/features/search/universal-home-search.ts");
const doc = readFileSync(resolve(majalisRoot, "../../docs/mushaf/MUSHAF_BOOKMARK_SYSTEM.md"), "utf8");

assert.match(kinds, /reading/);
assert.match(kinds, /hifz/);
assert.match(kinds, /review/);
assert.match(kinds, /custom/);
assert.match(kinds, /khatmah/);
assert.match(kinds, /tadabbur/);
assert.match(kinds, /lesson/);
assert.match(kinds, /wird/);
assert.match(kinds, /MUSHAF_PRODUCT_BOOKMARK_KINDS/);
assert.match(kinds, /MUSHAF_KHATMAH_TYPES/);
assert.match(kinds, /حفظ آخر موضع قراءة/);
assert.match(kinds, /إضافة علامة حفظ/);
assert.match(kinds, /إضافة علامة مراجعة/);
assert.match(kinds, /إضافة علامة شخصية/);
assert.match(kinds, /بدء ختمة/);
assert.match(kinds, /searchAliases/);
assert.match(kinds, /الحفظ/);

assert.match(store, /MY_BOOKMARKS_MAX\s*=\s*1000/);
assert.match(store, /getBookmarksOnPage/);
assert.match(store, /kind:\s*MushafBookmarkKind/);
assert.match(store, /rangeFromPage/);
assert.match(store, /rangeToPage/);
assert.match(store, /khatmaType/);
assert.match(store, /"reading"/);
assert.doesNotMatch(store, /import\s+(?!type\s)\{[^}]*\}\s+from\s+["']@\/lib\/quran-bookmark-kinds["']/);

assert.match(ops, /addTypedBookmark/);
assert.match(ops, /setReadingBookmark/);
assert.match(ops, /getReadingBookmark/);
assert.match(ops, /getHifzProgress/);
assert.match(ops, /getReviewProgress/);
assert.match(ops, /getKhatmahProgress/);
assert.match(ops, /startKhatmah/);
assert.match(ops, /searchMushafBookmarksForQuery/);
assert.match(ops, /kind !== "reading"/);
assert.match(ops, /getBookmarkStats/);
assert.match(ops, /exportBookmarksJson/);
assert.match(ops, /importBookmarksJson/);
assert.match(ops, /archiveBookmark/);
assert.match(ops, /MUSHAF_TOTAL_PAGES\s*=\s*604/);

assert.match(composer, /data-testid="mushaf-bookmark-composer"/);
assert.match(composer, /MUSHAF_PRODUCT_BOOKMARK_KINDS/);
assert.match(composer, /MUSHAF_KHATMAH_TYPES/);
assert.match(composer, /quran-my-bookmarks-ops/);
assert.match(sheet, /data-testid="mushaf-page-bookmark-sheet"/);
assert.match(sheet, /حفظ آخر موضع قراءة|actionLabel/);
assert.match(sheet, /startKhatmah/);
assert.match(markers, /data-testid="mushaf-bookmark-markers"/);
assert.match(markers, /rb-markers__tab/);
assert.match(manager, /data-testid="mushaf-bookmarks-manager"/);
assert.match(manager, /علامات المصحف/);
assert.match(manager, /لم يتم إنشاء أي علامة بعد/);
assert.match(manager, /العودة إلى آخر موضع قراءة/);
assert.match(manager, /getKhatmahProgress|الختمات/);
assert.match(manager, /تصدير/);
assert.match(manager, /استيراد/);

assert.match(css, /\.rb-markers__dot/);
assert.match(css, /\.rb-markers__tab/);
assert.match(css, /\.rb-page-sheet/);
assert.doesNotMatch(css, /transform:\s*scale\(/);
assert.match(css, /inset-inline-start:\s*0\.12rem/);
assert.doesNotMatch(css, /\.rb-manager\b/);
assert.match(managerCss, /\.rb-manager\b/);
assert.match(manager, /reader-bookmarks-manager\.css/);

assert.match(reader, /MushafBookmarkComposer/);
assert.match(reader, /MushafPageBookmarkSheet/);
assert.match(reader, /MushafBookmarkMarkers/);
assert.match(reader, /lazy\([\s\S]*mushaf-bookmarks/);
assert.doesNotMatch(reader, /reader-bookmarks\.css/);
assert.match(composer, /reader-bookmarks\.css/);
assert.match(markers, /reader-bookmarks\.css/);
assert.doesNotMatch(reader, /reader-bookmarks-manager\.css/);
assert.match(controls, /إضافة فاصل|علامة/);
assert.match(controls, /mushaf-page-bookmark-btn/);
assert.match(controls, /mushaf-bookmarks-manager-link/);
assert.match(controls, /العلامات|إدارة العلامات/);
assert.match(nav, /id:\s*"bookmark",\s*enabled:\s*true/);

assert.match(routes, /\/mushaf\/bookmarks/);
assert.match(routes, /MushafBookmarksPage/);
assert.ok(existsSync(resolve(majalisRoot, "src/pages/quran/MushafBookmarksPage.tsx")));

assert.match(sync, /mushaf_marks_v1/);
assert.match(sync, /scheduleMushafBookmarksSync/);
assert.match(sync, /bootMushafBookmarkCloudSync/);
assert.match(analytics, /getMushafBookmarkAnalytics/);
assert.match(analytics, /lastReadingPage/);
assert.match(analytics, /memorizationProgressPct/);
assert.match(analytics, /readingStreakDays/);
assert.match(analytics, /khatmaProgressPct/);
assert.match(resumeCard, /data-testid="last-reading-bookmark-card"/);
assert.match(resumeCard, /آخر موضع قراءة|متابعة القراءة/);
assert.match(resumeCard, /متابعة/);
assert.match(hub, /LastReadingBookmarkCard/);
assert.match(home, /LastReadingBookmarkCard/);
assert.match(search, /searchMushafBookmarksForQuery/);
assert.match(search, /import\(\s*["']@\/lib\/quran-my-bookmarks-ops["']\s*\)/);
assert.doesNotMatch(
  search,
  /import\s+\{[^}]*searchMushafBookmarksForQuery[^}]*\}\s+from\s+["']@\/lib\/quran-my-bookmarks-ops["']/,
);

assert.match(doc, /Data model/);
assert.match(doc, /Sync architecture|Sync design/);
assert.match(doc, /Local storage strategy|Offline strategy/);
assert.match(doc, /Resume-reading flow/);
assert.match(doc, /Memorization flow/);
assert.match(doc, /Revision flow/);
assert.match(doc, /Khatmah flow/);
assert.match(doc, /Bookmark manager/);
assert.match(doc, /Search integration/);
assert.match(doc, /UI mockups/);
assert.match(doc, /Accessibility review/);
assert.match(doc, /Performance review/);

/* لا يغطي النص بمستطيل عريض */
assert.doesNotMatch(markers, /width:\s*['"`]?100%/);
assert.match(css, /pointer-events:\s*none/);

console.log("mushaf-advanced-bookmarks-gate.test.ts: ok");
