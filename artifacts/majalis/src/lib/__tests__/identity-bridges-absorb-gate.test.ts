/**
 * FINAL Program Phase 4 — Identity bridges absorb (brand-v4 / design-tokens → theme contract).
 * Run: node --import tsx src/lib/__tests__/identity-bridges-absorb-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const brand = read("src/styles/brand-v4.css");
assert.match(brand, /Phase 4 identity absorb/);
assert.match(brand, /--bg:\s*var\(--surface-app\)/);
assert.match(brand, /--bg-elevated:\s*var\(--mj-surface\)/);
assert.match(brand, /--surface:\s*var\(--mj-surface\)/);
assert.match(brand, /--brand-deep:\s*var\(--mj-brand-deep\)/);
assert.doesNotMatch(
  brand.replace(/\/\*[\s\S]*?\*\//g, ""),
  /html\[data-theme="dark"\][\s\S]{0,240}--bg:\s*#131A18/i,
);
assert.doesNotMatch(
  brand.replace(/\/\*[\s\S]*?\*\//g, ""),
  /html\[data-theme="dark"\][\s\S]{0,800}--brand-deep:\s*#0E1C17/i,
);

const dt = read("src/styles/design-tokens.css");
assert.match(dt, /Phase 4 identity absorb/);
assert.match(dt, /--bg:\s*var\(--surface-app\)/);
assert.match(dt, /--surface:\s*var\(--mj-surface\)/);
assert.match(dt, /--ss-card-bg:\s*var\(--mj-surface\)/);
assert.match(dt, /--ss-warm-bg:\s*var\(--mj-bg,\s*var\(--surface-app\)\)/);

const polish = read("src/styles/ssunnah-ux-polish.css");
assert.doesNotMatch(polish, /var\(--surface-app,\s*#131A18\)/i);

const budget = JSON.parse(read("reports/visual-system-debt-budget.json"));
assert.ok(budget.ceilings.hexInCss <= 8905, `hex ceiling must be ≤8905 (got ${budget.ceilings.hexInCss})`);
assert.ok(budget.ceilings.important <= 4787, `important ceiling must not rise`);

const report = readFileSync(
  resolve(root, "../../docs/performance/SUNNAH_FINAL_PROGRAM_PHASE4_IDENTITY_BRIDGES_ABSORB.md"),
  "utf8",
);
assert.match(report, /Phase 4/);
assert.match(report, /hexInCss/);

console.log("identity-bridges-absorb-gate.test.ts: ok");
