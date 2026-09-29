/**
 * بوابة: بطاقة نتيجة البحث على سلطة الأسطح (srch-result-card + card-system).
 * node --import tsx src/lib/__tests__/search-result-card-soft-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const tsx = read("src/components/search/SearchResultCards.tsx");
const css = read("src/styles/card-system.css");
const mur = read("src/styles/modern-ui-refresh.css");

assert.match(tsx, /srch-result-card/, "نتيجة البحث تستخدم srch-result-card");
assert.doesNotMatch(tsx, /\bsoft-card\b/, "لا soft-card مباشر");
assert.match(css, /\.srch-result-card\b/, "card-system يغطي نتائج البحث");
assert.doesNotMatch(mur, /\.srch-result-card\s*,/, "modern-ui-refresh لا يفرض سطحًا منفصلًا");

console.log("search-result-card-soft-gate.test.ts: ok");
