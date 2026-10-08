/**
 * Wave 3 — Card System V2 adoption on shared entry + continue surfaces.
 * Run: node --import tsx src/lib/__tests__/product-redesign-wave3-cards-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const hub = read("src/components/ui/HubCard.tsx");
assert.match(hub, /data-cs2-card/);
assert.match(hub, /"data-cs2-type":\s*"navigation"/);
assert.match(hub, /cs2-nav__title/);
assert.match(hub, /cs2-host/);

const mushaf = read("src/components/quran/QuranOpenMushafCard.tsx");
assert.match(mushaf, /data-cs2-card/);
assert.match(mushaf, /data-cs2-type=\{info\.hasResume \? "continue" : "navigation"\}/);

const progress = read("src/pages/account/ui/ProgressCenterView.tsx");
assert.match(progress, /متابعة القراءة/);

const css = read("src/styles/card-system-v2.css");
assert.match(css, /cs2-host/);
assert.match(css, /data-cs2-type="navigation"/);
assert.doesNotMatch(css, /!important/);

const entryGate = read("src/lib/__tests__/section-entry-card-gate.test.ts");
assert.match(entryGate, /SectionEntryCard/, "بوابة الدخول ما زالت المرجع");

console.log("product-redesign-wave3-cards-gate.test.ts: ok");
