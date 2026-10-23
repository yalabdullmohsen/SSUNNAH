import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), "../native-shot-provenance-guard.sh");
const sh = (cwd, cmd) => spawnSync("bash", ["-c", cmd], { cwd, encoding: "utf8" });
const G = "git -c user.email=a@b -c user.name=t";

function repoWithShots(provenance) {
  const r = mkdtempSync(join(tmpdir(), "prov-"));
  sh(r, `git init -q -b base && echo x > f && git add . && ${G} commit -qm base && git checkout -qb pr`);
  mkdirSync(join(r, "docs/native/qa/x"), { recursive: true });
  writeFileSync(join(r, "docs/native/qa/x/a.png"), "png");
  const sha = sh(r, "git rev-parse HEAD").stdout.trim();
  if (provenance) writeFileSync(join(r, "docs/native/qa/x/PROVENANCE.txt"), provenance(sha));
  sh(r, `git add . && ${G} commit -qm shots`);
  return r;
}
const run = (r) => spawnSync("bash", [SCRIPT], { env: { ...process.env, GUARD_REPO: r, BASE_REF: "base" }, encoding: "utf8" });
const good = (sha) => `git_sha=${sha}\nbinary_sha256=${"a".repeat(64)}\n`;

test("يفشل: لقطات مضافة بلا PROVENANCE.txt", () => {
  const r = run(repoWithShots(null));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /بلا PROVENANCE\.txt/);
});
test("يفشل: git_sha ليس من أسلاف HEAD", () => {
  assert.equal(run(repoWithShots(() => good("b".repeat(40)))).status, 0); // sha غير موجود في السجل: يُقبل شكلًا
  const r = repoWithShots(good);
  sh(r, `git checkout -q base && git checkout -qb other && echo y > g && git add . && ${G} commit -qm o && git checkout -q pr`);
  const other = sh(r, "git rev-parse other").stdout.trim();
  writeFileSync(join(r, "docs/native/qa/x/PROVENANCE.txt"), good(other));
  sh(r, `git add . && ${G} commit -qm p`);
  assert.equal(run(r).status, 1);
});
test("يفشل: git_sha غير صالح", () => {
  assert.equal(run(repoWithShots(() => "git_sha=zzz\n")).status, 1);
});
test("يفشل بإرشاد: حقول PROVENANCE على سطر واحد (مكتوب يدويًا)", () => {
  const r = run(repoWithShots(() => `git_sha=${"a".repeat(40)} binary_sha256=${"b".repeat(64)} note=يدوي\n`));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /git_sha غير صالح/);
  assert.match(r.stderr, /native-shot-guard\.sh/);
});
test("ينجح: لقطات مع PROVENANCE صحيح", () => {
  assert.equal(run(repoWithShots(good)).status, 0);
});
