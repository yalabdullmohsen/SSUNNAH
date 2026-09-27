/**
 * تسميات درج كاملة + مجموعات IA + مدخل جميع الأقسام.
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

const knowledge = SIDEBAR_NAV_GROUPS.find((g) => g.id === "knowledge");
assert.ok(knowledge, "مجموعة المعرفة");
assert.ok(knowledge!.items.some((i) => i.href === "/sections" && i.label === "جميع الأقسام"));

const quran = SIDEBAR_NAV_GROUPS.find((g) => g.id === "quran");
assert.deepEqual(
  quran!.items.map((i) => i.label),
  ["المصحف", "القرآن الكريم", "التفسير", "التلاوة", "علوم القرآن"],
);

const learning = SIDEBAR_NAV_GROUPS.find((g) => g.id === "learning");
assert.deepEqual(
  learning!.items.map((i) => i.label),
  ["الدروس العلمية", "المحفوظات", "التقدم"],
);

const worship = SIDEBAR_NAV_GROUPS.find((g) => g.id === "worship");
assert.ok(worship!.items.some((i) => i.href === "/duas" && i.label === "الأدعية"));
assert.ok(!worship!.items.some((i) => i.href === "/tasbih"));

const bottomQuran = navFor("bottom").find((i) => i.id === "quran");
assert.equal(bottomQuran?.label, "القرآن", "الشريط السفلي يبقى مختصرًا للقرآن");

assert.match(css, /overflow-wrap:\s*anywhere/);
assert.match(css, /\.sidebar-item:active/);
assert.match(css, /min\(92vw,\s*340px\)/);
assert.match(audit, /جميع الأقسام/);

console.log("sidebar-nav-full-labels-gate.test.ts: ok");
