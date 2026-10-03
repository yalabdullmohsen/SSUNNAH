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

assert.match(tableMap, /TABLE_AUTHORITY_ONLY/);
assert.match(tableMap, /ui\/table/);
assert.match(tableMap, /APPROVED/);
assert.match(tableMap, /SPECIAL_CASE/);

assert.match(listMap, /LIST_AUTHORITY_ONLY/);
assert.match(listMap, /SimpleList/);
assert.match(listMap, /InteractiveList/);
assert.match(listMap, /NavigationList/);
assert.match(listMap, /ResultList/);

assert.match(dataMap, /DATA_PRESENTATION_UNIFIED/);
assert.match(dataMap, /StatusBadge/);

assert.match(listSys, /export function SimpleList/);
assert.match(listSys, /export function InteractiveList/);
assert.match(listSys, /export function NavigationList/);
assert.match(listSys, /export function ResultList/);
assert.match(listSys, /SettingsList/);
assert.match(listSys, /VirtualList/);

assert.match(tableCss, /\.ss-data-table\b/);
assert.match(dsIndex, /SimpleList/);
assert.match(compare, /from ["']@\/components\/ui\/table["']/);
assert.match(compare, /ss-data-table/);
assert.ok(existsSync(resolve(majalis, "src/components/ui/table.tsx")));

console.log("table-list-authority-gate: ok");
