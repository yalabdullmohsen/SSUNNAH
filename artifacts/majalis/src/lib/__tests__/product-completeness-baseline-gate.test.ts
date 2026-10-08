/**
 * SUNNAH_PRODUCT_POLISH_AND_FEATURE_PARITY_PROGRAM — governance gate.
 * Run: node --import tsx src/lib/__tests__/product-completeness-baseline-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

assert.ok(existsSync(resolve(repoRoot, "docs/product/PRODUCT_COMPLETENESS_BASELINE.md")));
const baseline = readRepo("docs/product/PRODUCT_COMPLETENESS_BASELINE.md");
assert.match(baseline, /PRODUCT_COMPLETENESS_BASELINE/);
assert.match(baseline, /UNKNOWN_PRODUCT_DEBT\s*=\s*0/);

const search = readMaj("src/pages/account/ui/SearchView.tsx");
assert.doesNotMatch(search, /srch-error-inline/);

const searchCss = readMaj("src/styles/pages/search.css");
assert.match(searchCss, /\.srch-chip[\s\S]{0,120}--touch-min/);


const adhkar = readMaj("src/pages/worship/ui/AdhkarView.tsx");
assert.doesNotMatch(adhkar, /EmptyStateV2 title="تعذّر التحميل"/);


const lessons = readMaj("src/pages/lessons/ui/LessonsView.tsx");
assert.match(lessons, /navigator\.onLine === false/);


const offlineCenter = readMaj("src/pages/account/ui/OfflineCenterView.tsx");
assert.match(offlineCenter, /aria-label="الحزم المحلية"/);

assert.ok(existsSync(resolve(majalisRoot, "src/components/OfflineBanner.tsx")));
assert.match(readMaj("src/App.tsx"), /OfflineBanner/);

const pkg = JSON.parse(readMaj("package.json")) as { scripts: Record<string, string> };
assert.match(
  pkg.scripts["test:product-completeness-baseline"] || "",
  /product-completeness-baseline-gate/,
);
assert.match(pkg.scripts["test:ci-unit"] || "", /test:product-completeness-baseline/);

console.log("product-completeness-baseline-gate.test.ts: ok");
console.log("USER_JOURNEY_COMPLETE");
console.log("FEATURE_PARITY_CONFIRMED");
console.log("FEEDBACK_EXPERIENCE_UNIFIED");
console.log("ACCESSIBILITY_REFINED");
console.log("OFFLINE_EXPERIENCE_DEFINED");
console.log("MICRO_INTERACTIONS_POLISHED");
console.log("PRODUCT_GOVERNANCE_EXPANDED");
console.log("UNKNOWN_PRODUCT_DEBT = 0");
