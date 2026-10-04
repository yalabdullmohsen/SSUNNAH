/**
 * قائمة فحص UI ثابتة (منع رجوع أعطال التثبيت).
 * Run: node --import tsx src/lib/__tests__/ui-regression-checklist-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");

const finalCss = read("src/styles/final-release.css");
const topChrome = read("src/styles/components/top-chrome-layout.css");
const theme = read("src/app/styles/theme.css");
const critical = read("src/styles/critical-first-paint.css");
const offline = read("src/styles/components/language-offline.css");
const pcb = read("src/styles/components/prayer-countdown-banner.css");
const soft = read("src/styles/theme-aliases.css");
const adCss = read("src/styles/components/header-ad-slot.css");

// 1) لا تداخل مع BottomNav — حجز سفلي على #main-content
assert.match(
  finalCss,
  /#main-content\.app-main[\s\S]*?padding-block-end:\s*calc\(\s*var\(--bottom-nav-height,\s*64px\)/,
  "حجز سفلي على #main-content",
);
assert.match(topChrome, /--bottom-nav-height:\s*64px/, "ارتفاع شريط موحّد 64px");
assert.match(theme, /--content-pb:\s*calc\(\s*var\(--bottom-nav-height/, "--content-pb معرّف");

// 2) شريط سفلي صلب
assert.match(
  finalCss,
  /\.bottom-nav(?:--v2)?[\s\S]{0,400}?opacity:\s*1\s*!important/,
  "الشريط السفلي غير شفاف",
);
assert.match(
  finalCss,
  /backdrop-filter:\s*none\s*!important/,
  "لا blur شفاف على الشريط",
);

// 3) زوايا ناعمة — رموز
assert.match(theme, /--radius-card:\s*20px/);
assert.match(theme, /--radius-button:\s*16px/);
assert.match(theme, /--radius-pill:\s*999px/);
assert.match(soft, /--soft-card-grad:\s*none/);
assert.match(read("src/components/design-system/AppCard.tsx"), /ss-app-card/);
assert.match(
  finalCss,
  /\.global-back-btn[\s\S]{0,120}?border-radius:\s*var\(--radius-pill,\s*999px\)\s*!important/,
  "زر الرجوع العائم pill",
);

// 4) لا فراغ إعلان قديم / skip مخفي
assert.match(critical, /--ad-banner-height:\s*0px/);
assert.match(adCss, /\.navbar-v3__ad-row[\s\S]*?display:\s*none/);
assert.match(theme, /\.skip-link[\s\S]*?clip:\s*rect\(0/);
assert.match(theme, /\.skip-link\.mj-skip-link:focus-visible/);

// 5) رسائل صلبة
assert.match(offline, /\.offline-banner\s*\{[\s\S]*?background:\s*var\(--mj-brand-deep/);
assert.doesNotMatch(pcb, /backdrop-filter:\s*blur/);
/* PR E: chunk-recovery toast CSS deleted — component returns null in production. */
assert.equal(
  existsSync(resolve(root, "src/styles/components/chunk-recovery-toast.css")),
  false,
  "chunk-recovery-toast.css dead-with-proof",
);
assert.match(read("src/components/ChunkRecoveryToast.tsx"), /return null/);

// 6) لا CSS عام button في final-release
assert.doesNotMatch(finalCss, /^\s*button\s*\{/m);

console.log("ui-regression-checklist-gate.test.ts: ok");
