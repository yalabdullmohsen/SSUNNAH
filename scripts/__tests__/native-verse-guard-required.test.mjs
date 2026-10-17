import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

// طفرة: حارس verse-selection (finalOnly) مطلوب في RC_FINAL؛ حذفه أو فكّ ربطه يجب أن يُغلق بوابة RC.
const GUARD = "native-mushaf-verse-selection-guard.sh";
function gate({ withGuard, wired }) {
  const d = mkdtempSync(join(tmpdir(), "rcgate-"));
  mkdirSync(join(d, "scripts"));
  mkdirSync(join(d, "docs/native"), { recursive: true });
  copyFileSync("scripts/native-rc-gate.sh", join(d, "scripts/native-rc-gate.sh"));
  writeFileSync(join(d, "docs/native/required-guards.json"), JSON.stringify({ guards: [
    { id: "verse-selection", owner: "ن3", match: "native-.*(verse|selection|ayah).*\\.(mjs|sh)$", finalOnly: true }] }));
  if (withGuard) writeFileSync(join(d, "scripts", GUARD), "#!/bin/sh\nexit 0\n");
  writeFileSync(join(d, "scripts/native-release-check.sh"), wired ? `bash scripts/${GUARD} || bad x\n` : "echo noop\n");
  const r = spawnSync("bash", [join(d, "scripts/native-rc-gate.sh")], { cwd: d, env: { ...process.env, RC_FINAL: "1" }, encoding: "utf8" });
  return { code: r.status, out: r.stdout + r.stderr };
}

test("الحارس موجود ومربوط: يُعدّ ✓", () => {
  assert.match(gate({ withGuard: true, wired: true }).out, /✓ verse-selection/);
});
test("حُذف الحارس: البوابة تفشل وتسمّيه", () => {
  const r = gate({ withGuard: false, wired: true });
  assert.notEqual(r.code, 0);
  assert.match(r.out, /الحارس «verse-selection» \(ن3\) غير موجود/);
});
test("فُكّ ربطه من release-check: البوابة تفشل", () => {
  const r = gate({ withGuard: true, wired: false });
  assert.notEqual(r.code, 0);
  assert.match(r.out, /غير مربوط/);
});
test("الشجرة الحقيقية: الحارس مُدرج ومربوط", () => {
  const r = spawnSync("bash", ["scripts/native-rc-gate.sh"], { env: { ...process.env, RC_FINAL: "1" }, encoding: "utf8" });
  assert.match(r.stdout, /✓ verse-selection/);
});
