/**
 * PHASE 2 — أوجه الخطوط مُعرَّفة مرة واحدة (font-system.css مُحقن inline + font-faces-deferred.css)،
 * وسلطة حجم الخط الأساسي P1 ما زالت قائمة (calc(100% * --ui-font-scale)).
 *
 * Run: pnpm --filter @workspace/majalis run test:startup-typography-fouc-p2
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderedIndexHtml } from "./font-system-test-helper";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(root, "../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const SCOPE = "docs/performance/STARTUP_TYPOGRAPHY_FOUC_PHASE2_SCOPE.md";

console.log("=== Phase 2 scope + freeze ===");
assert.ok(existsSync(resolve(repoRoot, SCOPE)), SCOPE);
const scope = readRepo(SCOPE);
assert.match(scope, /IMPLEMENTATION_FROZEN/);

console.log("=== الأوجه الحرجة inline والباقي مؤجَّل — بلا تكرار ===");
const html = renderedIndexHtml();
const inline = html.match(/<style id="mj-font-system">([\s\S]*?)<\/style>/)?.[1] ?? "";
assert.match(inline, /"Sunnah UI"/);
assert.match(inline, /"Sunnah Text"/);
assert.doesNotMatch(inline, /"Sunnah Quran"[^}]*src:/, "Sunnah Quran غير حرج — في font-faces-deferred.css");
assert.match(read("src/styles/font-faces-deferred.css"), /"Sunnah Quran"/);
assert.doesNotMatch(read("src/styles/critical-first-paint.css"), /@font-face/);

console.log("=== P1 authority still held (no absolute 16px on html) ===");
const CANON = /font-size:\s*calc\(\s*100%\s*\*\s*var\(--ui-font-scale,\s*1\)\s*\)/;
assert.match(read("src/index.css"), CANON);
assert.doesNotMatch(read("src/index.css"), /html\s*\{[^}]*font-size:\s*16px\s*;/s);
assert.match(read("src/styles/design-system.css"), CANON);

console.log("startup-typography-fouc-p2-gate: ok");
