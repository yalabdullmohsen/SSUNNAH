/**
 * U2 — Token Role Authority Freeze.
 * node --import tsx src/lib/__tests__/token-role-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const matrix = readRepo("docs/design/FINAL_TOKEN_ROLE_MATRIX.md");
for (const section of [
  "Role matrix",
  "canvas",
  "ink",
  "surface",
  "brand-deep",
  "focus ring",
  "TOKEN_CONTRACT",
  "no new family",
]) {
  assert.match(matrix, new RegExp(section, "i"), `matrix missing ${section}`);
}

const theme = read("src/app/styles/theme.css");
/* Dark brand-deep must not be the night surface hex — ink/semantic via mj-brand-deep */
assert.doesNotMatch(
  theme,
  /--color-brand-deep:\s*#0E1C17/i,
  "dark --color-brand-deep must not be surface #0E1C17",
);
assert.match(
  theme,
  /--color-brand-deep:\s*var\(--mj-brand-deep/,
  "dark --color-brand-deep tracks --mj-brand-deep (ink)",
);

const aliases = read("src/styles/theme-aliases.css");
assert.match(aliases, /--mj-brand-deep:\s*#8FD4B0/, "night brand-deep ink");
assert.match(aliases, /--mj-brand-deep-surface:\s*#0E1C17/, "surface role stays separate");

const ad = read("src/styles/components/header-ad-slot.css");
assert.doesNotMatch(
  ad.replace(/\/\*[\s\S]*?\*\//g, ""),
  /html\[data-theme="dark"\][\s\S]{0,200}\.header-ad-slot__banner[\s\S]{0,120}background:\s*#121816/i,
  "header-ad dark banner: no page-local #121816 canvas",
);
assert.match(
  ad,
  /header-ad-slot__banner[\s\S]{0,160}background:\s*var\(--mj-bg/,
  "header-ad dark banner uses --mj-bg",
);

const fiqh = read("src/styles/pages/fiqh-hub.css");
assert.doesNotMatch(
  fiqh,
  /fiqh-status-badge--review[\s\S]{0,120}color:\s*var\(--mj-surface-2\)/,
  "fiqh review badge: no Surface-as-Ink",
);
assert.match(
  fiqh,
  /fiqh-status-badge--review[\s\S]{0,160}color:\s*var\(--mj-ink/,
  "fiqh review badge uses ink",
);

const authority = readRepo("docs/design/DESIGN_TOKEN_AUTHORITY.md");
assert.match(authority, /--sf2-\*/);
assert.match(authority, /CANONICAL/);

console.log("token-role-authority-gate.test.ts: ok");
