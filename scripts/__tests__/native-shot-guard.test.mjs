import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, utimesSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), "../native-shot-guard.sh");
const sh = (cwd, cmd) => spawnSync("bash", ["-c", cmd], { cwd, encoding: "utf8" });

function fixture(appAgeSec) {
  const repo = mkdtempSync(join(tmpdir(), "guard-repo-"));
  mkdirSync(join(repo, "ios-native"));
  writeFileSync(join(repo, "ios-native/A.swift"), "x");
  sh(repo, "git init -q && git add . && git -c user.email=a@b -c user.name=t commit -qm c");
  const app = join(mkdtempSync(join(tmpdir(), "guard-app-")), "SunnahApp.app");
  mkdirSync(app);
  const t = Date.now() / 1000 + appAgeSec;
  utimesSync(app, t, t);
  return { repo, app, out: join(repo, "shots") };
}
const guard = ({ repo, app, out }) =>
  spawnSync("bash", [SCRIPT, app, out], { env: { ...process.env, GUARD_REPO: repo, SRC_DIRS: "ios-native" }, encoding: "utf8" });

test("يفشل مع تطبيق أقدم من آخر commit للكود", () => {
  const f = fixture(-86400);
  const r = guard(f);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /التطبيق قديم/);
  assert.equal(existsSync(join(f.out, "PROVENANCE.txt")), false);
});

test("يفشل إن عُدّل ملف كود بعد البناء (شجرة غير نظيفة)", () => {
  const f = fixture(-5);
  const t = Date.now() / 1000 + 60;
  writeFileSync(join(f.repo, "ios-native/A.swift"), "changed");
  utimesSync(join(f.repo, "ios-native/A.swift"), t, t);
  assert.equal(guard(f).status, 1);
});

test("ينجح مع تطبيق أحدث ويكتب PROVENANCE بالـSHA", () => {
  const f = fixture(+60);
  const r = guard(f);
  assert.equal(r.status, 0, r.stderr);
  const p = readFileSync(join(f.out, "PROVENANCE.txt"), "utf8");
  const sha = sh(f.repo, "git rev-parse HEAD").stdout.trim();
  assert.match(p, new RegExp(`git_sha=${sha}`));
  assert.match(p, /binary_sha256=/);
});
