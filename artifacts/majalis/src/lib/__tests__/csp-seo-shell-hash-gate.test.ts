/**
 * بوابة: سكربت إزالة #seo-shell في prerender مُجزّأ في CSP.
 * تشغيل: node --import tsx src/lib/__tests__/csp-seo-shell-hash-gate.test.ts
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const post = readFileSync(resolve(root, "scripts/post-build-seo.mjs"), "utf8");
const vercel = readFileSync(resolve(root, "vercel.json"), "utf8");

assert.match(post, /classList\.add\('js-ready'\)/, "سكربت js-ready في post-build-seo");
assert.match(post, /getElementById\('seo-shell'\)/, "إزالة seo-shell");
assert.match(post, /MutationObserver/, "تأجيل إزالة seo-shell حتى يركّب React");
assert.match(post, /requestAnimationFrame\(function\(\)\{requestAnimationFrame\(a\)\}\)/, "إزالة الصدفة بعد إطارَي رسم لا بعد 3200ms");
assert.match(post, /setTimeout\(a,\s*2500\)/, "سقف أمان إن تعذّر تركيب React");
assert.doesNotMatch(post, /setTimeout\(a,\s*3200\)/);
assert.match(post, /#seo-shell\{[^}]*position:\s*fixed/, "الصدفة غطاء ثابت بلا تضخيم ارتفاع الصفحة");
assert.match(post, /#seo-shell\{[^}]*z-index:\s*2/, "الصدفة فوق #root حتى الإزالة");
assert.match(post, /extractCriticalStyles/, "U4: حقن CSS الحرج في صفحات prerender");
assert.match(post, /extractSpaBootBody/, "U4: حقن mj-startup-chrome في صفحات prerender");
assert.match(post, /mj-startup-chrome/, "U4: هيكل الكروم جزء من الدمج");
assert.match(post, /hasHeader&&hasBottom/, "U4: إزالة الصدفة بعد كروم React لا أول ابن");

/** استخرج قيمة SEO_SHELL_REMOVE_SCRIPT كما تُحقن في HTML */
const constMatch = post.match(/const SEO_SHELL_REMOVE_SCRIPT\s*=\s*"((?:\\.|[^"\\])*)"/);
assert.ok(constMatch, "ثابت SEO_SHELL_REMOVE_SCRIPT موجود");
const SCRIPT = JSON.parse(`"${constMatch[1]}"`) as string;
assert.ok(SCRIPT.startsWith("(function"), "IIFE كامل");
assert.match(SCRIPT, /function ready\(\)/, "جاهزية كروم React قبل إزالة الصدفة");
assert.ok(post.includes("<script>${SEO_SHELL_REMOVE_SCRIPT}</script>"), "حقن عبر الثابت");

const hash = createHash("sha256").update(SCRIPT, "utf8").digest("base64");
const token = `'sha256-${hash}'`;
assert.ok(vercel.includes(token), `CSP يجب أن يحتوي ${token}`);
assert.doesNotMatch(vercel, /fonts\.googleapis\.com/, "لا Google Fonts في CSP — خطوط محلية");
assert.doesNotMatch(vercel, /Access-Control-Allow-Origin["']?\s*:\s*["']\*/);

assert.ok(!vercel.includes("''sha256"), "لا اقتباس مزدوج قبل sha256 في CSP");
assert.ok(!/'sha256-[^']+=''/.test(vercel), "لا اقتباس زائد بعد hash في CSP");

console.log(`csp-seo-shell-hash-gate.test.ts: ok — ${token}`);
