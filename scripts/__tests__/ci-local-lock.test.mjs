import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, utimesSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), "../ci-local-lock.sh");
const env = (lock, extra = {}) => ({ ...process.env, CI_LOCAL_LOCK_DIR: lock, CI_LOCAL_LOCK_POLL: "1", ...extra });
const freshLock = () => join(mkdtempSync(join(tmpdir(), "ci-lock-")), "lock");
const run = (lock, cmd, extra) => spawnSync("bash", [SCRIPT, "bash", "-c", cmd], { env: env(lock, extra), encoding: "utf8" });

test("يشغّل الأمر ويمرّر كود خروجه ويحرّر القفل حتى عند الفشل", () => {
  const lock = freshLock();
  assert.equal(run(lock, "exit 0").status, 0);
  assert.equal(existsSync(lock), false);
  assert.equal(run(lock, "exit 3").status, 3);
  assert.equal(existsSync(lock), false);
});

test("قفل حيّ مأخوذ: ينتظر ثم يفشل بلا تشغيل الأمر", () => {
  const lock = freshLock();
  mkdirSync(lock);
  const r = run(lock, "echo RAN", { CI_LOCAL_LOCK_WAIT: "2" });
  assert.equal(r.status, 75);
  assert.doesNotMatch(r.stdout, /RAN/);
  assert.equal(existsSync(lock), true);
});

test("قفل معلّق أقدم من الحد يُكسر ويُشغَّل الأمر", () => {
  const lock = freshLock();
  mkdirSync(lock);
  const old = Date.now() / 1000 - 3600;
  utimesSync(lock, old, old);
  const r = run(lock, "echo RAN", { CI_LOCAL_LOCK_WAIT: "5", CI_LOCAL_LOCK_STALE: "2400" });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /RAN/);
  assert.equal(existsSync(lock), false);
});

test("تشغيلان متزامنان لا يتداخلان: الثاني ينتظر تحرير الأول", async () => {
  const lock = freshLock();
  const log = join(dirname(lock), "log");
  const cmd = `echo start >> ${log}; sleep 1; echo end >> ${log}`;
  const go = () =>
    new Promise((ok) => spawn("bash", [SCRIPT, "bash", "-c", cmd], { env: env(lock, { CI_LOCAL_LOCK_WAIT: "20" }) }).on("close", ok));
  const codes = await Promise.all([go(), go()]);
  assert.deepEqual(codes, [0, 0]);
  const { readFileSync } = await import("node:fs");
  assert.equal(readFileSync(log, "utf8"), "start\nend\nstart\nend\n");
});
