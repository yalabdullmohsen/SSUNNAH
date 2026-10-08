/**
 * Wave 1 — Foundation V2 + Card V2 + App State V2 gate.
 * Run: node --import tsx src/lib/__tests__/product-redesign-wave1-foundation-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CS2_CARD_TYPES } from "@/components/design-system/CardSystemV2";
import { SF2_CONTRAST_NOTES, SF2_TEXT, SF2_SURFACE } from "@/lib/sunnah-foundation-v2";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repo = resolve(root, "../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readDoc = (rel: string) => readFileSync(resolve(repo, rel), "utf8");

assert.ok(existsSync(resolve(root, "src/styles/sunnah-foundation-v2.css")));
assert.ok(existsSync(resolve(root, "src/styles/card-system-v2.css")));
assert.ok(existsSync(resolve(root, "src/styles/app-state-v2.css")));
assert.ok(existsSync(resolve(root, "src/components/design-system/CardSystemV2.tsx")));

const v2 = read("src/styles/sunnah-foundation-v2.css");
assert.match(v2, /--sf2-page-bg/);
assert.match(v2, /--sf2-text-primary:\s*var\(--sf-color-rich-ink/);
assert.match(v2, /#15382d|#15382D|rich-ink/i);
assert.match(v2, /--sf2-action-primary/);
assert.match(v2, /--sf2-skeleton/);
assert.match(v2, /--sf2-focus-ring/);

const main = read("src/main.tsx");
assert.match(main, /sunnah-foundation-v2\.css/);
assert.match(main, /card-system-v2\.css/);
assert.match(main, /app-state-v2\.css/);
assert.ok(
  main.indexOf("sunnah-foundation-tokens.css") < main.indexOf("sunnah-foundation-v2.css"),
  "V2 after PR-1 foundation",
);

const idx = read("src/components/design-system/index.ts");
assert.match(idx, /SF2_SURFACE/);

assert.equal(CS2_CARD_TYPES.length, 8);
assert.ok(CS2_CARD_TYPES.includes("NavigationCard"));
assert.ok(CS2_CARD_TYPES.includes("EvidenceBlock"));

assert.match(SF2_TEXT.primary, /sf2-text-primary/);
assert.match(SF2_SURFACE.page, /sf2-page-bg/);
assert.equal(SF2_CONTRAST_NOTES.primaryOnPage.fg, "#15382D");
assert.equal(SF2_CONTRAST_NOTES.primaryOnPage.min, 4.5);

for (const doc of [
  "docs/design/PRODUCT_UX_AUDIT.md",
  "docs/design/ROUTE_COMPONENT_INVENTORY.md",
  "docs/design/SUNNAH_FOUNDATION_V2.md",
  "docs/design/CARD_SYSTEM_V2.md",
  "docs/design/DESIGN_TOKEN_MIGRATION.md",
  "docs/scientific/SCIENTIFIC_AUDIT_PLAN.md",
]) {
  assert.match(readDoc(doc), /./, `missing ${doc}`);
}

assert.doesNotMatch(v2, /!important/);
assert.doesNotMatch(read("src/styles/card-system-v2.css"), /!important/);

console.log("product-redesign-wave1-foundation-gate.test.ts: ok");
