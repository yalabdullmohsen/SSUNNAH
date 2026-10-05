/**
 * بوابة IA الموحّد — كل القوائم مشتقة من sections.registry ولا تنحرف عنه.
 * Run: node --import tsx src/lib/__tests__/ia-unified-menus-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SECTIONS,
  SECTION_GROUP_META,
  SECTION_GROUP_ORDER,
  getSectionByRoute,
  menuLabel,
} from "@/config/sections.registry";
import { footerNav, navFor, primaryNav, secondaryNav } from "@/config/navigation";
import { SIDEBAR_NAV_GROUPS } from "@/lib/sidebar-nav";
import { SITE_FOOTER_GROUPS } from "@/lib/site-footer-nav";
import { SERVICES_CENTER_GROUPS } from "@/lib/services-center-nav";
import { IA_HOME_PRIMARY } from "@/lib/ia-final-structure";
import { HOME_CONTENT_HUB } from "@/lib/home-content-hub";
import { SECTION_TABS } from "@/components/TopSectionBar";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

type Item = { href: string; label: string };
const linkItems = (groups: typeof SERVICES_CENTER_GROUPS): Item[] =>
  groups.flatMap((g) =>
    g.items.flatMap((i) => (i.action.kind === "link" ? [{ href: i.action.href, label: i.label }] : [])),
  );

const MENUS: Record<string, { items: Item[]; labelMode: "menu" | "full" }> = {
  topBar: { items: SECTION_TABS, labelMode: "menu" },
  primaryNav: { items: [...primaryNav], labelMode: "menu" },
  secondaryNav: { items: [...secondaryNav], labelMode: "menu" },
  bottomNav: { items: navFor("bottom"), labelMode: "menu" },
  drawer: { items: SIDEBAR_NAV_GROUPS.flatMap((g) => g.items), labelMode: "menu" },
  footer: { items: SITE_FOOTER_GROUPS.flatMap((g) => g.links), labelMode: "menu" },
  sectionsHub: { items: linkItems(SERVICES_CENTER_GROUPS), labelMode: "full" },
  homePrimary: { items: IA_HOME_PRIMARY.map((h) => ({ href: h.href, label: h.title })), labelMode: "full" },
  homeContentHub: { items: HOME_CONTENT_HUB.map((h) => ({ href: h.href, label: h.title })), labelMode: "full" },
};

// ── مسارات الراوتر: صفحة حقيقية لا تحويل ─────────────────────
const routerSrc = read("src/App.tsx") + "\n" + read("src/AppRoutes.tsx");
const redirects = new Set(
  [...routerSrc.matchAll(/<Route\s+path="([^"]+)"[^>]*>\s*<Redirect\b/g)].map((m) => m[1]),
);
const routes = new Set([...routerSrc.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]));

for (const [name, { items, labelMode }] of Object.entries(MENUS)) {
  assert.ok(items.length > 0, `${name}: قائمة غير فارغة`);
  const hrefs = items.map((i) => i.href);
  assert.equal(new Set(hrefs).size, hrefs.length, `${name}: بلا تكرار مقصد`);
  for (const item of items) {
    const path = item.href.split(/[?#]/)[0]!;
    const section = getSectionByRoute(path);
    assert.ok(section, `${name}: ${item.href} غير مسجّل في sections.registry`);
    assert.ok(routes.has(path), `${name}: ${item.href} بلا Route`);
    assert.ok(!redirects.has(path), `${name}: ${item.href} رابط يحوّل — استخدم المسار المعتمد`);
    assert.ok(!section!.comingSoon, `${name}: ${item.href} «قريبًا» لا يُعرض في القوائم`);
    const expected = labelMode === "menu" ? menuLabel(section!) : section!.label;
    assert.equal(item.label, expected, `${name}: اسم ${item.href} يطابق السجل («${expected}»)`);
  }
}

// ── المجموعات: نفس مجموعات IA السبع وبنفس الترتيب في كل قائمة مُجمَّعة ──
assert.equal(SECTION_GROUP_ORDER.length, 7);
assert.deepEqual(
  SECTION_GROUP_ORDER.map((g) => SECTION_GROUP_META[g].label),
  ["القرآن الكريم", "الحديث والسنة", "العقيدة والفقه", "العبادات والأذكار", "الدروس والعلماء", "المعرفة والتاريخ", "الحساب والإعدادات"],
);
const inIaOrder = (ids: string[]) => {
  const idx = ids.map((id) => SECTION_GROUP_ORDER.indexOf(id as never));
  assert.ok(idx.every((i) => i >= 0), `مجموعات معروفة: ${ids.join(",")}`);
  assert.deepEqual(idx, [...idx].sort((a, b) => a - b), `ترتيب IA: ${ids.join(",")}`);
};
inIaOrder(SIDEBAR_NAV_GROUPS.map((g) => g.id));
inIaOrder(footerNav.map((g) => g.id));
inIaOrder(SERVICES_CENTER_GROUPS.filter((g) => g.id !== "hubs" && g.id !== "session").map((g) => g.id));
for (const g of SIDEBAR_NAV_GROUPS) {
  assert.equal(g.title, SECTION_GROUP_META[g.id as keyof typeof SECTION_GROUP_META].label, `عنوان مجموعة الدرج ${g.id}`);
  for (const item of g.items) {
    assert.equal(getSectionByRoute(item.href)!.group, g.id, `${item.href} داخل مجموعته في الدرج`);
  }
}
for (const g of footerNav) {
  for (const l of g.links) assert.equal(getSectionByRoute(l.href)!.group, g.id, `${l.href} داخل مجموعته في التذييل`);
}

// ── «قريبًا» خارج القوائم، والقسم الحي غير «القريب» يظهر في صفحة الأقسام ──
const hubHrefs = new Set(linkItems(SERVICES_CENTER_GROUPS).map((i) => i.href));
for (const s of SECTIONS) {
  if (s.comingSoon) assert.ok(!hubHrefs.has(s.route), `${s.id}: «قريبًا» خارج صفحة الأقسام`);
}

// ── لا قوائم يدوية: مصادر التنقّل بلا مسارات أو أسماء مكتوبة ──
for (const rel of ["src/config/navigation.ts", "src/lib/sidebar-nav.ts", "src/lib/site-footer-nav.ts"]) {
  const src = read(rel);
  assert.doesNotMatch(src, /href:\s*"\//, `${rel}: لا href يدوي — المصدر sections.registry`);
  assert.doesNotMatch(src, /label:\s*"[^"]+"/, `${rel}: لا أسماء يدوية — المصدر sections.registry`);
}
assert.doesNotMatch(read("src/components/TopSectionBar.tsx"), /PRIMARY_TAB_ICONS/, "أيقونات الشريط العلوي من السجل");
assert.doesNotMatch(read("src/components/home/HomeSectionsGrid.tsx"), /const ICONS\b/, "أيقونات الرئيسية من السجل");

// ── التوثيق ──
const docPath = resolve(root, "../../docs/design/INFORMATION_ARCHITECTURE.md");
assert.ok(existsSync(docPath), "docs/design/INFORMATION_ARCHITECTURE.md");
const doc = readFileSync(docPath, "utf8");
for (const g of SECTION_GROUP_ORDER) assert.ok(doc.includes(SECTION_GROUP_META[g].label), `التوثيق يذكر ${SECTION_GROUP_META[g].label}`);

console.log(
  `ia-unified-menus-gate: ok (${Object.keys(MENUS).length} قوائم · ${SIDEBAR_NAV_GROUPS.length} مجموعات درج · ${footerNav.length} مجموعات تذييل)`,
);
