/**
 * MUSHAF-FINAL-5 — appearance boundary + responsive contracts.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const reader = read("src/features/mushaf-reader/NewMushafReader.tsx");
assert.match(reader, /data-mushaf-appearance=\{mushafAppearanceResolved\}/);
assert.match(reader, /ssunnah:mushaf-appearance-change/);

const prefs = read("src/lib/mushaf-v2/appearance-prefs.ts");
assert.match(prefs, /html\.setAttribute\("data-mushaf-appearance"/);

const search = read("src/features/mushaf-madinah/MushafSearchSheet.tsx");
assert.match(search, /data-mushaf-appearance=\{appearanceAttr\}/);

const ipad = read("src/lib/__tests__/mushaf-ipad-portrait-width-gate.test.ts");
assert.match(ipad, /430px/);
assert.match(ipad, /must not hard-lock/);

const css = read("src/features/mushaf-reader/mushaf-reader.css");
assert.match(css, /html\[data-mushaf-appearance="night"\]/);
assert.match(css, /html\[data-mushaf-appearance="light"\]/);
/* page surface must not follow app dark token for paper */
assert.match(css, /--nm-page|--mushaf-paper|mushaf-appearance/);

const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
assert.match(pkg.scripts["test:mushaf-final-5-appearance"] || "", /mushaf-final-5-appearance-responsive/);

console.log("mushaf-final-5-appearance-responsive-gate.test.ts: ok");
