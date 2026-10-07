/**
 * بوابة: Back FAB موحّد أسفل يمين؛ السهم العائم الدائري العلوي ملغى.
 * تشغيل: node --import tsx src/lib/__tests__/floating-back-button.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const fab = read("src/components/FloatingBackButton.tsx");
assert.match(fab, /FLOATING_BACK_DISABLED/);
assert.match(fab, /AppBackButton/);
const calm = read("src/styles/sections-calm-polish.css");
assert.match(calm, /\.ads-toolbar[\s\S]{0,80}?app-back-btn--inline/, "رجوع هيدر إعدادات الأذان ظاهر");
assert.match(calm, /\.scroll-to-top[\s\S]{0,200}?stt-label|\.stt-label/, "زر الصعود يحمل تسمية واضحة");

const scroll = read("src/components/ScrollToTop.tsx");
assert.match(scroll, /ArrowUp|إلى الأعلى/);
assert.match(scroll, /scrollY\s*>\s*\d+/);
assert.match(scroll, /aria-modal|data-radix-dialog|isModalOverlayOpen|MutationObserver/);
assert.doesNotMatch(scroll, /useReadingProgress|stt-ring/);

assert.match(calm, /\.scroll-to-top[\s\S]{0,400}?height:\s*40px/, "زر أعلى صغير");
assert.match(
  calm,
  /:has\(\[role="dialog"\]\[data-state="open"\]\)[\s\S]{0,120}?\.scroll-to-top/,
  "إخفاء زر أعلى عند Dialog مفتوح",
);

const appBack = read("src/components/common/AppBackButton.tsx");
assert.match(appBack, /isImmersiveChromePath/, "AppBackButton للمصحف فقط");

assert.match(appBack, /goBackOrFallback|goBackOrFallback/);
assert.match(appBack, /fallbackHref/);
assert.match(appBack, /onPointerDown/);
assert.doesNotMatch(appBack, /window\.setTimeout|setTimeout\s*\(/);

assert.ok(!existsSync(resolve(root, "src/components/GlobalBackButton.tsx")), "الرجوع العائم أُلغي");

const app = `${read("src/App.tsx")}\n${read("src/AppRoutes.tsx")}`;
assert.doesNotMatch(app, /GlobalBackButton/);

const hero = read("src/components/topic/SectionHero.tsx");
assert.match(hero, /AppBackButton|section-hero__back|goBackOrFallback/, "هيرو القسم يعرض رجوعًا هيدريًا");
assert.match(hero, /showBack|withBack/);

const lobby = read("src/components/lobby/SectionLobby.tsx");
assert.match(lobby, /AppBackButton|data-section-back/, "اللوبي يعرض رجوعًا هيدريًا");
assert.match(lobby, /data-section-back/);

console.log("floating-back-button.test.ts: ok (unified bottom back fab)");
