/**
 * بوابة سلطة التبويب / التنقّل / تجربة التنقّل.
 * Run: node --import tsx src/lib/__tests__/tab-nav-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const root = resolve(majalis, "../..");
const readRepo = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readMaj = (rel: string) => readFileSync(resolve(majalis, rel), "utf8");

const tabMap = readRepo("docs/design/TAB_AUTHORITY_MAP.md");
const navMap = readRepo("docs/design/NAVIGATION_AUTHORITY_MAP.md");
const iaMap = readRepo("docs/design/NAVIGATION_EXPERIENCE_AUTHORITY.md");
const tabs = readMaj("src/components/design-system/TabSystem.tsx");
const dsIndex = readMaj("src/components/design-system/index.ts");
const unify = readMaj("src/styles/ssunnah-card-unify.css");
const ulum = readMaj("src/pages/quran/ui/UlumQuranView.tsx");
const tawba = readMaj("src/views/TawbaPage.tsx");
const bottom = readMaj("src/components/BottomNavBar.tsx");
const navConfig = readMaj("src/config/navigation.ts");
const engine = readMaj("src/pages/quran/QuranEnginePage.tsx");
const numbers = readMaj("src/pages/quran/ui/QuranNumbersView.tsx");
const prophetTabs = readMaj("src/components/prophets/ProphetStoryTabs.tsx");
const wave4 = readRepo("docs/design/eradication/PR_G_NAV_TABS_SEARCH_FILTERS.md");

assert.match(tabMap, /TAB_AUTHORITY_ONLY/);
assert.match(tabMap, /ContentTabs/);
assert.match(tabMap, /SegmentedFilter/);
assert.match(tabMap, /APPROVED/);
assert.match(tabMap, /LEGACY/);
assert.match(tabMap, /SPECIAL_CASE/);
assert.match(tabMap, /ProphetStoryTabs/);
assert.match(tabMap, /QuranEnginePage/);

assert.match(navMap, /NAVIGATION_AUTHORITY_ONLY/);
assert.match(navMap, /BottomNavBar/);
assert.match(navMap, /SideNavDrawer/);
assert.match(navMap, /config\/navigation/);

assert.match(iaMap, /NAVIGATION_EXPERIENCE_UNIFIED/);
assert.match(iaMap, /primaryNav/);
assert.match(iaMap, /sections\.registry/);

assert.match(tabs, /export function ContentTabs/);
assert.match(tabs, /export function PageTabs/);
assert.match(tabs, /role="tablist"/);
assert.match(dsIndex, /ContentTabs/);
assert.match(unify, /\.ss-tabs\b/);
assert.match(unify, /--ss-tab-min-height/);

assert.match(ulum, /ContentTabs/);
assert.match(tawba, /ContentTabs/);
assert.match(bottom, /BOTTOM_NAV_TABS/);
assert.match(navConfig, /primaryNav/);
assert.match(navConfig, /secondaryNav/);
assert.match(navConfig, /footerNav/);

/* Wave 4 / PR G */
assert.match(engine, /ContentTabs/);
assert.doesNotMatch(engine, /<button\b/, "QuranEnginePage nav on ContentTabs");
assert.match(numbers, /SegmentedFilter/);
assert.doesNotMatch(
  numbers,
  /role=["']tablist["']/,
  "QuranNumbers filters are SegmentedFilter (not DIY tablist)",
);
assert.match(prophetTabs, /ContentTabs/);
assert.doesNotMatch(prophetTabs, /from ["']@\/components\/ui\/button["']/, "ProphetStoryTabs composes ContentTabs");

assert.match(wave4, /TASK_CLASSIFICATION/);
assert.match(wave4, /SHARED_PLATFORM/);
assert.match(wave4, /NAV_TABS_SEARCH_FILTERS|PR_G/);

assert.ok(existsSync(resolve(majalis, "src/components/SideNavDrawer.tsx")));
assert.ok(existsSync(resolve(majalis, "src/components/filters/SegmentedFilter.tsx")));
assert.ok(existsSync(resolve(majalis, "src/components/platform/Breadcrumbs.tsx")));

console.log("tab-nav-authority-gate: ok");
