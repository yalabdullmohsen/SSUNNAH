/**
 * PHASE 1 — Root typography authority unified (closes P0 cascade bug).
 * Ensures html font-size always follows --ui-font-scale from critical→sync→deferred.
 *
 * Run: node --import tsx src/lib/__tests__/startup-typography-fouc-p0-gate.test.ts
 * Alias: pnpm run test:startup-typography-fouc-p1
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(root, "../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const CANON = /font-size:\s*calc\(\s*100%\s*\*\s*var\(--ui-font-scale,\s*1\)\s*\)/;
const SCOPE = "docs/performance/STARTUP_TYPOGRAPHY_FOUC_PHASE1_SCOPE.md";

console.log("=== Phase 1 scope + freeze ===");
assert.ok(existsSync(resolve(repoRoot, SCOPE)), SCOPE);
const scope = readRepo(SCOPE);
assert.match(scope, /IMPLEMENTATION_FROZEN/);
assert.match(scope, /Phase 1|PHASE 1|P1/);

console.log("=== critical + typography-app + index + design-system share calc ===");
const html = read("index.html");
assert.match(html, /font-size:calc\(100%\s*\*\s*var\(--ui-font-scale/);
assert.match(read("src/styles/critical-first-paint.css"), CANON);
assert.match(read("src/styles/typography-app.css"), CANON);
const indexCss = read("src/index.css");
assert.match(indexCss, CANON);
assert.doesNotMatch(indexCss, /html\s*\{[^}]*font-size:\s*16px\s*;/s);
const ds = read("src/styles/design-system.css");
assert.match(ds, CANON);
assert.doesNotMatch(ds, /html\s*\{[^}]*font-size:\s*var\(--ds-base\)\s*;/s);

console.log("=== sync cascade winner is scale calc (not absolute 16px) ===");
const main = read("src/main.tsx");
const syncCss: string[] = [];
for (const line of main.split("\n")) {
  const m = line.match(/^\s*import\s+["'](\.\/[^"']+\.css)["']/);
  if (m) syncCss.push(m[1]!);
}
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
assert.ok(winners.length >= 1, "expected html font-size in sync CSS");
for (const w of winners) {
  assert.match(
    w.value,
    /calc\(\s*100%\s*\*\s*var\(--ui-font-scale/,
    `competing root font-size in ${w.file}: ${w.value}`,
  );
  assert.notEqual(w.value, "16px", `absolute 16px returned in ${w.file}`);
}

console.log("=== product scales still applied by boot ===");
assert.match(html, /--ui-font-scale/);
assert.match(html, /0\.92/);
assert.match(html, /1\.08/);
assert.match(html, /1\.16/);

console.log("=== --ds-base may remain for components, not for html ===");
assert.match(ds, /--ds-base:\s*16px/);

console.log("startup-typography-fouc-p1-gate (via p0 script): ok");
