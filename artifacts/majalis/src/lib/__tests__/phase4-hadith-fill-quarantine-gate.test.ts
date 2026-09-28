/**
 * ملفات verified-hadith-fill*.ts خارج production graph — المصدر الحي public/data/hadith-verified.
 * التشغيل: node --import tsx src/lib/__tests__/phase4-hadith-fill-quarantine-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const libDir = resolve(root, "src/lib");
const fills = readdirSync(libDir).filter((f) => f.startsWith("verified-hadith-fill") && f.endsWith(".ts"));
assert.ok(fills.length >= 1, "fill files still on disk for rollback (not deleted)");

const srcRoot = resolve(root, "src");
function walkTs(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (name.name === "node_modules" || name.name === "dist" || name.name === "__tests__") continue;
    const p = resolve(dir, name.name);
    if (name.isDirectory()) walkTs(p, out);
    else if (/\.(ts|tsx)$/.test(name.name) && !name.name.includes("verified-hadith-fill")) out.push(p);
  }
  return out;
}

/** استيراد فعلي فقط — ذكر الاسم في بوابات/تعليقات لا يُحسب */
const importRe = /(?:from|import)\s*\(?\s*["'][^"']*verified-hadith-fill[^"']*["']/;
const importers: string[] = [];
for (const file of walkTs(srcRoot)) {
  const text = readFileSync(file, "utf8");
  if (importRe.test(text)) importers.push(file.replace(root + "/", ""));
}
assert.equal(importers.length, 0, `fill modules imported from: ${importers.join(", ")}`);

const hadithPublic = resolve(root, "public/data/hadith-verified/manifest.json");
assert.ok(existsSync(hadithPublic), "hadith-verified public manifest is SSOT runtime");

console.log("phase4-hadith-fill-quarantine-gate: ok", { fillFiles: fills.length, runtime: "public/data/hadith-verified" });
