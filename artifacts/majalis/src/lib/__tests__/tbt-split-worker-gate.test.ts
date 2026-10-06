/**
 * بوابة TBT: تأخير التسخين، بحث كسول، Worker للفهرس، شرائط الصلاة خارج الإقلاع.
 * تشغيل: node --import tsx src/lib/__tests__/tbt-split-worker-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const prefetch = read("src/lib/prefetch-top-routes.ts");
assert.match(prefetch, /(?:10_000|25_000|90_000)/, "تسخين المسارات بعد load بتأخير كافٍ (≥10ث)");

const homeSearch = read("src/components/home/HomeUniversalSearch.tsx");
assert.doesNotMatch(
  homeSearch,
  /import \{[^}]*runUniversalSearch[^}]*\} from ["']@\/features\/search\/universal-home-search["']/,
  "محرك البحث ليس استيراداً ساكناً في الرئيسية",
);
assert.match(homeSearch, /import\(\s*["']@\/features\/search\/universal-home-search["']\s*\)/, "المحرك عند الاستعلام فقط");

const unified = read("src/features/search/unified-local.ts");
assert.match(unified, /search-index\.worker/, "فهرس البحث عبر Worker");

const app = read("src/App.tsx") + "\n" + read("src/AppRoutes.tsx");
assert.match(app, /IdleRuntimeBoot/, "منطق المنصة بعد الخمول");
assert.match(app, /PrayerCountdownScope/, "جدولة الصلاة مؤجلة على الرئيسية");
assert.match(app, /PrayerRuntimeBoot/, "منطق الأذان داخل مزوّد الصلاة");