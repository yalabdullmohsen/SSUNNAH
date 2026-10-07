/**
 * بوابة سلطة المسافات / الأحجام / الإتاحة / التباين.
 * Run: node --import tsx src/lib/__tests__/spacing-size-a11y-contrast-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const root = resolve(majalis, "../..");
const readRepo = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readMaj = (rel: string) => readFileSync(resolve(majalis, rel), "utf8");

const spaceMap = readRepo("docs/design/SPACING_AUTHORITY_MAP.md");
const sizeMap = readRepo("docs/design/SIZE_AUTHORITY_MAP.md");
const a11yMap = readRepo("docs/design/ACCESSIBILITY_AUTHORITY_MAP.md");
const contrastMap = readRepo("docs/design/CONTRAST_AUTHORITY_MAP.md");
const a11yStd = readRepo("docs/design/ACCESSIBILITY_STANDARD.md");
const sizeTs = readMaj("src/lib/size-authority.ts");
const foundation = readMaj("src/styles/sunnah-foundation-tokens.css");
const foundationV2 = readMaj("src/styles/sunnah-foundation-v2.css");
const breakpoints = readMaj("src/styles/breakpoints.css");
const unify = readMaj("src/styles/ssunnah-card-unify.css");

assert.match(spaceMap, /SPACING_AUTHORITY_ONLY/);
assert.match(spaceMap, /--sf2-space-1/);
assert.match(spaceMap, /APPROVED/);
assert.match(spaceMap, /SPECIAL_CASE/);

assert.match(sizeMap, /SIZE_AUTHORITY_ONLY/);
assert.match(sizeMap, /--touch-min/);
assert.match(sizeMap, /44/);
assert.match(sizeMap, /ICON_SIZE_SCALE|--sf2-icon-box/);

assert.match(a11yMap, /ACCESSIBILITY_STANDARDIZED/);
assert.match(a11yMap, /focus-visible/);
assert.match(a11yMap, /WCAG/);
assert.match(a11yMap, /keyboard/i);
assert.match(a11yStd, /WCAG 2\.2 AA/);

assert.match(contrastMap, /CONTRAST_STANDARDIZED/);
assert.match(contrastMap, /--mj-on-brand/);
assert.match(contrastMap, /--mj-brand/);
assert.match(contrastMap, /AA/);

assert.match(sizeTs, /SIZE_AUTHORITY/);
assert.match(sizeTs, /TOUCH_MIN/);
assert.match(sizeTs, /ICON_SIZE_SCALE/);

assert.match(foundation, /--sf-space-1:\s*4px/);
assert.match(foundation, /--sf-space-4:\s*16px/);
assert.match(foundationV2, /--sf2-space-1/);
assert.match(foundationV2, /--sf2-focus-ring/);
assert.match(foundationV2, /--sf2-icon-box/);
assert.match(breakpoints, /--touch-min:\s*44px/);
assert.match(unify, /SPACING_AUTHORITY|--sf2-space|spacing authority/i);

assert.ok(existsSync(resolve(majalis, "src/lib/__tests__/a11y-contrast-100-gate.test.ts")));
assert.ok(existsSync(resolve(majalis, "src/lib/__tests__/design-token-contrast-aa.test.ts")));

console.log("spacing-size-a11y-contrast-authority-gate: ok");
