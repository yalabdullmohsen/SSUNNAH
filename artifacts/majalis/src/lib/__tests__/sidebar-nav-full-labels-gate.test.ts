/**
 * تسميات درج: عنوان + توضيح مختصر + مدخل جميع الأقسام.
 * Run: node --import tsx src/lib/__tests__/sidebar-nav-full-labels-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { navFor } from "@/config/navigation";
import { SIDEBAR_NAV_GROUPS } from "@/lib/sidebar-nav";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const css = readFileSync(resolve(root, "src/styles/components/sidebar-redesign.css"), "utf8");
const audit = readFileSync(
  resolve(root, "../../docs/remediation/SIDEBAR_NAV_FULL_LABELS_AUDIT.md"),
  "utf8",
);
const registry = readFileSync(resolve(root, "src/components/layout/DrawerFromRegistry.tsx"), "utf8");

/* مجموعات الدرج = مجموعات IA السبع من السجل؛ الأسماء المختصرة navLabel والتوضيح navHint */
const knowledge = SIDEBAR_NAV_GROUPS.find((g) => g.id === "knowledge");
assert.ok(knowledge, "مجموعة المعرفة والتاريخ");
assert.ok(
  knowledge!.items.some((i) => i.href === "/sections" && i.label === "الأقسام" && i.description === "دليل كامل للأقسام"),
  "مدخل جميع الأقسام بتوضيح صريح",
);

const quran = SIDEBAR_NAV_GROUPS.find((g) => g.id === "quran");
assert.equal(quran!.title, "القرآن الكريم");
assert.equal(quran!.subtitle, "المصحف • التفسير • التلاوة");
assert.deepEqual(
  quran!.items.map((i) => i.label),
  ["المصحف", "القرآن", "التفسير", "التلاوة", "علوم القرآن"],
);

const learning = SIDEBAR_NAV_GROUPS.find((g) => g.id === "learning");
assert.equal(learning!.title, "الدروس والعلماء");
assert.deepEqual(
  learning!.items.map((i) => i.label),
  ["الدروس", "المحفوظات", "التقدم"],
);
assert.equal(
  learning!.items.find((i) => i.href === "/lessons")?.description,
  "الدروس والمحاضرات",
);

const fiqhGroup = SIDEBAR_NAV_GROUPS.find((g) => g.id === "fiqh");
assert.equal(fiqhGroup!.items.find((i) => i.href === "/fiqh")?.label, "الفقه");
assert.equal(
  fiqhGroup!.items.find((i) => i.href === "/fiqh")?.description,
  "الأحكام الفقهية",
);

const worship = SIDEBAR_NAV_GROUPS.find((g) => g.id === "worship");
assert.ok(worship!.items.some((i) => i.href === "/duas" && i.label === "الأدعية"));
assert.ok(!worship!.items.some((i) => i.href === "/tasbih"));

assert.ok(SIDEBAR_NAV_GROUPS.some((g) => g.items.some((i) => i.href === "/flashcards")));
assert.ok(SIDEBAR_NAV_GROUPS.some((g) => g.items.some((i) => i.href === "/ulum-quran")));

const bottomQuran = navFor("bottom").find((i) => i.id === "quran");
assert.equal(bottomQuran?.label, "القرآن", "الشريط السفلي يبقى مختصرًا للقرآن");

assert.match(css, /overflow-wrap:\s*anywhere/);
assert.match(css, /\.sidebar-item:active/);
assert.match(css, /min\(92vw,\s*340px\)/);
assert.match(css, /sidebar-section-toggle__sub/);
assert.match(registry, /sidebar-item-sub/);
assert.match(registry, /expanded\s*\?/);
assert.match(audit, /جميع الأقسام/);
assert.match(audit, /عنوان \+ توضيح/);

console.log("sidebar-nav-full-labels-gate.test.ts: ok");
