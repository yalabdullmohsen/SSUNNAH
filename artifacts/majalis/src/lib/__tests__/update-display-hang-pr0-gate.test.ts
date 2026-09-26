/**
 * بوابة: جذر تعليق «تحديث العرض» موثّق + الإصلاح يمنع الواجهة الحاجبة.
 * Run: node --import tsx src/lib/__tests__/update-display-hang-pr0-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const reportPath = resolve(repoRoot, "docs/performance/UPDATE_DISPLAY_HANG_ROOT_CAUSE_PR0.md");
const loopPath = resolve(repoRoot, "docs/performance/STARTUP_UPDATE_LOOP_ROOT_CAUSE.md");
const metricsPath = resolve(repoRoot, "docs/performance/update-display-hang-pr0-metrics.json");
assert.ok(existsSync(reportPath), "تقرير PR-0 مطلوب");
assert.ok(existsSync(loopPath), "STARTUP_UPDATE_LOOP_ROOT_CAUSE مطلوب");
assert.ok(existsSync(metricsPath), "metrics JSON مطلوب");

const report = readRepo("docs/performance/UPDATE_DISPLAY_HANG_ROOT_CAUSE_PR0.md");
const loop = readRepo("docs/performance/STARTUP_UPDATE_LOOP_ROOT_CAUSE.md");
assert.match(report, /السبب الجذري/);
assert.match(report, /ErrorBoundary/);
assert.match(report, /tryRecoverFromStaleChunk|chunk-recovery/);
assert.match(loop, /tryRecoverFromStaleChunk/);
assert.match(loop, /بلا.*auto-reload|بلا reload/);

const boundary = readMaj("src/components/ErrorBoundary.tsx");
const recovery = readMaj("src/lib/chunk-recovery.ts");
const toast = readMaj("src/components/ChunkRecoveryToast.tsx");
const lazy = readMaj("src/lib/lazy-with-retry.ts");
const main = readMaj("src/main.tsx");

assert.doesNotMatch(boundary, /تحديث العرض/);
assert.doesNotMatch(boundary, /تم تحديث المنصة/);
assert.doesNotMatch(recovery, /جاري تحسين العرض/);
assert.doesNotMatch(recovery, /safeLocationReload/);
assert.match(toast, /return null/);
assert.match(lazy, /tryRecoverFromStaleChunk/);
assert.doesNotMatch(lazy, /PAGE_LOAD_TIMEOUT_MS/);
assert.match(main, /ChunkRecoveryToast/);
assert.match(main, /ErrorBoundary/);

assert.ok(existsSync(resolve(majalisRoot, "src/lib/app-update-manager.ts")));

console.log("update-display-hang-pr0-gate.test.ts: ok");
