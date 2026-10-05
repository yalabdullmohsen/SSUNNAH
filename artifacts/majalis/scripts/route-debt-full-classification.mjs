#!/usr/bin/env node
/**
 * مولّد تصنيف دين المسارات (Track classification) — يعيد إنتاج
 * docs/audit/ROUTE_DEBT_FULL_CLASSIFICATION.json و ROUTE_PRIORITY_QUEUE.json
 * من مدخلاتها الحتمية، وفق قواعد OPEN_ROUTE_DEBT_CLASSIFICATION_d2924d5fe.md:
 *
 *   1. لا صف مصفوفة U9 → DEAD_ROUTE
 *   2. /account (Routing) → OWNER_ACTION
 *   3. ADMIN_ONLY → KEEP_JUSTIFIED_WITH_EVIDENCE
 *   4. IMMERSIVE (/mushaf*) · خاصّات الصلاة/الأذان/القبلة → KEEP_JUSTIFIED_WITH_EVIDENCE
 *   5. دين جهاز فقط (RTL/Keyboard/Contrast/StartupCLS) + QM PARTIAL على a11y/responsive → PARTIAL
 *   6. دين جهاز فقط بلا QM PARTIAL → DEVICE_REQUIRED
 *   7. حقول KEEP غير جهازية مختلطة → PARTIAL
 *
 * المدخلات (لا يُكتب فيها شيء):
 *   docs/audit/evidence/t046-u9-route-matrix/open-route-debt.json
 *   docs/audit/ROUTE_UNIFICATION_MATRIX.json · ADMIN_ROUTE_UNIFICATION_MATRIX.json
 *   docs/audit/ROUTE_QUALITY_MATRIX.json
 *
 * تشغيل:  node scripts/route-debt-full-classification.mjs          (يكتب المخرجات)
 *         node scripts/route-debt-full-classification.mjs --check  (يفشل عند الانحراف)
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const rel = (p) => resolve(repoRoot, p);
const readJson = (p) => JSON.parse(readFileSync(rel(p), "utf8"));

export const SOURCE = "docs/audit/evidence/t046-u9-route-matrix/open-route-debt.json";
export const OUT = "docs/audit/ROUTE_DEBT_FULL_CLASSIFICATION.json";
export const QUEUE_OUT = "docs/audit/ROUTE_PRIORITY_QUEUE.json";

/** حقول لا يُغلقها إلا اعتماد جهاز/قياس لكل مسار */
export const DEVICE_FIELDS = new Set(["RTL", "Keyboard", "Contrast", "StartupCLS"]);
/** حقول مصفوفة الجودة التي تجعل الدين «إصلاحًا في المستودع» حين تكون PARTIAL */
export const QM_A11Y_RESPONSIVE_FIELDS = [
  "accessibility",
  "a11y",
  "mobile",
  "tablet",
  "desktop",
  "largeText",
  "zoom200",
];
/** أسطح الصلاة الخاصة (حسابات/جدولة/بوصلة) — حدود منتج موثّقة في U9 §5 */
export const PRAYER_SPECIAL_KEEP = new Set(["/prayer-times", "/prayer-ranks", "/qibla", "/adhan-settings"]);

export function classifyItem(item, u9Row, qmRow) {
  const fields = item.debtFields.map((f) => f.field);
  if (!u9Row) return "DEAD_ROUTE";
  if (item.route === "/account" && fields.includes("Routing")) return "OWNER_ACTION";
  if (item.classification === "ADMIN_ONLY") return "KEEP_JUSTIFIED_WITH_EVIDENCE";
  if (item.classification === "IMMERSIVE" || item.route.startsWith("/mushaf")) {
    return "KEEP_JUSTIFIED_WITH_EVIDENCE";
  }
  if (PRAYER_SPECIAL_KEEP.has(item.route)) return "KEEP_JUSTIFIED_WITH_EVIDENCE";
  const deviceOnly = fields.every((f) => DEVICE_FIELDS.has(f));
  if (!deviceOnly) return "PARTIAL";
  const qmPartial = QM_A11Y_RESPONSIVE_FIELDS.some((k) => qmRow?.[k] === "PARTIAL");
  return qmPartial ? "PARTIAL" : "DEVICE_REQUIRED";
}

export function buildClassification() {
  const debt = readJson(SOURCE);
  const u9 = [
    ...readJson("docs/audit/ROUTE_UNIFICATION_MATRIX.json").routes,
    ...readJson("docs/audit/ADMIN_ROUTE_UNIFICATION_MATRIX.json").routes,
  ];
  const u9By = new Map(u9.map((r) => [r.route, r]));
  const qmBy = new Map(readJson("docs/audit/ROUTE_QUALITY_MATRIX.json").routes.map((r) => [r.route, r]));

  const items = debt.items.map((item) => ({
    route: item.route,
    sourceClass: item.classification,
    trackClass: classifyItem(item, u9By.get(item.route), qmBy.get(item.route)),
    debtFields: item.debtFields.map((f) => f.field),
    priority: Boolean(item.priority),
  }));
  const totals = {};
  for (const it of items) totals[it.trackClass] = (totals[it.trackClass] ?? 0) + 1;
  return { count: items.length, items, totals };
}

function gitSha() {
  try {
    return execSync("git rev-parse HEAD", { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

const QUEUE_CLASSES = new Set(["PARTIAL", "KEEP_JUSTIFIED_WITH_EVIDENCE"]);

function main() {
  const check = process.argv.includes("--check");
  const { count, items, totals } = buildClassification();
  const queueRoutes = items.filter((it) => it.priority && QUEUE_CLASSES.has(it.trackClass));

  if (check) {
    const current = readJson(OUT);
    const queue = readJson(QUEUE_OUT);
    const drift = [];
    if (JSON.stringify(current.items) !== JSON.stringify(items)) drift.push(`${OUT}: items`);
    if (JSON.stringify(current.totals) !== JSON.stringify(totals)) drift.push(`${OUT}: totals`);
    if (JSON.stringify(queue.routes) !== JSON.stringify(queueRoutes)) drift.push(`${QUEUE_OUT}: routes`);
    if (drift.length) {
      console.error(`route-debt classification drift — أعد التوليد:\n  ${drift.join("\n  ")}`);
      process.exit(1);
    }
    console.log(`route-debt-full-classification: ok (count=${count}, totals=${JSON.stringify(totals)})`);
    return;
  }

  const sha = gitSha();
  const out = {
    sha,
    shaShort: sha.slice(0, 12),
    generatedAt: new Date().toISOString(),
    source: SOURCE,
    generator: "artifacts/majalis/scripts/route-debt-full-classification.mjs",
    count,
    unknown: 0,
    totals,
    items,
  };
  writeFileSync(rel(OUT), `${JSON.stringify(out, null, 2)}\n`);
  writeFileSync(
    rel(QUEUE_OUT),
    `${JSON.stringify(
      {
        sha,
        routes: queueRoutes,
        note: "Priority public routes; feedback COMPLETE per Wave4; residuals DEVICE/KEEP as classified",
      },
      null,
      2,
    )}\n`,
  );
  console.log(`wrote ${OUT} + ${QUEUE_OUT} (count=${count}, totals=${JSON.stringify(totals)})`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
