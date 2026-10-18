import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), "../native-nav-title-guard.sh");
const sh = (cwd, cmd) => spawnSync("bash", ["-c", cmd], { cwd, encoding: "utf8" });

function repoWith(files, allow = "") {
  const repo = mkdtempSync(join(tmpdir(), "nav-guard-"));
  mkdirSync(join(repo, "Sources/Components"), { recursive: true });
  for (const [p, c] of Object.entries(files)) writeFileSync(join(repo, p), c);
  writeFileSync(join(repo, "allow.txt"), allow);
  sh(repo, "git init -q && git add . && git -c user.email=a@b -c user.name=t commit -qm c");
  return repo;
}
const run = (repo) =>
  spawnSync("bash", [SCRIPT], { env: { ...process.env, GUARD_REPO: repo, GUARD_DIRS: "Sources", GUARD_ALLOW: "allow.txt" }, encoding: "utf8" });

test("sunnahNavTitle وnavigationTitle(\"\") والمكوّن نفسه تمرّ", () => {
  const r = run(repoWith({
    "Sources/A.swift": 'v.sunnahNavTitle("س")\nv.navigationTitle("")\n',
    "Sources/Components/SunnahNavTitle.swift": "content.navigationTitle(title)\n",
  }));
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test(".navigationTitle( خام يفشل", () => {
  const r = run(repoWith({ "Sources/A.swift": 'v.navigationTitle("عنوان")\n' }));
  assert.equal(r.status, 1);
  assert.match(r.stdout, /A\.swift:1/);
});

test("navigationTitle(متغير) يفشل، والتعليق التوثيقي يمرّ", () => {
  assert.equal(run(repoWith({ "Sources/A.swift": "v.navigationTitle(t)\n" })).status, 1);
  assert.equal(run(repoWith({ "Sources/A.swift": "/// بديل navigationTitle(x)\n" })).status, 0);
});

test("ملف في قائمة السماح يمرّ", () => {
  assert.equal(run(repoWith({ "Sources/A.swift": "v.navigationTitle(t)\n" }, "Sources/A.swift\n")).status, 0);
});
