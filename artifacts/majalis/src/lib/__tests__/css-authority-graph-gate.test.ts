/**
 * DESIGN_SYSTEM_CSS_DECOMPOSITION — logical authority in one physical sheet.
 * cssFiles ceiling = 356; extracted micro-files were inlined back in cascade order.
 * Run: node --import tsx src/lib/__tests__/css-authority-graph-gate.test.ts
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readCssGraph } from "../css-authority-graph.ts";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readMaj = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const DS = resolve(majalisRoot, "src/styles/design-system.css");
const graph = readCssGraph(DS);
const ds = readMaj("src/styles/design-system.css");

const FORBIDDEN_SHEETS = [
  "src/styles/features/home.css",
  "src/styles/features/auth.css",
  "src/styles/features/admin.css",
  "src/styles/features/search.css",
  "src/styles/features/tasbih.css",
  "src/styles/features/user-stats.css",
  "src/styles/features/learning-seasons.css",
  "src/styles/features/tawhid.css",
  "src/styles/features/legacy-surfaces.css",
  "src/styles/components/cards.css",
  "src/styles/components/buttons.css",
  "src/styles/components/forms.css",
  "src/styles/components/chips.css",
  "src/styles/components/badges.css",
  "src/styles/components/stats.css",
  "src/styles/components/pagination.css",
  "src/styles/components/empty-states.css",
  "src/styles/components/search-ui.css",
] as const;

console.log("=== CSS_AUTHORITY_GRAPH_SINGLE (physical sheet = design-system.css) ===");
assert.equal(graph.circular.length, 0, "no circular CSS imports");
assert.match(ds, /COMPONENT_AUTHORITY/);
assert.match(ds, /FEATURE_AUTHORITY/);
const iComp = ds.indexOf("COMPONENT_AUTHORITY");
const iFeat = ds.indexOf("FEATURE_AUTHORITY");
const iHtml = ds.indexOf("\nhtml {");
assert.ok(iComp >= 0 && iFeat > iComp, "COMPONENT region before FEATURE region");
assert.ok(iHtml > iFeat, "FOUNDATION html after FEATURE region (cascade seal)");
assert.doesNotMatch(ds, /@import\s+"\.\/(?:components|features)\//);

console.log("=== extracted micro-sheets must not exist (cssFiles ceiling) ===");
for (const rel of FORBIDDEN_SHEETS) {
  assert.equal(existsSync(resolve(majalisRoot, rel)), false, `must not exist: ${rel}`);
}

console.log("=== FEATURE region must not redefine tokens ===");
const featureRegion = ds.slice(iFeat, iHtml);
assert.doesNotMatch(featureRegion, /:root\s*\{/);
assert.doesNotMatch(featureRegion, /--(?:ds|mj|msk|sf|ss)-[\w-]+\s*:/);

console.log("=== FOUNDATION pins (gates + startup) ===");
assert.match(ds, /font-size:\s*calc\(\s*100%\s*\*\s*var\(--ui-font-scale,\s*1\)\s*\)/);
assert.match(ds, /--ds-base:\s*16px/);
assert.match(ds, /@keyframes ds-shimmer[\s\S]*translate3d/);
assert.doesNotMatch(ds, /@keyframes ds-shimmer[\s\S]*background-position/);
assert.doesNotMatch(ds, /body\s*\{[^}]*font-size:\s*var\(--ds-text-base\)/s);
assert.doesNotMatch(ds, /body\s*\{[^}]*background:\s*var\(--ds-parchment\)/s);
assert.match(ds, /--ds-radius-lg:\s*var\(--radius-button/);
assert.match(ds, /--ds-radius-xl:\s*var\(--radius-card/);

console.log("=== graph still contains component/feature selectors ===");
assert.match(graph.text, /\.ds-stat strong\s*\{[\s\S]*?color:\s*var\(--mj-brand-deep/);
assert.match(graph.text, /html\.dark \.ds-stat strong/);
assert.match(graph.text, /\.tc-ring-btn\s*\{/);
assert.match(graph.text, /\.tawheed-types-grid\s*\{/);
assert.match(graph.text, /\.hcp-since-pill\s*\{/);
assert.match(graph.text, /\.lsw-featured\s*\{/);
assert.match(graph.text, /\.login-oauth\s*\{/);
assert.match(graph.text, /\.admin-bootstrap-flag\s*\{/);
assert.match(graph.text, /\.user-stats-section\s*\{/);
assert.match(graph.text, /\.search-page-title\s*\{/);
assert.doesNotMatch(graph.text, /\.tawheed-breadcrumb\s*\{/);
assert.doesNotMatch(graph.text, /\.fiqh-adopted-opinion\s*\{/);
assert.doesNotMatch(graph.text, /var\(--[\w-]+\s*,\s*#[0-9a-fA-F]{3,8}/);

console.log("=== rule-text preservation vs origin/main mega-file ===");
let original: string;
try {
  original = execFileSync(
    "git",
    ["show", "origin/main:artifacts/majalis/src/styles/design-system.css"],
    { cwd: repoRoot, encoding: "utf8", maxBuffer: 2 * 1024 * 1024 },
  );
} catch {
  original = "";
}
if (original) {
  const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "");
  const origRules = strip(original);
  const graphRules = strip(graph.text);
  const missing: string[] = [];
  const re = /([^{}@][^{]*)\{([^{}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(origRules))) {
    const sel = m[1]!.trim().replace(/\s+/g, " ");
    const body = m[2]!.trim();
    if (!sel || !body || sel.startsWith("@")) continue;
    if (!graphRules.includes(m[2]!)) missing.push(sel.slice(0, 80));
  }
  assert.equal(missing.length, 0, `missing rule bodies: ${missing.slice(0, 8).join(" | ")}`);
}

console.log("css-authority-graph-gate.test.ts: ok");
console.log("CSS_AUTHORITY_GRAPH_SINGLE");
console.log("TOKEN_AUTHORITY_CLEAR");
console.log("FOUNDATION_IS_FOUNDATION_ONLY");
