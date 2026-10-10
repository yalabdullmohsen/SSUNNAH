/**
 * تكافؤ ci:local مع CI: لا فحص يفشل في repo-gates ولا يراه المطوّر محليًا.
 * يقارن قائمة ci:local (--plan) بما تشتقّه الوظيفة repo-gates في ci.yml، ويتحقق من ربط pre-push.
 * Run: node --import tsx src/lib/__tests__/ci-local-parity-gate.test.ts
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { repoGatesLeaves, repoGatesSteps, isBudgetGate } from "../../../../../scripts/ci-local-plan.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../..");
const key = (l: { cwd: string; cmd: string }) => `${l.cwd}::${l.cmd}`;
const ci = [...new Set(repoGatesLeaves().filter((l: { optional: boolean }) => !l.optional).map(key))];
assert.ok(repoGatesSteps().length >= 5 && ci.length > 100, `ci.yml repo-gates لم يُقرأ كما ينبغي (${ci.length})`);

const plan = JSON.parse(execFileSync("node", ["scripts/ci-local.mjs", "--plan", "--base", "HEAD"], { cwd: root, encoding: "utf8" }));
assert.deepEqual([...new Set(plan.full)].sort(), [...ci].sort(), "ci:local --full يختلف عن repo-gates في ci.yml");

const budgetInCi = repoGatesLeaves().filter(isBudgetGate).map(key);
const missing = budgetInCi.filter((k: string) => !plan.always.includes(k));
assert.deepEqual(missing, [], `بوابات سقوف في CI لا يشغّلها ci:local افتراضيًا:\n${missing.join("\n")}`);
assert.ok(plan.always.some((k: string) => /visual-system-inventory\.mjs --check/.test(k)), "visual-system-debt-budget غائب عن ci:local");

const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
/* ci:local يمرّ عبر القفل المشترك (تشغيل واحد على الجهاز) ثم يشغّل ci-local.mjs نفسه */
assert.equal(pkg.scripts["ci:local"], "bash scripts/ci-local-lock.sh node scripts/ci-local.mjs");
assert.match(readFileSync(resolve(root, "scripts/install-ci-local-hook.sh"), "utf8"), /pnpm|PNPM_BIN.*run ci:local/);
console.log(`ci-local-parity-gate.test.ts: ok (${ci.length} أمرًا في CI، ${plan.always.length} بوابة سقوف دائمة)`);
