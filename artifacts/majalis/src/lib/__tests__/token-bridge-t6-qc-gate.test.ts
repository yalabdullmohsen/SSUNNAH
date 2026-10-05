/**
 * T6 — retire quality-campaign / governance compat aliases (zero var() consumers).
 * Gate contracts migrated to canonical tokens in the same change.
 * node --import tsx src/lib/__tests__/token-bridge-t6-qc-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const esc = (s: string) => s.replace(/[-()]/g, "\\$&");
const declared = (css: string, tok: string) =>
  new RegExp(`(^|[\\s;{])${esc(tok)}\\s*:`, "m").test(css);

/** removed alias → canonical replacement (declared in canonicalFile). */
const retired = [
  { alias: "--ds-muted", canonical: "--text-muted", canonicalFile: "src/styles/design-tokens.css" },
  { alias: "--ds-danger", canonical: "--danger", canonicalFile: "src/styles/design-tokens.css" },
  { alias: "--ds-success", canonical: "--success", canonicalFile: "src/styles/design-tokens.css" },
  { alias: "--ds-durationFast", canonical: "--motion-fast", canonicalFile: "src/styles/design-tokens.css" },
  { alias: "--ds-transition-slow", canonical: "--motion-slow", canonicalFile: "src/styles/design-tokens.css" },
  { alias: "--ds-text", canonical: "--text", canonicalFile: "src/styles/brand-v4.css" },
] as const;

assert.equal(retired.length, 6);

const authorityCss = [
  "src/styles/ssunnah-ds-canonical.css",
  "src/styles/design-tokens.css",
  "src/styles/design-system.css",
  "src/styles/brand-v4.css",
]
  .map(read)
  .join("\n");

for (const { alias, canonical, canonicalFile } of retired) {
  assert.ok(!declared(authorityCss, alias), `${alias} declaration removed`);
  assert.ok(declared(read(canonicalFile), canonical), `${canonical} canonical declared in ${canonicalFile}`);
}

/* Repo scan: no var()/declaration of retired aliases anywhere in src/scripts/public/index.html. */
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (["node_modules", "dist", ".git", "lhci-reports", ".lighthouseci", "__tests__"].includes(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(css|scss|ts|tsx|js|mjs|html)$/.test(name)) out.push(p);
  }
  return out;
}
const files = [
  ...walk(resolve(majalisRoot, "src")),
  ...walk(resolve(majalisRoot, "public")),
  resolve(majalisRoot, "index.html"),
];
for (const { alias } of retired) {
  const re = new RegExp(`${esc(alias)}(?![\\w-])`);
  const hits = files.filter((f) => re.test(readFileSync(f, "utf8"))).map((f) => f.replace(majalisRoot + "/", ""));
  assert.equal(hits.length, 0, `${alias}: zero references (found ${hits.join(", ")})`);
}

/* KEEP: --ds-base pinned at 16px by css-authority / startup-typography gates (no 16px canonical twin). */
assert.match(read("src/styles/design-system.css"), /--ds-base:\s*16px/);

/* Migrated contracts reference canonical names, not retired aliases. */
const qc = read("scripts/test-quality-campaign-gate.mjs");
for (const tok of ["--text-muted", "--danger", "--success"]) {
  assert.match(qc, new RegExp(`"${esc(tok)}"`), `quality-campaign requires ${tok}`);
}
const gov = read("src/lib/__tests__/ssunnah-ds-governance-gate.test.ts");
assert.match(gov, /--motion-fast/, "governance motion contract → --motion-fast");

for (const script of ["scripts/test-quality-campaign-gate.mjs", "scripts/visual-system-inventory.mjs"]) {
  const args = script.endsWith("inventory.mjs") ? [script, "--check"] : [script];
  const r = spawnSync(process.execPath, args, { cwd: majalisRoot, encoding: "utf8" });
  assert.equal(r.status, 0, `${script}: ${r.stderr || r.stdout}`);
}

console.log(`token-bridge-t6-qc-gate: ok (removed=${retired.length}, kept=--ds-base)`);
