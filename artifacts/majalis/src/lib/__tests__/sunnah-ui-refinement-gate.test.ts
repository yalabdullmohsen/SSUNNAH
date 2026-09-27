/**
 * بوابة صقل واجهة سُنّة — سلم الحواف + بطاقة القسم + بحث موسّع + empty هادف.
 * Run: node --import tsx src/lib/__tests__/sunnah-ui-refinement-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SF_RADIUS_SCALE } from "../sunnah-foundation-tokens.ts";
import { SEARCH_SCOPE_IDS, SEARCH_SCOPE_DEFS } from "@/features/search/search-scopes";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const css = read("src/styles/sunnah-foundation-tokens.css");
const soft = read("src/styles/soft-cards.css");
const scopes = read("src/features/search/search-scopes.ts");
const searchView = read("src/pages/account/ui/SearchView.tsx");
const emptyV2 = read("src/components/design-system/EmptyStateV2.tsx");
const sectionCard = read("src/components/ui/HubCard.tsx");
const tarikh = read("src/views/TarikhIslamiDetailPage.tsx");

assert.deepEqual(SF_RADIUS_SCALE, { xs: 12, sm: 16, md: 20, lg: 24 });
assert.match(css, /--sf-radius-xs:\s*12px/);
assert.match(css, /--sf-radius-sm:\s*16px/);
assert.match(css, /--sf-radius-md:\s*20px/);
assert.match(css, /--sf-radius-lg:\s*24px/);
assert.match(css, /--sf-radius-card:\s*var\(--sf-radius-md/);

assert.match(soft, /--radius-card:\s*var\(--sf-radius-card/);
assert.match(soft, /--soft-card-grad:\s*none/);

for (const id of ["discover", "knowledge", "glossary", "reference"] as const) {
  assert.ok((SEARCH_SCOPE_IDS as readonly string[]).includes(id), `scope ${id}`);
  assert.ok(SEARCH_SCOPE_DEFS.some((d) => d.id === id), `def ${id}`);
  assert.match(scopes, new RegExp(`id: "${id}"`));
}
assert.match(searchView, /islamic-glossary/);
assert.match(searchView, /discover-islam/);

assert.match(emptyV2, /nextStep\?:/);
assert.match(emptyV2, /navPath\?:/);
assert.match(sectionCard, /count\?:\s*number/);
assert.match(sectionCard, /countLabel\?:/);
assert.doesNotMatch(tarikh, /عنصر غير موجود/);
assert.match(tarikh, /tarikh-unavailable/);
assert.doesNotMatch(tarikh, /EmptyStateV2/);

assert.ok(existsSync(resolve(repoRoot, "docs/design/SUNNAH_UI_REFINEMENT_AUDIT.md")));
assert.ok(existsSync(resolve(repoRoot, "docs/design/UNIFIED_SEARCH_ARCHITECTURE.md")));

console.log("sunnah-ui-refinement-gate.test.ts: ok");
