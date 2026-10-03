/**
 * Prevent new manual React Query key literals outside query-keys.ts.
 * Run: node --import tsx src/lib/__tests__/query-key-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { queryKeys } from "@/lib/query-keys";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const srcRoot = resolve(majalis, "src");

/** Allowlisted files that may still contain literal keys (tests / key module itself). */
const ALLOWLIST = new Set([
  "lib/query-keys.ts",
  "lib/__tests__/query-key-authority-gate.test.ts",
  "lib/__tests__/query-cache-contract-gate.test.ts",
]);

const LITERAL_KEY =
  /(?:queryKey|invalidateQueries)\s*(?::|\()\s*(?:\{\s*queryKey:\s*)?\[\s*["'][^"']+["']/;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const offenders: string[] = [];
for (const file of walk(srcRoot)) {
  const rel = file.slice(srcRoot.length + 1).replace(/\\/g, "/");
  if (ALLOWLIST.has(rel)) continue;
  if (rel.includes("__tests__") || rel.includes("/tests/")) continue;
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("queryKeys.")) continue;
    if (LITERAL_KEY.test(line)) {
      offenders.push(`${rel}:${i + 1}:${line.trim().slice(0, 120)}`);
    }
  }
}

assert.equal(
  offenders.length,
  0,
  `manual query keys outside query-keys.ts:\n${offenders.slice(0, 30).join("\n")}`,
);

// Authority surface present
assert.ok(queryKeys.adhkar.published[0] === "adhkar");
assert.ok(queryKeys.account.progress("u").includes("u"));
assert.ok(queryKeys.search.hadithRpc("q", "c").includes("hadith_rpc"));
assert.ok(queryKeys.admin.categories[0] === "admin");

// Call sites migrated
const adhkar = readFileSync(resolve(majalis, "src/lib/adhkar-service.ts"), "utf8");
assert.match(adhkar, /queryKeys\.adhkar\.published/);
assert.doesNotMatch(adhkar, /queryKey:\s*\[\s*["']adhkar["']/);

const importer = readFileSync(resolve(majalis, "src/views/admin/ContentFileImport.tsx"), "utf8");
assert.match(importer, /queryKeys\.adhkar\.root|queryKeys\.fawaid/);
assert.doesNotMatch(importer, /invalidateQueries\(\{\s*queryKey:\s*\[\s*["']adhkar["']/);

console.log("query-key-authority-gate: ok");
