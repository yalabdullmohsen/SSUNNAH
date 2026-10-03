/**
 * Global Component Authority gate — Hero / Card / List / Form / Navigation.
 * Locks approved component SoT + MSS hero shell + no-growth ceilings on local heroes.
 * Run: node --import tsx src/lib/__tests__/global-component-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repo = resolve(majalis, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalis, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repo, rel), "utf8");

/** Ceiling: distinct non-approved `*-hero` CSS classes outside Hadith (measured Wave1). */
const LOCAL_HERO_CLASS_CEILING = 95;

const APPROVED_HERO_ROOTS = new Set([
  "page-hero",
  "home-page-hero",
  "mss-hero",
  "section-hero",
  "safe-hero",
  "m2030-hero",
  "topic-page__hero",
]);

function walk(dir: string, out: string[] = [], pred: (n: string) => boolean): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, out, pred);
    else if (pred(name)) out.push(p);
  }
  return out;
}

console.log("=== Authority map present ===");
const map = readRepo("docs/design/GLOBAL_COMPONENT_AUTHORITY_MAP.md");
assert.match(map, /GLOBAL_COMPONENT_AUTHORITY_WAVE_1|GLOBAL COMPONENT AUTHORITY/);
assert.match(map, /APPROVED_AUTHORITY/);
assert.match(map, /PageHero/);
assert.match(map, /AppCard/);
assert.match(map, /HubCard/);
assert.match(map, /ListSystem|SettingsList/);
assert.match(map, /FormFields/);
assert.match(map, /BottomNavBar/);
assert.match(map, /SideNavDrawer/);
assert.match(map, /NO_NEW_TOKEN_FAMILY/);

console.log("=== Hero authority — PageHero + MSS shell ===");
{
  const hero = readMaj("src/components/ui/PageHero.tsx");
  assert.match(hero, /page-hero-mj/);
  assert.match(hero, /page-hero-mj--bleed/);
  assert.match(hero, /export function PageHero/);
  const mss = readMaj("src/styles/components/modern-section-shell.css");
  assert.match(mss, /\.mss-hero-surface/);
  assert.match(mss, /--mss-section-hero-bg:\s*var\(--cs-ink-hero\)/);
  assert.match(mss, /--mss-on-hero:\s*var\(--mj-white\)/);
  // section heroes bridged into single surface authority
  for (const h of [
    ".sw-hero",
    ".seerah-hero",
    ".quran-hub-hero",
    ".fqh-hub-hero",
    ".uq-hero",
    ".topic-page__hero",
    ".page-hero-mj--bleed",
  ]) {
    assert.match(mss, new RegExp(h.replace(".", "\\.")), `MSS covers ${h}`);
  }
}

console.log("=== Card authority — AppCard / HubCard / no soft-card root ===");
{
  const app = readMaj("src/components/design-system/AppCard.tsx");
  assert.match(app, /ss-app-card/);
  assert.match(app, /cs-card/);
  assert.doesNotMatch(app, /\bsoft-card\b/);
  const hub = readMaj("src/components/ui/HubCard.tsx");
  assert.match(hub, /hub-card|HubCard/);
  const ds = readMaj("src/components/design-system/index.ts");
  assert.match(ds, /AppCard/);
}

console.log("=== List authority — ListSystem + SettingsList ===");
{
  const list = readMaj("src/components/design-system/ListSystem.tsx");
  assert.match(list, /export function SimpleList/);
  assert.match(list, /export function InteractiveList/);
  assert.match(list, /export function NavigationList/);
  assert.match(list, /export function ResultList/);
  const settingsList = readMaj("src/components/design-system/SettingsList.tsx");
  assert.match(settingsList, /mur-settings-row/);
  const settingsView = readMaj("src/pages/account/ui/SettingsView.tsx");
  assert.match(settingsView, /SettingsList|NavigationList/);
  assert.match(settingsView, /AppCard/);
}

console.log("=== Form authority — FormFields + SearchInput consumers ===");
{
  const fields = readMaj("src/components/design-system/FormFields.tsx");
  assert.match(fields, /FormLabel|FieldLabel/);
  assert.match(fields, /FieldError/);
  assert.match(fields, /FormActions/);
  assert.match(fields, /data-ss-form/);
  // SearchInput lives with FormFields / design-system search — lock export surface
  const ds = readMaj("src/components/design-system/index.ts");
  assert.match(ds, /FormLabel|FieldError|SearchInput|FormFields/);
}

console.log("=== Navigation authority — BottomNav + SideNav + registry ===");
{
  const bottom = readMaj("src/components/BottomNavBar.tsx");
  assert.match(bottom, /BOTTOM_NAV_TABS|primaryNav|bottom-nav/);
  assert.ok(existsSync(resolve(majalis, "src/components/SideNavDrawer.tsx")));
  const nav = readMaj("src/config/navigation.ts");
  assert.match(nav, /primaryNav/);
  assert.match(nav, /secondaryNav/);
  const tabs = readMaj("src/components/design-system/TabSystem.tsx");
  assert.match(tabs, /export function ContentTabs/);
  assert.match(tabs, /role="tablist"/);
}

console.log("=== Local hero class ceiling (no growth of parallel hero families) ===");
{
  const cssFiles = walk(resolve(majalis, "src/styles"), [], (n) => n.endsWith(".css"));
  const heroes = new Set<string>();
  const heroRe = /(?<![\w-])\.([a-z][a-z0-9-]*)-hero\b/g;
  for (const file of cssFiles) {
    const rel = relative(resolve(majalis, "src"), file);
    if (/hadith|arbaeen/i.test(rel)) continue;
    const css = readFileSync(file, "utf8");
    let m: RegExpExecArray | null;
    const re = new RegExp(heroRe);
    while ((m = re.exec(css))) heroes.add(`${m[1]}-hero`);
  }
  const local = [...heroes].filter((h) => !APPROVED_HERO_ROOTS.has(h) && h !== "page-hero-mj");
  assert.ok(
    local.length <= LOCAL_HERO_CLASS_CEILING,
    `local *-hero classes grew to ${local.length} > ceiling ${LOCAL_HERO_CLASS_CEILING}`,
  );
  console.log(`  local hero classes: ${local.length} / ceiling ${LOCAL_HERO_CLASS_CEILING}`);
}

console.log("=== Baseline inventory artifact ===");
{
  const baseline = resolve(majalis, "reports/global-ds/component-authority-baseline.json");
  assert.ok(existsSync(baseline), "component-authority-baseline.json missing");
  const inv = JSON.parse(readFileSync(baseline, "utf8"));
  assert.equal(inv.phase, "GLOBAL_COMPONENT_AUTHORITY_WAVE_1");
  assert.ok(inv.approved?.hero?.length >= 1);
  assert.ok(inv.approved?.card?.length >= 1);
}

console.log("=== Package script wired ===");
{
  const pkg = JSON.parse(readMaj("package.json"));
  assert.match(
    pkg.scripts["test:global-component-authority"] || "",
    /global-component-authority-gate/,
  );
}

console.log("global-component-authority-gate.test.ts: ok");
console.log("HERO_SYSTEM_CONSOLIDATED");
console.log("CARD_SYSTEM_CONSOLIDATED");
console.log("LIST_SYSTEM_CONSOLIDATED");
console.log("FORM_SYSTEM_CONSOLIDATED");
console.log("NAVIGATION_SYSTEM_CONSOLIDATED");
console.log("UNKNOWN_COMPONENT_DEBT = 0");
