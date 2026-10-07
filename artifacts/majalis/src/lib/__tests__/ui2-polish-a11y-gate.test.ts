/**
 * UI2 — critical polish a11y batch.
 * node --import tsx src/lib/__tests__/ui2-polish-a11y-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const mutedDisabled = [
  "src/components/ui/input.tsx",
  "src/components/ui/textarea.tsx",
  "src/components/ui/select.tsx",
  "src/components/ui/toggle.tsx",
  "src/components/ui/command.tsx",
  "src/components/ui/sidebar.tsx",
  "src/components/ui/field.tsx",
  "src/components/ui/input-group.tsx",
] as const;

for (const rel of mutedDisabled) {
  const text = read(rel);
  assert.doesNotMatch(text, /(?:^|[\s"'])disabled:opacity-50\b/, `${rel}: no disabled:opacity-50`);
  assert.doesNotMatch(text, /data-\[disabled\]:opacity-50/, `${rel}: no data-disabled opacity-only`);
  assert.match(text, /opacity-100/, `${rel}: muted disabled uses opacity-100`);
}

for (const rel of [
  "src/components/ui/dialog.tsx",
  "src/components/ui/alert-dialog.tsx",
  "src/components/ui/drawer.tsx",
  "src/components/ui/table.tsx",
] as const) {
  const text = read(rel);
  assert.doesNotMatch(text, /sm:text-left|\btext-left /, `${rel}: logical text alignment`);
  assert.match(text, /text-start/, `${rel}: text-start present`);
}

const abar = read("src/components/QuranActionBar.tsx");
assert.match(abar, /qe-abar__preview"[^>]*title=\{ayah\.text\}/);

const thc = read("src/components/reading/TextHighlightCapture.tsx");
assert.match(thc, /thc-pop__quote[^>]*title=\{pop\.quote\}/);

const learning = read("src/pages/lessons/ui/MyLearningView.tsx");
assert.match(learning, /title=\{n\.title \?\? n\.body/);

const univCard = read("src/components/universities/UniversityCard.tsx");
assert.match(univCard, /line-clamp-2"[^>]*title=\{u\.name_ar\}/);
assert.match(univCard, /univ-card__meta"[^>]*title=\{u\.about\}/);

const univDetail = read("src/views/UniversityDetailPage.tsx");
assert.doesNotMatch(univDetail, /opacity-50\s+cursor-not-allowed/, "UniversityDetail: no opacity-only disabled");
assert.match(univDetail, /disabled=\{!inCompare && !canAdd\}/);

const rec = read("src/components/recommendations/RecommendationWidget.tsx");
assert.match(rec, /rw-card__title line-clamp-2"[^>]*title=\{title\}/);

const citation = read("src/components/citation/CitationModal.tsx");
assert.match(citation, /line-clamp-1"[^>]*title=\{source\.title_ar\}/);

console.log("ui2-polish-a11y-gate: ok");
