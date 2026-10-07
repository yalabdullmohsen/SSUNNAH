/**
 * بوابة PR-3: زر أعلى + طباعة معرفة + فراغات التفاصيل.
 * تشغيل: node --import tsx src/lib/__tests__/knowledge-fabs-spacing-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const kxCss = read("src/styles/components/knowledge-summary-card.css");
const sectsCss = read("src/styles/pages/islamic-sects.css");

/* زر «أعلى» أُلغي من الواجهة (#2693، قرار المالك) — لا فحص لتفاصيله؛ الرجوع يخدمه زر الرجوع الدائري. */

assert.match(kxCss, /\.kx-detail-surface[\s\S]{0,500}?text-align:\s*start/);
assert.match(kxCss, /\.kx-detail-surface[\s\S]{0,800}?bottom-nav-height/);
assert.match(kxCss, /border-inline-start:\s*none/);
assert.doesNotMatch(kxCss, /border-inline-start:\s*[34]px/);

assert.match(sectsCss, /--sect-section-gap:\s*1\.25rem/);
assert.doesNotMatch(sectsCss, /--sect-section-gap:\s*3rem/);

console.log("knowledge-fabs-spacing-gate.test.ts: ok");
