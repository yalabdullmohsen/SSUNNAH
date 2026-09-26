/**
 * بوابة: لا شاشة «تحديث العرض» ولا رسائل تقنية في Production UI.
 * Run: node --import tsx src/lib/__tests__/update-no-fullscreen-ui-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const FORBIDDEN = [
  "تحديث العرض",
  "تم تحديث المنصة",
  "جاري تحسين العرض",
  "يُحدَّث العرض",
  "يُحدّث العرض",
  "refreshing display",
  "improving display",
];

const prodUi = [
  "src/components/ErrorBoundary.tsx",
  "src/components/ChunkRecoveryToast.tsx",
  "src/lib/chunk-recovery.ts",
  "src/lib/lazy-with-retry.ts",
  "src/lib/service-worker.ts",
];

for (const file of prodUi) {
  const src = read(file);
  for (const phrase of FORBIDDEN) {
    assert.doesNotMatch(
      src,
      new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `${file} must not contain «${phrase}»`,
    );
  }
}

const recovery = read("src/lib/chunk-recovery.ts");
assert.doesNotMatch(recovery, /safeLocationReload/);
assert.doesNotMatch(recovery, /setTimeout\s*\(\s*\(\)\s*=>\s*\{[\s\S]*reload/);
assert.match(recovery, /MAJALIS_PURGE_SHELL_ASSETS/);
assert.match(recovery, /quiet:\s*true/);

const lazy = read("src/lib/lazy-with-retry.ts");
assert.doesNotMatch(lazy, /PAGE_LOAD_TIMEOUT_MS/);
assert.doesNotMatch(lazy, /setTimeout/);

const sw = read("src/lib/service-worker.ts");
assert.doesNotMatch(sw, /safeLocationReload/);
assert.match(sw, /mj:sw-updated-quiet/);

const boundary = read("src/components/ErrorBoundary.tsx");
assert.doesNotMatch(boundary, /error-boundary-page--recovering/);
assert.match(boundary, /إعادة المحاولة/);

const toast = read("src/components/ChunkRecoveryToast.tsx");
assert.match(toast, /return null/);

const updateMgr = read("src/lib/app-update-manager.ts");
assert.match(updateMgr, /IDLE/);
assert.match(updateMgr, /READY/);
assert.match(updateMgr, /FAILED/);

const doc = readFileSync(
  resolve(root, "../../docs/performance/STARTUP_UPDATE_LOOP_ROOT_CAUSE.md"),
  "utf8",
);
assert.match(doc, /ErrorBoundary/);
assert.match(doc, /tryRecoverFromStaleChunk/);

console.log("update-no-fullscreen-ui-gate.test.ts: ok");
