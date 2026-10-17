import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), "../native-debug-hooks-guard.sh");
const sh = (cwd, cmd) => spawnSync("bash", ["-c", cmd], { cwd, encoding: "utf8" });

function repoWith(swift) {
  const repo = mkdtempSync(join(tmpdir(), "dbg-guard-"));
  mkdirSync(join(repo, "ios-native"));
  writeFileSync(join(repo, "ios-native/A.swift"), swift);
  sh(repo, "git init -q && git add . && git -c user.email=a@b -c user.name=t commit -qm c");
  return repo;
}
const run = (repo, ...args) =>
  spawnSync("bash", [SCRIPT, ...args], { env: { ...process.env, GUARD_REPO: repo, GUARD_DIRS: "ios-native" }, encoding: "utf8" });

test("رمز داخل #if DEBUG يمرّ", () => {
  const r = run(repoWith('#if DEBUG\nlet a = env["SNAP_ROUTE"]\n#endif\n'));
  assert.equal(r.status, 0, r.stderr);
});

test("رمز خارج #if DEBUG يفشل", () => {
  const r = run(repoWith('let a = env["SNAP_DETAIL"]\n'));
  assert.equal(r.status, 1);
  assert.match(r.stdout, /A\.swift:1/);
});

test("رمز في فرع #else من DEBUG (أي Release) يفشل", () => {
  const r = run(repoWith('#if DEBUG\nlet a = 1\n#else\nlet b = "SNAP_SCROLL"\n#endif\n'));
  assert.equal(r.status, 1);
});

test("#if متداخل غير DEBUG داخل DEBUG يمرّ", () => {
  const r = run(repoWith('#if DEBUG\n#if os(iOS)\nlet a = "SNAP_BOTTOM"\n#endif\n#endif\n'));
  assert.equal(r.status, 0, r.stderr);
});

test("binary يحوي رمزًا يفشل، ونظيف يمرّ", () => {
  const repo = repoWith("let a = 1\n");
  const mk = (body) => {
    const app = join(mkdtempSync(join(tmpdir(), "dbg-app-")), "T.app");
    mkdirSync(app);
    writeFileSync(join(app, "Info.plist"), '<?xml version="1.0"?><plist version="1.0"><dict><key>CFBundleExecutable</key><string>T</string></dict></plist>');
    writeFileSync(join(app, "T"), "x");
    writeFileSync(join(app, "T.debug.dylib"), body);   // الرمز قد يكون في dylib لا في الـbinary الرئيسي
    return app;
  };
  assert.equal(run(repo, mk("hello SNAP_DRAWER world")).status, 1);
  assert.equal(run(repo, mk("hello world")).status, 0);
});

test("خطاف snapshotScroll خارج #if DEBUG يفشل وداخله يمرّ", () => {
  assert.equal(run(repoWith('let a = UserDefaults.standard.string(forKey: "snapshotScroll")\n')).status, 1);
  assert.equal(run(repoWith('#if DEBUG\nSnapshotScroll.startIfRequested()\n#endif\n')).status, 0);
});
