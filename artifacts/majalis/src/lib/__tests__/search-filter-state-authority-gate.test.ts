/**
 * بوابة سلطة البحث / الفلاتر / الحالة / الاستجابة.
 * Run: node --import tsx src/lib/__tests__/search-filter-state-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const root = resolve(majalis, "../..");
const readRepo = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readMaj = (rel: string) => readFileSync(resolve(majalis, rel), "utf8");

const searchMap = readRepo("docs/design/SEARCH_AUTHORITY_MAP.md");
const filterMap = readRepo("docs/design/FILTER_AUTHORITY_MAP.md");
const stateMap = readRepo("docs/design/STATE_AUTHORITY_MAP.md");
const respMap = readRepo("docs/design/RESPONSIVE_AUTHORITY_MAP.md");
const statusMap = readRepo("docs/design/STATUS_AUTHORITY_MAP.md");
const searchSys = readMaj("src/components/design-system/SearchSystem.tsx");
const filterSys = readMaj("src/components/design-system/FilterSystem.tsx");
const stateSys = readMaj("src/components/design-system/StateSystem.tsx");
const formFields = readMaj("src/components/design-system/FormFields.tsx");
const mj = readMaj("src/components/ui/mj.tsx");
const tawba = readMaj("src/views/TawbaPage.tsx");
const unify = readMaj("src/styles/ssunnah-card-unify.css");
const breakpoints = readMaj("src/styles/breakpoints.css");
const dsIndex = readMaj("src/components/design-system/index.ts");

assert.match(searchMap, /SEARCH_AUTHORITY_ONLY/);
assert.match(searchMap, /SearchInput/);
assert.match(searchMap, /SearchResultCard/);
assert.match(searchMap, /GlobalSearchModal/);

assert.match(filterMap, /FILTER_AUTHORITY_ONLY/);
assert.match(filterMap, /SegmentedFilter/);
assert.match(filterMap, /ActiveFilters/);
assert.match(filterMap, /FilterSheet/);

assert.match(stateMap, /STATE_AUTHORITY_ONLY/);
assert.match(stateMap, /EmptyStateV2/);
assert.match(stateMap, /NoResultsState/);
assert.match(stateMap, /LoadingStateV2/);
assert.match(statusMap, /STATUS_AUTHORITY_ONLY/);

assert.match(respMap, /RESPONSIVE_SYSTEM_UNIFIED/);
assert.match(respMap, /breakpoints\.css/);
assert.match(breakpoints, /--bp-tablet/);
assert.match(breakpoints, /--touch-min/);

assert.match(searchSys, /SearchInput/);
assert.match(searchSys, /SearchResultCard/);
assert.match(filterSys, /SegmentedFilter/);
assert.match(filterSys, /ActiveFilters/);
assert.match(stateSys, /EmptyStateV2/);
assert.match(stateSys, /ErrorStateV2/);
assert.match(stateSys, /OfflineStateV2/);

assert.match(formFields, /export function SearchInput/);
assert.match(mj, /SearchInput/);
assert.match(mj, /export function SearchField/);
assert.match(tawba, /SearchField/);
assert.match(unify, /\.ss-search-input/);
assert.match(dsIndex, /SearchSystem|SearchResultCard/);
assert.match(dsIndex, /FilterSystem|SegmentedFilter/);
assert.match(dsIndex, /StateSystem|AppEmptyState/);

assert.ok(existsSync(resolve(majalis, "src/components/GlobalSearchModal.tsx")));
assert.ok(existsSync(resolve(majalis, "src/components/filters/SegmentedFilter.tsx")));
assert.ok(existsSync(resolve(majalis, "src/components/search/SearchResultCards.tsx")));

console.log("search-filter-state-authority-gate: ok");
