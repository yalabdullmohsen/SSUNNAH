/**
 * T-046 U9 — Route Matrix Certification exit gate.
 * Run: node --import tsx src/lib/__tests__/u9-route-matrix-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const reportPath = "docs/audit/U9_ROUTE_MATRIX_CERTIFICATION_REPORT.md";
assert.ok(existsSync(resolve(repoRoot, reportPath)), `missing ${reportPath}`);
const report = readRepo(reportPath);
for (const section of [
  "Route Inventory",
  "Public Coverage",
  "Admin Coverage",
  "Failure Inventory",
  "Open Route Debt",
  "Exceptions",
  "Final Status",
  "Exit Decision",
  "ROUTES_CLASSIFIED_AND_CLOSED",
]) {
  assert.match(report, new RegExp(section));
}

assert.ok(existsSync(resolve(repoRoot, "docs/audit/U8_DEFERRED_IDENTITY_REPORT.md")));
assert.match(
  readRepo("docs/audit/U8_DEFERRED_IDENTITY_REPORT.md"),
  /DEFERRED_IDENTITY_ABSORBED_OR_JUSTIFIED/,
);

const publicPath = "docs/audit/ROUTE_UNIFICATION_MATRIX.json";
const adminPath = "docs/audit/ADMIN_ROUTE_UNIFICATION_MATRIX.json";
assert.ok(existsSync(resolve(repoRoot, publicPath)));
assert.ok(existsSync(resolve(repoRoot, adminPath)));

const publicMatrix = JSON.parse(readRepo(publicPath));
const adminMatrix = JSON.parse(readRepo(adminPath));
const evidenceDir = resolve(repoRoot, "docs/audit/evidence/t046-u9-route-matrix");
const summary = JSON.parse(readFileSync(resolve(evidenceDir, "summary.json"), "utf8"));
const debt = JSON.parse(readFileSync(resolve(evidenceDir, "open-route-debt.json"), "utf8"));

assert.equal(summary.exit, "ROUTES_CLASSIFIED_AND_CLOSED");
assert.equal(summary.exitCode, "ROUTES_CLASSIFIED_AND_CLOSED");
assert.equal(summary.unclassified, 0);
assert.equal(publicMatrix.summary.unclassified, 0);
assert.equal(adminMatrix.summary.unclassified, 0);

const ALLOWED = new Set([
  "PUBLIC",
  "ADMIN_ONLY",
  "UTILITY",
  "AUTH",
  "IMMERSIVE",
  "SETTINGS",
  "LEGAL",
  "ACCOUNT",
]);
const FIELD_KEYS = [
  "Theme",
  "Canvas",
  "Buttons",
  "Cards",
  "Back",
  "Floating",
  "Loading",
  "Empty",
  "Error",
  "Offline",
  "RTL",
  "Keyboard",
  "Contrast",
  "StartupCLS",
  "DeferredRepaint",
  "Evidence",
  "Status",
];
const FIELD_OK = new Set(["PASS", "KEEP_JUSTIFIED"]);

function assertRow(row: {
  route: string;
  classification: string;
  status: string;
  fields: Record<string, { status: string; note?: string; closure?: string }>;
}, adminExpect: boolean) {
  assert.ok(ALLOWED.has(row.classification), `${row.route} bad class ${row.classification}`);
  assert.notEqual(row.classification, "UNCLASSIFIED");
  if (adminExpect) assert.equal(row.classification, "ADMIN_ONLY");
  else assert.notEqual(row.classification, "ADMIN_ONLY");
  assert.equal(row.status, "CLOSED", `${row.route} status`);
  for (const key of FIELD_KEYS) {
    assert.ok(row.fields[key], `${row.route} missing field ${key}`);
    if (key === "Status") {
      assert.equal(row.fields[key].status, "CLOSED");
      assert.ok(
        row.fields[key].closure === "PASS" || row.fields[key].closure === "KEEP_JUSTIFIED",
        `${row.route} Status.closure`,
      );
    } else {
      assert.ok(
        FIELD_OK.has(row.fields[key].status),
        `${row.route}.${key}=${row.fields[key].status}`,
      );
      assert.ok(
        typeof row.fields[key].note === "string" && row.fields[key].note.length > 2,
        `${row.route}.${key} note`,
      );
    }
  }
}

assert.ok(publicMatrix.routes.length >= 370);
assert.equal(adminMatrix.routes.length, 42);

for (const row of publicMatrix.routes) assertRow(row, false);
for (const row of adminMatrix.routes) assertRow(row, true);

const all = [...publicMatrix.routes, ...adminMatrix.routes];
assert.equal(all.length, summary.totalRoutes);
assert.equal(
  all.filter((r) => r.classification === "UNCLASSIFIED").length,
  0,
);

const priority = [
  "/",
  "/search",
  "/quran-hub",
  "/mushaf",
  "/prayer-times",
  "/lessons",
  "/hadith",
  "/fiqh",
  "/library",
  "/account",
  "/settings",
];
const by = Object.fromEntries(all.map((r) => [r.route, r]));
for (const p of priority) {
  assert.ok(by[p], `priority missing ${p}`);
  assert.equal(by[p].status, "CLOSED");
}

assert.equal(by["/"].classification, "PUBLIC");
assert.equal(by["/mushaf"].classification, "IMMERSIVE");
assert.equal(by["/settings"].classification, "SETTINGS");
assert.equal(by["/account"].classification, "ACCOUNT");
assert.equal(by["/admin/v3"].classification, "ADMIN_ONLY");

assert.ok(debt.count >= 0);
assert.equal(debt.count, debt.items.length);
assert.equal(debt.count, summary.openRouteDebtCount);

assert.ok(existsSync(resolve(repoRoot, "docs/design/INTERACTION_COMPONENT_AUTHORITY.md")));
assert.ok(existsSync(resolve(repoRoot, "docs/design/CARD_SURFACE_AUTHORITY.md")));
assert.ok(existsSync(resolve(repoRoot, "docs/audit/ROUTE_QUALITY_MATRIX.json")));

// Admin must not be counted as public coverage close
assert.ok(
  /Admin success does \*\*not\*\* close public coverage|Admin PASS is \*\*not\*\* used/i.test(
    report,
  ) || /لا تستخدم نجاح Admin|Admin success does not close/i.test(report),
);

console.log(
  `u9-route-matrix-gate: ok (total=${all.length}, admin=${adminMatrix.routes.length}, unclassified=0, debt=${debt.count}, exit=${summary.exit})`,
);
