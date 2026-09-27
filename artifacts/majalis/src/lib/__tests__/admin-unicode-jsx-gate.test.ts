/**
 * بوابة: لا تسلسلات \\uXXXX حرفية داخل مصادر admin (JSX أو غيرها).
 * تشغيل: node --import tsx src/lib/__tests__/admin-unicode-jsx-gate.test.ts
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const dirs = [
  resolve(root, "src/views/admin"),
  resolve(root, "src/components/admin"),
  resolve(root, "src/admin-v3"),
];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(name)) out.push(p);
  }
  return out;
}

const literal = /\\u[0-9a-fA-F]{4}/;
const offenders: string[] = [];
for (const dir of dirs) {
  for (const file of walk(dir)) {
    const src = readFileSync(file, "utf8");
    if (literal.test(src)) offenders.push(file.replace(root + "/", ""));
  }
}

assert.equal(
  offenders.length,
  0,
  `تسلسلات Unicode حرفية في admin:\n${offenders.join("\n")}`,
);

console.log("admin-unicode-jsx-gate.test.ts: ok");
