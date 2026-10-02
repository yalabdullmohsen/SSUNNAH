/**
 * T-034 honesty gate: auth report stays FAIL until device Login–Expiration board passes.
 * Run: node --import tsx src/lib/__tests__/ios-auth-certification-gate.test.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../../../../");
const reportPath = resolve(root, "docs/audit/IOS_AUTH_CERTIFICATION_REPORT.md");
const matrixPath = resolve(root, "docs/audit/evidence/t034-ios-auth/matrix-results.json");

function fail(msg: string): never {
  console.error(`ios-auth-certification-gate: ${msg}`);
  process.exit(1);
}

if (!existsSync(reportPath)) fail(`missing report ${reportPath}`);
if (!existsSync(matrixPath)) fail(`missing matrix ${matrixPath}`);

const report = readFileSync(reportPath, "utf8");
const matrix = JSON.parse(readFileSync(matrixPath, "utf8")) as {
  verdict?: string;
  exit?: string;
  blockingFailures?: string[];
  requiredBoard?: Record<string, string>;
};

if (!report.includes("IOS_AUTH_NOT_CERTIFIED")) {
  fail("report must declare IOS_AUTH_NOT_CERTIFIED");
}
if (!report.includes("Verdict: FAIL")) fail("report must declare FAIL verdict");
if (matrix.verdict !== "FAIL") fail(`matrix.verdict expected FAIL, got ${matrix.verdict}`);
if (matrix.exit !== "IOS_AUTH_NOT_CERTIFIED") {
  fail(`matrix.exit expected IOS_AUTH_NOT_CERTIFIED, got ${matrix.exit}`);
}
if (!Array.isArray(matrix.blockingFailures) || matrix.blockingFailures.length < 1) {
  fail("matrix must list blockingFailures");
}
for (const key of ["Login", "Logout", "Register", "Recovery", "Expiration"] as const) {
  const v = matrix.requiredBoard?.[key];
  if (v !== "FAIL") fail(`requiredBoard.${key} must be FAIL until certified, got ${v}`);
}
if (report.includes("CAP_SESSION_STORE=localStorage") === false) {
  fail("report must disclose Cap session store = localStorage");
}

console.log("ios-auth-certification-gate.test.ts: ok", {
  verdict: matrix.verdict,
  exit: matrix.exit,
  blockers: matrix.blockingFailures.length,
});
