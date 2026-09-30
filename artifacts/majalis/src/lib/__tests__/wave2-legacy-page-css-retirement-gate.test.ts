/**
 * WAVE2 — Legacy page CSS retirement equivalence gate.
 * Run: node --import tsx src/lib/__tests__/wave2-legacy-page-css-retirement-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const retired = [
  "src/styles/pages/home-legacy.css",
  "src/styles/pages/lessons-legacy.css",
  "src/styles/pages/misc-page-legacy.css",
] as const;

for (const rel of retired) {
  assert.equal(existsSync(resolve(majalisRoot, rel)), false, `retired file must be gone: ${rel}`);
}

assert.ok(existsSync(resolve(majalisRoot, "src/styles/components/optimized-sheikh-image.css")));
assert.ok(existsSync(resolve(majalisRoot, "src/styles/components/home/home-widget-chrome.css")));

const sheikhCss = read("src/styles/components/optimized-sheikh-image.css");
assert.match(sheikhCss, /\.optimized-sheikh-image\s*\{/);
assert.match(sheikhCss, /@keyframes\s+optimized-sheikh-shimmer/);

const chrome = read("src/styles/components/home/home-widget-chrome.css");
assert.match(chrome, /\.home-prayer-ranks-list\s*\{/);
assert.match(chrome, /\.home-section-link\s*\{/);
assert.match(chrome, /\.home-daily-meta\s*\{/);

const lessons = read("src/styles/pages/lessons.css");
assert.match(lessons, /\.lesson-unified-card__status\s*\{[\s\S]*?color:\s*var\(--chip-fg/);
assert.match(lessons, /\.lesson-detail-stats-row\s*\{/);
assert.match(lessons, /\.lesson-unified-card--archived\s*\{/);

const shell = read("src/styles/components/content-reading-shell.css");
assert.match(shell, /\.content-detail-header\s*\{/);
assert.match(shell, /\.content-detail-action-btn\s*\{/);

const topic = read("src/styles/components/topic-page.css");
assert.match(topic, /\.fiqh-review-list\s*\{/);
assert.match(topic, /\.fiqh-review-filter--active\s*\{/);

assert.match(read("src/components/sheikh/OptimizedSheikhImage.tsx"), /optimized-sheikh-image\.css/);
assert.doesNotMatch(read("src/components/sheikh/OptimizedSheikhImage.tsx"), /misc-page-legacy/);
assert.doesNotMatch(read("src/pages/account/ui/HomeBelowFold.tsx"), /home-legacy/);
assert.doesNotMatch(read("src/pages/lessons/ui/LessonsView.tsx"), /lessons-legacy/);
assert.doesNotMatch(read("src/pages/worship/ui/TasbihView.tsx"), /misc-page-legacy/);
assert.doesNotMatch(read("src/components/ui/TopicQuiz.tsx"), /misc-page-legacy/);
assert.match(read("src/components/widgets/Widget.tsx"), /home-widget-chrome\.css/);
assert.match(read("src/components/platform/ContentDetailLayout.tsx"), /content-reading-shell\.css/);

function collectTs(dir: string, acc: string[] = []): string[] {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === "__tests__") continue;
      collectTs(p, acc);
    } else if (/\.(tsx?|mjs|js)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

const corpus = collectTs(resolve(majalisRoot, "src"))
  .filter((p) => !p.includes(`${join("lib", "__tests__")}`))
  .map((p) => readFileSync(p, "utf8"))
  .join("\n");

assert.doesNotMatch(corpus, /home-legacy\.css/);
assert.doesNotMatch(corpus, /lessons-legacy\.css/);
assert.doesNotMatch(corpus, /misc-page-legacy\.css/);

console.log("wave2-legacy-page-css-retirement-gate.test.ts: ok");
