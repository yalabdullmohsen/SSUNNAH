#!/usr/bin/env node
// يشغّل بوابات fast المسجّلة في scripts/gate-registry.json بالتوازي (6 عمّال).
// --heavy يضيف فئة heavy. الفشل يوقف بكود 1 مع ذيل المخرجات.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const reg = JSON.parse(readFileSync(join(here, "gate-registry.json"), "utf8"));
const list = [...reg.fast, ...(process.argv.includes("--heavy") ? reg.heavy : [])];
const failed = [];
let next = 0;

function runOne(script) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [join("scripts", script)], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    const timer = setTimeout(() => child.kill("SIGKILL"), 120_000);
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) failed.push({ script, tail: out.trim().split("\n").slice(-6).join("\n") });
      resolve();
    });
  });
}

async function worker() {
  while (next < list.length) await runOne(list[next++]);
}
await Promise.all(Array.from({ length: 6 }, worker));

if (failed.length) {
  for (const f of failed) console.error(`✗ ${f.script}\n${f.tail}\n`);
  console.error(`registered-gates: ${failed.length}/${list.length} فشلت`);
  process.exit(1);
}
console.log(`registered-gates: ${list.length} بوابة نجحت`);
