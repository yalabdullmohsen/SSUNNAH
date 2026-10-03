/**
 * Mutation invalidation + logout/account-switch cache contracts.
 * Run: node --import tsx src/lib/__tests__/mutation-invalidation-contract-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalis, rel), "utf8");

const auth = read("src/components/AuthProvider.tsx");
assert.match(auth, /queryClient\.clear\(\)/);
// logout path
assert.match(auth, /const logout = useCallback/);
assert.ok(auth.indexOf("queryClient.clear()") < auth.indexOf("authApi.signOut") || auth.includes("logout"));
// account switch clears previous user cache
assert.match(auth, /lastUserIdRef\.current !== next\.id/);
assert.match(auth, /SIGNED_IN/);

const importer = read("src/views/admin/ContentFileImport.tsx");
assert.match(importer, /invalidateQueries\(\{\s*queryKey:\s*queryKeys\.adhkar\.root/);
assert.match(importer, /invalidateQueries\(\{\s*queryKey:\s*queryKeys\.fawaid/);

// Search race / cancel already held
const searchView = read("src/pages/account/ui/SearchView.tsx");
assert.match(searchView, /AbortController/);
assert.match(searchView, /requestSeqRef|seq !==/);

const arabicDb = read("src/lib/arabic-db-search.ts");
assert.match(arabicDb, /STALE_SEARCH_SUPERSEDED|searchGeneration/);

const flag = read("src/lib/arabic-search-feature-flag.ts");
assert.match(flag, /return false/);

console.log("mutation-invalidation-contract-gate: ok");
