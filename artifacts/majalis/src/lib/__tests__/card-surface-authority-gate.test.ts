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
assert.match(authority, /MUSHAF_SPECIAL/);
assert.match(authority, /Forbidden/);

const surfaces = read("src/components/design-system/SurfacePrimitives.tsx");
assert.doesNotMatch(surfaces, /#[0-9a-fA-F]{3,8}/);
assert.doesNotMatch(surfaces, /!important/);


assert.match(read("src/components/home/HomeDailyProgress.tsx"), /LinkCard[\s\S]*@\/design-system/);
assert.match(read("src/components/home/HomeLatestUpdates.tsx"), /LinkCard[\s\S]*@\/design-system/);
assert.match(read("src/components/home/HomePrayerRanks.tsx"), /Card[\s\S]*@\/design-system/);
assert.match(read("src/components/design-system/SunnahCardV2.tsx"), /from "@\/components\/ui\/button"/);

const pkg = JSON.parse(read("package.json"));
assert.match(pkg.scripts["test:card-surface-authority"] || "", /card-surface-authority-gate/);

console.log("card-surface-authority-gate.test.ts: ok");
