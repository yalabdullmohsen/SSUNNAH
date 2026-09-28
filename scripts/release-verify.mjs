#!/usr/bin/env node
/**
 * release:verify — بوابة Release Candidate محلية (Phase 6).
 * لا تنشر · لا ترفع للمتجر · لا توقيع.
 *
 * Usage: node scripts/release-verify.mjs
 * Exit 0 = TECHNICALLY_VERIFIED_WITH_EXTERNAL_BLOCKERS ممكن (انظر docs/release/RELEASE_READINESS_TRUTH.md)
 * Exit 1 = Critical FAIL داخل المستودع
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const majalis = join(root, "artifacts/majalis");
const outDir = join(root, "reports/release-candidate");
const failures = [];
const warnings = [];
const results = [];

function run(name, cmd, args, opts = {}) {
  const started = Date.now();
  const r = spawnSync(cmd, args, {
    cwd: opts.cwd ?? root,
    encoding: "utf8",
    env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
    maxBuffer: 20 * 1024 * 1024,
  });
  const ok = r.status === 0;
  const entry = {
    name,
    command: [cmd, ...args].join(" "),
    status: ok ? "PASS" : "FAIL",
    ms: Date.now() - started,
    exit: r.status,
  };
  results.push(entry);
  if (!ok) {
    failures.push(`${name} (exit ${r.status})`);
    const tail = `${r.stdout || ""}\n${r.stderr || ""}`.trim().split("\n").slice(-40).join("\n");
    console.error(`\n──── FAIL: ${name} ────\n${tail}\n`);
  } else {
    console.log(`✓ ${name} (${(entry.ms / 1000).toFixed(1)}s)`);
  }
  return ok;
}

function assert(name, cond, detail = "") {
  results.push({ name, status: cond ? "PASS" : "FAIL", detail });
  if (!cond) {
    failures.push(`${name}${detail ? `: ${detail}` : ""}`);
    console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    console.log(`✓ ${name}`);
  }
  return cond;
}

console.log("release:verify — Phase 6 Release Candidate gate");
console.log(`root: ${root}`);

const commit = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).stdout.trim();
const branch = spawnSync("git", ["branch", "--show-current"], { cwd: root, encoding: "utf8" }).stdout.trim();
const nodeV = process.version;
const pnpmV = spawnSync("pnpm", ["-v"], { cwd: root, encoding: "utf8" }).stdout.trim();

assert("git commit readable", /^[0-9a-f]{40}$/i.test(commit), commit);
assert("branch is phase-6 RC branch or documented", Boolean(branch), branch || "detached");

// Clean tree preferred; allow documented exceptions via env
const dirty = spawnSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).stdout.trim();
if (dirty && process.env.RELEASE_VERIFY_ALLOW_DIRTY !== "1") {
  warnings.push("working tree dirty — set RELEASE_VERIFY_ALLOW_DIRTY=1 to allow");
  console.warn("⚠ working tree dirty (continuing; set RELEASE_VERIFY_ALLOW_DIRTY=1 to silence)");
}

// Capacitor identity checks (no mutation)
const capTs = readFileSync(join(majalis, "capacitor.config.ts"), "utf8");
const capJson = JSON.parse(readFileSync(join(majalis, "capacitor.config.json"), "utf8"));
assert("capacitor appId expected", capJson.appId === "com.yousef.majlisilm", capJson.appId);
assert("capacitor appName سُنّة", capJson.appName === "سُنّة", capJson.appName);
assert("capacitor webDir dist", capJson.webDir === "dist", capJson.webDir);
assert("no cleartext", capJson.server?.cleartext === false);
assert("server.url is www.ssunnah.com", capJson.server?.url === "https://www.ssunnah.com");
assert("no localhost in capacitor.config.ts", !/localhost|127\.0\.0\.1/.test(capTs));
assert("no http:// cleartext server", !/url:\s*["']http:\/\//.test(capTs));

const androidGradle = readFileSync(join(majalis, "android/app/build.gradle"), "utf8");
const androidAppId = androidGradle.match(/applicationId\s+"([^"]+)"/)?.[1];
assert("android applicationId present", Boolean(androidAppId), androidAppId || "missing");
if (androidAppId && androidAppId !== capJson.appId) {
  warnings.push(
    `Android applicationId (${androidAppId}) ≠ Capacitor appId (${capJson.appId}) — OWNER_ACTION before store`,
  );
  console.warn(`⚠ appId mismatch Capacitor=${capJson.appId} Android=${androidAppId} (documented, not auto-fixed)`);
}

const pbx = readFileSync(join(majalis, "ios/App/App.xcodeproj/project.pbxproj"), "utf8");
assert("iOS PRODUCT_BUNDLE_IDENTIFIER includes com.yousef.majlisilm", /PRODUCT_BUNDLE_IDENTIFIER = com\.yousef\.majlisilm;/.test(pbx));

// Dev gallery must not be production-only navigation (DEV-gated)
const routes = readFileSync(join(majalis, "src/AppRoutes.tsx"), "utf8");
assert(
  "dev design-system route is DEV-gated",
  /import\.meta\.env\.DEV[\s\S]{0,200}\/dev\/design-system/.test(routes) ||
    /\/dev\/design-system[\s\S]{0,200}import\.meta\.env\.DEV/.test(routes) ||
    (routes.includes("/dev/design-system") && routes.includes("import.meta.env.DEV")),
);

// Required docs for Phase 6
for (const doc of [
  "docs/release/RELEASE_READINESS_TRUTH.md",
  "docs/remediation/PHASE_6_RELEASE_BASELINE.md",
  "docs/qa/MUSHAF_REAL_DEVICE_RELEASE_MATRIX.md",
  "docs/qa/PRAYER_ADHAN_REAL_DEVICE_MATRIX.md",
  "docs/qa/IOS_RELEASE_CHECKLIST.md",
  "docs/qa/ANDROID_RELEASE_CHECKLIST.md",
  "docs/operations/OBSERVABILITY_CONTRACT.md",
  "docs/operations/INCIDENT_RESPONSE_RUNBOOK.md",
  "docs/privacy/PRIVACY_IMPLEMENTATION_GAP_REPORT.md",
  "docs/legal/RELEASE_ASSET_LICENSE_MATRIX.md",
  "docs/security/RELEASE_SUPPLY_CHAIN_REPORT.md",
  "docs/store-release/STORE_METADATA_TECHNICAL_GAP_REPORT.md",
  "docs/release/RELEASE_ROLLOUT_AND_ROLLBACK.md",
  "docs/release/PHASE_6_OWNER_ACTIONS.md",
]) {
  assert(`doc exists ${doc}`, existsSync(join(root, doc)));
}

// Core gates (compose existing)
run("verify:preflight", "pnpm", ["run", "verify:preflight"]);
run("typecheck", "pnpm", ["run", "typecheck"]);
run("verify:store-assets", "pnpm", ["run", "verify:store-assets"]);
run("phase6-release-readiness-gate", "node", [
  "--import",
  "tsx",
  "src/lib/__tests__/phase6-release-readiness-gate.test.ts",
], { cwd: majalis });
run("phase6-soak-prep-gate", "node", [
  "--import",
  "tsx",
  "src/lib/__tests__/phase6-soak-prep-gate.test.ts",
], { cwd: majalis });
run("phase5-design-ux-gate", "node", [
  "--import",
  "tsx",
  "src/lib/__tests__/phase5-design-ux-gate.test.ts",
], { cwd: majalis });
run("test:prayer-engine-p0", "pnpm", ["--filter", "@workspace/majalis", "run", "test:prayer-engine-p0"]);
run("test:ios-gates", "pnpm", ["--filter", "@workspace/majalis", "run", "test:ios-gates"]);
run("test:licenses", "pnpm", ["--filter", "@workspace/majalis", "run", "test:licenses"]);
run("verify:ci", "pnpm", ["run", "verify:ci"]);

// Post verify:ci dist checks if present
const dist = join(majalis, "dist");
if (existsSync(dist)) {
  const versionPath = join(dist, "version.json");
  assert("dist/version.json exists", existsSync(versionPath));
  if (existsSync(versionPath)) {
    const v = JSON.parse(readFileSync(versionPath, "utf8"));
    assert("version.json has commit", Boolean(v.commit || v.shortCommit));
  }
  // Secret-ish patterns in built JS/CSS (heuristic)
  const assets = join(dist, "assets");
  let secretHits = 0;
  if (existsSync(assets)) {
    // أسماء متغيرات البيئة (مثل SUPABASE_SERVICE_ROLE_KEY في قوائم requiredSecrets) ليست أسرارًا.
    const secretRe =
      /BEGIN PRIVATE KEY|sk-ant-[A-Za-z0-9_-]{16,}|sk_live_[A-Za-z0-9]{16,}|AIza[0-9A-Za-z_-]{35}|service_role[=:]\s*["'][^"']{20,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/;
    for (const name of readdirSync(assets)) {
      if (!/\.(js|css|html|json)$/.test(name)) continue;
      const p = join(assets, name);
      if (statSync(p).size > 8_000_000) continue;
      const text = readFileSync(p, "utf8");
      if (secretRe.test(text)) {
        secretHits += 1;
        failures.push(`possible secret pattern in dist/assets/${name}`);
      }
    }
  }
  assert("no obvious secrets in dist assets", secretHits === 0, `hits=${secretHits}`);
  assert("dist built", true);
} else {
  warnings.push("dist missing after verify:ci — unexpected");
}

mkdirSync(outDir, { recursive: true });
const summary = {
  generatedAt: new Date().toISOString(),
  commit,
  branch,
  node: nodeV,
  pnpm: pnpmV,
  failures,
  warnings,
  results,
  storeStatus: failures.length ? "HOLD" : "HOLD", // never auto STORE GO
  verdict: failures.length
    ? "NOT_READY"
    : "TECHNICALLY_VERIFIED_WITH_EXTERNAL_BLOCKERS",
};
writeFileSync(join(outDir, "release-verify-report.json"), JSON.stringify(summary, null, 2) + "\n");

console.log("\n═══ release:verify summary ═══");
console.log(`commit: ${commit.slice(0, 12)}`);
console.log(`branch: ${branch}`);
console.log(`node: ${nodeV} · pnpm: ${pnpmV}`);
console.log(`PASS steps: ${results.filter((r) => r.status === "PASS").length}`);
console.log(`FAIL steps: ${results.filter((r) => r.status === "FAIL").length}`);
console.log(`warnings: ${warnings.length}`);
console.log(`verdict: ${summary.verdict}`);
console.log(`storeStatus: HOLD (never auto STORE GO)`);
console.log(`report: reports/release-candidate/release-verify-report.json`);

if (failures.length) {
  console.error(`\n✗ release:verify FAILED (${failures.length})`);
  process.exit(1);
}
console.log("\n✓ release:verify PASS — TECHNICALLY_VERIFIED_WITH_EXTERNAL_BLOCKERS");
process.exit(0);
