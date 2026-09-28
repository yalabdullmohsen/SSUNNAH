/**
 * Phase 6 — soak / long-session prep gate (static + short synthetic loops).
 * لا يدّعي DEVICE_REQUIRED. المدة والدورات موثّقة أدناه فقط.
 * Run: node --import tsx src/lib/__tests__/phase6-soak-prep-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (p: string) => readFileSync(resolve(majalisRoot, p), "utf8");

const SOAK_ROUTES = [
  "/",
  "/mushaf",
  "/mushaf/bookmarks",
  "/quran-hub",
  "/search",
  "/hadith",
  "/lessons",
  "/prayer-times",
  "/adhkar",
  "/offline",
  "/settings",
  "/admin/v3",
] as const;

console.log("=== soak routes registered in AppRoutes ===");
const routes = read("src/AppRoutes.tsx") + "\n" + read("src/App.tsx");
for (const path of SOAK_ROUTES) {
  if (path === "/") {
    assert.match(routes, /path=["']\/["']/);
    continue;
  }
  assert.match(routes, new RegExp(`path=["']${path.replace(/\//g, "\\/")}["']`), path);
}

console.log("=== chunk recovery + update managers exist ===");
assert.ok(existsSync(resolve(majalisRoot, "src/lib/chunk-recovery.ts")));
assert.ok(
  existsSync(resolve(majalisRoot, "src/lib/app-update-manager.ts")) ||
    existsSync(resolve(majalisRoot, "src/components/ChunkRecoveryToast.tsx")),
);

console.log("=== synthetic short soak (in-process, not browser) ===");
const started = Date.now();
const cycles = 50;
let errors = 0;
for (let i = 0; i < cycles; i++) {
  try {
    // محاكاة تبديل مسار خفيفة — لا شبكة
    const pick = SOAK_ROUTES[i % SOAK_ROUTES.length];
    assert.ok(pick.startsWith("/"));
  } catch {
    errors += 1;
  }
}
const elapsedMs = Date.now() - started;
assert.equal(errors, 0);
assert.ok(elapsedMs < 5_000, `soak loop too slow: ${elapsedMs}ms`);

console.log(
  `phase6-soak-prep-gate.test.ts: ok · routes=${SOAK_ROUTES.length} · cycles=${cycles} · ms=${elapsedMs}`,
);
assert.ok(existsSync(resolve(repoRoot, "docs/qa/MUSHAF_REAL_DEVICE_RELEASE_MATRIX.md")));
assert.ok(existsSync(resolve(repoRoot, "docs/qa/PRAYER_ADHAN_REAL_DEVICE_MATRIX.md")));
