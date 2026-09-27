/**
 * Platform Section Registry W1 — product catalog + IA + docs.
 * Run: node --import tsx src/lib/__tests__/platform-section-registry-w1-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SECTIONS, isSectionComingSoon } from "@/config/sections.registry";
import {
  REQUIRED_SECTION_COUNT,
  SECTION_IA_GROUPS,
  SECTION_PRODUCT_CATALOG,
  listRegistryGaps,
  summarizeSectionAvailability,
  validateSectionProductCatalog,
} from "@/lib/product";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repo = resolve(root, "../..");
const readDoc = (rel: string) => readFileSync(resolve(repo, rel), "utf8");

for (const doc of [
  "docs/product/SECTION_REGISTRY.md",
  "docs/product/SECTION_COMPLETENESS_AUDIT.md",
  "docs/product/INFORMATION_ARCHITECTURE.md",
  "docs/remediation/waves/WAVE_PLATFORM_SECTION_REGISTRY_W1.md",
]) {
  assert.ok(existsSync(resolve(repo, doc)), `missing ${doc}`);
  assert.match(readDoc(doc), /./);
}

assert.equal(SECTION_PRODUCT_CATALOG.length, REQUIRED_SECTION_COUNT);
assert.equal(REQUIRED_SECTION_COUNT, 39);
assert.equal(SECTION_IA_GROUPS.length, 8);

const issues = validateSectionProductCatalog();
assert.equal(issues.length, 0, JSON.stringify(issues, null, 2));

const ids = SECTION_PRODUCT_CATALOG.map((e) => e.id);
assert.equal(new Set(ids).size, ids.length);

const firaq = SECTION_PRODUCT_CATALOG.find((e) => e.id === "firaq");
assert.ok(firaq);
assert.equal(firaq!.availability, "COMING_SOON");
assert.equal(firaq!.publication, "COMING_SOON");
const registrySects = SECTIONS.find((s) => s.id === "islamic-sects");
assert.ok(registrySects);
assert.equal(isSectionComingSoon(registrySects!), true);

const arabic = SECTION_PRODUCT_CATALOG.find((e) => e.id === "nahw-balagha");
assert.ok(arabic);
assert.equal(arabic!.availability, "BLOCKED_INCOMPLETE");
assert.equal(arabic!.completeContentCount, 0);

const avail = summarizeSectionAvailability();
assert.ok((avail.COMPLETE ?? 0) <= 3, "few COMPLETE — honesty");
assert.ok((avail.PARTIAL ?? 0) >= 10);

const gaps = listRegistryGaps();
assert.ok(gaps.some((g) => g.id === "adab-talab-ilm"));
assert.ok(gaps.some((g) => g.id === "institutions"));
assert.ok(gaps.some((g) => g.id === "historic-mosques"));

assert.match(readDoc("docs/product/SECTION_COMPLETENESS_AUDIT.md"), /BLOCKED_INCOMPLETE|COMING_SOON/);
assert.match(readDoc("docs/product/INFORMATION_ARCHITECTURE.md"), /القرآن وعلومه/);

console.log("platform-section-registry-w1-gate.test.ts: ok");
