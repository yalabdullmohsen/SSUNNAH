/**
 * Wave 2 — Navigation IA + collapsible drawer + canonical href helper.
 * Run: node --import tsx src/lib/__tests__/product-redesign-wave2-nav-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCanonicalPublicHref, navFor } from "@/config/navigation";
import { SIDEBAR_NAV_GROUPS } from "@/lib/sidebar-nav";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const titles = SIDEBAR_NAV_GROUPS.map((g) => g.title);
for (const t of ["القرآن والتلاوة", "التعلم", "العلوم الشرعية", "العبادة والأدوات", "المعرفة"]) {
  assert.ok(titles.includes(t), `مجموعة الدرج: ${t}`);
}

const hrefs = SIDEBAR_NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href));
assert.ok(hrefs.includes("/mushaf"));
assert.ok(hrefs.includes("/hadith"));
assert.ok(hrefs.includes("/tawhid") || hrefs.includes("/aqidah"));
assert.ok(hrefs.length < 40, `صفوف الدرج ${hrefs.length} < 40`);

const uniqueHrefs = new Set(hrefs);
assert.equal(uniqueHrefs.size, hrefs.length, "بلا تكرار مقصد في مجموعات الدرج");

const drawer = navFor("drawer");
assert.equal(drawer[0]?.href, "/mushaf");
assert.ok(drawer.some((i) => i.id === "hadith"));
assert.ok(drawer.some((i) => i.id === "tafsir"));

assert.equal(buildCanonicalPublicHref("hadith"), "/hadith");
assert.equal(buildCanonicalPublicHref("/mushaf/"), "/mushaf");
assert.equal(buildCanonicalPublicHref(""), null);

const registry = read("src/components/layout/DrawerFromRegistry.tsx");
assert.match(registry, /aria-expanded/);
assert.match(registry, /sidebar-section-toggle/);
assert.match(registry, /متابعة القراءة/);
assert.doesNotMatch(registry, /warmStaticQuranicFonts/);

const css = read("src/styles/components/sidebar-redesign.css");
assert.match(css, /sidebar-section-toggle/);
assert.match(css, /prefers-reduced-motion:\s*reduce/);

const stt = read("src/components/ScrollToTop.tsx");
assert.match(stt, /scrollY > 720/);
assert.match(stt, /prefers-reduced-motion/);
assert.match(stt, /data-safe-area/);

console.log("product-redesign-wave2-nav-gate.test.ts: ok");
