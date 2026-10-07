/**
 * Phase Back Authority P7 — AppBackButton owns proven in-page chrome; FloatingBack suppressed (rule 6).
 * Run: pnpm --filter @workspace/majalis run test:back-authority-unify
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { hasInPageBackChrome } from "../immersive-chrome";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

console.log("=== hasInPageBackChrome — lobbies مثبتة فقط ===");
for (const path of [
  "/quran-hub",
  "/lessons",
  "/lessons/abc",
  "/sources",
  "/competitions",
  "/competitions/cmp-1",
  "/sections",
  "/search",
  "/adhan-settings",
  "/settings",
  "/fiqh/books/book-1/lessons/lesson-1",
  "/prayer-times",
  "/prophets",
  "/prophets/nuh",
  "/arbaeen-nawawi",
  "/arbaeen-nawawi/1",
  "/submit",
]) {
  assert.equal(hasInPageBackChrome(path), true, path);
}

console.log("=== ليس in-page — Floating fallback أو immersive ===");
for (const path of [
  "/",
  "/mushaf",
  "/mushaf/12",
  "/quran-hub/tajweed",
  "/sources/some-id",
  "/fiqh",
  "/fiqh/books/book-1",
  "/support",
  "/contact",
  "/login",
]) {
  assert.equal(hasInPageBackChrome(path), false, path);
}

console.log("=== GlobalBackControlHost: يرافق كل الأقسام (قرار المالك 2026-10-07) ===");
const fab = read("src/components/FloatingBackButton.tsx");
assert.doesNotMatch(fab, /hasInPageBackChrome|domInPageBack|hideOnLegalSupport/, "لا إخفاء لوجود رجوع داخلي أو للدعم");
assert.doesNotMatch(fab, /zIndex\s*[:=]\s*\d{2,}/, "لا raw z-index في المضيف");

console.log("=== calm-polish لا يخفي الرجوع الداخلي بـ !important ===");
const calm = read("src/styles/sections-calm-polish.css");
assert.doesNotMatch(
  calm,
  /\.app-back-btn--lobby[\s\S]{0,120}?display:\s*none\s*!important/,
  "لا إخفاء lobby back بـ !important",
);
assert.doesNotMatch(
  calm,
  /\.section-lobby__back[\s\S]{0,120}?display:\s*none\s*!important/,
  "لا إخفاء section-lobby__back بـ !important",
);
assert.doesNotMatch(
  calm,
  /\.app-back-btn--inline[\s\S]{0,160}?display:\s*none\s*!important/,
  "لا إخفاء inline back بـ !important",
);
assert.doesNotMatch(
  calm,
  /\.app-back-btn--hero[\s\S]{0,120}?display:\s*none\s*!important/,
  "لا إخفاء hero back بـ !important",
);
assert.match(calm, /Back Authority P7/, "تعليق ملكية React موثّق");

console.log("=== PageHeroIntegratedBack يلفّ AppBackButton فقط ===");
const heroBack = read("src/components/ui/PageHeroIntegratedBack.tsx");
assert.match(heroBack, /AppBackButton/);
assert.doesNotMatch(heroBack, /history\.back\s*\(/);
assert.doesNotMatch(heroBack, /navigate\s*\(\s*-1/);

console.log("=== SectionLobby / SectionHero ما زالا AppBackButton ===");
assert.match(read("src/components/lobby/SectionLobby.tsx"), /AppBackButton/);
assert.match(read("src/components/topic/SectionHero.tsx"), /AppBackButton/);

console.log("=== MushafBookmarkEditorShell KEEP history.back في الورقة ===");
assert.match(
  read("src/features/mushaf-bookmarks/MushafBookmarkEditorShell.tsx"),
  /history\.back\s*\(/,
);

console.log("back-authority-unify-gate: ok");
