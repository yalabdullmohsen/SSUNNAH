/**
 * Final Internal Closure PR1 — Interaction Wave A (shared chrome only).
 * node --import tsx src/lib/__tests__/closure-pr1-interaction-wave-a-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const waveA = [
  "src/components/ui/AppBottomSheet.tsx",
  "src/components/ContentActions.tsx",
  "src/components/ui-common.tsx",
  "src/components/ComingSoonDialog.tsx",
];

for (const rel of waveA) {
  const text = read(rel);
  assert.match(text, /from ["']@\/components\/ui\/button["']/, `${rel}: canonical Button import`);
  assert.doesNotMatch(text, /<button[\s>]/, `${rel}: no raw <button>`);
}

const appSheet = read("src/components/ui/AppBottomSheet.tsx");
assert.match(appSheet, /aria-label=\{dismissible \? "إغلاق"/, "sheet scrim accessible name when dismissible");
assert.match(appSheet, /className="app-sheet__close"/, "footer close control");

const contentActions = read("src/components/ContentActions.tsx");
assert.match(contentActions, /role="group" aria-label="تقييم المحتوى"/, "rating group label");
assert.match(contentActions, /aria-label=\{`تقييم \$\{star\} من 5`\}/, "star buttons named");
assert.match(contentActions, /type="button"/, "explicit button type via Button");

const check = spawnSync(process.execPath, ["scripts/interaction-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

const budget = JSON.parse(read("reports/interaction-system-debt-budget.json"));
assert.ok(budget.ceilings.rawButtonElements <= 978, "ceiling not raised above baseline");
assert.ok(budget.ceilings.rawButtonFiles <= 227, "ceiling files not raised");

console.log("closure-pr1-interaction-wave-a-gate.test.ts: ok");
