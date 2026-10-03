/**
 * Global Design System authority gate — Wave 1 shared surfaces.
 * Locks Hex=0 / unsafe Hex fallbacks=0 on hero/card/form/nav identity authorities.
 * Run: node --import tsx src/lib/__tests__/global-design-system-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

const AUTHORITIES = [
  "src/styles/components/page-hero.css",
  "src/styles/components/hub-card.css",
  "src/styles/components/modern-section-shell.css",
  "src/styles/sunnah-identity-forms-filters.css",
  "src/styles/sunnah-identity-chrome-nav.css",
  "src/styles/card-system.css",
  "src/styles/ssunnah-card-unify.css",
  "src/styles/card-system-tokens.css",
] as const;

const HEX_RE = /#(?:[0-9a-fA-F]{3,8})\b/g;
const HEX_FALLBACK_RE = /var\(\s*--[a-zA-Z0-9-]+\s*,\s*#[0-9a-fA-F]{3,8}/g;

function load(rel: string): string {
  return readFileSync(resolve(root, rel), "utf8");
}

console.log("=== Global DS authorities — zero Hex ===");
for (const rel of AUTHORITIES) {
  const css = load(rel);
  const hits = css.match(HEX_RE) || [];
  assert.equal(hits.length, 0, `${rel}: Hex remaining: ${hits.slice(0, 8).join(", ")}`);
}

console.log("=== Global DS authorities — zero unsafe Hex fallbacks ===");
for (const rel of AUTHORITIES) {
  const css = load(rel);
  assert.equal((css.match(HEX_FALLBACK_RE) || []).length, 0, `${rel}: Hex fallback`);
}

console.log("=== Hero authority — mss palette aliases to mj/sf/cs ===");
{
  const mss = load("src/styles/components/modern-section-shell.css");
  assert.match(mss, /--mss-hero-from:\s*var\(--mj-brand-deep\)/);
  assert.match(mss, /--mss-on-hero:\s*var\(--mj-white\)/);
  assert.match(mss, /--mss-section-hero-bg:\s*var\(--cs-ink-hero\)/);
  assert.doesNotMatch(mss, /--mss-hero-from:\s*#/);
  assert.match(mss, /\.page-hero-mj--bleed/);
  assert.match(mss, /\.topic-page__hero/);
}

console.log("=== Card tokens — cs bridges to sf/mj ===");
{
  const cs = load("src/styles/card-system-tokens.css");
  assert.match(cs, /--cs-primary:\s*var\(--sf-color-deep-emerald\)/);
  assert.match(cs, /--cs-ink-hero:\s*var\(--sf-color-deep-emerald-deep\)/);
  assert.match(cs, /--mss-section-hero-bg:\s*var\(--cs-ink-hero\)/);
  assert.match(cs, /--ss-card-bg:\s*var\(--cs-surface-2\)/);
  // typo lock: no double closing paren on radius
  assert.doesNotMatch(cs, /--cs-radius:\s*var\([^)]+\)\)/);
}

console.log("=== Hub card / page hero consume token authorities ===");
{
  const hub = load("src/styles/components/hub-card.css");
  assert.match(hub, /--sf-radius-md|--cs-pad/);
  assert.match(hub, /--mj-brand|--ss-card-bg|--mj-surface/);
  const hero = load("src/styles/components/page-hero.css");
  assert.match(hero, /--mss-section-hero-bg|--svl-surface-section/);
  assert.match(hero, /--mj-ink|--mj-brand/);
}

console.log("=== Forms + chrome nav identity present ===");
{
  const forms = load("src/styles/sunnah-identity-forms-filters.css");
  assert.match(forms, /--mj-|--sf-|--ss-/);
  const nav = load("src/styles/sunnah-identity-chrome-nav.css");
  assert.match(nav, /--mj-|--sf-|--ss-/);
}

console.log("=== Green surface MSS hero keys tokenized ===");
{
  const gs = load("src/styles/green-surface-system.css");
  assert.match(gs, /--mss-section-hero-bg:\s*var\(--cs-ink-hero/);
  assert.match(gs, /--mss-on-hero:\s*var\(--mj-white\)/);
  assert.doesNotMatch(gs, /--mss-on-hero:\s*#/);
  assert.doesNotMatch(gs, /--mss-section-hero-bg:\s*#/);
}

console.log("global-design-system-authority-gate.test.ts: ok");
console.log("GLOBAL_DESIGN_SYSTEM_AUTHORITY_LOCKED");
console.log("UNKNOWN_GLOBAL_VISUAL_DEBT = 0");
