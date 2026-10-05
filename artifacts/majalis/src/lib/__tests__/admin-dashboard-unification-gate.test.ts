/**
 * توحيد لوحة التحكم — سلطة تخطيط واحدة + هيكل سليم + حالات/نبرات بتوكنات.
 * node --import tsx src/lib/__tests__/admin-dashboard-unification-gate.test.ts
 * التوثيق: docs/audit/ADMIN_DASHBOARD_UNIFICATION.md
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveAdminStatus } from "../admin-status";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

/* 1) سلطة التخطيط الواحدة تعيد استخدام القطع القائمة */
const layout = read("src/components/admin/AdminLayout.tsx");
for (const name of [
  "AdminSectionLayout",
  "AdminSectionHeader",
  "AdminStateGate",
  "AdminStatCard",
  "AdminStatGrid",
  "AdminStatusPill",
  "AdminToneBadge",
  "AdminTabs",
]) {
  assert.match(layout, new RegExp(`export function ${name}\\b`), `AdminLayout يصدّر ${name}`);
}
assert.match(layout, /from "@\/admin-v3\/states"/, "الحالات من admin-v3/states لا نسخة جديدة");
assert.match(layout, /ContentTabs/, "التبويبات فوق ContentTabs");
assert.match(layout, /ArrowLeft[\s\S]*ArrowRight[\s\S]*Home[\s\S]*End/, "أسهم لوحة المفاتيح للتبويبات");
assert.match(layout, /direction === "rtl"/, "الأسهم واعية لاتجاه RTL");

/* 2) الواجهات القديمة تفوّض للسلطة (لا تكرار) */
assert.match(read("src/views/admin/AdminUI.tsx"), /AdminStatusPill as StatusBadge/, "StatusBadge القديم = AdminStatusPill");
assert.doesNotMatch(read("src/views/admin/AdminUI.tsx"), /STATUS_MAP/, "لا خريطة حالة مكررة في AdminUI");
assert.match(read("src/views/admin/AdminSectionToolbar.tsx"), /AdminSectionHeader/, "AdminSectionToolbar يفوّض للرأس الموحّد");
assert.match(read("src/admin-v3/ui/primitives.tsx"), /resolveAdminStatus/, "شارة v3 من نفس سلطة الحالة");

/* 3) سلطة الحالة */
assert.deepEqual(resolveAdminStatus("PENDING"), { tone: "warning", label: "بانتظار المراجعة" });
assert.equal(resolveAdminStatus("approved").tone, "success");
assert.equal(resolveAdminStatus("rejected").tone, "danger");
assert.equal(resolveAdminStatus("published").label, "منشور");
assert.deepEqual(resolveAdminStatus("custom_x"), { tone: "neutral", label: "custom_x" });
assert.equal(resolveAdminStatus(null).label, "—");

/* 4) الهيكل: AdminShell يملك admin.css (الصفحات المستقلة كانت بلا تنسيق) */
const shell = read("src/views/admin/AdminShell.tsx");
assert.match(shell, /import "@\/styles\/admin\.css";/, "AdminShell يستورد admin.css");
assert.ok(!existsSync(resolve(root, "src/styles/pages/admin-shell.css")), "admin-shell.css المتعارض محذوف");
assert.doesNotMatch(read("src/views/AdminPage.tsx"), /styles\/admin\.css/, "admin.css مالكه AdminShell وحده");

/* 5) كل قسم: نوع ↔ تنقل ↔ عرض مرة واحدة، والقسم المجهول يُرد للوحة */
const union = shell.slice(shell.indexOf("export type AdminSection"), shell.indexOf("type NavItem"));
const sectionKeys = [...union.matchAll(/\|\s*"([a-z-]+)"/g)].map((m) => m[1]);
assert.ok(sectionKeys.length >= 40, `أقسام الاتحاد ${sectionKeys.length}`);
const navKeys = new Set([...shell.matchAll(/\{ key: "([a-z-]+)"/g)].map((m) => m[1]));
const page = read("src/views/AdminPage.tsx");
for (const k of sectionKeys) {
  assert.ok(navKeys.has(k), `القسم ${k} له عنصر تنقل (لا قسم غير قابل للوصول)`);
  const renders = page.split(`section === "${k}" &&`).length - 1;
  assert.equal(renders, 1, `القسم ${k} يُعرض مرة واحدة (كان telegram مكررًا)`);
}
assert.match(page, /resolveAdminSection\(/, "?section= يمر عبر resolveAdminSection");
assert.match(page, /<AdminSectionBoundary name=\{section\} resetKey=\{section\}>/, "حاجز أخطاء لكل قسم");
assert.match(shell, /"\/admin\/automation\/dashboard": "مراقبة الأتمتة"/, "الصفحات المستقلة بعنوانها لا باسم قسم مضيف");
assert.match(shell, /ADMIN_SECTION_KEYS\.has\(key\) \? key : "dashboard"/, "القسم المجهول ← لوحة التحكم");

assert.match(read("src/views/admin/DashboardSection.tsx"), /<AdminStateGate error=\{loadError\} onRetry=\{load\}/, "فشل لوحة التحكم ← حالة خطأ لا هيكل أبدي");

/* 6) Button asChild لا يمرّر Fragment إلى Slot (تحذير React + فقدان className) */
assert.match(read("src/components/ui/button.tsx"), /\{asChild \? children : content\}/, "asChild يمرر الابن مباشرة");

/* 7) شارات الحالة في admin.css بتوكنات لا hex */
const css = read("src/styles/admin.css");
const badges = css.slice(css.indexOf("/* نبرات الحالة الموحّدة"), css.indexOf("/* ── حالات القسم الموحّدة"));
assert.ok(badges.length > 0, "كتلة النبرات موجودة");
assert.doesNotMatch(badges, /#[0-9a-fA-F]{3,8}\b/, "لا hex في نبرات الحالة/بطاقات الإحصاء");

/* 8) لا حوارات متصفح أصلية في نطاق اللوحة + سقف hex لا يرتفع */
const scope = ["src/views/admin", "src/components/admin", "src/admin-v3", "src/views/AdminPage.tsx"];
const files: string[] = [];
const walk = (p: string) => {
  const abs = resolve(root, p);
  if (statSync(abs).isDirectory()) for (const f of readdirSync(abs)) walk(join(p, f));
  else if (/\.tsx?$/.test(p)) files.push(p);
};
scope.forEach(walk);
let hex = 0;
for (const f of files) {
  const src = read(f);
  assert.doesNotMatch(src, /\bwindow\.(confirm|alert|prompt)\(/, `${f}: لا window.confirm/alert/prompt`);
  hex += (src.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) || []).length;
}
const HEX_CEILING = 98; // يُخفَّض مع كل موجة — لا يُرفع
assert.ok(hex <= HEX_CEILING, `ألوان hex في TSX اللوحة ${hex} > ${HEX_CEILING}`);

console.log(`✓ admin-dashboard-unification gate — ${sectionKeys.length} قسمًا، hex=${hex}/${HEX_CEILING}`);
