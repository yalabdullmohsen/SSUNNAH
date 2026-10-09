/**
 * ci:local يقرأ كتلة if/else/fi (أو for/done) المتعددة الأسطر في ci.yml أمرًا واحدًا لا أوامر منفصلة.
 * Run: node --import tsx src/lib/__tests__/ci-local-multiline-blocks.test.ts
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { expandCommand, groupShellBlocks, repoGatesSteps } from "../../../../../scripts/ci-local-plan.mjs";

const block = ["if [ -f a ] && [ -f b ]; then", "  echo yes", "else", "  echo no", "fi", "echo tail"];
assert.deepEqual(groupShellBlocks(block), ["if [ -f a ] && [ -f b ]; then\n  echo yes\nelse\n  echo no\nfi", "echo tail"]);
assert.deepEqual(groupShellBlocks(["for x in 1 2; do", "echo $x", "done"]).length, 1);
assert.deepEqual(groupShellBlocks(["pnpm a \\", "  --flag", "pnpm b"]), ["pnpm a \\\n  --flag", "pnpm b"]);

// && داخل الكتلة لا يُفكَّك، والكتلة تُنفَّذ كما هي بـbash -c وتنجح.
const leaves = expandCommand(groupShellBlocks(block.slice(0, 5))[0]);
assert.equal(leaves.length, 1);
assert.equal(spawnSync("bash", ["-c", leaves[0].cmd], { encoding: "utf8" }).stdout.trim(), "no");

// لا أمر ورقي في ci.yml يبدأ بـelse/fi/done/then (علامة تقسيم الكتل).
const orphan = repoGatesSteps().flatMap((s: { cmds: string[] }) => s.cmds).filter((c: string) => /^(else|elif|fi|done|esac|then)\b/.test(c));
assert.deepEqual(orphan, [], `أسطر كتل مفصولة:\n${orphan.join("\n")}`);
console.log("ci-local-multiline-blocks.test.ts: ok");
