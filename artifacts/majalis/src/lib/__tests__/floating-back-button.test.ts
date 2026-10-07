/**
 * بوابة: Back FAB موحّد أسفل يمين؛ السهم العائم الدائري العلوي ملغى.
 * تشغيل: node --import tsx src/lib/__tests__/floating-back-button.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const fab = read("src/components/FloatingBackButton.tsx");
assert.match(fab, /FLOATING_BACK_DISABLED/);
assert.match(fab, /GlobalBackControlHost/);
assert.match(fab, /FIXED_BACK_BAR_ENABLED/);
assert.match(fab, /UNIFIED_BACK_FAB_ENABLED/);
assert.match(fab, /variant="bar"/);
assert.match(fab, /AppBackButton/);
assert.match(fab, /autoHideFloating=\{false\}/, "الشريط لا يُخفى على /profile والإعدادات العامة");
assert.match(fab, /path === "\/"|hideOnHome/, "إخفاء على الرئيسية");
assert.match(fab, /prayer-times|hideOnPrayer/, "إخفاء على الصلاة — منع CLS للمضيف");
assert.match(fab, /isImmersiveChromePath|hideOnMushaf/, "إخفاء على المصحف");
/* قرار المالك 2026-10-07: الزر الدائري يرافق كل الأقسام — لا إخفاء لوجود رجوع داخلي ولا في الإعدادات/الدعم */
assert.doesNotMatch(fab, /hideOnInPageAppBack|hideOnAdhanSettings|hideOnLegalSupport|domInPageBack/, "لا إخفاء بسبب رجوع داخلي");
assert.match(fab, /قرار المالك/, "القرار موثّق في المكوّن");
assert.match(fab, /hideBack/, "إخفاء موحّد");
assert.doesNotMatch(fab, /ChevronUp/);
assert.match(fab, /data-visible="1"|data-global-back-visible/, "ظاهر أسفل يمين");
assert.match(fab, /data-edge="bottom"|data-global-back-edge/, "أسفل يمين");

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

const backCss = read("src/styles/final-release.css");
assert.match(backCss, /\.app-back-btn--bar\.fixed-back-bar/, "شريط ثابت");
/* الزر الدائري يرافق كل الأقسام: CSS يُستورد من المكوّن نفسه لا من صفحات المعرفة فقط */
assert.match(read("src/main.tsx"), /import\("\.\/styles\/final-release\.css"\)/, "CSS الزر يُحمَّل في كل مسار عبر final-release");
assert.doesNotMatch(read("src/styles/knowledge-experience.css"), /fixed-back-bar/, "لا تعريف FAB داخل knowledge-experience");
assert.match(backCss, /position:\s*fixed/);
assert.match(backCss, /right:\s*max\(0\.75rem/, "يمين الشاشة فعليًا");
assert.match(backCss, /border-radius:\s*var\(--radius-pill/, "دائري");
assert.match(backCss, /width:\s*36px;[\s\S]{0,40}height:\s*36px/, "36×36 دائرة");
assert.match(backCss, /right:\s*max\(0\.75rem,\s*var\(--inset-right/, "يمين فعليًا");
assert.match(backCss, /bottom:\s*var\(\s*--global-back-bottom/, "أسفل فوق الشريط السفلي");
assert.doesNotMatch(
  backCss,
  /\.app-back-btn--bar\.fixed-back-bar[\s\S]{0,500}?top:\s*var\(--global-back-top/,
  "لا تثبيت أعلى يمين",
);
assert.match(backCss, /inset-inline-end:\s*unset/, "لا منطق RTL يقلب الزر لليسار");
assert.match(backCss, /html\.chrome-immersive[\s\S]{0,220}?display:\s*none/, "إخفاء CSS في المصحف");
assert.match(backCss, /data-visible="1"|data-global-back-visible/, "ظهور FAB");
// الرجوع المدمج مخفي بـ calm-polish — لا نخفي FAB بـ :has وإلا يختفي السهم بالكامل.
assert.doesNotMatch(
  backCss,
  /body:has\(\[data-section-back/,
  "لا إخفاء FAB بسبب data-section-back المخفي أصلًا",
);
assert.doesNotMatch(
  backCss,
  /body:has\(\.lesson-detail-back\)[\s\S]{0,120}?display:\s*none/,
  "لا إخفاء FAB بسبب lesson-detail-back المخفي",
);
assert.match(backCss, /\.app-back-btn--bar\.fixed-back-bar\s*>\s*span[\s\S]{0,80}?display:\s*none/, "FAB أيقونة فقط");

const appBack = read("src/components/common/AppBackButton.tsx");
assert.match(appBack, /isImmersiveChromePath/, "إخفاء المصحف في AppBackButton");
assert.match(
  appBack,
  /variant === "floating" \|\| variant === "bar"[\s\S]{0,120}?isImmersiveChromePath/,
  "إخفاء المصحف بلا شرط autoHideFloating",
);

assert.match(appBack, /goBackOrFallback|goBackOrFallback/);
assert.match(appBack, /fallbackHref/);
assert.match(appBack, /onPointerDown/);
assert.doesNotMatch(appBack, /window\.setTimeout|setTimeout\s*\(/);

const legacy = read("src/components/GlobalBackButton.tsx");
assert.match(legacy, /FloatingBackButton/);

const app = `${read("src/App.tsx")}\n${read("src/AppRoutes.tsx")}`;
assert.match(app, /FloatingBackButton|GlobalBackButton/);

for (const f of ["src/components/topic/SectionHero.tsx", "src/components/lobby/SectionLobby.tsx"]) {
  assert.doesNotMatch(read(f), /AppBackButton/, "لا رجوع داخل البطاقة: " + f);
}

console.log("floating-back-button.test.ts: ok (unified bottom back fab)");
