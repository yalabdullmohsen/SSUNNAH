/**
 * Card/Surface authority (Interaction PR-5).
 * node --import tsx src/lib/__tests__/card-surface-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

assert.ok(existsSync(resolve(repoRoot, "docs/design/CARD_SURFACE_AUTHORITY.md")));
const authority = readRepo("docs/design/CARD_SURFACE_AUTHORITY.md");
assert.match(authority, /AppCard/);
assert.match(authority, /InteractiveCard/);
assert.match(authority, /StatusCard/);
assert.match(authority, /InsetSurface/);
assert.match(authority, /ElevatedSurface/);
assert.match(authority, /MUSHAF_SPECIAL/);
assert.match(authority, /Forbidden/);

const surfaces = read("src/components/design-system/SurfacePrimitives.tsx");
assert.match(surfaces, /export function InteractiveCard/);
assert.match(surfaces, /export function StatusCard/);
assert.match(surfaces, /export function InsetSurface/);
assert.match(surfaces, /export function ElevatedSurface/);
assert.match(surfaces, /from "\.\/AppCard"/);
assert.doesNotMatch(surfaces, /#[0-9a-fA-F]{3,8}/);
assert.doesNotMatch(surfaces, /!important/);

const idx = read("src/components/design-system/index.ts");
assert.match(idx, /InteractiveCard/);
assert.match(idx, /StatusCard/);
assert.match(idx, /InsetSurface/);
assert.match(idx, /ElevatedSurface/);

assert.match(read("src/pages/account/ui/SettingsView.tsx"), /AppCard/);
assert.match(read("src/components/home/HomeDailyProgress.tsx"), /InteractiveCard/);
assert.match(read("src/components/home/HomeLatestUpdates.tsx"), /InteractiveCard/);
assert.match(read("src/components/home/HomePrayerRanks.tsx"), /InsetSurface/);
assert.match(read("src/pages/account/ui/SearchView.tsx"), /StatusCard/);
assert.match(read("src/components/design-system/SunnahCardV2.tsx"), /from "@\/components\/ui\/button"/);

const pkg = JSON.parse(read("package.json"));
assert.match(pkg.scripts["test:card-surface-authority"] || "", /card-surface-authority-gate/);

console.log("card-surface-authority-gate.test.ts: ok");
