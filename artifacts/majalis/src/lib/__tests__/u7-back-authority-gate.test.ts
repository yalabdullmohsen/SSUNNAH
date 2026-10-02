/**
 * T-044 U7 — Back Authority + Floating Layer exit gate.
 * Run: node --import tsx src/lib/__tests__/u7-back-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { hasInPageBackChrome } from "../immersive-chrome";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const reportPath = "docs/audit/U7_BACK_AUTHORITY_REPORT.md";
assert.ok(existsSync(resolve(repoRoot, reportPath)), `missing ${reportPath}`);
const report = readRepo(reportPath);
assert.match(report, /BACK_AUTHORITY_ONLY/);
assert.match(report, /FLOATING_LAYER_CERTIFIED/);
assert.match(report, /Final Decision/);
assert.match(report, /FloatingLayerManager/);

assert.ok(existsSync(resolve(repoRoot, "docs/audit/U6_CARD_AUTHORITY_REPORT.md")));
assert.match(readRepo("docs/audit/U6_CARD_AUTHORITY_REPORT.md"), /CARD_AUTHORITY_ONLY/);

const evidenceDir = resolve(repoRoot, "docs/audit/evidence/t044-u7-back-authority");
assert.ok(existsSync(resolve(evidenceDir, "summary.json")));
const summary = JSON.parse(readFileSync(resolve(evidenceDir, "summary.json"), "utf8"));
assert.equal(summary.exit.BACK_AUTHORITY_ONLY, true);
assert.equal(summary.exit.FLOATING_LAYER_CERTIFIED, true);
assert.deepEqual(summary.navigateNeg1, []);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith(".tsx") || name.endsWith(".ts")) out.push(p);
  }
  return out;
}

const historyFiles: string[] = [];
for (const file of walk(resolve(majalisRoot, "src"))) {
  const rel = relative(resolve(majalisRoot, "src"), file).replace(/\\/g, "/");
  if (/__tests__|\.test\./.test(rel)) continue;
  const text = readFileSync(file, "utf8");
  if (/history\.back\s*\(/.test(text)) historyFiles.push(rel);
  assert.doesNotMatch(text, /navigate\s*\(\s*-1/, `${rel}: no navigate(-1)`);
}
for (const rel of historyFiles) {
  assert.ok(
    /navigation-back\.ts$|mushaf-bookmarks\/MushafBookmarkEditorShell\.tsx$/.test(rel),
    `unexpected history.back in ${rel}`,
  );
}

assert.match(readMaj("src/pages/worship/ui/PrayerTimesView.tsx"), /AppBackButton/);
assert.match(readMaj("src/pages/worship/ui/PrayerTimesView.tsx"), /pts-back/);
assert.doesNotMatch(readMaj("src/pages/worship/ui/PrayerTimesView.tsx"), /goBackOrFallback/);
assert.match(readMaj("src/components/prophets/ProphetStoryReaderHeader.tsx"), /AppBackButton/);
assert.match(readMaj("src/lib/floating-layer-manager.ts"), /floating-back/);
assert.match(readMaj("src/components/FloatingLayerSync.tsx"), /floating-layer-manager|installFloatingLayerSync/);

assert.equal(hasInPageBackChrome("/prayer-times"), true);
assert.equal(hasInPageBackChrome("/prophets/nuh"), true);
assert.equal(hasInPageBackChrome("/mushaf"), false);

assert.equal(existsSync(resolve(majalisRoot, "src/components/common/BackSystemV2.tsx")), false);

const unify = spawnSync(
  process.execPath,
  ["--import", "tsx", "src/lib/__tests__/back-authority-unify-gate.test.ts"],
  { cwd: majalisRoot, encoding: "utf8" },
);
assert.equal(unify.status, 0, unify.stderr || unify.stdout);

console.log(
  `u7-back-authority-gate: ok (historyAllow=${historyFiles.length}, exit=${summary.exitCode})`,
);
