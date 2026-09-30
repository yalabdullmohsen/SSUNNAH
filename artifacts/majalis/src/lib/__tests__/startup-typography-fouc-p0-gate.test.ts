/**
 * PHASE 0 — Startup typography / FOUC cascade evidence.
 * Proves competing html font-size authorities (no product fix in P0).
 *
 * Run: node --import tsx src/lib/__tests__/startup-typography-fouc-p0-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(root, "../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const BASELINE = "docs/performance/STARTUP_TYPOGRAPHY_FOUC_LIVE_BASELINE.md";
const SCOPE = "docs/performance/STARTUP_TYPOGRAPHY_FOUC_SCOPE_MANIFEST.md";

console.log("=== docs + freeze ===");
assert.ok(existsSync(resolve(repoRoot, BASELINE)), BASELINE);
assert.ok(existsSync(resolve(repoRoot, SCOPE)), SCOPE);
const scope = readRepo(SCOPE);
assert.match(scope, /IMPLEMENTATION_FROZEN/);
assert.match(scope, /PHASE 0|P0/);
const baseline = readRepo(BASELINE);
assert.match(baseline, /FIXABLE_IN_REPOSITORY/);
assert.match(baseline, /index\.css/);
assert.match(baseline, /--ui-font-scale/);
assert.match(baseline, /BASELINE_LOCKED/);
assert.match(baseline, /Explicit non-claims|no `DEVICE_TESTED`/);
assert.doesNotMatch(baseline, /\*\*Status:\*\*\s*`DEVICE_TESTED`/);
assert.doesNotMatch(baseline, /\*\*Verdict:\*\*\s*`ZERO_SECURITY_RISK`/);

console.log("=== critical + typography-app use scale formula ===");
const html = read("index.html");
assert.match(html, /--ui-font-scale/);
assert.match(html, /font-size:calc\(100%\s*\*\s*var\(--ui-font-scale/);
const typo = read("src/styles/typography-app.css");
assert.match(typo, /html\s*\{\s*font-size:\s*calc\(100%\s*\*\s*var\(--ui-font-scale/);
const critical = read("src/styles/critical-first-paint.css");
assert.match(critical, /html\s*\{\s*font-size:\s*calc\(100%\s*\*\s*var\(--ui-font-scale/);

console.log("=== index.css absolute 16px competes (P0 evidence) ===");
const indexCss = read("src/index.css");
assert.match(indexCss, /html\s*\{\s*font-size:\s*16px\s*;/);

console.log("=== sync import order: typography-app before index.css ===");
const main = read("src/main.tsx");
const syncCss: string[] = [];
for (const line of main.split("\n")) {
  const m = line.match(/^\s*import\s+["'](\.\/[^"']+\.css)["']/);
  if (m) syncCss.push(m[1]!);
}
const typoIdx = syncCss.indexOf("./styles/typography-app.css");
const indexIdx = syncCss.indexOf("./index.css");
assert.ok(typoIdx >= 0, "typography-app.css sync import missing");
assert.ok(indexIdx >= 0, "index.css sync import missing");
assert.ok(indexIdx > typoIdx, "index.css must follow typography-app (cascade winner)");

console.log("=== last sync html font-size winner is index.css 16px ===");
const winners: { file: string; value: string }[] = [];
for (const rel of syncCss) {
  const path = resolve(root, "src", rel.replace(/^\.\//, ""));
  if (!existsSync(path)) continue;
  const text = readFileSync(path, "utf8");
  const re = /html(?:\s*,\s*body)?\s*\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const fm = m[1]!.match(/font-size\s*:\s*([^;]+);/);
    if (fm) winners.push({ file: rel, value: fm[1]!.trim() });
  }
}
assert.ok(winners.length >= 2, `expected ≥2 sync html font-size rules, got ${winners.length}`);
const last = winners[winners.length - 1]!;
assert.equal(last.file, "./index.css");
assert.equal(last.value, "16px");

console.log("=== product scales documented in boot ===");
assert.match(html, /0\.92/);
assert.match(html, /1\.08/);
assert.match(html, /1\.16/);
assert.match(baseline, /0\.92/);
assert.match(baseline, /1\.08/);

console.log("=== deferred design-system also sets absolute base (inventory) ===");
const ds = read("src/styles/design-system.css");
assert.match(ds, /html\s*\{\s*font-size:\s*var\(--ds-base\)/);
assert.match(ds, /--ds-base:\s*16px/);
assert.match(main, /import\(["']\.\/styles\/design-system\.css["']\)/);

console.log("=== MajlisAmiriFallback size-adjust inventory ===");
const fontsUi = read("src/styles/fonts-ui.css");
assert.match(fontsUi, /size-adjust:\s*105%/);
assert.match(html, /size-adjust:105%/);

console.log("=== no Quran/prayer mutation in this PR scope ===");
assert.match(scope, /Mushaf QPC|prayer calculation|Out of scope/i);

console.log("startup-typography-fouc-p0-gate.test.ts: ok");
