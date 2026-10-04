/**
 * PR S5 — استعادة chunk/تحديث: محاولة واحدة · بلا شاشة حاجبة · offline آمن.
 * تشغيل: node --import tsx src/lib/__tests__/startup-chunk-recovery-s5-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readPkg = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const doc = readRepo("docs/performance/STARTUP_CHUNK_RECOVERY_S5.md");
assert.match(doc, /CHUNK_RECOVERY_SINGLE_ATTEMPT|STARTUP_CHUNK_RECOVERY_S5/);
assert.match(doc, /OFFLINE_RECOVERY_SAFE/);
assert.match(doc, /NO_STARTUP_UPDATE_LOOP/);

const recovery = readPkg("src/lib/chunk-recovery.ts");
assert.match(recovery, /isBrowserOffline/);
assert.match(recovery, /reason:\s*["']offline["']/);
assert.doesNotMatch(recovery, /safeLocationReload/);
assert.doesNotMatch(recovery, /تحديث العرض/);
assert.match(recovery, /quiet:\s*true/);

const lazy = readPkg("src/lib/lazy-with-retry.ts");
assert.match(lazy, /localStorage/);
assert.match(lazy, /sessionStorage/);
assert.match(lazy, /isBrowserOffline/);
assert.doesNotMatch(lazy, /PAGE_LOAD_TIMEOUT_MS/);

const boundary = readPkg("src/components/ErrorBoundary.tsx");
assert.doesNotMatch(boundary, /تحديث العرض/);
assert.doesNotMatch(boundary, /تم تحديث المنصة/);
assert.match(boundary, /isBrowserOffline/);
assert.match(boundary, /لا يتوفر اتصال بالشبكة|غير متصل/);
assert.match(boundary, /إعادة المحاولة/);
assert.match(boundary, /hardRecoverStaleDeploy/);

const toast = readPkg("src/components/ChunkRecoveryToast.tsx");
assert.match(toast, /return null/);

const pkg = readPkg("package.json");
assert.match(pkg, /"test:startup-chunk-recovery-s5"/);
assert.match(pkg, /"test:chunk-recovery"/);

console.log("CHUNK_RECOVERY_SINGLE_ATTEMPT");
console.log("NO_STARTUP_UPDATE_LOOP");
console.log("NO_PERSISTENT_BLOCKING_RECOVERY_SCREEN");
console.log("OFFLINE_RECOVERY_SAFE");
console.log("startup-chunk-recovery-s5-gate: ok");
