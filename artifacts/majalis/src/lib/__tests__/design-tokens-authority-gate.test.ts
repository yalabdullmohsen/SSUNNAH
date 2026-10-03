/**
 * بوابة سلطة توكنات التصميم الموحّدة.
 * Run: node --import tsx src/lib/__tests__/design-tokens-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DESIGN_TOKENS_AUTHORITY,
  DESIGN_TOKENS_AUTHORITY_META,
  resolveDesignToken,
} from "../design-tokens-authority.ts";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const root = resolve(majalis, "../..");
const readRepo = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readMaj = (rel: string) => readFileSync(resolve(majalis, rel), "utf8");

const doc = readRepo("docs/design/DESIGN_TOKENS_AUTHORITY.md");
const pkg = JSON.parse(readMaj("package.json"));
const script = readMaj("scripts/token-compliance-report.mjs");

assert.match(doc, /DESIGN_TOKENS_AUTHORITY_ACTIVE/);
assert.match(doc, /TOKEN_COMPLIANCE_ENFORCED/);
assert.match(doc, /no new token family|no new CSS token families/i);
assert.match(doc, /color\.primary/);
assert.match(doc, /spacing\.md/);
assert.match(doc, /elevation\.0/);

assert.equal(DESIGN_TOKENS_AUTHORITY_META.status, "DESIGN_TOKENS_AUTHORITY_ACTIVE");
assert.equal(DESIGN_TOKENS_AUTHORITY_META.policy, "no-new-family");

const paths = Object.keys(DESIGN_TOKENS_AUTHORITY);
assert.ok(paths.length >= 80, `expected ≥80 token paths, got ${paths.length}`);
assert.equal(DESIGN_TOKENS_AUTHORITY["color.primary"], "--mj-brand");
assert.equal(DESIGN_TOKENS_AUTHORITY["color.text.primary"], "--mj-ink");
assert.equal(DESIGN_TOKENS_AUTHORITY["spacing.md"], "--sf2-space-3");
assert.equal(DESIGN_TOKENS_AUTHORITY["elevation.1"], "--sf2-elevation-1");
assert.equal(DESIGN_TOKENS_AUTHORITY["border.subtle"], "--ss-border-subtle");
assert.equal(DESIGN_TOKENS_AUTHORITY["card.shadow"], "--sf2-elevation-1");
assert.equal(DESIGN_TOKENS_AUTHORITY["status.empty"], "EmptyStateV2");
assert.equal(resolveDesignToken("typography.pageTitle"), "--sf-type-page-title");

assert.match(script, /TOKEN_COMPLIANCE_REPORT/);
assert.match(script, /design-tokens-authority\.json/);
assert.match(pkg.scripts["test:design-tokens-authority"] || "", /token-compliance-report/);

assert.ok(existsSync(resolve(root, "docs/design/DESIGN_TOKEN_AUTHORITY.md")));

console.log("design-tokens-authority-gate: ok");
