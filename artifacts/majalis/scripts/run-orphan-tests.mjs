/**
 * يشغّل اختبارات src/lib/__tests__ المسجّلة في wired-orphan-tests.json (كانت بلا أي سكربت يستدعيها فلا تُشغَّل في CI).
 * تشغيل: node scripts/run-orphan-tests.mjs
 */
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cpus } from "node:os";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const list = JSON.parse(readFileSync(join(root, "scripts/wired-orphan-tests.json"), "utf8"));
const width = Math.max(2, Math.min(6, cpus().length));
const failed = [];
let next = 0;

const runOne = (name) =>
  new Promise((done) => {
    const p = spawn(process.execPath, ["--import", "tsx", join("src/lib/__tests__", name)], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (out += d));
    const t = setTimeout(() => p.kill("SIGKILL"), 120_000);
    p.on("close", (code) => {
      clearTimeout(t);
      if (code !== 0) failed.push({ name, out: out.split("\n").slice(-12).join("\n") });
      done();
    });
  });

await Promise.all(Array.from({ length: width }, async () => { while (next < list.length) await runOne(list[next++]); }));
if (failed.length) {
  for (const f of failed) console.error(`✗ ${f.name}\n${f.out}\n`);
  console.error(`run-orphan-tests: ${failed.length}/${list.length} فشلت`);
  process.exit(1);
}
console.log(`run-orphan-tests: ok (${list.length})`);
