/**
 * CI #7500 — عناوين HubCard في الوضع الداكن ليست حبرًا غنيًا على سطح ليلي.
 * Run: node --import tsx src/lib/__tests__/ci-7500-hub-card-dark-contrast-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const hub = readFileSync(resolve(root, "src/styles/components/hub-card.css"), "utf8");
const cs2 = readFileSync(resolve(root, "src/styles/card-system-v2.css"), "utf8");
const doc = readFileSync(
  resolve(root, "../../docs/remediation/CI_7500_CONTRAST_ROOT_CAUSE.md"),
  "utf8",
);

assert.match(hub, /html\[data-theme="dark"\] \.hub-card \.hub-card__title/);
assert.match(hub, /luxury-night-ink|#edf5f0/);
assert.doesNotMatch(
  hub,
  /html\[data-theme="dark"\] \.hub-card__title,\s*\nhtml\.dark \.hub-card__title \{\s*\n\s*color:\s*var\(--text-primary/,
  "لا رجوع لـ --text-primary على عنوان الدرج الداكن",
);

assert.match(cs2, /html:not\(\[data-theme="dark"\]\):not\(\.dark\) \.hub-card\.cs2-host \.cs2-nav__title/);
assert.match(doc, /quran-knowledge/);
assert.match(doc, /#15382D/);
assert.match(doc, /#24302B/);

console.log("ci-7500-hub-card-dark-contrast-gate.test.ts: ok");
