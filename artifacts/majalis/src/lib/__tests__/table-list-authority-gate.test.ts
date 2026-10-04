/**
 * بوابة سلطة الجداول/القوائم/عرض البيانات.
 * Run: node --import tsx src/lib/__tests__/table-list-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const root = resolve(majalis, "../..");

const tableMap = readFileSync(resolve(root, "docs/design/TABLE_AUTHORITY_MAP.md"), "utf8");
const listMap = readFileSync(resolve(root, "docs/design/LIST_AUTHORITY_MAP.md"), "utf8");
const dataMap = readFileSync(resolve(root, "docs/design/DATA_PRESENTATION_AUTHORITY.md"), "utf8");
const listSys = readFileSync(resolve(majalis, "src/components/design-system/ListSystem.tsx"), "utf8");
const tableCss = readFileSync(resolve(majalis, "src/styles/ssunnah-card-unify.css"), "utf8");
const dsIndex = readFileSync(resolve(majalis, "src/components/design-system/index.ts"), "utf8");
const compare = readFileSync(resolve(majalis, "src/views/UniversitiesComparePage.tsx"), "utf8");
const annual = readFileSync(resolve(majalis, "src/pages/lessons/ui/AnnualCourseDetailView.tsx"), "utf8");
const prophets = readFileSync(resolve(majalis, "src/views/ProphetStoriesPage.tsx"), "utf8");
const settings = readFileSync(resolve(majalis, "src/pages/account/ui/SettingsView.tsx"), "utf8");
const mj = readFileSync(resolve(majalis, "src/components/ui/mj.tsx"), "utf8");
const uiCommon = readFileSync(resolve(majalis, "src/components/ui-common.tsx"), "utf8");
const contentShell = readFileSync(
  resolve(majalis, "src/styles/components/content-reading-shell.css"),
  "utf8",
);
const wave2Doc = readFileSync(
  resolve(root, "docs/design/eradication/PR_E_LISTS_TABLES_ABSORPTION.md"),
  "utf8",
);

assert.match(tableMap, /TABLE_AUTHORITY_ONLY/);
assert.match(tableMap, /ui\/table/);
assert.match(tableMap, /APPROVED/);
assert.match(tableMap, /SPECIAL_CASE/);
assert.match(tableMap, /ProphetStoriesPage/);
assert.match(tableMap, /DEAD_WITH_PROOF/);

assert.match(listMap, /LIST_AUTHORITY_ONLY/);
assert.match(listMap, /SimpleList/);
assert.match(listMap, /InteractiveList/);
assert.match(listMap, /NavigationList/);
assert.match(listMap, /ResultList/);
assert.match(listMap, /DEAD_WITH_PROOF/);
assert.match(listMap, /ListRow/);

assert.match(dataMap, /DATA_PRESENTATION_UNIFIED/);
assert.match(dataMap, /StatusBadge/);

assert.match(listSys, /export function SimpleList/);
assert.match(listSys, /export function InteractiveList/);
assert.match(listSys, /export function NavigationList/);
assert.match(listSys, /export function ResultList/);
assert.match(listSys, /SettingsList/);
assert.match(listSys, /VirtualList/);

assert.match(tableCss, /\.ss-data-table\b/);
assert.match(tableCss, /nth-child\(even\)/);
assert.match(dsIndex, /SimpleList/);
assert.match(compare, /from ["']@\/components\/ui\/table["']/);
assert.match(compare, /ss-data-table/);
assert.match(annual, /from ["']@\/components\/ui\/table["']/);
assert.match(annual, /ss-data-table/);
assert.match(annual, /SimpleList/);
assert.match(settings, /NavigationList/);
assert.ok(existsSync(resolve(majalis, "src/components/ui/table.tsx")));

/* Wave 2 / PR E — prophet compare absorbed onto TABLE authority */
assert.match(prophets, /from ["']@\/components\/ui\/table["']/);
assert.match(prophets, /ss-data-table/);
assert.match(prophets, /function CompareView/);
assert.doesNotMatch(
  prophets,
  /<table\s+className=["']nb-table["']/,
  "ProphetStories CompareView must not use raw <table className=nb-table>",
);

/* ListRow dead — must not be exported */
assert.doesNotMatch(mj, /export function ListRow\b/, "ListRow removed from mj.tsx");
assert.doesNotMatch(uiCommon, /\bListRow\b/, "ListRow not re-exported from ui-common");

/* content-detail-table recipe not duplicated in reading shell */
assert.doesNotMatch(
  contentShell,
  /\.content-detail-table\s*\{/,
  "content-detail-table visual block removed from content-reading-shell",
);

assert.match(wave2Doc, /TASK_CLASSIFICATION/);
assert.match(wave2Doc, /SHARED_PLATFORM/);
assert.match(wave2Doc, /LIST_TABLE_AUTHORITY_CONSOLIDATED|PR_E_LISTS_TABLES/);

console.log("table-list-authority-gate: ok");
