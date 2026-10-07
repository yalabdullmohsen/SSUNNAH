/**
 * Component layer consolidation — ratchet for DEFEATED declarations in card / button / color-token layers.
 * A declaration is "defeated" when an identical selector + same property (same or broader at-rule)
 * always wins over it regardless of lazy CSS load order (same file, or a critical sync sheet).
 * Deleting them is computed-style neutral (parity proof: docs/audit/COMPONENT_LAYER_CONSOLIDATION.md).
 * node --import tsx src/lib/__tests__/component-layer-consolidation-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");

const mod = (await import(
  pathToFileURL(resolve(majalisRoot, "scripts/component-layer-defeated-inventory.mjs")).href
)) as {
  scanDefeated: (src: string) => Array<{ family: string; file: string; line: number; prop: string }>;
  summarize: (l: unknown[]) => { total: number; important: number; byFamily: Record<string, number> };
};

/* Ceilings only go down. Measured after each consolidation wave. */
const CEILINGS = { card: __CARD__, button: __BUTTON__, token: __TOKEN__ } as const;

const list = mod.scanDefeated(resolve(majalisRoot, "src"));
const sum = mod.summarize(list);
for (const fam of Object.keys(CEILINGS) as Array<keyof typeof CEILINGS>) {
  const n = sum.byFamily[fam] ?? 0;
  assert.ok(
    n <= CEILINGS[fam],
    `defeated ${fam} declarations ${n} > ceiling ${CEILINGS[fam]}:\n` +
      list
        .filter((d) => d.family === fam)
        .slice(0, 15)
        .map((d) => `  ${d.file}:${d.line} ${d.prop}`)
        .join("\n"),
  );
}

/* Parser self-check: same-file later override is detected, fallback (modern value) is not. */
const { parseDecls } = (await import(
  pathToFileURL(resolve(majalisRoot, "scripts/component-layer-defeated-inventory.mjs")).href
)) as { parseDecls: (t: string) => Array<{ prop: string; imp: boolean; line: number }> };
const probe = parseDecls(".a{color:red;/* x;{ */height:1px}\n@media (min-width:1px){.b{gap:1px!important}}");
assert.deepEqual(
  probe.map((d) => [d.prop, d.imp, d.line]),
  [
    ["color", false, 1],
    ["height", false, 1],
    ["gap", true, 2],
  ],
);

const pkg = JSON.parse(readFileSync(resolve(majalisRoot, "package.json"), "utf8"));
assert.ok(pkg.scripts["test:component-layer-consolidation"], "package.json script missing");
assert.ok(existsSync(resolve(repoRoot, "docs/audit/COMPONENT_LAYER_CONSOLIDATION.md")), "audit doc missing");

console.log(`component-layer-consolidation gate OK ${JSON.stringify(sum)}`);
