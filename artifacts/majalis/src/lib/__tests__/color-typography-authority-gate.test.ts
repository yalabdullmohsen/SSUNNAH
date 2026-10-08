/**
 * بوابة سلطة اللون / الطباعة / لغة التصميم.
 * Run: node --import tsx src/lib/__tests__/color-typography-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const root = resolve(majalis, "../..");
const readRepo = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readMaj = (rel: string) => readFileSync(resolve(majalis, rel), "utf8");

const colorMap = readRepo("docs/design/COLOR_AUTHORITY_MAP.md");
const typeMap = readRepo("docs/design/TYPOGRAPHY_AUTHORITY_MAP.md");
const langMap = readRepo("docs/design/DESIGN_LANGUAGE_AUTHORITY.md");
const tokenAuth = readRepo("docs/design/DESIGN_TOKEN_AUTHORITY.md");
const colorTs = readMaj("src/lib/color-authority.ts");
const typoSys = readMaj("src/components/design-system/TypographySystem.tsx");
const scale = readMaj("src/styles/typography-scale.css");
const dsIndex = readMaj("src/components/design-system/index.ts");

assert.match(colorMap, /COLOR_AUTHORITY_ONLY/);
assert.match(colorMap, /PRIMARY/);
assert.match(colorMap, /BACKGROUND/);
assert.match(colorMap, /--mj-brand/);
assert.match(colorMap, /no new token family/i);

assert.match(typeMap, /TYPOGRAPHY_AUTHORITY_ONLY/);
assert.match(typeMap, /PAGE_TITLE/);
assert.match(typeMap, /SECTION_TITLE/);
assert.match(typeMap, /PAGE_TITLE > SECTION_TITLE/);

assert.match(langMap, /DESIGN_LANGUAGE_UNIFIED/);
assert.match(langMap, /Brand consistency/);
assert.match(langMap, /Dark mode/);

assert.match(tokenAuth, /sf2/);
assert.match(colorTs, /COLOR_AUTHORITY/);
assert.match(colorTs, /PRIMARY:\s*"--mj-brand"/);
assert.match(colorTs, /ERROR:\s*"--mj-danger"/);
assert.match(colorTs, /BACKGROUND:\s*"--mj-bg"/);
assert.match(colorTs, /OVERLAY:\s*"--sf2-overlay"/);


assert.match(typoSys, /PageTitle/);
assert.match(typoSys, /MetaText/);

assert.match(scale, /--text-h1/);
assert.match(scale, /--sf-type-page-title/);
assert.match(scale, /--text-body/);
assert.match(dsIndex, /TypographySystem|PageTitle/);

assert.ok(existsSync(resolve(majalis, "src/styles/sunnah-foundation-v2.css")));
assert.ok(existsSync(resolve(root, "docs/design/FINAL_TOKEN_ROLE_MATRIX.md")));

console.log("color-typography-authority-gate: ok");
