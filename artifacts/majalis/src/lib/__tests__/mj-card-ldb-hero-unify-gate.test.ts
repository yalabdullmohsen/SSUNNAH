/**
 * بوابة: Card المشتركة + ldb-hero على soft parchment (بلا هيرو أخضر ممتد).
 * node --import tsx src/lib/__tests__/mj-card-ldb-hero-unify-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

const mj = readFileSync(resolve(root, "src/components/ui/mj.tsx"), "utf8");
assert.match(mj, /function Card[\s\S]*?AppCard/, "Card الأساسي عبر AppCard");
assert.doesNotMatch(mj, /function Card[\s\S]*?\bsoft-card\b/, "Card بلا soft-card مباشر");

const shell = readFileSync(resolve(root, "src/styles/components/modern-section-shell.css"), "utf8");
assert.match(shell, /\.ldb-hero\s*[,{]/, "ldb-hero ضمن سطح soft hero");
assert.match(shell, /--mss-section-hero-bg/, "توكن parchment موجود");

const ldb = readFileSync(resolve(root, "src/styles/pages/learning-path-dashboard.css"), "utf8");
assert.doesNotMatch(
  ldb,
  /\.ldb-hero\s*\{[^}]*linear-gradient/,
  "ldb-hero بلا تدرج أخضر ممتد في learning-path-dashboard",
);

const quiz = readFileSync(resolve(root, "src/components/quiz-game/DailyChallengeQuiz.tsx"), "utf8");
assert.doesNotMatch(quiz, /\bsoft-card\b/, "DailyChallengeQuiz بلا soft-card مباشر");
assert.doesNotMatch(quiz, /\bmj-card\b/, "DailyChallengeQuiz بلا mj-card عاري");

console.log("mj-card-ldb-hero-unify-gate.test.ts: ok");
