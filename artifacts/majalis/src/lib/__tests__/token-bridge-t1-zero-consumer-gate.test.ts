/**
 * T1 — zero-consumer --ds-/--majalis- alias removal + quality-campaign keep-compat.
 * node --import tsx src/lib/__tests__/token-bridge-t1-zero-consumer-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

/** 26 aliases actually retired (zero var() consumers). */
const retired = [
  "--ds-bg",
  "--ds-divider",
  "--ds-error",
  "--ds-font-bold",
  "--ds-font-medium",
  "--ds-font-regular",
  "--ds-font-semibold",
  "--ds-gold",
  "--ds-gold-soft",
  "--ds-iconPrimary",
  "--ds-iconSecondary",
  "--ds-line-strong",
  "--ds-onPrimary",
  "--ds-primary",
  "--ds-primaryContainer",
  "--ds-primaryHover",
  "--ds-selected",
  "--ds-successContainer",
  "--ds-surfaceSecondary",
  "--ds-text-muted",
  "--ds-textOnColor",
  "--ds-warning",
  "--majalis-green",
  "--majalis-primary",
  "--majalis-secondary",
  "--majalis-text",
] as const;

/** KEEP_COMPATIBILITY_WITH_EVIDENCE — quality-campaign public contract only. */
const keptCompat = [
  { alias: "--ds-muted", canonical: "var(--text-muted)" },
  { alias: "--ds-danger", canonical: "var(--danger)" },
  { alias: "--ds-success", canonical: "var(--success)" },
] as const;

const cssBundle = [
  "src/styles/ssunnah-ds-canonical.css",
  "src/styles/brand-v4.css",
  "src/styles/design-tokens.css",
  "src/styles/design-system.css",
]
  .map(read)
  .join("\n");

assert.equal(retired.length, 26, "26 retired aliases");
assert.equal(keptCompat.length, 3, "3 quality-campaign compat aliases");

for (const tok of retired) {
  assert.doesNotMatch(
    cssBundle,
    new RegExp(`${tok.replace(/-/g, "\\-")}\\s*:`),
    `${tok} declaration removed`,
  );
}

const designTokens = read("src/styles/design-tokens.css");
for (const { alias, canonical } of keptCompat) {
  assert.match(
    designTokens,
    new RegExp(`${alias.replace(/-/g, "\\-")}\\s*:\\s*${canonical.replace(/[()]/g, "\\$&")}`),
    `${alias} bridges to ${canonical}`,
  );
}
assert.match(designTokens, /KEEP_COMPATIBILITY_WITH_EVIDENCE/);

const qualityGate = read("scripts/test-quality-campaign-gate.mjs");
for (const { alias } of keptCompat) {
  assert.match(qualityGate, new RegExp(`"${alias.replace(/-/g, "\\-")}"`), `${alias} still required by quality-campaign`);
}

/** No new runtime var() consumers for kept legacy aliases (repo scan). */
function walkSourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (
      name === "node_modules" ||
      name === "dist" ||
      name === ".git" ||
      name === "lhci-reports" ||
      name === ".lighthouseci"
    ) {
      continue;
    }
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      walkSourceFiles(p, out);
      continue;
    }
    if (/\.(css|scss|ts|tsx|js|mjs|html)$/.test(name)) out.push(p);
  }
  return out;
}

const files = walkSourceFiles(resolve(majalisRoot, "src")).concat(
  walkSourceFiles(resolve(majalisRoot, "scripts")),
);
for (const { alias } of keptCompat) {
  const re = new RegExp(`var\\(\\s*${alias.replace(/-/g, "\\-")}\\b`);
  const hits: string[] = [];
  for (const f of files) {
    const t = readFileSync(f, "utf8");
    if (re.test(t)) hits.push(f.replace(majalisRoot + "/", ""));
  }
  assert.equal(hits.length, 0, `${alias}: no new var() consumers (found ${hits.join(", ")})`);
}

const budget = JSON.parse(read("reports/visual-system-debt-budget.json"));
assert.ok(budget.ceilings.hexInCss <= 5569, `hexInCss ceiling ≤5569 (got ${budget.ceilings.hexInCss})`);
assert.equal(budget.policy, "decreasing-ceilings");

const check = spawnSync(process.execPath, ["scripts/visual-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

console.log("token-bridge-t1-zero-consumer-gate: ok");
console.log("ALIASES_RETIRED_26");
console.log("COMPAT_ALIASES_KEPT_3");
console.log("KEEP_COMPATIBILITY_WITH_EVIDENCE");
